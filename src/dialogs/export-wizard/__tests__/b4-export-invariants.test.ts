import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import type { Diagram } from '@/lib/domain/diagram';
import {
    deviceDiagramLocation,
    onlineDiagramLocation,
    readOnlineDiagramId,
} from '@/lib/diagram/diagram-location';
import { b4MergeCatalogFixture } from '@/lib/schema-merge/__tests__/b4-merge-fixture';
import { exportBaseSQL } from '@/lib/data/sql-export/export-sql-script';
import {
    getDeterministicSqlExportTargets,
    hasDeterministicSqlExportPath,
} from '@/lib/data/sql-export/deterministic-sql-export-capability';
import { generateDBMLFromDiagram } from '@/lib/dbml/dbml-export/dbml-export';
import { diagramToJSONOutput } from '@/lib/export-import-utils';
import { isPrismaExportSupported } from '@/lib/export/prisma-export-capability';
import { isEfCoreExportSupported } from '@/lib/export/ef-core-export-capability';
import { isRailsExportSupported } from '@/lib/export/rails-export-capability';
import { isDjangoExportSupported } from '@/lib/export/django-export-capability';
import { isDrizzleExportSupported } from '@/lib/export/drizzle-export-capability';
import { ApiError } from '@/lib/api/client';
import type * as ApiClientModule from '@/lib/api/client';
import { exportPrismaSchema } from '@/lib/api/prisma-export';
import { exportEfCoreProject } from '@/lib/api/ef-core-export';
import { exportRailsProject } from '@/lib/api/rails-export';
import { exportDjangoProject } from '@/lib/api/django-export';
import { exportDrizzleProject } from '@/lib/api/drizzle-export';
import { exportLaravelMigrations } from '@/lib/api/diagram-laravel-export';
import { getExportTargetAvailability } from '../export-target-availability';
import {
    EXPORT_TARGET_REGISTRY,
    resolveVisibleExportTargetsBySection,
} from '../export-target-registry';
import type { ExportTargetId } from '../export-target-id';

const { apiRequestMock } = vi.hoisted(() => ({
    apiRequestMock: vi.fn(),
}));

vi.mock('@/lib/api/client', async () => {
    const actual = (await vi.importActual(
        '@/lib/api/client'
    )) as typeof ApiClientModule;

    return {
        ...actual,
        apiRequest: apiRequestMock,
    };
});

const CLIENT_TARGETS = [
    'sql',
    'dbml',
    'diagram_json',
    'png',
    'jpg',
    'svg',
] as const satisfies readonly ExportTargetId[];

const STATELESS_TARGETS = [
    'prisma',
    'ef_core',
    'rails',
    'django',
    'drizzle',
] as const satisfies readonly ExportTargetId[];

const ONLINE_TARGETS = ['laravel'] as const satisfies readonly ExportTargetId[];

const withDatabaseType = (
    diagram: Diagram,
    databaseType: DatabaseType
): Diagram => ({
    ...diagram,
    databaseType,
});

const expectCatalogSql = (sql: string) => {
    expect(sql).toMatch(/create table/i);
    expect(sql.toLowerCase()).toContain('users');
    expect(sql.toLowerCase()).toContain('posts');
    expect(sql.toLowerCase()).toContain('comments');
    expect(sql.toLowerCase()).toContain('email');
    expect(sql.toLowerCase()).toContain('user_id');
    expect(sql.toLowerCase()).toContain('post_id');
    expect(sql).toMatch(/references|foreign key/i);
};

