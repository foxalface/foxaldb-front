import type { BenchmarkRunResult, StatisticalAggregate } from '../types';

export function median(values: number[]): number {
    if (values.length === 0) {
        return 0;
    }
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
        return ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2;
    }
    return sorted[mid] ?? 0;
}

export function standardDeviation(values: number[]): number {
    if (values.length <= 1) {
        return 0;
    }
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance =
        values.reduce((acc, v) => acc + (v - mean) ** 2, 0) /
        (values.length - 1);
    return Math.sqrt(variance);
}

export function scenarioResultKey(result: BenchmarkRunResult): string {
    const s = result.scenario;
    return [
        s.mode,
        s.tableCount,
        s.phase,
        s.fieldDensity,
        s.relationshipDensity,
        s.overlapCluster ? 'overlap' : 'grid',
    ].join('|');
}

export function aggregateStatisticalRuns(
    runs: BenchmarkRunResult[]
): StatisticalAggregate[] {
    const byKey = new Map<string, BenchmarkRunResult[]>();
    for (const run of runs) {
        const key = scenarioResultKey(run);
        const list = byKey.get(key) ?? [];
        list.push(run);
        byKey.set(key, list);
    }

    return [...byKey.entries()].map(([key, group]) => {
        const fpsValues = group.map((r) => r.frameMetrics.fpsAverage);
        const p95Values = group.map((r) => r.frameMetrics.frameTimeMsP95);
        const longTasks = group.map((r) => r.longTasks.count);
        return {
            key,
            runCount: group.length,
            medianFps: median(fpsValues),
            fpsStdDev: standardDeviation(fpsValues),
            medianP95FrameMs: median(p95Values),
            p95FrameMsStdDev: standardDeviation(p95Values),
            medianLongTasks: median(longTasks),
            sample: group[0]?.scenario,
        };
    });
}

export function shuffleModes<T>(modes: T[], seed: number): T[] {
    const copy = [...modes];
    let s = seed;
    const random = () => {
        s = (s * 1664525 + 1013904223) % 4294967296;
        return s / 4294967296;
    };
    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(random() * (i + 1));
        const tmp = copy[i];
        copy[i] = copy[j] as T;
        copy[j] = tmp as T;
    }
    return copy;
}
