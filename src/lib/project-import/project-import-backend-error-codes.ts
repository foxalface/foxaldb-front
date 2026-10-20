/**
 * Stable `code` values returned by POST /api/project-import/parse on 422/501.
 * Keep in sync with backend ProjectImportException implementations.
 */
export const PROJECT_IMPORT_BACKEND_ERROR_CODES = [
    'unsafe_path',
    'duplicate_path',
    'disallowed_framework_file',
    'missing_framework_evidence',
    'bundle_too_many_files',
    'bundle_file_too_large',
    'bundle_total_too_large',
    'project_import_parse_failed',
    'project_parser_unavailable',
] as const;

export type ProjectImportBackendErrorCode =
    (typeof PROJECT_IMPORT_BACKEND_ERROR_CODES)[number];

export const isProjectImportBackendErrorCode = (
    value: string
): value is ProjectImportBackendErrorCode =>
    (PROJECT_IMPORT_BACKEND_ERROR_CODES as readonly string[]).includes(value);
