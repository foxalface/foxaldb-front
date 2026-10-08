export type { SchemaMergeCompareRequest } from './compare-request';
export { decodeSchemaMergeCompareResponse } from './compare-response';
export type { SchemaMergeCompareResponse } from './compare-response';
export { isSchemaMergeErrorCode } from './diff-types';
export { prepareSchemaMergeSource } from './prepare-schema-merge-source';
export type {
    PrepareSchemaMergeSourceContext,
    SchemaMergeDatabaseTypeMismatch,
    SchemaMergeFileTooLarge,
    SchemaMergeInvalidSource,
    SchemaMergeNeedsDatabaseGroupResolution,
    SchemaMergeNeedsDialectResolution,
    SchemaMergeNeedsProjectResolution,
    SchemaMergeProjectParseFailure,
    SchemaMergeReadySource,
    SchemaMergeSourceInput,
    SchemaMergeSourcePreparationResult,
    SchemaMergeSourceResolution,
    SchemaMergeUnsupportedSource,
} from './source-adapter-types';
export {
    SCHEMA_MERGE_SOURCE_KIND_BY_IMPORT_FORMAT,
    SCHEMA_MERGE_SOURCE_KIND_BY_PROJECT_FRAMEWORK,
    SCHEMA_MERGE_SOURCE_KINDS,
    isSchemaMergeSourceKind,
    schemaMergeSourceKindForImportFormat,
    schemaMergeSourceKindForProjectFramework,
} from './source-kinds';
export type {
    SchemaMergeCompareSource,
    SchemaMergeSourceKind,
} from './source-kinds';
