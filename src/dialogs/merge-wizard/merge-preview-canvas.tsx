import React, { useEffect, useMemo, useRef } from 'react';
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
import type { Diagram } from '@/lib/domain/diagram';
import type { MergePreviewDecorations } from '@/lib/schema-merge/preview/preview-types';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/use-theme';
import {
    diagramFlowEdgeTypes,
    diagramFlowNodeTypes,
    diagramToFlowElements,
    type DiagramFlowEdgeType,
    type DiagramFlowNodeType,
} from '@/pages/editor-page/canvas/diagram-flow-elements';
import { MarkerDefinitions } from '@/pages/editor-page/canvas/marker-definitions';
import { buildMergePreviewFlowDecorationMaps } from './merge-preview-decoration-maps';
import { MergePreviewControls } from './merge-preview-controls';
import { MergePreviewProviders } from './merge-preview-providers';
import { useTranslation } from 'react-i18next';
import { TooltipProvider } from '@/components/tooltip/tooltip';

export interface MergePreviewCanvasProps {
    diagram: Diagram;
    decorations: MergePreviewDecorations;
    className?: string;
    /** Resets initial fit when Compare generation / Result remounts. */
    layoutGeneration?: number;
}

const PREVIEW_FLOW_PROPS = {
    nodesDraggable: false,
    nodesConnectable: false,
    elementsSelectable: false,
    nodesFocusable: false,
    edgesFocusable: false,
    deleteKeyCode: [] as string[],
    panOnDrag: true,
    panOnScroll: true,
    zoomOnScroll: true,
    zoomOnPinch: true,
    fitView: false,
    proOptions: { hideAttribution: true },
    onlyRenderVisibleElements: true,
} as const;

const MergePreviewCanvasFlow: React.FC<{
    diagram: Diagram;
    decorations: MergePreviewDecorations;
    layoutGeneration?: number;
    containerRef: React.RefObject<HTMLDivElement | null>;
}> = ({ diagram, decorations, layoutGeneration, containerRef }) => {
    const { effectiveTheme } = useTheme();
    const { fitView } = useReactFlow();
    const initialFitDoneRef = useRef(false);
    const diagramKeyRef = useRef(diagram.id);

    const decorationMaps = useMemo(
        () => buildMergePreviewFlowDecorationMaps(diagram, decorations),
        [diagram, decorations]
    );

    const flowElements = useMemo(
        () =>
            diagramToFlowElements(diagram, {
                databaseType: diagram.databaseType,
                forceShowTables: true,
                showDBViews: true,
                filterLoading: false,
                includeAreas: true,
                includeNotes: true,
                includeDependencies: true,
                mergePreviewByTableId: decorationMaps.mergePreviewByTableId,
                mergePreviewByRelationshipId:
                    decorationMaps.mergePreviewByRelationshipId,
            }),
        [diagram, decorationMaps]
    );

    const [nodes, setNodes, onNodesChange] = useNodesState<DiagramFlowNodeType>(
        flowElements.nodes
    );
    const [edges, setEdges, onEdgesChange] = useEdgesState<DiagramFlowEdgeType>(
        flowElements.edges
    );

    useEffect(() => {
        setNodes(flowElements.nodes);
        setEdges(flowElements.edges);
    }, [flowElements.edges, flowElements.nodes, setEdges, setNodes]);

    useEffect(() => {
        if (diagramKeyRef.current !== diagram.id) {
            diagramKeyRef.current = diagram.id;
            initialFitDoneRef.current = false;
        }
    }, [diagram.id]);

    useEffect(() => {
        initialFitDoneRef.current = false;
    }, [layoutGeneration]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }

        const tryFit = () => {
            if (initialFitDoneRef.current) {
                return;
            }

            const { width, height } = container.getBoundingClientRect();
            if (width < 64 || height < 64) {
                return;
            }

            if (nodes.length === 0) {
                initialFitDoneRef.current = true;
                return;
            }

            fitView({ padding: 0.1, maxZoom: 0.8, duration: 200 });
            initialFitDoneRef.current = true;
        };

        const observer = new ResizeObserver(() => {
            requestAnimationFrame(tryFit);
        });

        observer.observe(container);
        requestAnimationFrame(tryFit);

        return () => observer.disconnect();
    }, [containerRef, fitView, nodes.length, layoutGeneration]);

    return (
        <ReactFlow
            {...PREVIEW_FLOW_PROPS}
            colorMode={effectiveTheme}
            className="size-full"
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={diagramFlowNodeTypes}
            edgeTypes={diagramFlowEdgeTypes}
            defaultEdgeOptions={{
                animated: false,
                type: 'relationship-edge',
            }}
            data-testid="merge-preview-canvas"
        >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
            <MarkerDefinitions />
            <MergePreviewControls />
        </ReactFlow>
    );
};

export const MergePreviewCanvas: React.FC<MergePreviewCanvasProps> = ({
    diagram,
    decorations,
    className,
    layoutGeneration,
}) => {
    const { t } = useTranslation();
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <TooltipProvider>
            <div
                ref={containerRef}
                className={cn('relative size-full min-h-0', className)}
                data-testid="merge-preview-canvas-root"
                aria-label={t('merge_wizard.preview.canvas_aria')}
            >
                <ReactFlowProvider>
                    <MergePreviewProviders diagram={diagram}>
                        <div className="size-full min-h-48">
                            <MergePreviewCanvasFlow
                                diagram={diagram}
                                decorations={decorations}
                                layoutGeneration={layoutGeneration}
                                containerRef={containerRef}
                            />
                        </div>
                    </MergePreviewProviders>
                </ReactFlowProvider>
            </div>
        </TooltipProvider>
    );
};
