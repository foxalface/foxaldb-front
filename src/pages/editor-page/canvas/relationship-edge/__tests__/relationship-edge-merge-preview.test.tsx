import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { EdgeProps } from '@xyflow/react';
import type { RelationshipEdgeType } from '../relationship-edge';

const openRelationshipPopover = vi.fn();

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        relationships: [],
        updateRelationship: vi.fn(),
        removeRelationship: vi.fn(),
        readonly: true,
    }),
}));

vi.mock('@/context/diff-context/use-diff', () => ({
    useDiff: () => ({
        checkIfRelationshipRemoved: () => false,
        checkIfNewRelationship: () => false,
    }),
}));

const localConfig = { showCardinality: false };

vi.mock('@/hooks/use-local-config', () => ({
    useLocalConfig: () => localConfig,
}));

vi.mock('@/hooks/use-canvas', () => ({
    useCanvas: () => ({
        editRelationshipPopover: null,
        openRelationshipPopover,
        closeRelationshipPopover: vi.fn(),
        visualExportCaptureActive: false,
    }),
}));

vi.mock('../edit-relationship-popover', () => ({
    EditRelationshipPopover: () => null,
}));

vi.mock('@xyflow/react', () => ({
    getSmoothStepPath: () => ['M0 0'],
    Position: { Left: 'left', Right: 'right' },
    useReactFlow: () => ({
        getInternalNode: () => ({ measured: { width: 200 } }),
        getEdge: () => ({ sourceHandle: 'left_rel_f1' }),
    }),
    useViewport: () => ({ x: 0, y: 0, zoom: 1 }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

import { RelationshipEdge } from '../relationship-edge';
import { TooltipProvider } from '@/components/tooltip/tooltip';
import { MergePreviewHighlightProvider } from '@/dialogs/merge-wizard/merge-preview-highlight-provider';

const renderEdge = (change?: 'add' | 'modify' | 'delete') => {
    const props = {
        id: 'rel-1',
        source: 't1',
        target: 't2',
        sourceX: 0,
        sourceY: 0,
        targetX: 200,
        targetY: 0,
        selected: false,
        data: {
            relationship: {
                id: 'rel-1',
                name: 'rel',
                sourceTableId: 't1',
                targetTableId: 't2',
                sourceFieldId: 'f1',
                targetFieldId: 'f2',
                sourceCardinality: 'one',
                targetCardinality: 'many',
                createdAt: 0,
            },
            ...(change
                ? {
                      mergePreview: {
                          change,
                          operationId: 'op-rel',
                          indicatorLane: 1,
                      },
                  }
                : {}),
        },
    } as EdgeProps<RelationshipEdgeType>;

    return render(
        <TooltipProvider>
            <RelationshipEdge {...props} />
        </TooltipProvider>
    );
};

describe('RelationshipEdge merge preview', () => {
    afterEach(() => {
        cleanup();
        openRelationshipPopover.mockClear();
    });

    it('leaves edge path unchanged without merge metadata', () => {
        renderEdge();
        expect(document.querySelector('[data-merge-change]')).toBeNull();
    });

    it('renders centered bubble indicators for merge preview', () => {
        renderEdge('add');
        const bubble = document.querySelector(
            '[data-merge-indicator-variant="bubble"]'
        );
        expect(bubble).toBeTruthy();
        expect(bubble?.className).toContain('size-5');
        expect(bubble?.className).toContain('items-center');
        expect(bubble?.className).toContain('justify-center');
    });

    it('exposes indicator lane metadata on the foreignObject', () => {
        renderEdge('modify');
        const indicator = document.querySelector(
            '[data-merge-indicator-lane="1"]'
        );
        expect(indicator).toBeTruthy();
    });

    it('styles delete preview edges and keeps them rendered', () => {
        renderEdge('delete');
        const path = document.querySelector(
            '[data-merge-change="delete"]'
        ) as SVGPathElement;
        expect(path).toBeTruthy();
        expect(path.getAttribute('stroke-dasharray')).toBe('8 6');
        expect(path.className).toContain('!stroke-2');
        expect(path.className).toContain('cursor-pointer');
        expect(path).toHaveStyle({ pointerEvents: 'stroke' });
        const interaction = document.querySelector(
            '.react-flow__edge-interaction'
        ) as SVGPathElement;
        expect(interaction).toHaveStyle({ pointerEvents: 'stroke' });
        expect(interaction.getAttribute('stroke-width')).toBe('16');
        expect(
            screen.getByLabelText('merge_wizard.result.change.delete')
        ).toBeInTheDocument();
    });

    it('uses semantic merge cardinality markers for add', () => {
        localConfig.showCardinality = true;
        renderEdge('add');
        const path = document.querySelector(
            '.react-flow__edge-path'
        ) as SVGPathElement;
        expect(
            path.getAttribute('data-merge-cardinality-source-marker')
        ).toMatch(/^cardinality_merge_add_one_(left|right)$/);
        expect(
            path.getAttribute('data-merge-cardinality-target-marker')
        ).toMatch(/^cardinality_merge_add_many_(left|right)$/);
        expect(path.getAttribute('marker-start')).toMatch(
            /cardinality_merge_add_one_/
        );
        expect(path.getAttribute('marker-end')).toMatch(
            /cardinality_merge_add_many_/
        );
        localConfig.showCardinality = false;
    });

    it('uses semantic merge cardinality markers for modify and delete', () => {
        localConfig.showCardinality = true;
        renderEdge('modify');
        let path = document.querySelector(
            '.react-flow__edge-path'
        ) as SVGPathElement;
        expect(path.getAttribute('marker-start')).toContain(
            'cardinality_merge_modify'
        );

        cleanup();
        renderEdge('delete');
        path = document.querySelector(
            '.react-flow__edge-path'
        ) as SVGPathElement;
        expect(path.getAttribute('marker-end')).toContain(
            'cardinality_merge_delete'
        );
        localConfig.showCardinality = false;
    });

    it('keeps neutral cardinality markers without merge metadata', () => {
        localConfig.showCardinality = true;
        renderEdge();
        const path = document.querySelector(
            '.react-flow__edge-path'
        ) as SVGPathElement;
        expect(path.getAttribute('marker-start')).toContain(
            'cardinality_not_selected'
        );
        expect(path.getAttribute('marker-start')).not.toContain(
            'cardinality_merge'
        );
        localConfig.showCardinality = false;
    });

    it('does not mount relationship merge tooltips', () => {
        renderEdge('add');
        expect(
            screen.queryByText('merge_wizard.result.change.add')
        ).not.toBeInTheDocument();
    });

    it('marks foreground metadata without switching cardinality to selected pink', () => {
        localConfig.showCardinality = true;
        const props = {
            id: 'rel-1',
            source: 't1',
            target: 't2',
            sourceX: 0,
            sourceY: 0,
            targetX: 200,
            targetY: 0,
            selected: false,
            data: {
                relationship: {
                    id: 'rel-1',
                    name: 'rel',
                    sourceTableId: 't1',
                    targetTableId: 't2',
                    sourceFieldId: 'f1',
                    targetFieldId: 'f2',
                    sourceCardinality: 'one',
                    targetCardinality: 'many',
                    createdAt: 0,
                },
                mergePreview: {
                    change: 'add' as const,
                    operationId: 'op-rel',
                    indicatorLane: 0,
                },
                mergePreviewHover: {
                    foreground: true,
                },
            },
        } as EdgeProps<RelationshipEdgeType>;

        render(
            <TooltipProvider>
                <RelationshipEdge {...props} />
            </TooltipProvider>
        );

        const path = document.querySelector(
            '.react-flow__edge-path'
        ) as SVGPathElement;
        expect(path.getAttribute('data-merge-preview-foreground')).toBe('true');
        expect(path.getAttribute('marker-start')).toContain(
            'cardinality_merge_add'
        );
        expect(path.getAttribute('marker-start')).not.toContain('selected');
        localConfig.showCardinality = false;
    });

    it('applies foreground styling when merge preview hover requests it', () => {
        const props = {
            id: 'rel-1',
            source: 't1',
            target: 't2',
            sourceX: 0,
            sourceY: 0,
            targetX: 200,
            targetY: 0,
            selected: false,
            data: {
                relationship: {
                    id: 'rel-1',
                    name: 'rel',
                    sourceTableId: 't1',
                    targetTableId: 't2',
                    sourceFieldId: 'f1',
                    targetFieldId: 'f2',
                    sourceCardinality: 'one',
                    targetCardinality: 'many',
                    createdAt: 0,
                },
                mergePreview: {
                    change: 'modify' as const,
                    operationId: 'op-rel',
                    indicatorLane: 0,
                },
                mergePreviewHover: {
                    focused: true,
                    foreground: true,
                },
            },
        } as EdgeProps<RelationshipEdgeType>;

        render(
            <TooltipProvider>
                <RelationshipEdge {...props} />
            </TooltipProvider>
        );

        const path = document.querySelector('.react-flow__edge-path');
        expect(path?.getAttribute('data-merge-preview-foreground')).toBe(
            'true'
        );
        expect(path?.className).not.toContain('drop-shadow');
    });

    it('calls highlight handler on preview hover without opening popover', () => {
        const onHighlightOperation = vi.fn();
        const onClearHighlight = vi.fn();
        const props = {
            id: 'rel-1',
            source: 't1',
            target: 't2',
            sourceX: 0,
            sourceY: 0,
            targetX: 200,
            targetY: 0,
            selected: false,
            data: {
                relationship: {
                    id: 'rel-1',
                    name: 'rel',
                    sourceTableId: 't1',
                    targetTableId: 't2',
                    sourceFieldId: 'f1',
                    targetFieldId: 'f2',
                    sourceCardinality: 'one',
                    targetCardinality: 'many',
                    createdAt: 0,
                },
                mergePreview: {
                    change: 'add' as const,
                    operationId: 'op-rel-hover',
                    indicatorLane: 0,
                },
            },
        } as EdgeProps<RelationshipEdgeType>;

        render(
            <TooltipProvider>
                <MergePreviewHighlightProvider
                    onHighlightOperation={onHighlightOperation}
                    onClearHighlight={onClearHighlight}
                >
                    <RelationshipEdge {...props} />
                </MergePreviewHighlightProvider>
            </TooltipProvider>
        );

        const path = document.querySelector('.react-flow__edge-path');
        fireEvent.mouseEnter(path!);
        expect(onHighlightOperation).toHaveBeenCalledWith('op-rel-hover');
        fireEvent.mouseLeave(path!);
        expect(onClearHighlight).toHaveBeenCalled();
        expect(openRelationshipPopover).not.toHaveBeenCalled();
    });

    it('does not open relationship popover in readonly preview', () => {
        renderEdge('modify');
        const path = document.querySelector('.react-flow__edge-path');
        expect(path).toBeTruthy();
        fireEvent.click(path!, { detail: 2 });
        expect(openRelationshipPopover).not.toHaveBeenCalled();
    });
});
