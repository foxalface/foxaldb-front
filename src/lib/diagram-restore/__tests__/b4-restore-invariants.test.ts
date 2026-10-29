import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import { DatabaseEdition } from '@/lib/domain/database-edition';
import type { Diagram } from '@/lib/domain/diagram';
import { b4MergeCatalogFixture } from '@/lib/schema-merge/__tests__/b4-merge-fixture';
import { diagramToJSONOutput } from '@/lib/export-import-utils';
import {
    RestoreDiagramJsonParseError,
    persistRestoredDiagramFromJson,
} from '../restore-diagram-from-json-backup';
import {
    openPersistedNewDiagram,
    type PersistedNewDiagram,
} from '@/lib/diagram/persist-new-diagram';
import { parseDiagramJsonContent } from '@/lib/import/parse-diagram-json-content';

const createDiagram = vi.fn();
const getDiagram = vi.fn();
const updateDiagram = vi.fn();

vi.mock('@/lib/api/diagrams', () => ({
    createDiagram: (...args: unknown[]) => createDiagram(...args),
    getDiagram: (...args: unknown[]) => getDiagram(...args),
    updateDiagram: (...args: unknown[]) => updateDiagram(...args),
}));

const sourceIds = (diagram: Diagram): Set<string> => {
    const ids = new Set<string>([diagram.id]);
    for (const table of diagram.tables ?? []) {
        ids.add(table.id);
        for (const field of table.fields) {
            ids.add(field.id);
        }
    }
    for (const relationship of diagram.relationships ?? []) {
        ids.add(relationship.id);
    }
    for (const area of diagram.areas ?? []) {
        ids.add(area.id);
    }
    for (const note of diagram.notes ?? []) {
        ids.add(note.id);
    }
    for (const customType of diagram.customTypes ?? []) {
        ids.add(customType.id);
    }
    return ids;
};

const catalogBackup = (): { diagram: Diagram; json: string } => {
    const diagram = b4MergeCatalogFixture();
    const users = diagram.tables?.find((table) => table.name === 'users');
    if (users) {
        users.parentAreaId = 'area-billing';
    }

    return { diagram, json: diagramToJSONOutput(diagram) };
};

