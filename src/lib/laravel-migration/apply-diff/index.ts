export {
    normalizeColumnName,
    normalizeTableName,
} from './normalize-identifier';
export {
    buildDiagramEntityIndex,
    resolveFieldByTableAndColumn,
    resolveTableByName,
} from './build-diagram-entity-index';
export {
    columnMatchKey,
    foreignKeyMatchKey,
    indexMatchKey,
    normalizedIndexColumns,
    tableColumnMatchKey,
    tableMatchKey,
} from './snapshot-match-key';
export { mapColumnSnapshotToField } from './map-column-snapshot-to-field';
export { planLaravelMigrationDiffApply } from './plan-laravel-migration-diff-apply';
export type {
    AddColumnOperation,
    AddForeignKeyOperation,
    AddIndexOperation,
    AddTableOperation,
    ApplyOperation,
    ApplyOperationKind,
    ApplyPlan,
    ApplyValidationIssue,
    ApplyValidationSeverity,
    DiagramEntityIndex,
    ModifyColumnOperation,
    ModifyForeignKeyOperation,
    ModifyIndexOperation,
    PlannedFieldPayload,
    RemoveColumnOperation,
    RemoveForeignKeyOperation,
    RemoveIndexOperation,
    RemoveTableOperation,
} from './types';
export { APPLY_OPERATION_PHASE_ORDER } from './types';
