import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    BenchmarkCampaignController,
    CampaignAbortError,
    CampaignTimeoutError,
    CanvasInitTimeoutError,
    waitForCanvasHandle,
} from '../perf/campaign-controller';
import { DEFAULT_CANVAS_POLL_INTERVAL_MS } from '../perf/campaign-types';

describe('BenchmarkCampaignController', () => {
    beforeEach(() => {
        window.__foxaldbBenchmarkCampaignProgress = undefined;
        window.__foxaldbBenchmarkCancelCampaign = undefined;
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('prevents double begin', () => {
        const controller = new BenchmarkCampaignController({
            globalTimeoutMs: 60_000,
        });
        controller.begin('statistical-matrix', 1);
        expect(() => controller.begin('anomaly-pan-probe', 1)).toThrow(
            /already running/
        );
        controller.cancel();
    });

    it('publishes progress on begin and finalize completed', () => {
        const controller = new BenchmarkCampaignController({
            globalTimeoutMs: 60_000,
        });
        controller.begin('statistical-matrix', 3);
        expect(window.__foxaldbBenchmarkCampaignProgress?.status).toBe(
            'running'
        );
        expect(window.__foxaldbBenchmarkCampaignProgress?.totalSteps).toBe(3);
        controller.finalize('completed');
        expect(window.__foxaldbBenchmarkCampaignProgress?.status).toBe(
            'completed'
        );
        expect(window.__foxaldbBenchmarkCampaignComplete).toBe(true);
    });

    it('cancel sets cancelled status and clears cancel hook', () => {
        const controller = new BenchmarkCampaignController({
            globalTimeoutMs: 60_000,
        });
        controller.begin('full-suite-all-modes', 2);
        expect(typeof window.__foxaldbBenchmarkCancelCampaign).toBe('function');
        controller.cancel();
        expect(controller.getStatus()).toBe('cancelled');
        expect(window.__foxaldbBenchmarkCampaignProgress?.status).toBe(
            'cancelled'
        );
    });

    it('global timeout finalizes as timed_out', () => {
        const controller = new BenchmarkCampaignController({
            globalTimeoutMs: 1000,
        });
        controller.begin('anomaly-pan-probe', 1);
        vi.advanceTimersByTime(1001);
        expect(controller.getStatus()).toBe('timed_out');
        expect(window.__foxaldbBenchmarkCampaignError).toMatch(
            /Global campaign/
        );
    });

    it('assertNotAborted throws CampaignAbortError after cancel', () => {
        const controller = new BenchmarkCampaignController({
            globalTimeoutMs: 60_000,
        });
        controller.begin('statistical-matrix', 1);
        controller.cancel();
        expect(() => controller.assertNotAborted()).toThrow(CampaignAbortError);
    });

    it('keeps partial results after append', () => {
        const controller = new BenchmarkCampaignController({
            globalTimeoutMs: 60_000,
        });
        controller.begin('statistical-matrix', 1);
        controller.appendResults([
            {
                scenario: {
                    mode: 'classic',
                    tableCount: 20,
                    phase: 'pan',
                    durationMs: 1000,
                    fieldDensity: 'medium',
                    relationshipDensity: 'sparse',
                    overlapCluster: false,
                    warmupMs: 800,
                    runIndex: 0,
                    buildMode: 'development',
                },
                frameMetrics: {
                    fpsAverage: 60,
                    frameTimeMsP95: 16,
                    frameTimeMsP50: 16,
                    frameTimeMsAverage: 16,
                    frameTimeMsMax: 20,
                    droppedFramesEstimate: 0,
                    sampleCount: 10,
                    durationMs: 1000,
                },
                longTasks: { count: 0, totalDurationMs: 0, maxDurationMs: 0 },
                reactRenders: {
                    benchmarkNodeRenderCount: 0,
                    profilerCommitCount: 0,
                    profilerActualDurationMsTotal: 0,
                },
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
                userAgent: 'test',
                recordedAt: new Date().toISOString(),
            },
        ]);
        controller.finalize('failed', 'stopped early');
        expect(controller.getPartialResults()).toHaveLength(1);
        const payload = controller.buildPayload('statistical-matrix');
        expect(payload.partialResults).toHaveLength(1);
        expect(payload.status).toBe('failed');
    });

    it('dispose clears timers without throwing', () => {
        const controller = new BenchmarkCampaignController({
            globalTimeoutMs: 5000,
        });
        controller.begin('statistical-matrix', 1);
        controller.dispose();
        expect(controller.getStatus()).toBe('running');
    });
});

describe('waitForCanvasHandle', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('resolves when handle is available on first poll', async () => {
        const handle = { ok: true as const };
        await expect(
            waitForCanvasHandle(() => handle, {
                timeoutMs: 5000,
                pollIntervalMs: DEFAULT_CANVAS_POLL_INTERVAL_MS,
            })
        ).resolves.toEqual({ ok: true });
    });

    it('waits until handle becomes available', async () => {
        let handle: { ok: true } | null = null;
        const promise = waitForCanvasHandle(() => handle, {
            timeoutMs: 5000,
            pollIntervalMs: 100,
        });
        handle = { ok: true };
        await vi.advanceTimersByTimeAsync(100);
        await expect(promise).resolves.toEqual({ ok: true });
    });

    it('throws CanvasInitTimeoutError when handle stays null', async () => {
        const promise = waitForCanvasHandle(() => null, {
            timeoutMs: 300,
            pollIntervalMs: 100,
        });
        const expectation = expect(promise).rejects.toBeInstanceOf(
            CanvasInitTimeoutError
        );
        await vi.advanceTimersByTimeAsync(350);
        await expectation;
    });

    it('throws CampaignAbortError when signal aborted', async () => {
        const abortController = new AbortController();
        const promise = waitForCanvasHandle(() => null, {
            timeoutMs: 5000,
            pollIntervalMs: 100,
            abortSignal: abortController.signal,
        });
        const rejection =
            expect(promise).rejects.toBeInstanceOf(CampaignAbortError);
        abortController.abort();
        await vi.advanceTimersByTimeAsync(100);
        await rejection;
    });
});

describe('CampaignTimeoutError', () => {
    it('has expected name', () => {
        expect(new CampaignTimeoutError().name).toBe('CampaignTimeoutError');
    });
});