describe('B4 export inventory', () => {
    it('registers exactly the current twelve targets', () => {
        expect(EXPORT_TARGET_REGISTRY.map((target) => target.id)).toEqual([
            ...CLIENT_TARGETS.slice(0, 1),
            ...ONLINE_TARGETS,
            ...STATELESS_TARGETS,
            ...CLIENT_TARGETS.slice(1),
        ]);
        expect(EXPORT_TARGET_REGISTRY).toHaveLength(12);
    });

    it('keeps client exports local, frameworks stateless, and Laravel online-only', () => {
        const guest = {
            isAuthenticated: false,
            onlineDiagramId: null,
            databaseType: DatabaseType.POSTGRESQL,
        };
        const device = {
            isAuthenticated: true,
            onlineDiagramId: null,
            databaseType: DatabaseType.POSTGRESQL,
        };
        const online = {
            isAuthenticated: true,
            onlineDiagramId: '42',
            databaseType: DatabaseType.POSTGRESQL,
        };

        for (const targetId of CLIENT_TARGETS) {
            expect(getExportTargetAvailability(targetId, guest).status).toBe(
                'available'
            );
            expect(getExportTargetAvailability(targetId, device).status).toBe(
                'available'
            );
            expect(getExportTargetAvailability(targetId, online).status).toBe(
                'available'
            );
        }

        for (const targetId of STATELESS_TARGETS) {
            expect(getExportTargetAvailability(targetId, guest).status).toBe(
                'hidden'
            );
            expect(getExportTargetAvailability(targetId, device).status).toBe(
                'available'
            );
            expect(getExportTargetAvailability(targetId, online).status).toBe(
                'available'
            );
        }

        expect(getExportTargetAvailability('laravel', guest).status).toBe(
            'hidden'
        );
        expect(getExportTargetAvailability('laravel', device).status).toBe(
            'hidden'
        );
        expect(getExportTargetAvailability('laravel', online).status).toBe(
            'available'
        );
    });

    it('treats a numeric device id as device and ignores a mismatched online id', () => {
        expect(
            readOnlineDiagramId(deviceDiagramLocation('42'), '42')
        ).toBeNull();
        expect(
            readOnlineDiagramId(onlineDiagramLocation('42'), '43')
        ).toBeNull();
        expect(readOnlineDiagramId(onlineDiagramLocation('42'), '42')).toBe(
            '42'
        );
        expect(
            getExportTargetAvailability('laravel', {
                isAuthenticated: true,
                onlineDiagramId: readOnlineDiagramId(
                    deviceDiagramLocation('42'),
                    '42'
                ),
                databaseType: DatabaseType.POSTGRESQL,
            }).status
        ).toBe('hidden');
        expect(
            getExportTargetAvailability('prisma', {
                isAuthenticated: true,
                onlineDiagramId: null,
                databaseType: DatabaseType.POSTGRESQL,
            }).status
        ).toBe('available');
    });

    it('hides framework targets from guests and shows client targets', () => {
        const guest = {
            isAuthenticated: false,
            onlineDiagramId: null,
            databaseType: DatabaseType.POSTGRESQL,
        };
        const visible = [
            ...resolveVisibleExportTargetsBySection('database', guest),
            ...resolveVisibleExportTargetsBySection('framework', guest),
            ...resolveVisibleExportTargetsBySection('portable', guest),
            ...resolveVisibleExportTargetsBySection('visual', guest),
        ].map((target) => target.id);

        expect(visible).toEqual([
            'sql',
            'dbml',
            'diagram_json',
            'png',
            'jpg',
            'svg',
        ]);
    });

    it('does not import diagram persistence or autosave flush into the wizard', () => {
        const wizard = readFileSync(
            resolve(
                process.cwd(),
                'src/dialogs/export-wizard/export-wizard-dialog.tsx'
            ),
            'utf8'
        );

        expect(wizard).not.toContain('flushDiagramAutosave');
        expect(wizard).not.toContain('updateDiagram');
        expect(wizard).not.toContain('createDiagram');
        expect(wizard).not.toContain('deleteDiagram');
        expect(wizard).not.toContain('useStorage');
        expect(wizard).toContain('content: currentDiagram');
        expect(wizard).toContain('exportLaravelMigrations(currentDiagram.id');
    });
});

describe('B4 framework capability matrix', () => {
    const supported = (
        databaseTypes: readonly DatabaseType[]
    ): ReadonlySet<DatabaseType> => new Set(databaseTypes);

    const cases: Array<{
        name: string;
        supports: (databaseType: DatabaseType) => boolean;
        allowed: ReadonlySet<DatabaseType>;
    }> = [
        {
            name: 'Prisma',
            supports: isPrismaExportSupported,
            allowed: supported([
                DatabaseType.POSTGRESQL,
                DatabaseType.MYSQL,
                DatabaseType.MARIADB,
                DatabaseType.SQLITE,
                DatabaseType.SQL_SERVER,
                DatabaseType.COCKROACHDB,
            ]),
        },
        {
            name: 'EF Core',
            supports: isEfCoreExportSupported,
            allowed: supported([
                DatabaseType.POSTGRESQL,
                DatabaseType.SQL_SERVER,
                DatabaseType.SQLITE,
                DatabaseType.MYSQL,
            ]),
        },
        {
            name: 'Rails',
            supports: isRailsExportSupported,
            allowed: supported([
                DatabaseType.POSTGRESQL,
                DatabaseType.MYSQL,
                DatabaseType.MARIADB,
                DatabaseType.SQLITE,
            ]),
        },
        {
            name: 'Django',
            supports: isDjangoExportSupported,
            allowed: supported([
                DatabaseType.POSTGRESQL,
                DatabaseType.MYSQL,
                DatabaseType.MARIADB,
                DatabaseType.SQLITE,
            ]),
        },
        {
            name: 'Drizzle',
            supports: isDrizzleExportSupported,
            allowed: supported([
                DatabaseType.POSTGRESQL,
                DatabaseType.MYSQL,
                DatabaseType.MARIADB,
                DatabaseType.SQLITE,
            ]),
        },
    ];

    it.each(cases)(
        'keeps the $name database matrix unchanged',
        ({ supports, allowed }) => {
            for (const databaseType of Object.values(DatabaseType)) {
                expect(supports(databaseType)).toBe(allowed.has(databaseType));
            }
        }
    );
});

