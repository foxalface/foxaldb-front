import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import type { Diagram } from '@/lib/domain/diagram';
import type { DBField, DBRelationship, DBTable } from '@/lib/domain';
import { DBCustomTypeKind } from '@/lib/domain/db-custom-type';
import { projectDiagramSemantics } from '../../test-support/diagram-semantic-projection';

const field = (
    id: string,
    name: string,
    overrides: Partial<DBField> = {}
): DBField => ({
    id,
    name,
    type: { id: 'int', name: 'int' },
    primaryKey: false,
    unique: false,
    nullable: true,
    createdAt: 1,
    ...overrides,
});

const table = (
    id: string,
    name: string,
    options: Partial<DBTable> & { fields?: DBField[] } = {}
): DBTable => ({
    id,
    name,
    schema: options.schema,
    x: options.x ?? 0,
    y: options.y ?? 0,
    width: options.width ?? 200,
    fields: options.fields ?? [],
    indexes: [],
    color: '#fff',
    isView: options.isView ?? false,
    createdAt: 1,
    order: options.order ?? 0,
});

const baseDiagram = (partial: Partial<Diagram>): Diagram => ({
    id: 'diagram-id',
    name: 'Test',
    databaseType: DatabaseType.POSTGRESQL,
    createdAt: new Date(),
    updatedAt: new Date(),
    tables: [],
    relationships: [],
    customTypes: [],
    ...partial,
});

describe('projectDiagramSemantics', () => {
    it('ignores generated ids for equivalent schema', () => {
        const semanticA = projectDiagramSemantics(
            baseDiagram({
                id: 'a',
                tables: [
                    table('t1', 'users', {
                        fields: [field('f1', 'id', { primaryKey: true })],
                    }),
                ],
            })
        );

        const semanticB = projectDiagramSemantics(
            baseDiagram({
                id: 'b',
                tables: [
                    table('other-t', 'users', {
                        fields: [field('other-f', 'id', { primaryKey: true })],
                    }),
                ],
            })
        );

        expect(semanticA).toEqual(semanticB);
    });

    it('ignores layout and table array order', () => {
        const users = table('u', 'users', {
            x: 10,
            y: 20,
            width: 400,
            fields: [field('uf', 'id')],
        });
        const posts = table('p', 'posts', {
            x: 500,
            y: 600,
            fields: [field('pf', 'user_id')],
        });

        const orderedA = projectDiagramSemantics(
            baseDiagram({ tables: [users, posts] })
        );
        const orderedB = projectDiagramSemantics(
            baseDiagram({ tables: [posts, users] })
        );

        expect(orderedA).toEqual(orderedB);
    });

    it('keeps distinct schemas with the same table name', () => {
        const semantic = projectDiagramSemantics(
            baseDiagram({
                tables: [
                    table('a', 'users', { schema: 'public' }),
                    table('b', 'users', { schema: 'audit' }),
                ],
            })
        );

        expect(semantic.tables).toHaveLength(2);
        expect(semantic.tables.map((t) => t.schema)).toEqual([
            'audit',
            'public',
        ]);
    });

    it('preserves isView', () => {
        const semantic = projectDiagramSemantics(
            baseDiagram({
                tables: [
                    table('v', 'active_users', { isView: true }),
                    table('t', 'users', { isView: false }),
                ],
            })
        );

        const views = semantic.tables.filter((t) => t.isView);
        const tables = semantic.tables.filter((t) => !t.isView);
        expect(views).toHaveLength(1);
        expect(tables).toHaveLength(1);
        expect(views[0]?.name).toBe('active_users');
    });

    it('preserves field semantic values without normalizing null and false', () => {
        const semantic = projectDiagramSemantics(
            baseDiagram({
                tables: [
                    table('t', 'flags', {
                        fields: [
                            field('a', 'a', {
                                nullable: false,
                                primaryKey: false,
                                unique: false,
                                increment: null,
                                default: undefined,
                            }),
                            field('b', 'b', {
                                nullable: true,
                                default: '',
                            }),
                        ],
                    }),
                ],
            })
        );

        const flags = semantic.tables[0]?.fields;
        expect(flags?.[0]?.nullable).toBe(false);
        expect(flags?.[0]?.increment).toBe(null);
        expect(flags?.[0]?.default).toBe(undefined);
        expect(flags?.[1]?.default).toBe('');
    });

    it('projects relationships as referencing FK → referenced PK', () => {
        const users = table('users-id', 'users', {
            fields: [
                field('users-pk', 'id', { primaryKey: true, unique: true }),
            ],
        });
        const posts = table('posts-id', 'posts', {
            fields: [field('posts-fk', 'user_id')],
        });

        const relationship: DBRelationship = {
            id: 'rel-1',
            name: 'fk_posts_user',
            sourceTableId: users.id,
            targetTableId: posts.id,
            sourceFieldId: 'users-pk',
            targetFieldId: 'posts-fk',
            sourceCardinality: 'one',
            targetCardinality: 'many',
            createdAt: 1,
        };

        // SQL-import convention: source = referenced PK, target = FK holder

        const semantic = projectDiagramSemantics(
            baseDiagram({
                tables: [users, posts],
                relationships: [relationship],
            })
        );

        expect(semantic.relationships).toEqual([
            {
                referencing: {
                    schema: undefined,
                    table: 'posts',
                    field: 'user_id',
                },
                referenced: { schema: undefined, table: 'users', field: 'id' },
            },
        ]);
    });

    it('includes custom types without ids', () => {
        const semantic = projectDiagramSemantics(
            baseDiagram({
                customTypes: [
                    {
                        id: 'enum-1',
                        name: 'status',
                        schema: 'public',
                        kind: DBCustomTypeKind.enum,
                        values: ['open', 'closed'],
                    },
                ],
            })
        );

        expect(semantic.customTypes).toEqual([
            {
                schema: 'public',
                name: 'status',
                kind: DBCustomTypeKind.enum,
                values: ['open', 'closed'],
            },
        ]);
    });
});
