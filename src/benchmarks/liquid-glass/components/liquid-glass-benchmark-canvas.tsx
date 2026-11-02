import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    Background,
    BackgroundVariant,
    Controls,
    MiniMap,
    ReactFlow,
    ReactFlowProvider,
    useEdgesState,
    useNodesState,
    useReactFlow,
    type EdgeTypes,
    type NodeTypes,
    type ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { BenchmarkTableNode } from './benchmark-table-node';
import { BenchmarkRelationshipEdgeComponent } from './benchmark-relationship-edge';
import { BenchmarkLiquidGlassSvgDefs } from './benchmark-liquid-glass-svg-defs';
import { generateBenchmarkScenario } from '../scenarios/generate-benchmark-scenario';
import type {
    BenchmarkRelationshipEdge,
    BenchmarkTableNodeType,
} from '../scenarios/generate-benchmark-scenario';
import type {
    BenchmarkRunResult,
    BenchmarkScenarioProfile,
    LiquidGlassRenderMode,
    StatisticalAggregate,
} from '../types';
import {
    BENCHMARK_PHASES,
    buildScenarioConfig,
    runBenchmarkScenario,
} from '../perf/benchmark-runner';
import { runStatisticalPanZoomMatrix } from '../perf/statistical-matrix';
import { aggregateStatisticalRuns } from '../perf/statistics';
import { recordProfilerCommit } from '../perf/react-render-counters';
import type { LiquidGlassBenchmarkCanvasHandle } from '../perf/campaign-types';
import { Button } from '@/components/button/button';

const nodeTypes: NodeTypes = {
    'benchmark-table': BenchmarkTableNode,
};

const edgeTypes: EdgeTypes = {
    'benchmark-relationship': BenchmarkRelationshipEdgeComponent,
};

interface BenchmarkCanvasInnerProps {
    profile: BenchmarkScenarioProfile;
    renderMode: LiquidGlassRenderMode;
    onResults: (results: BenchmarkRunResult[]) => void;
    onAggregates?: (aggregates: StatisticalAggregate[]) => void;
    onHarnessReady?: LiquidGlassBenchmarkCanvasProps['onHarnessReady'];
    campaignLocked?: boolean;
    running: boolean;
    setRunning: (value: boolean) => void;
}

interface LiquidGlassBenchmarkCanvasProps {
    profile: BenchmarkScenarioProfile;
    renderMode: LiquidGlassRenderMode;
    onResults: (results: BenchmarkRunResult[]) => void;
    onAggregates?: (aggregates: StatisticalAggregate[]) => void;
    onHarnessReady?: (state: {
        reactFlowInitialized: boolean;
        handleAvailable: boolean;
    }) => void;
    campaignLocked?: boolean;
}

export type { LiquidGlassBenchmarkCanvasProps };
export type { LiquidGlassBenchmarkCanvasHandle } from '../perf/campaign-types';

const BenchmarkCanvasInner = forwardRef<
    LiquidGlassBenchmarkCanvasHandle,
    BenchmarkCanvasInnerProps
