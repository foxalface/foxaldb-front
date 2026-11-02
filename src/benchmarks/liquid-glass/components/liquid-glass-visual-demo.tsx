import React, { useEffect, useMemo } from 'react';
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
import type { LiquidGlassRenderMode } from '../types';
import { buildVisualDemoScenario } from '../scenarios/visual-demo-scenario';
import { BenchmarkTableNode } from './benchmark-table-node';
import { BenchmarkRelationshipEdgeComponent } from './benchmark-relationship-edge';
import { BenchmarkLiquidGlassSvgDefs } from './benchmark-liquid-glass-svg-defs';
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

const VISUAL_DEMO_SURFACE_STYLE: React.CSSProperties = {
    background:
        'linear-gradient(145deg, #1e3a8a 0%, #6d28d9 32%, #0f766e 62%, #c2410c 100%)',
};

function VisualDemoFlow({ renderMode }: { renderMode: LiquidGlassRenderMode }) {
    const generated = useMemo(
        () => buildVisualDemoScenario(renderMode),
        [renderMode]
    );
    const [nodes, setNodes, onNodesChange] = useNodesState(generated.nodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(generated.edges);
    const { fitView } = useReactFlow();

    useEffect(() => {
        setNodes(generated.nodes);
        setEdges(generated.edges);
        void fitView({ padding: 0.2, duration: 0 });
    }, [fitView, generated.edges, generated.nodes, setEdges, setNodes]);

    return (
        <ReactFlow<BenchmarkTableNodeType, BenchmarkRelationshipEdge>
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            nodesDraggable={false}
            panOnDrag
            zoomOnScroll
            minZoom={0.4}
            maxZoom={1.5}
            proOptions={{ hideAttribution: true }}
        >
            <Background
                variant={BackgroundVariant.Lines}
                gap={28}
                lineWidth={1}
                color="rgba(255,255,255,0.32)"
            />
        </ReactFlow>
    );
}

export interface LiquidGlassVisualDemoProps {
    renderMode: LiquidGlassRenderMode;
}

export const LiquidGlassVisualDemo: React.FC<LiquidGlassVisualDemoProps> = ({
    renderMode,
}) => {
    return (
        <div
            className="relative h-[min(42vh,420px)] w-full overflow-hidden rounded-lg border border-slate-400/60 shadow-inner dark:border-slate-600"
            data-visual-transparency-demo
            data-visual-demo-mode={renderMode}
            style={VISUAL_DEMO_SURFACE_STYLE}
        >
            <BenchmarkLiquidGlassSvgDefs />
            <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.18),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(0,0,0,0.25),transparent_50%)]" />
            <div className="relative z-[1] size-full">
                <ReactFlowProvider>
                    <VisualDemoFlow renderMode={renderMode} />
                </ReactFlowProvider>
            </div>
            <p className="pointer-events-none absolute bottom-2 left-3 z-10 max-w-[70%] text-xs font-medium text-white/90 drop-shadow-sm">
                Demo surface only — benchmark canvas below keeps a neutral
                background for comparable metrics.
            </p>
        </div>
    );
};