describe('B4 client export output', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    const forbidNetwork = () =>
        vi
            .spyOn(globalThis, 'fetch')
            .mockRejectedValue(new Error('export must not call the backend'));

    it('exports guest PostgreSQL SQL locally', async () => {
        const fetchSpy = forbidNetwork();
        const diagram = b4MergeCatalogFixture();
        const snapshot = structuredClone(diagram);

        const sql = await exportBaseSQL({
            diagram,
            targetDatabaseType: DatabaseType.POSTGRESQL,
        });

        expectCatalogSql(sql);
        expect(sql.toLowerCase()).toContain('account_status');
        expect(diagram).toEqual(snapshot);
        expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('exports MySQL, SQLite, and SQL Server from the same catalog shape', async () => {
        forbidNetwork();
        const source = b4MergeCatalogFixture();

        for (const databaseType of [
            DatabaseType.MYSQL,
            DatabaseType.SQLITE,
            DatabaseType.SQL_SERVER,
        ]) {
            const sql = await exportBaseSQL({
                diagram: withDatabaseType(source, databaseType),
                targetDatabaseType: databaseType,
            });
            expectCatalogSql(sql);
        }
    });

    it('exports PostgreSQL across MySQL, MariaDB, and SQL Server', async () => {
        forbidNetwork();
        const diagram = b4MergeCatalogFixture();

        for (const targetDatabaseType of [
            DatabaseType.MYSQL,
            DatabaseType.MARIADB,
            DatabaseType.SQL_SERVER,
        ]) {
            expect(
                hasDeterministicSqlExportPath(
                    DatabaseType.POSTGRESQL,
                    targetDatabaseType
                )
            ).toBe(true);
            const sql = await exportBaseSQL({
                diagram,
                targetDatabaseType,
            });
            expectCatalogSql(sql);
        }
    });

    it('has no deterministic SQL target for Oracle, CockroachDB, ClickHouse, or Generic', () => {
        for (const databaseType of [
            DatabaseType.ORACLE,
            DatabaseType.COCKROACHDB,
            DatabaseType.CLICKHOUSE,
            DatabaseType.GENERIC,
        ]) {
            expect(getDeterministicSqlExportTargets(databaseType)).toEqual([]);
            expect(
                hasDeterministicSqlExportPath(databaseType, databaseType)
            ).toBe(false);
            expect(
                hasDeterministicSqlExportPath(databaseType, DatabaseType.MYSQL)
            ).toBe(false);
        }
    });

    it('exports DBML tables and refs without a backend call', async () => {
        const fetchSpy = forbidNetwork();
        const diagram = b4MergeCatalogFixture();
        const snapshot = structuredClone(diagram);
        const result = await generateDBMLFromDiagram(diagram);
        const dbml = `${result.standardDbml}\n${result.relationshipsDbml}`;

        expect(result.error).toBeUndefined();
        expect(dbml).toContain('Table "public"."users"');
        expect(dbml).toContain('Table "public"."posts"');
        expect(dbml).toContain('Table "public"."comments"');
        expect(dbml).toContain('Ref "fk_0_users_posts_fk"');
        expect(dbml).toContain('Ref "fk_1_posts_comments_fk"');
        expect(diagram).toEqual(snapshot);
        expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('exports Diagram JSON with schema version, relationships, types, areas, and notes', () => {
        const diagram = b4MergeCatalogFixture();
        const snapshot = structuredClone(diagram);
        const parsed = JSON.parse(diagramToJSONOutput(diagram)) as {
            schemaVersion: number;
            relationships: Array<{ name: string }>;
            customTypes: Array<{ name: string }>;
            areas: Array<{ name: string }>;
            notes: Array<{ content: string }>;
        };

        expect(parsed.schemaVersion).toBe(1);
        expect(parsed.relationships.map((item) => item.name)).toEqual([
            'users_posts_fk',
            'posts_comments_fk',
        ]);
        expect(parsed.customTypes.map((item) => item.name)).toEqual([
            'account_status',
        ]);
        expect(parsed.areas.map((item) => item.name)).toEqual(['Billing']);
        expect(parsed.notes.map((item) => item.content)).toEqual([
            'Account status is an enum.',
        ]);
        expect(diagram).toEqual(snapshot);
    });
});

describe('B4 stateless framework export safety', () => {
    afterEach(() => {
        apiRequestMock.mockReset();
    });

    it('posts the in-memory diagram to each stateless endpoint', async () => {
        const diagram = b4MergeCatalogFixture();
        apiRequestMock.mockResolvedValue({ success: true, files: [] });

        await exportPrismaSchema({ version: '7', diagram });
        await exportEfCoreProject({ diagram });
        await exportRailsProject({ diagram });
        await exportDjangoProject({ diagram });
        await exportDrizzleProject({ diagram });

        expect(apiRequestMock.mock.calls.map((call) => call[0])).toEqual([
            '/exports/prisma',
            '/exports/ef-core',
            '/exports/rails',
            '/exports/django',
            '/exports/drizzle',
        ]);
        for (const call of apiRequestMock.mock.calls) {
            const data = call[1]?.data as { diagram?: Diagram };
            expect(data.diagram?.id).toBe('42');
            expect(data.diagram?.tables?.map((table) => table.name)).toEqual([
                'users',
                'posts',
                'comments',
            ]);
            expect(String(call[0])).not.toContain('/diagrams/');
        }
    });

    it.each([401, 422, 429])(
        'keeps the diagram unchanged when Prisma export returns %s',
        async (status) => {
            const diagram = b4MergeCatalogFixture();
            const snapshot = structuredClone(diagram);
            apiRequestMock.mockRejectedValue(
                new ApiError('export failed', status, { message: 'failed' })
            );

            await expect(
                exportPrismaSchema({ version: '7', diagram })
            ).rejects.toBeInstanceOf(ApiError);
            expect(diagram).toEqual(snapshot);
            expect(apiRequestMock).toHaveBeenCalledTimes(1);
            expect(apiRequestMock.mock.calls[0]?.[0]).toBe('/exports/prisma');
        }
    );

    it('keeps the diagram unchanged when a framework export cannot reach the server', async () => {
        const diagram = b4MergeCatalogFixture();
        const snapshot = structuredClone(diagram);
        apiRequestMock.mockRejectedValue(new Error('offline'));

        await expect(exportRailsProject({ diagram })).rejects.toThrow(
            'offline'
        );
        expect(diagram).toEqual(snapshot);
        expect(apiRequestMock.mock.calls[0]?.[0]).toBe('/exports/rails');
    });
});

describe('B4 Laravel export request', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('posts the current diagram content to the exact online diagram id', async () => {
        const diagram = {
            ...b4MergeCatalogFixture(),
            name: 'Unsaved catalog',
        };
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            blob: () =>
                Promise.resolve(new Blob(['zip'], { type: 'application/zip' })),
            text: () => Promise.resolve(''),
        });
        vi.stubGlobal('fetch', fetchMock);

        await exportLaravelMigrations(diagram.id, {
            laravelVersion: '13',
            includeIndexes: true,
            includeForeignKeys: true,
            content: diagram,
        });

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const [url, init] = fetchMock.mock.calls[0] as [
            string,
            { method?: string; body?: string },
        ];
        expect(url).toContain('/diagrams/42/export/laravel-migrations');
        expect(init.method).toBe('POST');
        const body = JSON.parse(init.body ?? '{}') as {
            content?: { name?: string; tables?: Array<{ name: string }> };
        };
        expect(body.content?.name).toBe('Unsaved catalog');
        expect(body.content?.tables?.map((table) => table.name)).toEqual([
            'users',
            'posts',
            'comments',
        ]);
    });

    it.each([403, 422, 500])(
        'does not issue another diagram write when Laravel export returns %s',
        async (status) => {
            const fetchMock = vi.fn().mockResolvedValue({
                ok: false,
                status,
                text: () =>
                    Promise.resolve(
                        JSON.stringify({ message: `status ${status}` })
                    ),
            });
            vi.stubGlobal('fetch', fetchMock);

            await expect(
                exportLaravelMigrations('42', {
                    laravelVersion: '13',
                    content: b4MergeCatalogFixture(),
                })
            ).rejects.toBeInstanceOf(ApiError);
            expect(fetchMock).toHaveBeenCalledTimes(1);
            expect(String(fetchMock.mock.calls[0]?.[0])).toContain(
                '/diagrams/42/export/laravel-migrations'
            );
        }
    );
});
