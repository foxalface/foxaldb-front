import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
    parseAutorunQueryValue,
    createInitialPageDiagnostics,
} from '../perf/benchmark-mount-diagnostics';
import { CAMPAIGN_QUERY_VALUE } from '../perf/campaign-types';

describe('parseAutorunQueryValue', () => {
    it('returns unrecognized when param is absent', () => {
        expect(parseAutorunQueryValue(new URLSearchParams(''))).toEqual({
            raw: null,
            valid: false,
            recognized: false,
        });
    });

    it('accepts production-campaign', () => {
        expect(
            parseAutorunQueryValue(
                new URLSearchParams(`autorun=${CAMPAIGN_QUERY_VALUE}`)
            )
        ).toEqual({
            raw: CAMPAIGN_QUERY_VALUE,
            valid: true,
            recognized: true,
        });
    });

    it('rejects autorun=product with recognized=true', () => {
        expect(
            parseAutorunQueryValue(new URLSearchParams('autorun=product'))
        ).toEqual({
            raw: 'product',
            valid: false,
            recognized: true,
        });
    });
});

describe('createInitialPageDiagnostics', () => {
    beforeEach(() => {
        vi.stubGlobal('window', {
            location: {
                pathname: '/dev/benchmarks/liquid-glass',
                search: '?autorun=product',
            },
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('marks invalid autorun in diagnostics', () => {
        const diagnostics = createInitialPageDiagnostics(
            new URLSearchParams('autorun=product')
        );
        expect(diagnostics.autorunValid).toBe(false);
        expect(diagnostics.autorunParam).toBe('product');
        expect(diagnostics.canvasReady).toBe(false);
    });
});
