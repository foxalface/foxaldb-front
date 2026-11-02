import { describe, expect, it } from 'vitest';
import {
    buildBenchmarkFields,
    columnsForTableCount,
    fieldCountForDensity,
    generateBenchmarkScenario,
    gridPositionForTableIndex,
} from '../scenarios/generate-benchmark-nodes';
import {
    aggregateStatisticalRuns,
    median,
    shuffleModes,
} from '../perf/statistics';
import { buildScenarioConfig } from '../perf/benchmark-runner';

describe('generate-benchmark-scenario', () => {
    it('builds deterministic field rows', () => {
        const fields = buildBenchmarkFields(2, 4);
        expect(fields).toHaveLength(4);
        expect(fields[0]?.primaryKey).toBe(true);
        expect(fields[0]?.name).toBe('email');
    });

    it('generates nodes, edges, and overlap cluster z-index', () => {
        const { nodes, edges } = generateBenchmarkScenario({
            profile: {
                tableCount: 20,
                fieldDensity: 'heavy',
                relationshipDensity: 'dense',
                overlapCluster: true,
            },
            renderMode: 'glass-css',
        });
        expect(nodes).toHaveLength(20);
        expect(edges.length).toBeGreaterThan(20);
        expect(nodes[0]?.zIndex).toBe(1);
        expect(fieldCountForDensity('heavy')).toBe(14);
        expect(columnsForTableCount(100)).toBe(10);
    });

    it('lays out nodes on a grid', () => {
        const a = gridPositionForTableIndex(0, 5, 272, 220);
        const b = gridPositionForTableIndex(1, 5, 272, 220);
        expect(a).toEqual({ x: 0, y: 0 });
        expect(b.x).toBeGreaterThan(a.x);
    });
});

describe('statistics', () => {
    it('computes median and shuffles deterministically', () => {
        expect(median([10, 20, 100])).toBe(20);
        const a = shuffleModes(['classic', 'glass-css', 'liquid-svg'], 42);
        const b = shuffleModes(['classic', 'glass-css', 'liquid-svg'], 42);
        expect(a).toEqual(b);
    });

    it('aggregates repeated runs', () => {
        const base = buildScenarioConfig({
            tableCount: 20,
            mode: 'liquid-svg',
            phase: 'pan',
            fieldDensity: 'medium',
            relationshipDensity: 'sparse',
            overlapCluster: false,
        });
        const runs = [0, 1, 2].map((runIndex) => ({
            scenario: { ...base, runIndex },
            frameMetrics: {
                sampleCount: 100,
                durationMs: 3000,
                fpsAverage: 100 + runIndex,
                frameTimeMsAverage: 10,
                frameTimeMsP50: 9,
                frameTimeMsP95: 12 + runIndex,
                frameTimeMsMax: 20,
                droppedFramesEstimate: 0,
            },
            longTasks: { count: 0, totalDurationMs: 0, maxDurationMs: 0 },
            memoryBefore: {
                supported: false,
                usedJsHeapSizeMb: null,
                totalJsHeapSizeMb: null,
                jsHeapSizeLimitMb: null,
            },
            memoryAfter: {
                supported: false,
                usedJsHeapSizeMb: null,
                totalJsHeapSizeMb: null,
                jsHeapSizeLimitMb: null,
            },
            reactRenders: {
                benchmarkNodeRenderCount: 0,
                profilerCommitCount: 0,
                profilerActualDurationMsTotal: 0,
            },
            userAgent: 'test',
            recordedAt: new Date().toISOString(),
        }));
        const aggregates = aggregateStatisticalRuns(runs);
        expect(aggregates).toHaveLength(1);
        expect(aggregates[0]?.medianFps).toBe(101);
        expect(aggregates[0]?.runCount).toBe(3);
    });
});
