import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import type { Diagram } from '@/lib/domain/diagram';
import type { DBField } from '@/lib/domain/db-field';
import type { DBRelationship } from '@/lib/domain/db-relationship';
import type { DBTable } from '@/lib/domain/db-table';
import type { DBCustomType } from '@/lib/domain/db-custom-type';
import { DBCustomTypeKind } from '@/lib/domain/db-custom-type';
import type { DiffOperation } from '../../diff-types';
import { buildSchemaMergePreview } from '../build-schema-merge-preview';
import { previewFieldId, previewTableId } from '../preview-id';
import { fieldIdentityKey, tableIdentityKey } from '../identity-key';

const field = (
    id: string,
    name: string,
    overrides: Partial<DBField> = {}
): DBField => ({
    id,
    name,
    type: { id: 'varchar', name: 'varchar' },
    primaryKey: false,
    unique: false,
    nullable: true,
    createdAt: 0,
    ...overrides,
});

const table = (
    id: string,
    name: string,
    options: {
        schema?: string | null;
        x?: number;
        y?: number;
        fields?: DBField[];
        isView?: boolean;
        width?: number;
    } = {}
): DBTable => ({
    id,
    name,
    schema: options.schema ?? 'public',
    x: options.x ?? 0,
    y: options.y ?? 0,
    width: options.width ?? 280,
    fields: options.fields ?? [],
    indexes: [],
    color: '#8eb7ff',
    isView: options.isView ?? false,
    createdAt: 0,
});

const diagram = (
    tables: DBTable[] = [],
    relationships: DBRelationship[] = [],
    customTypes: DBCustomType[] = []
): Diagram => ({
    id: 'd1',
    name: 'Test',
    databaseType: DatabaseType.POSTGRESQL,
    tables,
    relationships,
    customTypes,
    createdAt: new Date(0),
    updatedAt: new Date(0),
});

const op = (value: DiffOperation): DiffOperation => value;

const build = (
    baseDiagram: Diagram,
    incomingDiagram: Diagram,
    operations: DiffOperation[],
    selected: string[]
) =>
    buildSchemaMergePreview({
        baseDiagram,
        incomingDiagram,
        operations,
        selectedOperationIds: new Set(selected),
        viewsCompared: true,
        defaultSchema: 'public',
    });

