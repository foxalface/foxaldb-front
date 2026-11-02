import type { BenchmarkTableCount } from '../scenarios/generate-benchmark-nodes';
import { RENDER_MODES } from '../render-modes';
import type { BenchmarkRunResult, LiquidGlassRenderMode } from '../types';
import type { LiquidGlassBenchmarkCanvasHandle } from './campaign-types';
import type { BenchmarkCampaignController } from './campaign-controller';
import {
    CampaignAbortError,
    CampaignTimeoutError,
    CanvasInitTimeoutError,
    runWithScenarioTimeout,
} from './campaign-controller';
import { aggregateStatisticalRuns, shuffleModes } from './statistics';

const sleep = (ms: number) =>
    new Promise<void>((resolve) => {
        window.setTimeout(resolve, ms);
    });

export interface CampaignSegmentContext {
    handle: LiquidGlassBenchmarkCanvasHandle;
    controller: BenchmarkCampaignController;
    setRenderMode: (mode: LiquidGlassRenderMode) => void;
    setTableCount: (count: BenchmarkTableCount) => void;
    settleMs?: number;
}

function handleCampaignError(
    controller: BenchmarkCampaignController,
    error: unknown
): never {
    if (error instanceof CampaignAbortError) {
        if (controller.getStatus() === 'running') {
            controller.finalize('cancelled', error.message);
        }
        throw error;
    }
    if (error instanceof CanvasInitTimeoutError) {
        controller.finalize('timed_out', error.message);
        throw error;
    }
    if (error instanceof CampaignTimeoutError) {
        controller.finalize('timed_out', error.message);
        throw error;
    }
    const message = error instanceof Error ? error.message : String(error);
    if (controller.getStatus() === 'running') {
        controller.finalize('failed', message);
    }
    throw error;
}

export async function runStatisticalMatrixSegment(
    ctx: CampaignSegmentContext
): Promise<void> {
    const { handle, controller } = ctx;
    controller.begin('statistical-matrix', 1);
    controller.updateProgress({
        currentStep: 1,
        totalSteps: 1,
        currentScenario: 'statistical-matrix',
        message: 'Running statistical matrix',
    });
    try {
        controller.assertNotAborted();
        const payload = await runWithScenarioTimeout(
            handle.runStatisticalMatrix(),
            {
                label: 'statistical-matrix',
                abortSignal: controller.getSignal(),
            }
        );
        controller.appendResults(payload.results);
        controller.appendAggregates(payload.aggregates);
        controller.finalize('completed');
        window.__foxaldbBenchmarkCampaign = controller.buildPayload(
            'statistical-matrix',
            { statisticalMatrix: payload }
        );
    } catch (error) {
        handleCampaignError(controller, error);
    }
}

export async function runFullSuiteAllModesSegment(
    ctx: CampaignSegmentContext
): Promise<void> {
    const {
        handle,
        controller,
        setRenderMode,
        setTableCount,
        settleMs = 900,
    } = ctx;
    controller.begin('full-suite-all-modes', RENDER_MODES.length);
    try {
        for (let index = 0; index < RENDER_MODES.length; index += 1) {
            const mode = RENDER_MODES[index];
            if (!mode) {
                continue;
            }
            controller.assertNotAborted();
            controller.updateProgress({
                currentStep: index + 1,
                totalSteps: RENDER_MODES.length,
                currentMode: mode,
                currentScenario: 'full-suite',
                message: `Full suite (${mode})`,
            });
            setRenderMode(mode);
            setTableCount(20);
            await sleep(settleMs);
            controller.assertNotAborted();
            const runs = await runWithScenarioTimeout(handle.runFullSuite(), {
                label: `full-suite-${mode}`,
                abortSignal: controller.getSignal(),
            });
            controller.appendResults(runs);
        }
        controller.finalize('completed');
        window.__foxaldbBenchmarkCampaign = controller.buildPayload(
            'full-suite-all-modes',
            { fullSuites20Tables: controller.getPartialResults() }
        );
    } catch (error) {
        window.__foxaldbBenchmarkCampaign = controller.buildPayload(
            'full-suite-all-modes',
            { fullSuites20Tables: controller.getPartialResults() }
        );
        handleCampaignError(controller, error);
    }
}

