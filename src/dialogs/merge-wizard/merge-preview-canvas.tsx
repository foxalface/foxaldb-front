import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    Background,
    BackgroundVariant,
    ReactFlow,
    ReactFlowProvider,
    useEdgesState,
    useNodesInitialized,
    useNodesState,
    useReactFlow,
    useStore,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { Diagram } from '@/lib/domain/diagram';
import type { MergePreviewDecorations } from '@/lib/schema-merge/preview/preview-types';
import type { MergePreviewHighlightTarget } from '@/lib/schema-merge/preview/resolve-preview-highlight-target';
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
import {
    MERGE_PREVIEW_FIT_VIEW,
    MergePreviewControls,
} from './merge-preview-controls';
import { MergePreviewHighlightProvider } from './merge-preview-highlight-provider';
import { MergePreviewProviders } from './merge-preview-providers';
import { useTranslation } from 'react-i18next';
import { TooltipProvider } from '@/components/tooltip/tooltip';

export interface MergePreviewCanvasProps {
    diagram: Diagram;
    decorations: MergePreviewDecorations;
    className?: string;
    /** Resets initial fit when Compare generation / Result remounts. */
    layoutGeneration?: number;
    highlightTarget?: MergePreviewHighlightTarget | null;
    onHighlightOperation?: (operationId: string) => void;
    onClearHighlight?: () => void;
}

/**
 * Result dialog grows with `transition-[width,max-width] duration-300`.
 * Fitting before that ends locks the zoom to the smaller width.
 */
const MERGE_PREVIEW_DIALOG_RESIZE_MS = 340;

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
}> = ({ diagram, decorations, layoutGeneration }) => {
    const { effectiveTheme } = useTheme();
    const { fitView } = useReactFlow();
    const nodesInitialized = useNodesInitialized();
    const flowWidth = useStore((state) => state.width);
    const flowHeight = useStore((state) => state.height);
    const initialFitDoneRef = useRef(false);
    const openedAtRef = useRef(0);
    const settleTimerRef = useRef<number | null>(null);
    const [showAllNodesForFit, setShowAllNodesForFit] = useState(true);

    const finishInitialFit = useCallback(() => {
        if (settleTimerRef.current !== null) {
            window.clearTimeout(settleTimerRef.current);
            settleTimerRef.current = null;
        }

        if (initialFitDoneRef.current) {
            return;
        }

        initialFitDoneRef.current = true;
        setShowAllNodesForFit(false);
    }, []);

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
        initialFitDoneRef.current = false;
        openedAtRef.current = performance.now();
        setShowAllNodesForFit(true);

        return () => {
            if (settleTimerRef.current !== null) {
                window.clearTimeout(settleTimerRef.current);
                settleTimerRef.current = null;
            }
        };
    }, [diagram.id, layoutGeneration]);

    useEffect(() => {
        if (
            initialFitDoneRef.current ||
            !nodesInitialized ||
            (flowWidth ?? 0) < 64 ||
            (flowHeight ?? 0) < 64
        ) {
            return;
        }

        const fitOptions = {
            ...MERGE_PREVIEW_FIT_VIEW,
            duration: 0,
        };

        void fitView(fitOptions);

        if (settleTimerRef.current !== null) {
            window.clearTimeout(settleTimerRef.current);
        }

        const elapsed = performance.now() - openedAtRef.current;
        const delay = Math.max(80, MERGE_PREVIEW_DIALOG_RESIZE_MS - elapsed);

        settleTimerRef.current = window.setTimeout(() => {
            settleTimerRef.current = null;

            if (initialFitDoneRef.current) {
                return;
            }

            void fitView(fitOptions);
            finishInitialFit();
        }, delay);

        return () => {
            if (settleTimerRef.current !== null) {
                window.clearTimeout(settleTimerRef.current);
                settleTimerRef.current = null;
            }
        };
    }, [
        diagram.id,
        finishInitialFit,
        fitView,
        flowHeight,
        flowWidth,
        layoutGeneration,
        nodesInitialized,
    ]);

    return (
        <ReactFlow
            {...PREVIEW_FLOW_PROPS}
            onlyRenderVisibleElements={!showAllNodesForFit}
            id="merge-preview"
            colorMode={effectiveTheme}
            className="size-full"
            minZoom={0.1}
            maxZoom={5}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onMoveStart={(event) => {
                if (event) {
                    finishInitialFit();
                }
            }}
            nodeTypes={diagramFlowNodeTypes}
            edgeTypes={diagramFlowEdgeTypes}
            defaultEdgeOptions={{
                animated: false,
                type: 'relationship-edge',
            }}
            data-testid="merge-preview-canvas"
        >
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
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
    highlightTarget,
    onHighlightOperation,
    onClearHighlight,
}) => {
    const { t } = useTranslation();
    const highlightHandlers =
        onHighlightOperation && onClearHighlight
            ? {
                  onHighlightOperation,
                  onClearHighlight,
              }
            : null;

    return (
        <TooltipProvider>
            <div
                className={cn('relative size-full min-h-0', className)}
                data-testid="merge-preview-canvas-root"
                data-highlight-table-id={highlightTarget?.tableId ?? undefined}
                data-highlight-field-id={highlightTarget?.fieldId ?? undefined}
                data-highlight-relationship-id={
                    highlightTarget?.relationshipId ?? undefined
                }
                aria-label={t('merge_wizard.preview.canvas_aria')}
            >
                <ReactFlowProvider>
                    <MergePreviewProviders diagram={diagram}>
                        {highlightHandlers ? (
                            <MergePreviewHighlightProvider
                                onHighlightOperation={
                                    highlightHandlers.onHighlightOperation
                                }
                                onClearHighlight={
                                    highlightHandlers.onClearHighlight
                                }
                                highlightTarget={highlightTarget}
                            >
                                <div className="size-full min-h-48">
                                    <MergePreviewCanvasFlow
                                        diagram={diagram}
                                        decorations={decorations}
                                        layoutGeneration={layoutGeneration}
                                    />
                                </div>
                            </MergePreviewHighlightProvider>
                        ) : (
                            <div className="size-full min-h-48">
                                <MergePreviewCanvasFlow
                                    diagram={diagram}
                                    decorations={decorations}
                                    layoutGeneration={layoutGeneration}
                                />
                            </div>
                        )}
                    </MergePreviewProviders>
                </ReactFlowProvider>
            </div>
        </TooltipProvider>
    );
};
