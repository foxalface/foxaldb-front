import { describe, expect, it } from 'vitest';
import { mergeSourcePreparationErrorKey } from '../merge-source-preparation-message';

describe('mergeSourcePreparationErrorKey project import mapping', () => {
    it('maps unauthenticated project parse failures', () => {
        expect(
            mergeSourcePreparationErrorKey({
                status: 'project_parse_failure',
                code: 'project_import_unauthenticated',
                parserLocation: 'remote',
            })
        ).toBe('merge_wizard.errors.unauthenticated');
    });

    it('maps backend unsafe_path to shared project import i18n key', () => {
        expect(
            mergeSourcePreparationErrorKey({
                status: 'project_parse_failure',
                code: 'project_import_validation_rejected',
                parserLocation: 'remote',
                backendCode: 'unsafe_path',
            })
        ).toBe(
            'new_diagram_dialog.import_schema.errors.project_import.unsafe_path'
        );
    });

    it('maps bundle file too large backend code', () => {
        expect(
            mergeSourcePreparationErrorKey({
                status: 'project_parse_failure',
                code: 'project_import_validation_rejected',
                parserLocation: 'remote',
                backendCode: 'bundle_file_too_large',
            })
        ).toBe(
            'new_diagram_dialog.import_schema.errors.project_import.bundle_file_too_large'
        );
    });

    it('falls back to project_unreadable for unknown project failures', () => {
        expect(
            mergeSourcePreparationErrorKey({
                status: 'project_parse_failure',
                code: 'project_import_remote_failure',
                parserLocation: 'remote',
            })
        ).toBe(
            'new_diagram_dialog.import_schema.errors.project_import.remote_failure'
        );
    });
});
