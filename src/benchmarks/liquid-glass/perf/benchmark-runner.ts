import type { ReactFlowInstance } from '@xyflow/react';
import type {
    BenchmarkRelationshipEdge,
    BenchmarkTableNodeType,
} from '../scenarios/generate-benchmark-scenario';
import type {
    BenchmarkInteractionPhase,
    BenchmarkRunResult,
    BenchmarkScenarioConfig,
} from '../types';
import { FrameMetricsCollector } from './frame-metrics';
import { LongTaskObserver } from './long-task-observer';
import { readMemorySnapshot } from './memory-metrics';
import {
    getReactRenderSummary,
    resetReactRenderCounters,
} from './react-render-counters';

const sleep = (ms: number) =>
    new Promise<void>((resolve) => {
        window.setTimeout(resolve, ms);
    });

type SetNodesFn = (
    updater: (nodes: BenchmarkTableNodeType[]) => BenchmarkTableNodeType[]
) => void;

export interface BenchmarkRunnerCallbacks {
    setModalOpen?: (open: boolean) => void;
}

async function runWarmup(warmupMs: number): Promise<void> {
    if (warmupMs <= 0) {
        return;
    }
    const collector = new FrameMetricsCollector();
    collector.start();
    await sleep(warmupMs);
    collector.stop();
}

async function runInteractionPhase(
    phase: BenchmarkInteractionPhase,
    getFlow: () => ReactFlowInstance<
        BenchmarkTableNodeType,
        BenchmarkRelationshipEdge
    > | null,
    setNodes: SetNodesFn | null,
    durationMs: number,
    callbacks: BenchmarkRunnerCallbacks
): Promise<void> {
    const flow = getFlow();
    if (!flow) {
        await sleep(durationMs);
        return;
    }

    if (phase === 'modal') {
        callbacks.setModalOpen?.(true);
    } else {
        callbacks.setModalOpen?.(false);
    }

    const start = performance.now();
    if (phase === 'idle' || phase === 'modal') {
        await sleep(durationMs);
        callbacks.setModalOpen?.(false);
        return;
    }

    if (phase === 'overlap') {
        flow.setViewport({ x: -40, y: -20, zoom: 1.35 }, { duration: 0 });
    }

    while (performance.now() - start < durationMs) {
        const t = (performance.now() - start) / durationMs;
        if (phase === 'pan' || phase === 'overlap') {
            const x =
                Math.sin(t * Math.PI * 4) * (phase === 'overlap' ? 60 : 120);
            const y =
                Math.cos(t * Math.PI * 3) * (phase === 'overlap' ? 40 : 80);
            const zoom = phase === 'overlap' ? 1.35 : 1;
            flow.setViewport({ x, y, zoom }, { duration: 0 });
        } else if (phase === 'zoom') {
            const zoom = 0.65 + Math.sin(t * Math.PI * 2) * 0.35;
            flow.setViewport({ x: 0, y: 0, zoom }, { duration: 0 });
        } else if (phase === 'drag' && setNodes) {
            setNodes((current) =>
                current.map((node, index) => {
                    if (index !== 0) {
                        return node;
                    }
                    return {
                        ...node,
                        position: {
                            x: node.position.x + Math.sin(t * Math.PI * 6) * 2,
                            y: node.position.y + Math.cos(t * Math.PI * 6) * 2,
                        },
                        dragging: true,
                    };
                })
            );
        }
        await sleep(16);
    }

    if (phase === 'drag' && setNodes) {
        setNodes((current) =>
            current.map((node, index) =>
                index === 0 ? { ...node, dragging: false } : node
            )
        );
    }
}

export async function runBenchmarkScenario(options: {
    scenario: BenchmarkScenarioConfig;
    getFlow: () => ReactFlowInstance<
        BenchmarkTableNodeType,
        BenchmarkRelationshipEdge
    > | null;
    setNodes: SetNodesFn;
    callbacks?: BenchmarkRunnerCallbacks;
}): Promise<BenchmarkRunResult> {
    const { scenario, getFlow, setNodes, callbacks = {} } = options;
    resetReactRenderCounters();

    await runWarmup(scenario.warmupMs);

    const memoryBefore = readMemorySnapshot();
    const frameCollector = new FrameMetricsCollector();
    const longTaskObserver = new LongTaskObserver();

    longTaskObserver.start();
    frameCollector.start();

    const phaseStart = performance.now();
    await runInteractionPhase(
        scenario.phase,
        getFlow,
        setNodes,
        scenario.durationMs,
        callbacks
    );
    const elapsed = performance.now() - phaseStart;

    frameCollector.stop();
    const longTasks = longTaskObserver.stop();
    const memoryAfter = readMemorySnapshot();

    return {
        scenario,
        frameMetrics: frameCollector.summarize(elapsed),
        longTasks,
        memoryBefore,
        memoryAfter,
        reactRenders: getReactRenderSummary(),
        userAgent: navigator.userAgent,
        recordedAt: new Date().toISOString(),
    };
}

export const DEFAULT_PHASE_DURATION_MS = 3000;
export const DEFAULT_WARMUP_MS = 800;

export const BENCHMARK_PHASES: BenchmarkInteractionPhase[] = [
    'idle',
    'pan',
    'zoom',
    'drag',
    'overlap',
    'modal',
];

export function buildScenarioConfig(
    partial: Omit<
        BenchmarkScenarioConfig,
        'warmupMs' | 'runIndex' | 'buildMode' | 'durationMs'
    > & { durationMs?: number; warmupMs?: number; runIndex?: number }
): BenchmarkScenarioConfig {
    return {
        durationMs: partial.durationMs ?? DEFAULT_PHASE_DURATION_MS,
        warmupMs: partial.warmupMs ?? DEFAULT_WARMUP_MS,
        runIndex: partial.runIndex ?? 0,
        buildMode: import.meta.env.PROD ? 'production' : 'development',
        tableCount: partial.tableCount,
        mode: partial.mode,
        phase: partial.phase,
        fieldDensity: partial.fieldDensity,
        relationshipDensity: partial.relationshipDensity,
        overlapCluster: partial.overlapCluster,
    };
}
