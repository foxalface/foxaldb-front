import type { ProjectImportError } from './project-import-errors';
import { resolveProjectImportFailureKey } from './project-import-error-i18n';

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

        if (projectError.code === 'project_import_validation_rejected') {
            const backendCode =
                'backendCode' in projectError &&
                typeof projectError.backendCode === 'string'
                    ? projectError.backendCode
                    : undefined;

            return resolveProjectImportFailureKey({
                code: projectError.code,
                backendCode,
            });
        }

        return resolveProjectImportFailureKey({
            code: projectError.code,
        });
    }

    return GENERIC_IMPORT_FAILED;
};
