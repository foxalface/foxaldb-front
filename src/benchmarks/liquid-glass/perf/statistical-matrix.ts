import type { ReactFlowInstance } from '@xyflow/react';
import { generateBenchmarkScenario } from '../scenarios/generate-benchmark-scenario';
import type {
    BenchmarkRelationshipEdge,
    BenchmarkTableNodeType,
} from '../scenarios/generate-benchmark-scenario';
import { BENCHMARK_TABLE_COUNTS } from '../scenarios/generate-benchmark-nodes';
import type {
    BenchmarkRunResult,
    BenchmarkScenarioProfile,
    LiquidGlassRenderMode,
} from '../types';
import {
    buildScenarioConfig,
    DEFAULT_PHASE_DURATION_MS,
    DEFAULT_WARMUP_MS,
    runBenchmarkScenario,
} from './benchmark-runner';
import { shuffleModes } from './statistics';

type SetNodesFn = (
    updater: (nodes: BenchmarkTableNodeType[]) => BenchmarkTableNodeType[]
) => void;

export interface StatisticalMatrixOptions {
    baseProfile: Omit<BenchmarkScenarioProfile, 'tableCount'>;
    phase: 'pan' | 'zoom';
    iterationsPerMode: number;
    alternateModeOrder: boolean;
    getFlow: () => ReactFlowInstance<
        BenchmarkTableNodeType,
        BenchmarkRelationshipEdge
    > | null;
    setNodes: SetNodesFn;
    setEdges: (
        edges: ReturnType<typeof generateBenchmarkScenario>['edges']
    ) => void;
    onProgress?: (completed: number, total: number) => void;
}

const MODES: LiquidGlassRenderMode[] = ['classic', 'glass-css', 'liquid-svg'];

export async function runStatisticalPanZoomMatrix(
    options: StatisticalMatrixOptions
): Promise<BenchmarkRunResult[]> {
    const {
        baseProfile,
        phase,
        iterationsPerMode,
        alternateModeOrder,
        getFlow,
        setNodes,
        setEdges,
        onProgress,
    } = options;

    const results: BenchmarkRunResult[] = [];
    const total =
        BENCHMARK_TABLE_COUNTS.length * MODES.length * iterationsPerMode;
    let completed = 0;

    for (const tableCount of BENCHMARK_TABLE_COUNTS) {
        for (let iteration = 0; iteration < iterationsPerMode; iteration += 1) {
            const modeOrder = alternateModeOrder
                ? shuffleModes(
                      MODES,
                      tableCount * 17 + iteration * 31 + phase.length
                  )
                : MODES;
            for (const mode of modeOrder) {
                const profile: BenchmarkScenarioProfile = {
                    ...baseProfile,
                    tableCount,
                };
                const scenario = generateBenchmarkScenario({
                    profile,
                    renderMode: mode,
                });
                setNodes(() => scenario.nodes);
                setEdges(scenario.edges);
                getFlow()?.fitView({ padding: 0.1, duration: 0 });
                await new Promise((r) => window.setTimeout(r, 350));

                const result = await runBenchmarkScenario({
                    scenario: buildScenarioConfig({
                        tableCount,
                        mode,
                        phase,
                        fieldDensity: profile.fieldDensity,
                        relationshipDensity: profile.relationshipDensity,
                        overlapCluster: profile.overlapCluster,
                        durationMs: DEFAULT_PHASE_DURATION_MS,
                        warmupMs: DEFAULT_WARMUP_MS,
                        runIndex: iteration,
                    }),
                    getFlow,
                    setNodes,
                });
                results.push(result);
                completed += 1;
                onProgress?.(completed, total);
            }
        }
    }

    return results;
}
