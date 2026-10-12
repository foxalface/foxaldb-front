import type { SchemaMergeApplyFailure } from '@/lib/api/schema-merge-apply';

export const mergeApplyErrorKey = (
    failure: SchemaMergeApplyFailure
): string => {
    switch (failure.type) {
        case 'unauthenticated':
            return 'merge_wizard.apply_errors.unauthenticated';
        case 'forbidden':
            return 'merge_wizard.apply_errors.forbidden';
        case 'rate_limit':
            return 'merge_wizard.apply_errors.rate_limit';
        case 'unexpected':
            return 'merge_wizard.apply_errors.unexpected';
        case 'merge_code':
            switch (failure.code) {
                case 'stale_comparison':
                    return 'merge_wizard.errors.stale_comparison';
                case 'incomplete_selection':
                    return 'merge_wizard.errors.incomplete_selection';
                case 'malformed_diagram':
                case 'database_type_mismatch':
                case 'payload_too_large':
                case 'unsupported_source':
                case 'analysis_failed':
                    return `merge_wizard.apply_errors.${failure.code}`;
                default:
                    return 'merge_wizard.apply_errors.unexpected';
            }
        default: {
            const unreachable: never = failure;
            return unreachable;
        }
    }
};

export const mergeApplyInvalidatesComparison = (
    failure: SchemaMergeApplyFailure
): boolean =>
    failure.type === 'merge_code' &&
    (failure.code === 'stale_comparison' ||
        failure.code === 'incomplete_selection');

export const mergeApplyBlocksRetry = (
    failure: SchemaMergeApplyFailure
): boolean =>
    failure.type === 'unauthenticated' || failure.type === 'forbidden';