describe('buildSchemaMergePreview', () => {
    it('returns base diagram with empty decorations when nothing is selected', () => {
        const base = diagram([
            table('t1', 'users', { fields: [field('f1', 'email')] }),
        ]);
        const incoming = diagram();

        const result = build(base, incoming, [], []);

        expect(result.decorations).toEqual({
            tables: {},
            fields: {},
            relationships: {},
        });
        expect(result.diagram.tables?.[0]?.name).toBe('users');
        expect(result.diagram.tables?.[0]?.x).toBe(0);
    });

    it('does not mutate inputs', () => {
        const base = diagram([table('t1', 'users')]);
        const incoming = diagram([table('i1', 'invoices')]);
        const operations = [
            op({
                id: 'add-invoices',
                category: 'table',
                type: 'add',
                entityId: null,
                renameTo: null,
                identity: { kind: 'table', schema: 'public', name: 'invoices' },
                before: null,
                after: null,
                changes: [],
                dependsOn: [],
            } as DiffOperation),
        ];

        const baseBefore = structuredClone(base);
        const incomingBefore = structuredClone(incoming);

        build(base, incoming, operations, ['add-invoices']);

        expect(base).toEqual(baseBefore);
        expect(incoming).toEqual(incomingBefore);
    });

    it('adds a selected table with deterministic preview id and placement', () => {
        const base = diagram([
            table('t1', 'users', { x: 100, y: 50, width: 280 }),
        ]);
        const incoming = diagram([
            table('incoming-id', 'invoices', {
                fields: [field('incoming-field', 'id', { primaryKey: true })],
            }),
        ]);
        const identity = {
            kind: 'table' as const,
            schema: 'public',
            name: 'invoices',
        };
        const operations = [
            op({
                id: 'add-table',
                category: 'table',
                type: 'add',
                entityId: null,
                renameTo: null,
                identity,
                before: null,
                after: null,
                changes: [],
                dependsOn: [],
            } as DiffOperation),
        ];

        const first = build(base, incoming, operations, ['add-table']);
        const second = build(base, incoming, operations, ['add-table']);

        const added = first.diagram.tables?.find(
            (item) => item.name === 'invoices'
        );
        expect(added?.id).toBe(previewTableId(tableIdentityKey(identity)));
        expect(added?.id).not.toBe('incoming-id');
        expect(added?.x).toBe(100 + 280 + 80);
        expect(added?.y).toBe(0);
        expect(added?.fields[0]?.id).not.toBe('incoming-field');
        expect(first.decorations.tables[added!.id]).toBe('add');
        expect(base.tables?.[0]?.x).toBe(100);
        expect(
            second.diagram.tables?.find((t) => t.name === 'invoices')?.id
        ).toBe(added?.id);
    });

    it('omits unselected table add', () => {
        const base = diagram();
        const incoming = diagram([table('i1', 'invoices')]);
        const operations = [
            op({
                id: 'add-table',
                category: 'table',
                type: 'add',
                entityId: null,
                renameTo: null,
                identity: { kind: 'table', schema: 'public', name: 'invoices' },
                before: null,
                after: null,
                changes: [],
                dependsOn: [],
            } as DiffOperation),
        ];

        const result = build(base, incoming, operations, []);

        expect(result.diagram.tables).toHaveLength(0);
    });

    it('does not duplicate fields when table add and field adds are both selected', () => {
        const base = diagram();
        const incoming = diagram([
            table('i1', 'invoices', {
                fields: [field('if1', 'id'), field('if2', 'amount')],
            }),
        ]);
        const operations = [
            op({
                id: 'add-table',
                category: 'table',
                type: 'add',
                entityId: null,
                renameTo: null,
                identity: { kind: 'table', schema: 'public', name: 'invoices' },
                before: null,
                after: null,
                changes: [],
                dependsOn: [],
            } as DiffOperation),
            op({
                id: 'add-field-id',
                category: 'field',
                type: 'add',
                entityId: null,
                renameTo: null,
                identity: {
                    kind: 'field',
                    schema: 'public',
                    table: 'invoices',
                    name: 'id',
                },
                before: null,
                after: null,
                changes: [],
                dependsOn: ['add-table'],
            } as DiffOperation),
            op({
                id: 'add-field-amount',
                category: 'field',
                type: 'add',
                entityId: null,
                renameTo: null,
                identity: {
                    kind: 'field',
                    schema: 'public',
                    table: 'invoices',
                    name: 'amount',
                },
                before: null,
                after: null,
                changes: [],
                dependsOn: ['add-table'],
            } as DiffOperation),
        ];

        const result = build(base, incoming, operations, [
            'add-table',
            'add-field-id',
            'add-field-amount',
        ]);
        const invoices = result.diagram.tables?.find(
            (t) => t.name === 'invoices'
        );

        expect(invoices?.fields).toHaveLength(2);
    });

    it('adds a field to an existing parent', () => {
        const base = diagram([
            table('t1', 'users', { fields: [field('f1', 'id')] }),
        ]);
        const incoming = diagram([
            table('i1', 'users', {
                fields: [field('if1', 'id'), field('if2', 'nickname')],
            }),
        ]);
        const fieldIdentity = {
            kind: 'field' as const,
            schema: 'public',
            table: 'users',
            name: 'nickname',
        };
        const operations = [
            op({
                id: 'add-field',
                category: 'field',
                type: 'add',
                entityId: null,
                renameTo: null,
                identity: fieldIdentity,
                before: null,
                after: null,
                changes: [],
                dependsOn: [],
            } as DiffOperation),
        ];

        const result = build(base, incoming, operations, ['add-field']);
        const users = result.diagram.tables?.[0];

        expect(users?.fields).toHaveLength(2);
        const added = users?.fields.find((f) => f.name === 'nickname');
        expect(added?.id).toBe(previewFieldId(fieldIdentityKey(fieldIdentity)));
        expect(result.decorations.fields[added!.id]).toBe('add');
    });

    it('applies selected field modify and keeps unselected modify at base value', () => {
        const base = diagram([
            table('t1', 'users', {
                fields: [field('f1', 'email', { nullable: false })],
            }),
        ]);
        const incoming = diagram();
        const operations = [
            op({
                id: 'modify-field',
                category: 'field',
                type: 'modify',
                entityId: 'f1',
                renameTo: null,
                identity: {
                    kind: 'field',
                    schema: 'public',
                    table: 'users',
                    name: 'email',
                },
                before: null,
                after: null,
                changes: [
                    {
                        attribute: 'nullable',
                        before: false,
                        after: true,
                    },
                ],
                dependsOn: [],
            } as DiffOperation),
        ];

        const selected = build(base, incoming, operations, ['modify-field']);
        const unselected = build(base, incoming, operations, []);

        expect(selected.diagram.tables?.[0]?.fields[0]?.nullable).toBe(true);
        expect(selected.decorations.fields.f1).toBe('modify');
        expect(unselected.diagram.tables?.[0]?.fields[0]?.nullable).toBe(false);
        expect(unselected.decorations.fields).toEqual({});
    });

    it('renames table and field while preserving ids and layout', () => {
        const base = diagram([
            table('t1', 'users', {
                x: 40,
                y: 80,
                fields: [field('f1', 'name')],
            }),
        ]);
        const incoming = diagram();
        const operations = [
            op({
                id: 'rename-table',
                category: 'table',
                type: 'rename',
                entityId: 't1',
                renameTo: { kind: 'table', schema: 'public', name: 'accounts' },
                identity: { kind: 'table', schema: 'public', name: 'users' },
                before: null,
                after: null,
                changes: [],
                dependsOn: [],
            } as DiffOperation),
            op({
                id: 'rename-field',
                category: 'field',
                type: 'rename',
                entityId: 'f1',
                renameTo: {
                    kind: 'field',
                    schema: 'public',
                    table: 'accounts',
                    name: 'full_name',
                },
                identity: {
                    kind: 'field',
                    schema: 'public',
                    table: 'users',
                    name: 'name',
                },
                before: null,
                after: null,
                changes: [],
                dependsOn: ['rename-table'],
            } as DiffOperation),
        ];

        const result = build(base, incoming, operations, [
            'rename-table',
            'rename-field',
        ]);
        const renamed = result.diagram.tables?.[0];

        expect(renamed?.id).toBe('t1');
        expect(renamed?.x).toBe(40);
        expect(renamed?.y).toBe(80);
        expect(renamed?.name).toBe('accounts');
        expect(renamed?.fields[0]?.id).toBe('f1');
        expect(renamed?.fields[0]?.name).toBe('full_name');
        expect(result.decorations.tables.t1).toBe('rename');
        expect(result.decorations.fields.f1).toBe('rename');
    });

    it('keeps rename decoration when rename also carries attribute changes', () => {
        const base = diagram([
            table('t1', 'users', {
                fields: [
                    field('f1', 'email', {
                        type: { id: 'varchar', name: 'varchar' },
                    }),
                ],
            }),
        ]);
        const operations = [
            op({
                id: 'rename-field',
                category: 'field',
                type: 'rename',
                entityId: 'f1',
                renameTo: {
                    kind: 'field',
                    schema: 'public',
                    table: 'users',
                    name: 'email_address',
                },
                identity: {
                    kind: 'field',
                    schema: 'public',
                    table: 'users',
                    name: 'email',
                },
                before: null,
                after: null,
                changes: [
                    {
                        attribute: 'type',
                        before: { id: 'varchar', name: 'varchar' },
                        after: { id: 'text', name: 'text' },
                    },
                ],
                dependsOn: [],
            } as DiffOperation),
        ];

        const result = build(base, diagram(), operations, ['rename-field']);

        expect(result.diagram.tables?.[0]?.fields[0]?.name).toBe(
            'email_address'
        );
        expect(result.diagram.tables?.[0]?.fields[0]?.type.name).toBe('text');
        expect(result.decorations.fields.f1).toBe('rename');
    });

    it('decorates deletes without removing entities', () => {
        const base = diagram([
            table('t1', 'users', {
                fields: [field('f1', 'email'), field('f2', 'name')],
            }),
        ]);
        const operations = [
            op({
                id: 'delete-table',
                category: 'table',
                type: 'delete',
                entityId: 't1',
                renameTo: null,
                identity: { kind: 'table', schema: 'public', name: 'users' },
                before: null,
                after: null,
                changes: [],
                dependsOn: [],
            } as DiffOperation),
            op({
                id: 'delete-field',
                category: 'field',
                type: 'delete',
                entityId: 'f2',
                renameTo: null,
                identity: {
                    kind: 'field',
                    schema: 'public',
                    table: 'users',
                    name: 'name',
                },
                before: null,
                after: null,
                changes: [],
                dependsOn: [],
            } as DiffOperation),
        ];

        const tableOnly = build(base, diagram(), operations, ['delete-table']);
        expect(tableOnly.diagram.tables).toHaveLength(1);
        expect(tableOnly.decorations.tables.t1).toBe('delete');
        expect(tableOnly.decorations.fields).toEqual({});

        const fieldOnly = build(base, diagram(), operations, ['delete-field']);
        expect(fieldOnly.decorations.fields.f2).toBe('delete');
        expect(fieldOnly.decorations.tables).toEqual({});
    });

    it('adds and modifies relationships using semantic endpoints', () => {
        const base = diagram(
            [
                table('t1', 'users', { fields: [field('f1', 'id')] }),
                table('t2', 'posts', { fields: [field('f2', 'user_id')] }),
            ],
            [
                {
                    id: 'r1',
                    name: 'users_posts',
                    sourceTableId: 't1',
                    targetTableId: 't2',
                    sourceFieldId: 'f1',
                    targetFieldId: 'f2',
                    sourceCardinality: 'one',
                    targetCardinality: 'many',
                    createdAt: 0,
                },
            ]
        );

        const addOp = op({
            id: 'rel-add',
            category: 'relationship',
            type: 'add',
            entityId: null,
            renameTo: null,
            identity: {
                kind: 'relationship',
                source: {
                    schema: 'public',
                    table: 'users',
                    field: 'id',
                },
                target: {
                    schema: 'public',
                    table: 'comments',
                    field: 'user_id',
                },
            },
            before: null,
            after: null,
            changes: [],
            dependsOn: [],
        } as DiffOperation);

        const incomingWithComments = diagram(
            [
                table('i1', 'users', { fields: [field('if1', 'id')] }),
                table('i3', 'comments', { fields: [field('if3', 'user_id')] }),
            ],
            [
                {
                    id: 'incoming-rel',
                    name: 'users_comments',
                    sourceTableId: 'i1',
                    targetTableId: 'i3',
                    sourceFieldId: 'if1',
                    targetFieldId: 'if3',
                    sourceCardinality: 'one',
                    targetCardinality: 'many',
                    createdAt: 0,
                },
            ]
        );

        const addResult = build(
            diagram(
                [
                    table('t1', 'users', { fields: [field('f1', 'id')] }),
                    table('t3', 'comments', {
                        fields: [field('f3', 'user_id')],
                    }),
                ],
                []
            ),
            incomingWithComments,
            [addOp],
            ['rel-add']
        );

        expect(addResult.diagram.relationships).toHaveLength(1);
        expect(addResult.diagram.relationships?.[0]?.id).not.toBe(
            'incoming-rel'
        );
        expect(addResult.decorations.relationships).toBeDefined();

        const modifyOp = op({
            id: 'rel-mod',
            category: 'relationship',
            type: 'modify',
            entityId: 'r1',
            renameTo: null,
            identity: {
                kind: 'relationship',
                source: {
                    schema: 'public',
                    table: 'users',
                    field: 'id',
                },
                target: {
                    schema: 'public',
                    table: 'posts',
                    field: 'user_id',
                },
            },
            before: null,
            after: null,
            changes: [
                {
                    attribute: 'onDelete',
                    before: null,
                    after: 'cascade',
                },
            ],
            dependsOn: [],
        } as DiffOperation);

        const modifyResult = build(base, diagram(), [modifyOp], ['rel-mod']);

        expect(modifyResult.diagram.relationships?.[0]?.id).toBe('r1');
        expect(modifyResult.diagram.relationships?.[0]?.onDelete).toBe(
            'cascade'
        );
        expect(modifyResult.decorations.relationships.r1).toBe('modify');
    });

    it('resolves relationship endpoints after table rename', () => {
        const base = diagram([
            table('t1', 'users', { fields: [field('f1', 'id')] }),
            table('t2', 'invoices', { fields: [field('f2', 'user_id')] }),
        ]);
        const incoming = diagram(
            [
                table('i1', 'accounts', { fields: [field('if1', 'id')] }),
                table('i2', 'invoices', { fields: [field('if2', 'user_id')] }),
            ],
            [
                {
                    id: 'incoming-rel',
                    name: 'accounts_invoices',
                    sourceTableId: 'i1',
                    targetTableId: 'i2',
                    sourceFieldId: 'if1',
                    targetFieldId: 'if2',
                    sourceCardinality: 'one',
                    targetCardinality: 'many',
                    createdAt: 0,
                },
            ]
        );

        const operations = [
            op({
                id: 'rename-users',
                category: 'table',
                type: 'rename',
                entityId: 't1',
                renameTo: { kind: 'table', schema: 'public', name: 'accounts' },
                identity: { kind: 'table', schema: 'public', name: 'users' },
                before: null,
                after: null,
                changes: [],
                dependsOn: [],
            } as DiffOperation),
            op({
                id: 'rel-add',
                category: 'relationship',
                type: 'add',
                entityId: null,
                renameTo: null,
                identity: {
                    kind: 'relationship',
                    source: {
                        schema: 'public',
                        table: 'accounts',
                        field: 'id',
                    },
                    target: {
                        schema: 'public',
                        table: 'invoices',
                        field: 'user_id',
                    },
                },
                before: null,
                after: null,
                changes: [],
                dependsOn: ['rename-users'],
            } as DiffOperation),
        ];

        const result = build(base, incoming, operations, [
            'rename-users',
            'rel-add',
        ]);

        expect(result.diagram.relationships).toHaveLength(1);
        expect(result.diagram.relationships?.[0]?.sourceTableId).toBe('t1');
    });

    it('skips relationship add when endpoints cannot be resolved', () => {
        const base = diagram([
            table('t1', 'users', { fields: [field('f1', 'id')] }),
        ]);
        const incoming = diagram(
            [
                table('i1', 'users', { fields: [field('if1', 'id')] }),
                table('i2', 'orphan', { fields: [field('if2', 'user_id')] }),
            ],
            [
                {
                    id: 'incoming-rel',
                    name: 'rel',
                    sourceTableId: 'i1',
                    targetTableId: 'i2',
                    sourceFieldId: 'if1',
                    targetFieldId: 'if2',
                    sourceCardinality: 'one',
                    targetCardinality: 'many',
                    createdAt: 0,
                },
            ]
        );

        const operations = [
            op({
                id: 'rel-add',
                category: 'relationship',
                type: 'add',
                entityId: null,
                renameTo: null,
                identity: {
                    kind: 'relationship',
                    source: {
                        schema: 'public',
                        table: 'users',
                        field: 'id',
                    },
                    target: {
                        schema: 'public',
                        table: 'orphan',
                        field: 'user_id',
                    },
                },
                before: null,
                after: null,
                changes: [],
                dependsOn: [],
            } as DiffOperation),
        ];

        const result = build(base, incoming, operations, ['rel-add']);

        expect(result.diagram.relationships ?? []).toHaveLength(0);
    });

    it('copies custom types required by selected field type changes', () => {
        const custom: DBCustomType = {
            id: 'ct-incoming',
            name: 'status_enum',
            kind: DBCustomTypeKind.enum,
            values: ['open', 'closed'],
        };
        const base = diagram([
            table('t1', 'users', {
                fields: [
                    field('f1', 'status', {
                        type: { id: 'status_enum', name: 'status_enum' },
                    }),
                ],
            }),
        ]);
        const incoming = diagram(
            [
                table('i1', 'users', {
                    fields: [
                        field('if1', 'status', {
                            type: {
                                id: 'status_enum',
                                name: 'status_enum',
                            },
                        }),
                    ],
                }),
            ],
            [],
            [custom]
        );

        const operations = [
            op({
                id: 'modify-field',
                category: 'field',
                type: 'modify',
                entityId: 'f1',
                renameTo: null,
                identity: {
                    kind: 'field',
                    schema: 'public',
                    table: 'users',
                    name: 'status',
                },
                before: null,
                after: null,
                changes: [
                    {
                        attribute: 'type',
                        before: { id: 'varchar', name: 'varchar' },
                        after: {
                            id: 'status_enum',
                            name: 'status_enum',
                            customType: {
                                name: 'status_enum',
                                kind: 'enum',
                                values: ['open', 'closed'],
                            },
                        },
                    },
                ],
                dependsOn: [],
            } as DiffOperation),
        ];

        const result = build(base, incoming, operations, ['modify-field']);

        expect(
            result.diagram.customTypes?.some((t) => t.name === 'status_enum')
        ).toBe(true);
    });

    it('places multiple new tables deterministically on an empty base', () => {
        const incoming = diagram([table('i1', 'a'), table('i2', 'b')]);
        const operations = [
            op({
                id: 'add-a',
                category: 'table',
                type: 'add',
                entityId: null,
                renameTo: null,
                identity: { kind: 'table', schema: 'public', name: 'a' },
                before: null,
                after: null,
                changes: [],
                dependsOn: [],
            } as DiffOperation),
            op({
                id: 'add-b',
                category: 'table',
                type: 'add',
                entityId: null,
                renameTo: null,
                identity: { kind: 'table', schema: 'public', name: 'b' },
                before: null,
                after: null,
                changes: [],
                dependsOn: [],
            } as DiffOperation),
        ];

        const result = build(diagram(), incoming, operations, [
            'add-a',
            'add-b',
        ]);
        const positions = (result.diagram.tables ?? []).map((t) => ({
            name: t.name,
            x: t.x,
            y: t.y,
        }));

        expect(positions).toEqual([
            { name: 'a', x: 0, y: 0 },
            { name: 'b', x: 0, y: 160 },
        ]);
    });
});
