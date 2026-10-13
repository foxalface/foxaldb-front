import { describe, expect, it } from 'vitest';
import type { SchemaMergeApplyFailure } from '@/lib/api/schema-merge-apply';
import {
    mergeApplyBlocksRetry,
    mergeApplyErrorKey,
    mergeApplyInvalidatesComparison,
} from '../merge-apply-error';

describe('merge apply error mapping', () => {
    it('maps merge codes to i18n keys without leaking backend messages', () => {
        const stale: SchemaMergeApplyFailure = {
            type: 'merge_code',
            code: 'stale_comparison',
        };
        expect(mergeApplyErrorKey(stale)).toBe(
            'merge_wizard.errors.stale_comparison'
        );
        expect(mergeApplyInvalidatesComparison(stale)).toBe(true);
        expect(mergeApplyBlocksRetry(stale)).toBe(false);

        const incomplete: SchemaMergeApplyFailure = {
            type: 'merge_code',
            code: 'incomplete_selection',
        };
        expect(mergeApplyInvalidatesComparison(incomplete)).toBe(true);

        const retryable: SchemaMergeApplyFailure = {
            type: 'merge_code',
            code: 'analysis_failed',
        };
        expect(mergeApplyErrorKey(retryable)).toBe(
            'merge_wizard.apply_errors.analysis_failed'
        );
        expect(mergeApplyInvalidatesComparison(retryable)).toBe(false);

        const rateLimit: SchemaMergeApplyFailure = { type: 'rate_limit' };
        expect(mergeApplyErrorKey(rateLimit)).toBe(
            'merge_wizard.apply_errors.rate_limit'
        );
        expect(mergeApplyBlocksRetry(rateLimit)).toBe(false);

        const forbidden: SchemaMergeApplyFailure = { type: 'forbidden' };
        expect(mergeApplyBlocksRetry(forbidden)).toBe(true);
    });
});