describe('B4 restore catalog', () => {
    const addDiagram = vi.fn();
    const setDiagramLocation = vi.fn();
    const clearDiagramAccess = vi.fn();
    const loadDiagramFromData = vi.fn();
    const navigate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        addDiagram.mockResolvedValue(undefined);
        createDiagram.mockResolvedValue({
            diagram: { id: 77, name: 'Catalog' },
        });
        getDiagram.mockRejectedValue(new Error('restore must not GET'));
        updateDiagram.mockRejectedValue(new Error('restore must not PUT'));
    });

    it('accepts schemaVersion 1 and an unversioned compatible backup', () => {
        const { json } = catalogBackup();
        const versioned = parseDiagramJsonContent(json);
        const unversioned = parseDiagramJsonContent(
            JSON.stringify({
                ...JSON.parse(json),
                schemaVersion: undefined,
            })
        );

        expect(JSON.parse(json).schemaVersion).toBe(1);
        expect(versioned.ok).toBe(true);
        expect(unversioned.ok).toBe(true);
    });

    it('regenerates ids and remaps relationships, areas, notes, and the enum', () => {
        const { diagram: source, json } = catalogBackup();
        const parsed = parseDiagramJsonContent(json);
        expect(parsed.ok).toBe(true);
        if (!parsed.ok) {
            return;
        }

        const restored = parsed.diagram;
        const originalIds = sourceIds(source);
        const users = restored.tables?.find((table) => table.name === 'users');
        const posts = restored.tables?.find((table) => table.name === 'posts');
        const comments = restored.tables?.find(
            (table) => table.name === 'comments'
        );
        const usersPosts = restored.relationships?.find(
            (relationship) => relationship.name === 'users_posts_fk'
        );
        const postsComments = restored.relationships?.find(
            (relationship) => relationship.name === 'posts_comments_fk'
        );
        const status = users?.fields.find((field) => field.name === 'status');
        const accountStatus = restored.customTypes?.find(
            (customType) => customType.name === 'account_status'
        );
        const area = restored.areas?.[0];
        const note = restored.notes?.[0];

        expect(restored.id).not.toBe(source.id);
        expect(restored.name).toBe('Catalog');
        expect(restored.databaseType).toBe(DatabaseType.POSTGRESQL);
        expect(restored.createdAt).toBeInstanceOf(Date);
        expect(restored.createdAt.getTime()).not.toBe(
            source.createdAt.getTime()
        );
        expect(users?.id).not.toBe('users');
        expect(
            posts?.fields.find((field) => field.name === 'user_id')?.id
        ).not.toBe('posts-user-id');
        expect(usersPosts?.sourceTableId).toBe(users?.id);
        expect(usersPosts?.sourceFieldId).toBe(
            users?.fields.find((field) => field.name === 'id')?.id
        );
        expect(usersPosts?.targetTableId).toBe(posts?.id);
        expect(usersPosts?.targetFieldId).toBe(
            posts?.fields.find((field) => field.name === 'user_id')?.id
        );
        expect(postsComments?.sourceTableId).toBe(posts?.id);
        expect(postsComments?.targetTableId).toBe(comments?.id);
        expect(usersPosts?.id).not.toBe('rel-users-posts');
        for (const id of [
            usersPosts?.sourceTableId,
            usersPosts?.targetTableId,
            usersPosts?.sourceFieldId,
            usersPosts?.targetFieldId,
            postsComments?.sourceFieldId,
            postsComments?.targetFieldId,
            usersPosts?.id,
            postsComments?.id,
        ]) {
            expect(originalIds.has(id ?? '')).toBe(false);
        }
        expect(area?.name).toBe('Billing');
        expect(area?.id).not.toBe('area-billing');
        expect(users?.parentAreaId).toBe(area?.id);
        expect(note?.content).toBe('Account status is an enum.');
        expect(note?.id).not.toBe('note-account-status');
        expect(accountStatus?.values).toEqual(['active', 'disabled']);
        expect(accountStatus?.id).not.toBe('ct-account-status');
        expect(status?.type.name).toBe('account_status');
        expect(status?.type.id).toBe('ct-account-status');
    });

    it('drops a dangling relationship and keeps the rest of the backup', () => {
        const { json } = catalogBackup();
        const payload = JSON.parse(json) as {
            relationships: Array<Record<string, unknown>>;
        };
        const source = payload.relationships[0] ?? {};
        payload.relationships.push({
            ...source,
            id: 'rel-dangling',
            name: 'dangling_fk',
            targetTableId: 'missing-table',
        });

        const parsed = parseDiagramJsonContent(JSON.stringify(payload));
        expect(parsed.ok).toBe(true);
        if (!parsed.ok) {
            return;
        }

        expect(
            parsed.diagram.relationships?.some(
                (relationship) => relationship.name === 'dangling_fk'
            )
        ).toBe(false);
        expect(parsed.diagram.relationships).toHaveLength(2);
    });

    it('shares one cloned id when the backup repeats a source id', () => {
        const { json } = catalogBackup();
        const payload = JSON.parse(json) as {
            tables: Array<{ id: string; name: string }>;
        };
        payload.tables[1].id = payload.tables[0].id;

        const parsed = parseDiagramJsonContent(JSON.stringify(payload));
        expect(parsed.ok).toBe(true);
        if (!parsed.ok) {
            return;
        }

        expect(parsed.diagram.tables?.[0]?.id).toBe(
            parsed.diagram.tables?.[1]?.id
        );
    });

    it('rejects malformed JSON, an invalid shape, and an unknown database type without persisting', async () => {
        const cases = [
            '{not-json',
            JSON.stringify({ id: 'diagram', databaseType: 'postgresql' }),
            JSON.stringify({
                id: 'diagram',
                name: 'Backup',
                databaseType: 'postgresql',
                tables: 'nope',
            }),
            JSON.stringify({
                id: 'diagram',
                name: 'Backup',
                databaseType: 'snowflake',
            }),
        ];

        const malformed = await persistRestoredDiagramFromJson('{not-json', {
            destination: 'device',
            isAuthenticated: false,
            addDiagram,
        }).catch((error: unknown) => error);
        expect(malformed).toBeInstanceOf(RestoreDiagramJsonParseError);
        if (malformed instanceof RestoreDiagramJsonParseError) {
            expect(malformed.failure).toEqual({
                code: 'invalid_diagram_json',
                path: null,
                issueCode: 'invalid_json',
            });
        }

        const invalidTables = await persistRestoredDiagramFromJson(
            JSON.stringify({
                id: 'diagram',
                name: 'Backup',
                databaseType: 'postgresql',
                tables: 'nope',
            }),
            {
                destination: 'device',
                isAuthenticated: false,
                addDiagram,
            }
        ).catch((error: unknown) => error);
        expect(invalidTables).toBeInstanceOf(RestoreDiagramJsonParseError);
        if (invalidTables instanceof RestoreDiagramJsonParseError) {
            expect(invalidTables.failure.path).toBe('tables');
            expect(invalidTables.failure.code).toBe('invalid_diagram_json');
        }

        for (const json of cases) {
            await expect(
                persistRestoredDiagramFromJson(json, {
                    destination: 'device',
                    isAuthenticated: true,
                    addDiagram,
                })
            ).rejects.toMatchObject({
                name: 'RestoreDiagramJsonParseError',
                failure: { code: 'invalid_diagram_json' },
            });
        }

        const missingName = await persistRestoredDiagramFromJson(
            JSON.stringify({ id: 'diagram', databaseType: 'postgresql' }),
            {
                destination: 'online',
                isAuthenticated: true,
                addDiagram,
            }
        ).catch((error: unknown) => error);
        expect(missingName).toBeInstanceOf(RestoreDiagramJsonParseError);
        if (missingName instanceof RestoreDiagramJsonParseError) {
            expect(missingName.failure.path).toBe('name');
        }

        const unknownType = await persistRestoredDiagramFromJson(
            JSON.stringify({
                id: 'diagram',
                name: 'Backup',
                databaseType: 'snowflake',
            }),
            {
                destination: 'device',
                isAuthenticated: false,
                addDiagram,
            }
        ).catch((error: unknown) => error);
        expect(unknownType).toBeInstanceOf(RestoreDiagramJsonParseError);
        if (unknownType instanceof RestoreDiagramJsonParseError) {
            expect(unknownType.failure).toEqual({
                code: 'invalid_diagram_json',
                path: 'databaseType',
                issueCode: 'invalid_enum',
            });
        }

        expect(addDiagram).not.toHaveBeenCalled();
        expect(createDiagram).not.toHaveBeenCalled();
        expect(getDiagram).not.toHaveBeenCalled();
        expect(updateDiagram).not.toHaveBeenCalled();
    });

    it('accepts a backup that omits optional collections and keeps an edition', () => {
        const parsed = parseDiagramJsonContent(
            JSON.stringify({
                id: 'diagram',
                name: 'Sparse',
                databaseType: DatabaseType.POSTGRESQL,
                databaseEdition: DatabaseEdition.POSTGRESQL_SUPABASE,
            })
        );

        expect(parsed.ok).toBe(true);
        if (!parsed.ok) {
            return;
        }

        expect(parsed.diagram.databaseEdition).toBe(
            DatabaseEdition.POSTGRESQL_SUPABASE
        );
        expect(parsed.diagram.tables).toEqual([]);
        expect(parsed.diagram.relationships).toEqual([]);
        expect(parsed.diagram.dependencies).toEqual([]);
        expect(parsed.diagram.areas).toEqual([]);
        expect(parsed.diagram.customTypes).toEqual([]);
        expect(parsed.diagram.notes).toEqual([]);
    });

    it('restores a guest or authenticated device catalog only to Dexie', async () => {
        const { json } = catalogBackup();

        for (const isAuthenticated of [false, true]) {
            addDiagram.mockClear();
            const persisted = await persistRestoredDiagramFromJson(json, {
                destination: 'device',
                isAuthenticated,
                addDiagram,
            });

            expect(persisted.destination).toBe('device');
            expect(addDiagram).toHaveBeenCalledTimes(1);
            expect(createDiagram).not.toHaveBeenCalled();
            expect(getDiagram).not.toHaveBeenCalled();
            expect(updateDiagram).not.toHaveBeenCalled();
            if (persisted.destination !== 'device') {
                continue;
            }
            expect(
                persisted.diagram.tables?.map((table) => table.name)
            ).toEqual(['users', 'posts', 'comments']);
            expect(persisted.localId).toBe(persisted.diagram.id);
            expect(persisted.localId).not.toBe('42');
        }
    });

    it('posts an authenticated online restore and does not write Dexie or GET', async () => {
        const { json } = catalogBackup();
        const persisted = await persistRestoredDiagramFromJson(json, {
            destination: 'online',
            isAuthenticated: true,
            addDiagram,
        });

        expect(persisted).toEqual({ destination: 'online', diagramId: '77' });
        expect(createDiagram).toHaveBeenCalledTimes(1);
        const payload = createDiagram.mock.calls[0]?.[0] as {
            name: string;
            content: Diagram;
        };
        expect(payload.name).toBe('Catalog');
        expect(payload.content.tables?.map((table) => table.name)).toEqual([
            'users',
            'posts',
            'comments',
        ]);
        expect(addDiagram).not.toHaveBeenCalled();
        expect(getDiagram).not.toHaveBeenCalled();
        expect(updateDiagram).not.toHaveBeenCalled();

        await openPersistedNewDiagram(persisted, {
            setDiagramLocation,
            clearDiagramAccess,
            loadDiagramFromData,
            navigate,
            navigateAfterDeviceOpen: true,
        });

        expect(navigate).toHaveBeenCalledWith('/diagrams/77');
        expect(setDiagramLocation).not.toHaveBeenCalled();
        expect(loadDiagramFromData).not.toHaveBeenCalled();
        expect(getDiagram).not.toHaveBeenCalled();
    });

    it('does not call the API or open when Dexie add fails', async () => {
        addDiagram.mockRejectedValue(new Error('dexie failed'));

        await expect(
            persistRestoredDiagramFromJson(catalogBackup().json, {
                destination: 'device',
                isAuthenticated: true,
                addDiagram,
            })
        ).rejects.toThrow('dexie failed');

        expect(createDiagram).not.toHaveBeenCalled();
        expect(getDiagram).not.toHaveBeenCalled();
        expect(updateDiagram).not.toHaveBeenCalled();
        expect(setDiagramLocation).not.toHaveBeenCalled();
        expect(clearDiagramAccess).not.toHaveBeenCalled();
        expect(loadDiagramFromData).not.toHaveBeenCalled();
        expect(navigate).not.toHaveBeenCalled();
    });

    it('does not write Dexie when online creation is rejected as unauthenticated', async () => {
        const unauthorized = Object.assign(new Error('Unauthenticated'), {
            status: 401,
        });
        createDiagram.mockRejectedValue(unauthorized);

        await expect(
            persistRestoredDiagramFromJson(catalogBackup().json, {
                destination: 'online',
                isAuthenticated: true,
                addDiagram,
            })
        ).rejects.toMatchObject({ status: 401 });

        expect(addDiagram).not.toHaveBeenCalled();
        expect(getDiagram).not.toHaveBeenCalled();
        expect(updateDiagram).not.toHaveBeenCalled();
        expect(navigate).not.toHaveBeenCalled();
        expect(setDiagramLocation).not.toHaveBeenCalled();
    });

    it('does not write Dexie or navigate when online creation fails', async () => {
        createDiagram.mockRejectedValue(new Error('unauthorized'));

        await expect(
            persistRestoredDiagramFromJson(catalogBackup().json, {
                destination: 'online',
                isAuthenticated: true,
                addDiagram,
            })
        ).rejects.toThrow('unauthorized');

        expect(addDiagram).not.toHaveBeenCalled();
        expect(getDiagram).not.toHaveBeenCalled();
        expect(updateDiagram).not.toHaveBeenCalled();
        expect(navigate).not.toHaveBeenCalled();
        expect(setDiagramLocation).not.toHaveBeenCalled();
    });

    it('leaves the Dexie row in place when opening a persisted device restore fails', async () => {
        const persisted = await persistRestoredDiagramFromJson(
            catalogBackup().json,
            {
                destination: 'device',
                isAuthenticated: false,
                addDiagram,
            }
        );
        loadDiagramFromData.mockImplementation(() => {
            throw new Error('load failed');
        });

        await expect(
            openPersistedNewDiagram(persisted as PersistedNewDiagram, {
                setDiagramLocation,
                clearDiagramAccess,
                loadDiagramFromData,
                navigate,
                navigateAfterDeviceOpen: true,
            })
        ).rejects.toThrow('load failed');

        expect(addDiagram).toHaveBeenCalledTimes(1);
        expect(setDiagramLocation).not.toHaveBeenCalled();
        expect(clearDiagramAccess).not.toHaveBeenCalled();
        expect(navigate).not.toHaveBeenCalled();
        expect(createDiagram).not.toHaveBeenCalled();
    });
});
