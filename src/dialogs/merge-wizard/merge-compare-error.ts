import type { SchemaMergeCompareFailure } from '@/lib/api/schema-merge-compare';

export const mergeCompareErrorKey = (
    failure: SchemaMergeCompareFailure
): string => {
    switch (failure.type) {
        case 'unauthenticated':
            return 'merge_wizard.errors.unauthenticated';
        case 'forbidden':
            return 'merge_wizard.errors.forbidden';
        case 'rate_limit':
            return 'merge_wizard.errors.rate_limit';
        case 'unexpected':
            return 'merge_wizard.errors.unexpected';
        case 'autosave':
            return 'merge_wizard.errors.autosave_failed';
        case 'merge_code':
            switch (failure.code) {
                case 'malformed_diagram':
                case 'database_type_mismatch':
                case 'payload_too_large':
                case 'unsupported_source':
                case 'analysis_failed':
                    return `merge_wizard.errors.${failure.code}`;
                case 'stale_comparison':
                    return 'merge_wizard.errors.stale_comparison';
                case 'incomplete_selection':
                    return 'merge_wizard.errors.incomplete_selection';
                default:
                    return 'merge_wizard.errors.unexpected';
            }
        default: {
            const unreachable: never = failure;
            return unreachable;
        }
    }
};
