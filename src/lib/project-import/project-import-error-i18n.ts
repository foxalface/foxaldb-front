import type { ProjectImportErrorCode } from './project-import-errors';
import { isProjectImportBackendErrorCode } from './project-import-backend-error-codes';

export type ProjectImportI18nKey =
    `new_diagram_dialog.import_schema.errors.project_import.${string}`;

const BACKEND_CODE_TO_I18N_KEY: Record<string, ProjectImportI18nKey> = {
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

export const resolveProjectImportBackendCodeKey = (
    backendCode: string | undefined
): string | null => {
    if (
        backendCode &&
        isProjectImportBackendErrorCode(backendCode) &&
        BACKEND_CODE_TO_I18N_KEY[backendCode]
    ) {
        return BACKEND_CODE_TO_I18N_KEY[backendCode];
    }

    return null;
};

export const resolveProjectImportFailureKey = (failure: {
    code: ProjectImportErrorCode;
    backendCode?: string;
}): string => {
    if (failure.code === 'project_import_unauthenticated') {
        return 'new_diagram_dialog.import_schema.errors.project_import.unauthenticated';
    }

    if (failure.code === 'project_parser_unavailable') {
        return BACKEND_CODE_TO_I18N_KEY.project_parser_unavailable;
    }

    if (failure.code === 'project_import_network_failure') {
        return 'new_diagram_dialog.import_schema.errors.project_import.network_failure';
    }

    if (failure.code === 'project_import_remote_failure') {
        return 'new_diagram_dialog.import_schema.errors.project_import.remote_failure';
    }

    if (failure.code === 'project_import_validation_rejected') {
        const backendKey = resolveProjectImportBackendCodeKey(
            failure.backendCode
        );
        if (backendKey) {
            return backendKey;
        }

        return GENERIC_IMPORT_FAILED;
    }

    if (
        failure.code === 'malformed_project_import_payload' ||
        failure.code === 'unsupported_project_import_api_version' ||
        failure.code === 'inconsistent_project_import_framework'
    ) {
        return GENERIC_IMPORT_FAILED;
    }

    return GENERIC_IMPORT_FAILED;
};
