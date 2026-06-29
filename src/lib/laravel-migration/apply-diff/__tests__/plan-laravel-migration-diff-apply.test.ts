import type { DBRelationship } from '@/lib/domain/db-relationship';
import type { DBTable } from '@/lib/domain/db-table';
import type {
    ColumnSnapshot,
    LaravelMigrationSchemaDiff,
} from '@/types/laravel-migration';
import { describe, expect, it } from 'vitest';
import { mapColumnSnapshotToField } from '../map-column-snapshot-to-field';
import { planLaravelMigrationDiffApply } from '../plan-laravel-migration-diff-apply';
import { APPLY_OPERATION_PHASE_ORDER } from '../types';

const baseColumn = (
    overrides: Partial<ColumnSnapshot> = {}
): ColumnSnapshot => ({
    name: 'title',
    type: 'string',
    nullable: true,
    unique: false,
    primary: false,
    autoIncrement: false,
    length: 255,
    precision: null,
    scale: null,
    default: null,
    source: 'column',
    enumValues: null,
    ...overrides,
});

const usersTable: DBTable = {
    id: 'users-table-id',
    name: 'users',
    x: 0,
    y: 0,
    fields: [
        {
            id: 'users-id-field',
            name: 'id',
            type: { id: 'bigint', name: 'bigint' },
            primaryKey: true,
            unique: true,
            nullable: false,
            createdAt: 1,
        },
    ],
    indexes: [],
    color: '#000000',
    isView: false,
    createdAt: 1,
};

const postsTable: DBTable = {
    id: 'posts-table-id',
    name: 'posts',
    x: 100,
    y: 100,
    fields: [
        {
            id: 'posts-id-field',
            name: 'id',
            type: { id: 'bigint', name: 'bigint' },
            primaryKey: true,
            unique: true,
            nullable: false,
            createdAt: 1,
        },
        {
            id: 'posts-title-field',
            name: 'title',
            type: { id: 'varchar', name: 'varchar' },
            primaryKey: false,
            unique: false,
            nullable: true,
            characterMaximumLength: '255',
            createdAt: 1,
        },
        {
            id: 'posts-user-id-field',
            name: 'user_id',
            type: { id: 'bigint', name: 'bigint' },
            primaryKey: false,
            unique: false,
            nullable: false,
            createdAt: 1,
        },
    ],
    indexes: [],
    color: '#000000',
    isView: false,
    createdAt: 1,
};

const draftsTable: DBTable = {
    id: 'drafts-table-id',
    name: 'drafts',
    x: 200,
    y: 200,
    fields: [
        {
            id: 'drafts-id-field',
            name: 'id',
            type: { id: 'bigint', name: 'bigint' },
            primaryKey: true,
            unique: true,
            nullable: false,
            createdAt: 1,
        },
    ],
    indexes: [],
    color: '#000000',
    isView: false,
    createdAt: 1,
};

const postsUserRelationship: DBRelationship = {
    id: 'posts-user-relationship',
    name: 'posts_user_id_foreign',
    sourceTableId: postsTable.id,
    targetTableId: usersTable.id,
    sourceFieldId: 'posts-user-id-field',
    targetFieldId: 'users-id-field',
    sourceCardinality: 'many',
    targetCardinality: 'one',
    onDelete: 'cascade',
    onUpdate: 'restrict',
    createdAt: 1,
};

const emptyDiff = (): LaravelMigrationSchemaDiff => ({
    addedTables: [],
    removedTables: [],
    changedTables: [],
    addedForeignKeys: [],
    removedForeignKeys: [],
    changedForeignKeys: [],
    warnings: [],
});

