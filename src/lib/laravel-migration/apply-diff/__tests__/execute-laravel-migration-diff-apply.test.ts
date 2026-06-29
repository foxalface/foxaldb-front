import type { DBTable } from '@/lib/domain/db-table';
import type {
    ColumnSnapshot,
    LaravelMigrationSchemaDiff,
} from '@/types/laravel-migration';
import { describe, expect, it, vi } from 'vitest';
import {
    ApplyExecutionError,
    executeLaravelMigrationDiffApply,
} from '../execute-laravel-migration-diff-apply';
import type { LaravelMigrationApplyApi } from '../laravel-migration-apply-api';
import { planLaravelMigrationDiffApply } from '../plan-laravel-migration-diff-apply';

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

const emptyDiff = (): LaravelMigrationSchemaDiff => ({
    addedTables: [],
    removedTables: [],
    changedTables: [],
    addedForeignKeys: [],
    removedForeignKeys: [],
    changedForeignKeys: [],
    warnings: [],
});

const createMockApi = (): LaravelMigrationApplyApi => ({
    addTables: vi.fn(async () => undefined),
    removeTables: vi.fn(async () => undefined),
    addField: vi.fn(async () => undefined),
    removeField: vi.fn(async () => undefined),
    updateField: vi.fn(async () => undefined),
    addIndex: vi.fn(async () => undefined),
    removeIndex: vi.fn(async () => undefined),
    updateIndex: vi.fn(async () => undefined),
    addRelationships: vi.fn(async () => undefined),
    removeRelationships: vi.fn(async () => undefined),
    updateRelationship: vi.fn(async () => undefined),
});

describe('executeLaravelMigrationDiffApply', () => {
    it('adds a table', async () => {
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
        const api = createMockApi();

        await executeLaravelMigrationDiffApply({
            plan,
            api,
            existingTables: [usersTable],
            existingRelationships: [],
        });

        expect(api.addTables).toHaveBeenCalledTimes(1);
        expect(api.addTables).toHaveBeenCalledWith(
            [
                expect.objectContaining({
                    name: 'comments',
                    fields: [
                        expect.objectContaining({
                            name: 'id',
                            type: { id: 'bigint', name: 'bigint' },
                        }),
                    ],
                }),
            ],
            { updateHistory: false }
        );
    });

    it('removes a table', async () => {
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
        const api = createMockApi();

        await executeLaravelMigrationDiffApply({
            plan,
            api,
            existingTables: [usersTable, postsTable],
            existingRelationships: [],
        });

        expect(api.removeTables).toHaveBeenCalledWith([postsTable.id], {
            updateHistory: false,
        });
    });

    it('modifies a column', async () => {
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
        const api = createMockApi();

        await executeLaravelMigrationDiffApply({
            plan,
            api,
            existingTables: [postsTable],
            existingRelationships: [],
        });

        expect(api.updateField).toHaveBeenCalledWith(
            postsTable.id,
            'posts-title-field',
            expect.objectContaining({
                name: 'title',
                type: expect.objectContaining({
                    id: 'text',
                    name: 'text',
                }),
                nullable: false,
            }),
            { updateHistory: false }
        );
    });

    it('adds a foreign key involving existing tables', async () => {
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
        const api = createMockApi();

        await executeLaravelMigrationDiffApply({
            plan,
            api,
            existingTables: [usersTable, postsTable],
            existingRelationships: [],
        });

        expect(api.addRelationships).toHaveBeenCalledWith(
            [
                expect.objectContaining({
                    name: 'posts_user_id_foreign',
                    sourceTableId: postsTable.id,
                    targetTableId: usersTable.id,
                    sourceFieldId: 'posts-user-id-field',
                    targetFieldId: 'users-id-field',
                    onDelete: 'cascade',
                    onUpdate: 'restrict',
                }),
            ],
            { updateHistory: false }
        );
    });

    it('adds a table and foreign key involving the newly added table', async () => {
        const diff: LaravelMigrationSchemaDiff = {
            ...emptyDiff(),
            addedTables: [
                {
                    name: 'comments',
                    columns: [
                        baseColumn({
                            name: 'id',
                            type: 'bigInteger',
                            primary: true,
                        }),
                        baseColumn({
                            name: 'user_id',
                            type: 'unsignedBigInteger',
                            nullable: false,
                        }),
                    ],
                    indexes: [],
                },
            ],
            addedForeignKeys: [
                {
                    localTable: 'comments',
                    localColumn: 'user_id',
                    referencedTable: 'users',
                    referencedColumn: 'id',
                    constraintName: 'comments_user_id_foreign',
                    onDelete: 'cascade',
                    onUpdate: 'restrict',
                },
            ],
        };

        const plan = planLaravelMigrationDiffApply({
            tables: [usersTable],
            relationships: [],
            diff,
        });
        const api = createMockApi();

        await executeLaravelMigrationDiffApply({
            plan,
            api,
            existingTables: [usersTable],
            existingRelationships: [],
        });

        expect(api.addTables).toHaveBeenCalledTimes(1);
        expect(api.addRelationships).toHaveBeenCalledWith(
            [
                expect.objectContaining({
                    name: 'comments_user_id_foreign',
                    sourceTableId: expect.any(String),
                    targetTableId: usersTable.id,
                    sourceFieldId: expect.any(String),
                    targetFieldId: 'users-id-field',
                }),
            ],
            { updateHistory: false }
        );

        const addedTable = vi.mocked(api.addTables).mock.calls[0]?.[0]?.[0];
        const addedRelationship = vi.mocked(api.addRelationships).mock
            .calls[0]?.[0]?.[0];

        expect(addedTable?.name).toBe('comments');
        expect(addedRelationship?.sourceTableId).toBe(addedTable?.id);
    });

    it('throws ApplyExecutionError when plan.canApply is false', async () => {
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
        const api = createMockApi();

        await expect(
            executeLaravelMigrationDiffApply({
                plan,
                api,
                existingTables: [postsTable],
                existingRelationships: [],
            })
        ).rejects.toBeInstanceOf(ApplyExecutionError);
    });
});
