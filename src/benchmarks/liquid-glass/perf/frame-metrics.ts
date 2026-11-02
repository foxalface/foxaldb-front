import type { FrameMetricsSample, FrameMetricsSummary } from '../types';

const TARGET_FRAME_MS = 1000 / 60;

export function percentile(sortedValues: number[], p: number): number {
    if (sortedValues.length === 0) {
        return 0;
    }
    const index = Math.min(
        sortedValues.length - 1,
        Math.max(0, Math.ceil((p / 100) * sortedValues.length) - 1)
    );
    return sortedValues[index] ?? 0;
}

export function summarizeFrameSamples(
    samples: FrameMetricsSample[],
    durationMs: number
): FrameMetricsSummary {
    if (samples.length === 0) {
        return {
            sampleCount: 0,
            durationMs,
            fpsAverage: 0,
            frameTimeMsAverage: 0,
            frameTimeMsP50: 0,
            frameTimeMsP95: 0,
            frameTimeMsMax: 0,
            droppedFramesEstimate: 0,
        };
    }

    const frameTimes = samples.map((s) => s.frameTimeMs).sort((a, b) => a - b);
    const sum = frameTimes.reduce((acc, value) => acc + value, 0);
    const average = sum / frameTimes.length;
    const droppedFramesEstimate = frameTimes.filter(
        (t) => t > TARGET_FRAME_MS * 1.5
    ).length;

    return {
        sampleCount: samples.length,
        durationMs,
        fpsAverage: durationMs > 0 ? (samples.length / durationMs) * 1000 : 0,
        frameTimeMsAverage: average,
        frameTimeMsP50: percentile(frameTimes, 50),
        frameTimeMsP95: percentile(frameTimes, 95),
        frameTimeMsMax: frameTimes[frameTimes.length - 1] ?? 0,
        droppedFramesEstimate,
    };
}

export class FrameMetricsCollector {
    private samples: FrameMetricsSample[] = [];
    private lastTimestamp: number | null = null;
    private rafId: number | null = null;
    private running = false;

    start(): void {
        this.samples = [];
        this.lastTimestamp = null;
        this.running = true;
        const tick = (timestamp: number) => {
            if (!this.running) {
                return;
            }
            if (this.lastTimestamp !== null) {
                this.samples.push({
                    frameTimeMs: timestamp - this.lastTimestamp,
                    timestamp,
                });
            }
            this.lastTimestamp = timestamp;
            this.rafId = requestAnimationFrame(tick);
        };
        this.rafId = requestAnimationFrame(tick);
    }

    stop(): FrameMetricsSample[] {
        this.running = false;
        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
        return [...this.samples];
    }

    summarize(durationMs: number): FrameMetricsSummary {
        return summarizeFrameSamples(this.samples, durationMs);
    }
}