export async function runAnomalyPanProbeSegment(
    ctx: CampaignSegmentContext
): Promise<void> {
    const {
        handle,
        controller,
        setRenderMode,
        setTableCount,
        settleMs = 900,
    } = ctx;
    const totalRuns = 5 * RENDER_MODES.length;
    controller.begin('anomaly-pan-probe', totalRuns);
    const results: BenchmarkRunResult[] = [];
    try {
        let completed = 0;
        for (let round = 0; round < 5; round += 1) {
            const order = shuffleModes(RENDER_MODES, 42 + round * 17);
            for (const mode of order) {
                controller.assertNotAborted();
                completed += 1;
                controller.updateProgress({
                    currentStep: completed,
                    totalSteps: totalRuns,
                    completedRuns: completed - 1,
                    currentMode: mode,
                    currentScenario: 'pan-only',
                    message: `Anomaly pan (${mode}, round ${round + 1})`,
                });
                setRenderMode(mode);
                setTableCount(20);
                await sleep(settleMs);
                controller.assertNotAborted();
                const result = await runWithScenarioTimeout(
                    handle.runPanOnly(),
                    {
                        label: `pan-only-${mode}`,
                        abortSignal: controller.getSignal(),
                    }
                );
                results.push(result);
                controller.appendResults([result]);
            }
        }
        const aggregates = aggregateStatisticalRuns(results);
        controller.appendAggregates(aggregates);
        controller.finalize('completed');
        window.__foxaldbBenchmarkCampaign = controller.buildPayload(
            'anomaly-pan-probe',
            { anomalyPan20Tables: { results, aggregates } }
        );
    } catch (error) {
        const aggregates = aggregateStatisticalRuns(results);
        window.__foxaldbBenchmarkCampaign = controller.buildPayload(
            'anomaly-pan-probe',
            { anomalyPan20Tables: { results, aggregates } }
        );
        handleCampaignError(controller, error);
    }
}

export async function runProductionFullSegment(
    ctx: CampaignSegmentContext
): Promise<void> {
    const {
        handle,
        controller,
        setRenderMode,
        setTableCount,
        settleMs = 900,
    } = ctx;
    const totalSteps = 3;
    controller.begin('production-full', totalSteps);
    const fullSuites20Tables: BenchmarkRunResult[] = [];
    const anomalyResults: BenchmarkRunResult[] = [];
    try {
        controller.updateProgress({
            currentStep: 1,
            totalSteps,
            currentScenario: 'statistical-matrix',
        });
        controller.assertNotAborted();
        const statisticalMatrix = await runWithScenarioTimeout(
            handle.runStatisticalMatrix(),
            {
                label: 'statistical-matrix',
                abortSignal: controller.getSignal(),
            }
        );
        controller.appendResults(statisticalMatrix.results);
        controller.appendAggregates(statisticalMatrix.aggregates);

        for (let index = 0; index < RENDER_MODES.length; index += 1) {
            const mode = RENDER_MODES[index];
            if (!mode) {
                continue;
            }
            controller.assertNotAborted();
            controller.updateProgress({
                currentStep: 2,
                totalSteps,
                currentMode: mode,
                currentScenario: 'full-suite',
            });
            setRenderMode(mode);
            setTableCount(20);
            await sleep(settleMs);
            const modeRuns = await runWithScenarioTimeout(
                handle.runFullSuite(),
                {
                    label: `full-suite-${mode}`,
                    abortSignal: controller.getSignal(),
                }
            );
            fullSuites20Tables.push(...modeRuns);
            controller.appendResults(modeRuns);
        }

        controller.updateProgress({
            currentStep: 3,
            totalSteps,
            currentScenario: 'anomaly-pan-probe',
        });
        for (let round = 0; round < 5; round += 1) {
            const order = shuffleModes(RENDER_MODES, 42 + round * 17);
            for (const mode of order) {
                controller.assertNotAborted();
                setRenderMode(mode);
                setTableCount(20);
                await sleep(settleMs);
                const result = await runWithScenarioTimeout(
                    handle.runPanOnly(),
                    {
                        label: `pan-only-${mode}`,
                        abortSignal: controller.getSignal(),
                    }
                );
                anomalyResults.push(result);
                controller.appendResults([result]);
            }
        }
        const anomalyAggregates = aggregateStatisticalRuns(anomalyResults);
        controller.appendAggregates(anomalyAggregates);
        controller.finalize('completed');
        window.__foxaldbBenchmarkCampaign = controller.buildPayload(
            'production-full',
            {
                statisticalMatrix,
                fullSuites20Tables,
                anomalyPan20Tables: {
                    results: anomalyResults,
                    aggregates: anomalyAggregates,
                },
            }
        );
    } catch (error) {
        window.__foxaldbBenchmarkCampaign = controller.buildPayload(
            'production-full',
            {
                fullSuites20Tables,
                anomalyPan20Tables: {
                    results: anomalyResults,
                    aggregates: aggregateStatisticalRuns(anomalyResults),
                },
            }
        );
        handleCampaignError(controller, error);
    }
}
