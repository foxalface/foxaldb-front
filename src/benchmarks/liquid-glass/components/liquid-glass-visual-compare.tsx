import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Background,
    BackgroundVariant,
    ReactFlow,
    ReactFlowProvider,
    useEdgesState,
    useNodesState,
    useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { VisualComparePanelId } from '../types';
import { VISUAL_COMPARE_PANEL_IDS } from '../types';
import { buildRefractionVisualCompareScenario } from '../scenarios/refraction-visual-scenario';
import { BenchmarkTableNode } from './benchmark-table-node';
import { BenchmarkRelationshipEdgeComponent } from './benchmark-relationship-edge';
import { BenchmarkLiquidGlassSvgDefs } from './benchmark-liquid-glass-svg-defs';
import { BenchmarkBackdropLiquidSvgDefs } from './benchmark-backdrop-liquid-svg-defs';
import {
    VisualCompareRepaintKeyContext,
    VisualCompareSceneRefContext,
} from './visual-compare-context';
import { VISUAL_COMPARE_PANEL_META } from './visual-compare-panel-meta';
import type {
    BenchmarkRelationshipEdge,
    BenchmarkTableNodeType,
} from '../scenarios/generate-benchmark-scenario';

const nodeTypes = {
    'benchmark-table': BenchmarkTableNode,
};

const edgeTypes = {
    'benchmark-relationship': BenchmarkRelationshipEdgeComponent,
};

const PANEL_SURFACE_STYLE: React.CSSProperties = {
    background:
        'linear-gradient(145deg, #1e3a8a 0%, #6d28d9 32%, #0f766e 62%, #c2410c 100%)',
};

function supportsBackdropSvgFilter(): boolean {
    if (typeof CSS === 'undefined' || !CSS.supports) {
        return false;
    }
    return CSS.supports('backdrop-filter', 'url("#x")');
}

interface ComparePanelFlowProps {
    panelId: VisualComparePanelId;
    sceneRef: React.RefObject<HTMLDivElement | null>;
    repaintKey: number;
    cloneSyncEnabled: boolean;
    onViewportMove: () => void;
}

function ComparePanelFlow({
    panelId,
    sceneRef,
    repaintKey,
    cloneSyncEnabled,
    onViewportMove,
}: ComparePanelFlowProps) {
    const generated = useMemo(
        () => buildRefractionVisualCompareScenario(panelId),
        [panelId]
    );
    const [nodes, setNodes, onNodesChange] = useNodesState(generated.nodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(generated.edges);
    const { fitView } = useReactFlow();

    useEffect(() => {
        setNodes(generated.nodes);
        setEdges(generated.edges);
        void fitView({ padding: 0.18, duration: 0 });
    }, [fitView, generated.edges, generated.nodes, setEdges, setNodes]);

    return (
        <VisualCompareSceneRefContext.Provider value={sceneRef}>
            <VisualCompareRepaintKeyContext.Provider value={repaintKey}>
                <ReactFlow<BenchmarkTableNodeType, BenchmarkRelationshipEdge>
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    nodesDraggable={panelId === 'clone-sync-one-table'}
                    panOnDrag
                    zoomOnScroll
                    minZoom={0.45}
                    maxZoom={1.4}
                    onMove={cloneSyncEnabled ? onViewportMove : undefined}
                    proOptions={{ hideAttribution: true }}
                    data-visual-compare-repaint-key={repaintKey}
                    data-clone-sync-enabled={
                        cloneSyncEnabled ? 'true' : 'false'
                    }
                >
                    <Background
                        variant={BackgroundVariant.Lines}
                        gap={26}
                        lineWidth={1}
                        color="rgba(255,255,255,0.34)"
                    />
                </ReactFlow>
            </VisualCompareRepaintKeyContext.Provider>
        </VisualCompareSceneRefContext.Provider>
    );
}

interface VisualComparePanelProps {
    panelId: VisualComparePanelId;
}

const VisualComparePanel: React.FC<VisualComparePanelProps> = ({ panelId }) => {
    const sceneRef = useRef<HTMLDivElement>(null);
    const [repaintKey, setRepaintKey] = useState(0);
    const meta = VISUAL_COMPARE_PANEL_META[panelId];
    const backdropSupported = supportsBackdropSvgFilter();
    const cloneSyncEnabled = panelId === 'clone-sync-one-table';

    const showBackdropUnavailable =
        panelId === 'backdrop-chromium' && !backdropSupported;

    return (
        <div
            className="flex min-h-[280px] flex-col overflow-hidden rounded-md border border-white/25 bg-slate-950/20"
            data-visual-compare-panel={panelId}
        >
            <div className="space-y-0.5 border-b border-white/15 bg-black/25 px-3 py-2">
                <p className="text-sm font-semibold text-white">{meta.title}</p>
                <p className="text-xs text-white/80">{meta.subtitle}</p>
                {panelId === 'liquid-svg' ? (
                    <span className="inline-block rounded bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-950">
                        Non réfractif — tint uniquement
                    </span>
                ) : null}
                {showBackdropUnavailable ? (
                    <span className="inline-block rounded bg-slate-600 px-2 py-0.5 text-[10px] font-medium text-white">
                        Non disponible — backdrop-filter SVG requis (Chromium)
                    </span>
                ) : null}
            </div>
            <div
                ref={sceneRef}
                className="relative min-h-[240px] flex-1"
                data-visual-compare-scene
                style={PANEL_SURFACE_STYLE}
                onPointerUp={() => {
                    if (cloneSyncEnabled) {
                        setRepaintKey((value) => value + 1);
                    }
                }}
            >
                <BenchmarkLiquidGlassSvgDefs />
                <BenchmarkBackdropLiquidSvgDefs />
                <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_15%_25%,rgba(255,255,255,0.2),transparent_42%),radial-gradient(circle_at_85%_75%,rgba(0,0,0,0.28),transparent_48%)]" />
                {showBackdropUnavailable ? (
                    <div className="relative z-[2] flex size-full items-center justify-center p-4 text-center text-xs text-white/90">
                        Ouvrir ce panneau dans Chrome pour tester la réfraction
                        backdrop.
                    </div>
                ) : (
                    <div className="relative z-[1] size-full min-h-[240px]">
                        <ReactFlowProvider>
                            <ComparePanelFlow
                                panelId={panelId}
                                sceneRef={sceneRef}
                                repaintKey={repaintKey}
                                cloneSyncEnabled={cloneSyncEnabled}
                                onViewportMove={() =>
                                    setRepaintKey((value) => value + 1)
                                }
                            />
                        </ReactFlowProvider>
                    </div>
                )}
            </div>
        </div>
    );
};

export const LiquidGlassVisualCompare: React.FC = () => {
    return (
        <div
            className="space-y-3"
            data-visual-compare-root
            data-benchmark-excluded-from-metrics
        >
            <div className="grid gap-3 lg:grid-cols-2">
                {VISUAL_COMPARE_PANEL_IDS.map((panelId) => (
                    <VisualComparePanel key={panelId} panelId={panelId} />
                ))}
            </div>
            <p className="text-xs text-muted-foreground">
                Surface hors campagne perf — voir{' '}
                <code>src/benchmarks/liquid-glass/VISUAL_COMPARE.md</code>.
                Critères G1/G2 : validation humaine uniquement (edge{' '}
                <code>vd-e-through-table</code> sous{' '}
                <code>compare-hero-table</code>).
            </p>
        </div>
    );
};
