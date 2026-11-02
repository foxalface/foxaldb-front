import type { BenchmarkEnvironmentInfo } from '../types';

export async function estimateDisplayRefreshRateHz(
    sampleDurationMs = 1200
): Promise<number | null> {
    if (typeof requestAnimationFrame === 'undefined') {
        return null;
    }
    const deltas: number[] = [];
    let last: number | null = null;

    await new Promise<void>((resolve) => {
        const start = performance.now();
        const tick = (timestamp: number) => {
            if (last !== null) {
                deltas.push(timestamp - last);
            }
            last = timestamp;
            if (performance.now() - start < sampleDurationMs) {
                requestAnimationFrame(tick);
            } else {
                resolve();
            }
        };
        requestAnimationFrame(tick);
    });

    if (deltas.length < 30) {
        return null;
    }
    const average = deltas.reduce((a, b) => a + b, 0) / deltas.length;
    if (average <= 0) {
        return null;
    }
    return Math.round(1000 / average);
}

export function buildBenchmarkEnvironmentInfo(): BenchmarkEnvironmentInfo {
    return {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        devicePixelRatio: window.devicePixelRatio,
        hardwareConcurrency: navigator.hardwareConcurrency,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        isDev: import.meta.env.DEV,
        isProdBuild: import.meta.env.PROD,
        note: 'FPS rAF reflects display refresh cap; not a direct GPU shader cost. No GPU timer queries in this POC.',
    };
}

export async function enrichEnvironmentWithRefreshRate(
    base: BenchmarkEnvironmentInfo
): Promise<BenchmarkEnvironmentInfo> {
    const refreshRateHz = await estimateDisplayRefreshRateHz();
    return { ...base, refreshRateHz };
}
