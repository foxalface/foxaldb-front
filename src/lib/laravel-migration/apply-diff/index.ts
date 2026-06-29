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
export {
    createLaravelMigrationApplyApi,
    type LaravelMigrationApplyApi,
    type LaravelMigrationApplyMutationOptions,
} from './laravel-migration-apply-api';
export { ApplyIdResolver } from './apply-id-resolver';
export { computeNewTablePosition } from './compute-new-table-layout';
export {
    ApplyExecutionError,
    executeLaravelMigrationDiffApply,
} from './execute-laravel-migration-diff-apply';
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
