import type { ProjectImportError } from './project-import-errors';
import { isProjectImportBackendErrorCode } from './project-import-backend-error-codes';

const BACKEND_CODE_TO_I18N_KEY: Record<
    string,
    `new_diagram_dialog.import_schema.errors.project_import.${string}`
> = {
    unsafe_path:
        'new_diagram_dialog.import_schema.errors.project_import.unsafe_path',
    duplicate_path:
        'new_diagram_dialog.import_schema.errors.project_import.duplicate_path',
    disallowed_framework_file:
        'new_diagram_dialog.import_schema.errors.project_import.disallowed_file',
    missing_framework_evidence:
        'new_diagram_dialog.import_schema.errors.project_import.missing_evidence',
    bundle_too_many_files:
        'new_diagram_dialog.import_schema.errors.project_import.bundle_too_many_files',
    bundle_file_too_large:
        'new_diagram_dialog.import_schema.errors.project_import.bundle_file_too_large',
    bundle_total_too_large:
        'new_diagram_dialog.import_schema.errors.project_import.bundle_total_too_large',
    project_import_parse_failed:
        'new_diagram_dialog.import_schema.errors.project_import.parse_failed',
    project_parser_unavailable:
        'new_diagram_dialog.import_schema.errors.project_import.parser_unavailable',
};

const GENERIC_IMPORT_FAILED =
    'new_diagram_dialog.import_schema.errors.import_failed';

/**
 * Maps project import failures to stable i18n keys. Never returns raw API messages.
 */
export const resolveProjectImportErrorKey = (error: unknown): string => {
    if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        typeof (error as ProjectImportError).code === 'string'
    ) {
        const projectError = error as ProjectImportError;

        if (projectError.code === 'project_import_unauthenticated') {
            return 'new_diagram_dialog.import_schema.errors.project_import.unauthenticated';
        }

        if (projectError.code === 'project_parser_unavailable') {
            return BACKEND_CODE_TO_I18N_KEY.project_parser_unavailable;
        }

        if (projectError.code === 'project_import_network_failure') {
            return 'new_diagram_dialog.import_schema.errors.project_import.network_failure';
        }

        if (projectError.code === 'project_import_remote_failure') {
            return 'new_diagram_dialog.import_schema.errors.project_import.remote_failure';
        }

        if (projectError.code === 'project_import_validation_rejected') {
            const backendCode =
                'backendCode' in projectError &&
                typeof projectError.backendCode === 'string'
                    ? projectError.backendCode
                    : undefined;

            if (
                backendCode &&
                isProjectImportBackendErrorCode(backendCode) &&
                BACKEND_CODE_TO_I18N_KEY[backendCode]
            ) {
                return BACKEND_CODE_TO_I18N_KEY[backendCode];
            }

            return GENERIC_IMPORT_FAILED;
        }

        if (
            projectError.code === 'malformed_project_import_payload' ||
            projectError.code === 'unsupported_project_import_api_version' ||
            projectError.code === 'inconsistent_project_import_framework'
        ) {
            return GENERIC_IMPORT_FAILED;
        }
    }

    return GENERIC_IMPORT_FAILED;
};
