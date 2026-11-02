import type { StatisticalAggregate } from '../types';

export function formatAggregateRow(aggregate: StatisticalAggregate): string {
    const sample = aggregate.sample;
    return [
        sample?.mode ?? '?',
        String(sample?.tableCount ?? '?'),
        sample?.phase ?? '?',
        String(aggregate.runCount),
        aggregate.medianFps.toFixed(1),
        aggregate.fpsStdDev.toFixed(2),
        aggregate.medianP95FrameMs.toFixed(2),
        aggregate.p95FrameMsStdDev.toFixed(2),
    ].join('\t');
}
