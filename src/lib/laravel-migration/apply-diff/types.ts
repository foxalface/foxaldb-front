import type { DBField } from '@/lib/domain/db-field';
import type { DBIndex } from '@/lib/domain/db-index';
import type { DBRelationship } from '@/lib/domain/db-relationship';
import type { DBTable } from '@/lib/domain/db-table';
import type {
    ColumnSnapshot,
    ForeignKeySnapshot,
    IndexSnapshot,
    TableSnapshot,
} from '@/types/laravel-migration';

export type ApplyOperationKind =
    | 'removeForeignKey'
    | 'removeIndex'
    | 'removeColumn'
    | 'removeTable'
    | 'modifyColumn'
    | 'modifyIndex'
    | 'modifyForeignKey'
    | 'addTable'
    | 'addColumn'
    | 'addIndex'
    | 'addForeignKey';

export type ApplyValidationSeverity = 'error' | 'warning';

export interface ApplyValidationIssue {
    severity: ApplyValidationSeverity;
    code: string;
    message: string;
    context?: Record<string, string | number | boolean | null>;
}

export type PlannedFieldPayload = Omit<DBField, 'id' | 'createdAt'>;

export interface RemoveForeignKeyOperation {
    kind: 'removeForeignKey';
    relationshipId: string;
    foreignKey: ForeignKeySnapshot;
}

export interface RemoveIndexOperation {
    kind: 'removeIndex';
    tableId: string;
    tableName: string;
    indexId: string;
    index: IndexSnapshot;
}

export interface RemoveColumnOperation {
    kind: 'removeColumn';
    tableId: string;
    tableName: string;
    fieldId: string;
    column: ColumnSnapshot;
}

export interface RemoveTableOperation {
    kind: 'removeTable';
    tableId: string;
    tableName: string;
    table: TableSnapshot;
}

export interface ModifyColumnOperation {
    kind: 'modifyColumn';
    tableId: string;
    tableName: string;
    fieldId: string;
    before: ColumnSnapshot;
    after: ColumnSnapshot;
    fieldPayload: PlannedFieldPayload;
}

export interface ModifyIndexOperation {
    kind: 'modifyIndex';
    tableId: string;
    tableName: string;
    indexId: string;
    before: IndexSnapshot;
    after: IndexSnapshot;
}

export interface ModifyForeignKeyOperation {
    kind: 'modifyForeignKey';
    relationshipId: string;
    before: ForeignKeySnapshot;
    after: ForeignKeySnapshot;
}

export interface AddTableOperation {
    kind: 'addTable';
    tableName: string;
    table: TableSnapshot;
}

export interface AddColumnOperation {
    kind: 'addColumn';
    tableId: string | null;
    tableName: string;
    column: ColumnSnapshot;
    fieldPayload: PlannedFieldPayload;
}

export interface AddIndexOperation {
    kind: 'addIndex';
    tableId: string | null;
    tableName: string;
    index: IndexSnapshot;
    fieldIds: string[];
}

export interface AddForeignKeyOperation {
    kind: 'addForeignKey';
    localTableId: string | null;
    localTableName: string;
    localFieldId: string | null;
    localColumnName: string;
    referencedTableId: string | null;
    referencedTableName: string;
    referencedFieldId: string | null;
    referencedColumnName: string;
    foreignKey: ForeignKeySnapshot;
}

export type ApplyOperation =
    | RemoveForeignKeyOperation
    | RemoveIndexOperation
    | RemoveColumnOperation
    | RemoveTableOperation
    | ModifyColumnOperation
    | ModifyIndexOperation
    | ModifyForeignKeyOperation
    | AddTableOperation
    | AddColumnOperation
    | AddIndexOperation
    | AddForeignKeyOperation;

export interface ApplyPlan {
    operations: ApplyOperation[];
    issues: ApplyValidationIssue[];
    canApply: boolean;
}

export interface DiagramEntityIndex {
    tableByName: Map<string, DBTable>;
    fieldByTableAndName: Map<string, DBField>;
    indexByTableAndKey: Map<
        string,
        { table: DBTable; index: DBIndex; indexKey: string }
    >;
    relationshipByFkKey: Map<
        string,
        {
            relationship: DBRelationship;
            localTable: DBTable;
            localField: DBField;
            referencedTable: DBTable;
            referencedField: DBField;
        }
    >;
}

export const APPLY_OPERATION_PHASE_ORDER: Record<ApplyOperationKind, number> = {
    removeForeignKey: 1,
    removeIndex: 2,
    removeColumn: 3,
    removeTable: 4,
    modifyColumn: 5,
    modifyIndex: 6,
    modifyForeignKey: 7,
    addTable: 8,
    addColumn: 9,
    addIndex: 10,
    addForeignKey: 11,
};
