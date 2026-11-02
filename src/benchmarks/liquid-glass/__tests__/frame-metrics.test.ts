import { describe, expect, it } from 'vitest';
import { percentile, summarizeFrameSamples } from '../perf/frame-metrics';

describe('frame-metrics', () => {
    it('computes p95 on sorted frame times', () => {
        const summary = summarizeFrameSamples(
            [
                { frameTimeMs: 10, timestamp: 0 },
                { frameTimeMs: 12, timestamp: 10 },
                { frameTimeMs: 20, timestamp: 22 },
                { frameTimeMs: 40, timestamp: 42 },
            ],
            1000
        );
        expect(summary.frameTimeMsP50).toBe(12);
        expect(summary.frameTimeMsP95).toBe(40);
        expect(summary.sampleCount).toBe(4);
    });

    it('returns zeroed summary for empty samples', () => {
        const summary = summarizeFrameSamples([], 500);
        expect(summary.fpsAverage).toBe(0);
        expect(summary.frameTimeMsP95).toBe(0);
    });

    it('percentile handles single value', () => {
        expect(percentile([16.7], 95)).toBe(16.7);
    });
});
