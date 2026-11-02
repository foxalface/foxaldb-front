import type { MemoryMetricsSnapshot } from '../types';

interface ChromePerformanceMemory {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
}

interface PerformanceWithMemory extends Performance {
    memory?: ChromePerformanceMemory;
}

export function readMemorySnapshot(): MemoryMetricsSnapshot {
    const perf = performance as PerformanceWithMemory;
    const memory = perf.memory;
    if (!memory) {
        return {
            supported: false,
            usedJsHeapSizeMb: null,
            totalJsHeapSizeMb: null,
            jsHeapSizeLimitMb: null,
        };
    }
    const toMb = (bytes: number) =>
        Math.round((bytes / (1024 * 1024)) * 10) / 10;
    return {
        supported: true,
        usedJsHeapSizeMb: toMb(memory.usedJSHeapSize),
        totalJsHeapSizeMb: toMb(memory.totalJSHeapSize),
        jsHeapSizeLimitMb: toMb(memory.jsHeapSizeLimit),
    };
}
