import type { ReactRenderSummary } from '../types';

let benchmarkNodeRenderCount = 0;
let profilerCommitCount = 0;
let profilerActualDurationMsTotal = 0;

export function resetReactRenderCounters(): void {
    benchmarkNodeRenderCount = 0;
    profilerCommitCount = 0;
    profilerActualDurationMsTotal = 0;
}

export function incrementBenchmarkNodeRenderCount(): void {
    benchmarkNodeRenderCount += 1;
}

export function recordProfilerCommit(actualDurationMs: number): void {
    profilerCommitCount += 1;
    profilerActualDurationMsTotal += actualDurationMs;
}

export function getReactRenderSummary(): ReactRenderSummary {
    return {
        benchmarkNodeRenderCount,
        profilerCommitCount,
        profilerActualDurationMsTotal,
    };
}
