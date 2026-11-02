import type { LongTaskSummary } from '../types';

interface PerformanceLongTaskTiming extends PerformanceEntry {
    duration: number;
}

export class LongTaskObserver {
    private observer: PerformanceObserver | null = null;
    private entries: PerformanceLongTaskTiming[] = [];

    start(): void {
        this.entries = [];
        if (typeof PerformanceObserver === 'undefined') {
            return;
        }
        try {
            this.observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.entries.push(entry as PerformanceLongTaskTiming);
                }
            });
            this.observer.observe({ entryTypes: ['longtask'] });
        } catch {
            this.observer = null;
        }
    }

    stop(): LongTaskSummary {
        this.observer?.disconnect();
        this.observer = null;
        if (this.entries.length === 0) {
            return { count: 0, totalDurationMs: 0, maxDurationMs: 0 };
        }
        const durations = this.entries.map((e) => e.duration);
        return {
            count: this.entries.length,
            totalDurationMs: durations.reduce((a, b) => a + b, 0),
            maxDurationMs: Math.max(...durations),
        };
    }
}