>(function BenchmarkCanvasInner(
    {
        profile,
        renderMode,
        onResults,
        onAggregates,
        onHarnessReady,
        campaignLocked = false,
        running,
        setRunning,
    },
    ref
) {
    const flowRef = useRef<ReactFlowInstance<
        BenchmarkTableNodeType,
        BenchmarkRelationshipEdge
    > | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const { fitView } = useReactFlow();

    const generated = useMemo(
        () => generateBenchmarkScenario({ profile, renderMode }),
        [profile, renderMode]
    );
    const [nodes, setNodes, onNodesChange] = useNodesState(generated.nodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(generated.edges);

    useEffect(() => {
        setNodes(generated.nodes);
        setEdges(generated.edges);
        void fitView({ padding: 0.12, duration: 0 });
    }, [fitView, generated.edges, generated.nodes, setEdges, setNodes]);

    const onInit = useCallback(
        (
            instance: ReactFlowInstance<
                BenchmarkTableNodeType,
                BenchmarkRelationshipEdge
            >
        ) => {
            flowRef.current = instance;
            void instance.fitView({ padding: 0.12, duration: 0 });
            onHarnessReady?.({
                reactFlowInitialized: true,
                handleAvailable: true,
            });
        },
        [onHarnessReady]
    );

    useEffect(() => {
        onHarnessReady?.({
            reactFlowInitialized: flowRef.current != null,
            handleAvailable: true,
        });
    }, [onHarnessReady]);

    const runScenarioBatch = useCallback(
        async (phases: typeof BENCHMARK_PHASES) => {
            const collected: BenchmarkRunResult[] = [];
            for (const phase of phases) {
                const result = await runBenchmarkScenario({
                    scenario: buildScenarioConfig({
                        tableCount: profile.tableCount,
                        mode: renderMode,
                        phase,
                        fieldDensity: profile.fieldDensity,
                        relationshipDensity: profile.relationshipDensity,
                        overlapCluster: profile.overlapCluster,
                    }),
                    getFlow: () => flowRef.current,
                    setNodes,
                    callbacks: { setModalOpen },
                });
                collected.push(result);
            }
            return collected;
        },
        [profile, renderMode, setNodes]
    );

    const runFullSuiteInternal = useCallback(async () => {
        return runScenarioBatch(BENCHMARK_PHASES);
    }, [runScenarioBatch]);

    const runStatisticalMatrixInternal = useCallback(async () => {
        const panRuns = await runStatisticalPanZoomMatrix({
            baseProfile: {
                fieldDensity: profile.fieldDensity,
                relationshipDensity: profile.relationshipDensity,
                overlapCluster: profile.overlapCluster,
            },
            phase: 'pan',
            iterationsPerMode: 3,
            alternateModeOrder: true,
            getFlow: () => flowRef.current,
            setNodes,
            setEdges,
        });
        const zoomRuns = await runStatisticalPanZoomMatrix({
            baseProfile: {
                fieldDensity: profile.fieldDensity,
                relationshipDensity: profile.relationshipDensity,
                overlapCluster: profile.overlapCluster,
            },
            phase: 'zoom',
            iterationsPerMode: 2,
            alternateModeOrder: true,
            getFlow: () => flowRef.current,
            setNodes,
            setEdges,
        });
        const results = [...panRuns, ...zoomRuns];
        return {
            results,
            aggregates: aggregateStatisticalRuns(results),
        };
    }, [profile, setEdges, setNodes]);

    const runPanOnlyInternal = useCallback(async () => {
        return runBenchmarkScenario({
            scenario: buildScenarioConfig({
                tableCount: profile.tableCount,
                mode: renderMode,
                phase: 'pan',
                fieldDensity: profile.fieldDensity,
                relationshipDensity: profile.relationshipDensity,
                overlapCluster: profile.overlapCluster,
            }),
            getFlow: () => flowRef.current,
            setNodes,
        });
    }, [profile, renderMode, setNodes]);

    useImperativeHandle(
        ref,
        () => ({
            runPanOnly: async () => {
                if (running) {
                    throw new Error('Benchmark already running');
                }
                setRunning(true);
                try {
                    const result = await runPanOnlyInternal();
                    onResults([result]);
                    return result;
                } finally {
                    setRunning(false);
                }
            },
            runFullSuite: async () => {
                if (running) {
                    throw new Error('Benchmark already running');
                }
                setRunning(true);
                try {
                    const collected = await runFullSuiteInternal();
                    onResults(collected);
                    fitView({ padding: 0.12, duration: 200 });
                    return collected;
                } finally {
                    setRunning(false);
                }
            },
            runStatisticalMatrix: async () => {
                if (running) {
                    throw new Error('Benchmark already running');
                }
                setRunning(true);
                try {
                    const payload = await runStatisticalMatrixInternal();
                    onResults(payload.results);
                    onAggregates?.(payload.aggregates);
                    return payload;
                } finally {
                    setRunning(false);
                }
            },
        }),
        [
            fitView,
            onAggregates,
            onResults,
            runFullSuiteInternal,
            runPanOnlyInternal,
            runStatisticalMatrixInternal,
            running,
            setRunning,
        ]
    );

    const runFullSuite = useCallback(async () => {
        if (running) {
            return;
        }
        setRunning(true);
        try {
            onResults(await runFullSuiteInternal());
            fitView({ padding: 0.12, duration: 200 });
        } finally {
            setRunning(false);
        }
    }, [fitView, onResults, runFullSuiteInternal, running, setRunning]);

    const runStatisticalMatrix = useCallback(async () => {
        if (running) {
            return;
        }
        setRunning(true);
        try {
            const payload = await runStatisticalMatrixInternal();
            onResults(payload.results);
            onAggregates?.(payload.aggregates);
        } finally {
            setRunning(false);
        }
    }, [
        onAggregates,
        onResults,
        runStatisticalMatrixInternal,
        running,
        setRunning,
    ]);

    return (
        <div
            className="relative h-[min(70vh,720px)] w-full rounded-lg border border-slate-300 dark:border-slate-700"
            data-benchmark-measurement-surface
        >
            <BenchmarkLiquidGlassSvgDefs />
            {modalOpen ? (
                <div
                    className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm"
                    data-benchmark-modal
                >
                    <div className="w-[min(90%,420px)] rounded-lg border border-white/20 bg-white/30 p-6 shadow-xl backdrop-blur-md dark:bg-slate-900/40">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                            Translucent modal (benchmark overlay)
                        </p>
                    </div>
                </div>
            ) : null}
            <React.Profiler
                id="liquid-glass-benchmark-flow"
                onRender={(_id, phase, actualDuration) => {
                    if (phase === 'update') {
                        recordProfilerCommit(actualDuration);
                    }
                }}
            >
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    onInit={onInit}
                    minZoom={0.05}
                    maxZoom={2}
                    proOptions={{ hideAttribution: true }}
                >
                    <Background
                        variant={BackgroundVariant.Dots}
                        gap={16}
                        size={1}
                    />
                    <MiniMap pannable zoomable />
                    <Controls showInteractive={false} />
                </ReactFlow>
            </React.Profiler>
            <div className="absolute bottom-3 right-3 z-10 flex max-w-[70%] flex-wrap justify-end gap-2">
                <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={running || campaignLocked}
                    onClick={() => {
                        void (async () => {
                            if (running || campaignLocked) return;
                            setRunning(true);
                            try {
                                onResults([await runPanOnlyInternal()]);
                            } finally {
                                setRunning(false);
                            }
                        })();
                    }}
                >
                    Pan only
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={running || campaignLocked}
                    onClick={() => {
                        void runStatisticalMatrix();
                    }}
                >
                    Statistical matrix
                </Button>
                <Button
                    type="button"
                    size="sm"
                    disabled={running || campaignLocked}
                    onClick={() => {
                        void runFullSuite();
                    }}
                >
                    {running ? 'Running…' : 'Run full suite'}
                </Button>
            </div>
        </div>
    );
});

export const LiquidGlassBenchmarkCanvas = forwardRef<
    LiquidGlassBenchmarkCanvasHandle,
    LiquidGlassBenchmarkCanvasProps
>(function LiquidGlassBenchmarkCanvas(props, ref) {
    const [running, setRunning] = useState(false);
    return (
        <ReactFlowProvider>
            <BenchmarkCanvasInner
                ref={ref}
                {...props}
                running={running}
                setRunning={setRunning}
            />
        </ReactFlowProvider>
    );
});