describe('planLaravelMigrationDiffApply', () => {
    it('creates addTable operation for added tables', () => {
        const diff: LaravelMigrationSchemaDiff = {
            ...emptyDiff(),
            addedTables: [
                {
                    name: 'comments',
                    columns: [baseColumn({ name: 'id', type: 'bigInteger' })],
                    indexes: [],
                },
            ],
        };

        const plan = planLaravelMigrationDiffApply({
            tables: [usersTable],
            relationships: [],
            diff,
        });

        expect(plan.operations).toEqual([
            {
                kind: 'addTable',
                tableName: 'comments',
                table: diff.addedTables[0],
            },
        ]);
        expect(plan.canApply).toBe(true);
    });

    it('creates removeTable operation for removed tables', () => {
        const diff: LaravelMigrationSchemaDiff = {
            ...emptyDiff(),
            removedTables: [
                {
                    name: 'posts',
                    columns: [baseColumn({ name: 'id', type: 'bigInteger' })],
                    indexes: [],
                },
            ],
        };

        const plan = planLaravelMigrationDiffApply({
            tables: [usersTable, postsTable],
            relationships: [],
            diff,
        });

        expect(plan.operations).toEqual([
            {
                kind: 'removeTable',
                tableId: postsTable.id,
                tableName: 'posts',
                table: diff.removedTables[0],
            },
        ]);
    });

    it('creates modifyColumn operation for changed columns', () => {
        const after = baseColumn({
            name: 'title',
            type: 'text',
            nullable: false,
            length: null,
        });

        const diff: LaravelMigrationSchemaDiff = {
            ...emptyDiff(),
            changedTables: [
                {
                    tableName: 'posts',
                    addedColumns: [],
                    removedColumns: [],
                    changedColumns: [
                        {
                            columnName: 'title',
                            before: baseColumn(),
                            after,
                            changes: [
                                {
                                    attribute: 'type',
                                    before: 'string',
                                    after: 'text',
                                },
                            ],
                        },
                    ],
                    addedIndexes: [],
                    removedIndexes: [],
                    changedIndexes: [],
                },
            ],
        };

        const plan = planLaravelMigrationDiffApply({
            tables: [postsTable],
            relationships: [],
            diff,
        });

        expect(plan.operations).toHaveLength(1);
        expect(plan.operations[0]).toMatchObject({
            kind: 'modifyColumn',
            tableId: postsTable.id,
            fieldId: 'posts-title-field',
            after,
            fieldPayload: {
                name: 'title',
                type: { id: 'text', name: 'text' },
                nullable: false,
            },
        });
    });

    it('validates FK target and creates addForeignKey operation', () => {
        const diff: LaravelMigrationSchemaDiff = {
            ...emptyDiff(),
            addedForeignKeys: [
                {
                    localTable: 'posts',
                    localColumn: 'user_id',
                    referencedTable: 'users',
                    referencedColumn: 'id',
                    constraintName: 'posts_user_id_foreign',
                    onDelete: 'cascade',
                    onUpdate: 'restrict',
                },
            ],
        };

        const plan = planLaravelMigrationDiffApply({
            tables: [usersTable, postsTable],
            relationships: [],
            diff,
        });

        expect(plan.operations).toEqual([
            {
                kind: 'addForeignKey',
                localTableId: postsTable.id,
                localTableName: 'posts',
                localFieldId: 'posts-user-id-field',
                localColumnName: 'user_id',
                referencedTableId: usersTable.id,
                referencedTableName: 'users',
                referencedFieldId: 'users-id-field',
                referencedColumnName: 'id',
                foreignKey: diff.addedForeignKeys[0],
            },
        ]);
        expect(plan.canApply).toBe(true);
    });

    it('creates validation issue when FK target is missing', () => {
        const diff: LaravelMigrationSchemaDiff = {
            ...emptyDiff(),
            addedForeignKeys: [
                {
                    localTable: 'posts',
                    localColumn: 'user_id',
                    referencedTable: 'accounts',
                    referencedColumn: 'id',
                    constraintName: null,
                    onDelete: null,
                    onUpdate: null,
                },
            ],
        };

        const plan = planLaravelMigrationDiffApply({
            tables: [postsTable],
            relationships: [],
            diff,
        });

        expect(plan.operations).toHaveLength(0);
        expect(plan.canApply).toBe(false);
        expect(plan.issues).toContainEqual(
            expect.objectContaining({
                code: 'foreign_key_target_table_not_found',
                severity: 'error',
            })
        );
    });

    it('creates validation issue for duplicate added table', () => {
        const diff: LaravelMigrationSchemaDiff = {
            ...emptyDiff(),
            addedTables: [
                {
                    name: 'users',
                    columns: [baseColumn({ name: 'id', type: 'bigInteger' })],
                    indexes: [],
                },
            ],
        };

        const plan = planLaravelMigrationDiffApply({
            tables: [usersTable],
            relationships: [],
            diff,
        });

        expect(plan.operations).toHaveLength(0);
        expect(plan.canApply).toBe(false);
        expect(plan.issues).toContainEqual(
            expect.objectContaining({
                code: 'duplicate_table',
                severity: 'error',
            })
        );
    });

    it('sorts operations in required phase order', () => {
        const diff: LaravelMigrationSchemaDiff = {
            ...emptyDiff(),
            addedTables: [
                {
                    name: 'comments',
                    columns: [
                        baseColumn({ name: 'id', type: 'bigInteger' }),
                        baseColumn({
                            name: 'user_id',
                            type: 'unsignedBigInteger',
                        }),
                    ],
                    indexes: [],
                },
            ],
            removedTables: [
                {
                    name: 'drafts',
                    columns: [baseColumn({ name: 'id', type: 'bigInteger' })],
                    indexes: [],
                },
            ],
            addedForeignKeys: [
                {
                    localTable: 'comments',
                    localColumn: 'user_id',
                    referencedTable: 'users',
                    referencedColumn: 'id',
                    constraintName: null,
                    onDelete: null,
                    onUpdate: null,
                },
            ],
            removedForeignKeys: [
                {
                    localTable: 'posts',
                    localColumn: 'user_id',
                    referencedTable: 'users',
                    referencedColumn: 'id',
                    constraintName: 'posts_user_id_foreign',
                    onDelete: 'cascade',
                    onUpdate: 'restrict',
                },
            ],
            changedTables: [
                {
                    tableName: 'posts',
                    addedColumns: [
                        baseColumn({ name: 'published_at', type: 'timestamp' }),
                    ],
                    removedColumns: [
                        baseColumn({ name: 'title', type: 'string' }),
                    ],
                    changedColumns: [],
                    addedIndexes: [
                        {
                            name: 'posts_published_at_index',
                            columns: ['published_at'],
                            unique: false,
                            primary: false,
                        },
                    ],
                    removedIndexes: [],
                    changedIndexes: [],
                },
            ],
        };

        const plan = planLaravelMigrationDiffApply({
            tables: [usersTable, postsTable, draftsTable],
            relationships: [postsUserRelationship],
            diff,
        });

        const phaseOrder = plan.operations.map(
            (operation) => APPLY_OPERATION_PHASE_ORDER[operation.kind]
        );

        expect(phaseOrder).toEqual([...phaseOrder].sort((a, b) => a - b));
        expect(plan.operations.map((operation) => operation.kind)).toEqual([
            'removeForeignKey',
            'removeColumn',
            'removeTable',
            'addTable',
            'addColumn',
            'addIndex',
            'addForeignKey',
        ]);
    });
});

describe('mapColumnSnapshotToField', () => {
    it('creates validation issue for unknown column type', () => {
        const result = mapColumnSnapshotToField(
            baseColumn({ name: 'payload', type: 'binary' })
        );

        expect(result.fieldPayload).toBeNull();
        expect(result.issues).toContainEqual(
            expect.objectContaining({
                code: 'unknown_column_type',
                severity: 'error',
            })
        );
    });
});
