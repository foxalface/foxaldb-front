import { DatabaseType } from '@/lib/domain/database-type';
import type { Diagram } from '@/lib/domain/diagram';
import type { DBField } from '@/lib/domain/db-field';
import type { DBTable } from '@/lib/domain/db-table';
import type { DiffOperation } from '@/lib/schema-merge/diff-types';
import type { MergeWizardApplyContext } from './merge-wizard-apply-context';

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

const table = (id: string, name: string, fields: DBField[] = []): DBTable => ({
    id,
    name,
    schema: 'public',
    x: 0,
    y: 0,
    width: 280,
    fields,
    indexes: [],
    color: '#8eb7ff',
    isView: false,
    createdAt: 0,
});

const diagram = (
    tables: DBTable[],
    relationships: Diagram['relationships'] = []
): Diagram => ({
    id: 'base-diagram',
    name: 'Base',
    databaseType: DatabaseType.POSTGRESQL,
    tables,
    relationships,
    createdAt: new Date(0),
    updatedAt: new Date(0),
});

const op = (value: DiffOperation): DiffOperation => value;

const hash = 'c'.repeat(64);

/**
 * Representative Compare result for Result-step preview integration tests.
 * Includes table add (with dependent field + relationship), rename, modify, delete.
 */
export const mergeResultPreviewFixture = (): {
    applyContext: MergeWizardApplyContext;
    operationIds: {
        addTable: string;
        addField: string;
        addRelationship: string;
        renameField: string;
        modifyField: string;
        deleteField: string;
    };
} => {
    const baseDiagram = diagram([
        table('t-users', 'users', [
            field('f-name', 'name'),
            field('f-legacy', 'legacy_code'),
            field('f-notes', 'notes'),
        ]),
    ]);

    const incomingDiagram = diagram(
        [
            table('incoming-users', 'users', [
                field('incoming-name', 'full_name'),
            ]),
            table('incoming-invoices', 'invoices', [
                field('incoming-id', 'id', { primaryKey: true }),
                field('incoming-user', 'user_id'),
                field('incoming-amount', 'amount'),
            ]),
        ],
        [
            {
                id: 'incoming-rel',
                name: 'users_invoices',
                sourceTableId: 'incoming-users',
                targetTableId: 'incoming-invoices',
                sourceFieldId: 'incoming-name',
                targetFieldId: 'incoming-user',
                sourceSchema: 'public',
                targetSchema: 'public',
                sourceCardinality: 'one',
                targetCardinality: 'many',
                createdAt: 0,
            },
        ]
    );

    const addTableId = 'op-add-table';
    const addFieldId = 'op-add-field';
    const addRelationshipId = 'op-add-rel';
    const renameFieldId = 'op-rename-field';
    const modifyFieldId = 'op-modify-field';
    const deleteFieldId = 'op-delete-field';

    const operations: DiffOperation[] = [
        op({
            id: addTableId,
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
            id: addFieldId,
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
            dependsOn: [addTableId],
        } as DiffOperation),
        op({
            id: addRelationshipId,
            category: 'relationship',
            type: 'add',
            entityId: null,
            renameTo: null,
            identity: {
                kind: 'relationship',
                source: { schema: 'public', table: 'users', field: 'name' },
                target: {
                    schema: 'public',
                    table: 'invoices',
                    field: 'user_id',
                },
            },
            before: null,
            after: null,
            changes: [],
            dependsOn: [addTableId],
        } as DiffOperation),
        op({
            id: renameFieldId,
            category: 'field',
            type: 'rename',
            entityId: 'f-name',
            renameTo: {
                kind: 'field',
                schema: 'public',
                table: 'users',
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
            dependsOn: [],
        } as DiffOperation),
        op({
            id: modifyFieldId,
            category: 'field',
            type: 'modify',
            entityId: 'f-legacy',
            renameTo: null,
            identity: {
                kind: 'field',
                schema: 'public',
                table: 'users',
                name: 'legacy_code',
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
        op({
            id: deleteFieldId,
            category: 'field',
            type: 'delete',
            entityId: 'f-notes',
            renameTo: null,
            identity: {
                kind: 'field',
                schema: 'public',
                table: 'users',
                name: 'notes',
            },
            before: null,
            after: null,
            changes: [],
            dependsOn: [],
        } as DiffOperation),
    ];

    const applyContext: MergeWizardApplyContext = {
        baseDiagram,
        incomingDiagram,
        source: { kind: 'sql' },
        includeDeletions: true,
        generation: 42,
        response: {
            baseContentHash: hash,
            baseUpdatedAt: null,
            viewsCompared: true,
            operations,
        },
    };

    return {
        applyContext,
        operationIds: {
            addTable: addTableId,
            addField: addFieldId,
            addRelationship: addRelationshipId,
            renameField: renameFieldId,
            modifyField: modifyFieldId,
            deleteField: deleteFieldId,
        },
    };
};
