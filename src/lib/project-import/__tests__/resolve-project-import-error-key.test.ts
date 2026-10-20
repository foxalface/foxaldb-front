import { describe, expect, it } from 'vitest';
import { PROJECT_IMPORT_BACKEND_ERROR_CODES } from '../project-import-backend-error-codes';
import {
    ProjectImportUnauthenticatedError,
    ProjectImportValidationRejectedError,
} from '../project-import-errors';
import { resolveProjectImportErrorKey } from '../resolve-project-import-error-key';

describe('resolveProjectImportErrorKey', () => {
    it('maps each known backend error code to a dedicated i18n key', () => {
        for (const code of PROJECT_IMPORT_BACKEND_ERROR_CODES) {
            const error = new ProjectImportValidationRejectedError('msg', {
                backendCode: code,
            });

            const key = resolveProjectImportErrorKey(error);
            expect(key).toContain('project_import');
            expect(key).not.toBe(
                'new_diagram_dialog.import_schema.errors.import_failed'
            );
        }
    });

    it('maps unauthenticated errors without exposing API text', () => {
        expect(
            resolveProjectImportErrorKey(
                new ProjectImportUnauthenticatedError('Unauthenticated.')
            )
        ).toBe(
            'new_diagram_dialog.import_schema.errors.project_import.unauthenticated'
        );
    });

    it('falls back to generic import_failed for unknown validation codes', () => {
        expect(
            resolveProjectImportErrorKey(
                new ProjectImportValidationRejectedError('msg', {
                    backendCode: 'unknown_code',
                })
            )
        ).toBe('new_diagram_dialog.import_schema.errors.import_failed');
    });
});
