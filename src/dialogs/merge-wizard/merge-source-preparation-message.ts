import type { SchemaMergeSourcePreparationResult } from '@/lib/schema-merge/source-adapter-types';

export const mergeSourcePreparationErrorKey = (
    result: SchemaMergeSourcePreparationResult | null
): string | null => {
    if (!result) {
        return null;
    }

    switch (result.status) {
        case 'ready':
        case 'needs_dialect_resolution':
        case 'needs_project_resolution':
        case 'needs_database_group_resolution':
        case 'database_type_mismatch':
            return null;
        case 'unsupported':
            if (result.code === 'unable_to_detect') {
                return 'merge_wizard.errors.unable_to_detect';
            }

            if (result.code === 'unsupported_file_extension') {
                return 'merge_wizard.errors.unsupported_file_extension';
            }

            return 'merge_wizard.errors.unsupported_source';
        case 'invalid':
            if (result.code === 'empty_content') {
                return null;
            }

            if (result.code === 'malformed_archive') {
                return 'merge_wizard.errors.malformed_archive';
            }

            if (result.code === 'unreadable_file') {
                return 'merge_wizard.errors.unreadable_file';
            }

            if (
                result.code === 'invalid_dialect_resolution' ||
                result.code === 'unknown_project_candidate' ||
                result.code === 'unknown_database_group'
            ) {
                return 'merge_wizard.errors.invalid_resolution';
            }

            return 'merge_wizard.errors.malformed_source';
        case 'file_too_large':
            return 'merge_wizard.errors.file_too_large';
        case 'project_parse_failure':
            if (result.code === 'project_import_unauthenticated') {
                return 'merge_wizard.errors.unauthenticated';
            }

            return 'merge_wizard.errors.project_unreadable';
        default: {
            const unreachable: never = result;
            return unreachable;
        }
    }
};
