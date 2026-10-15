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

vi.mock('@/hooks/use-local-config', () => ({
    useLocalConfig: () => ({ showCardinality: false }),
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
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

import { RelationshipEdge } from '../relationship-edge';
import { TooltipProvider } from '@/components/tooltip/tooltip';

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
            ...(change ? { mergePreview: { change } } : {}),
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

    it('styles delete preview edges and keeps them rendered', () => {
        renderEdge('delete');
        const path = document.querySelector(
            '[data-merge-change="delete"]'
        ) as SVGPathElement;
        expect(path).toBeTruthy();
        expect(path.getAttribute('stroke-dasharray')).toBe('8 6');
        expect(
            screen.getByLabelText('merge_wizard.result.change.delete')
        ).toBeInTheDocument();
    });

    it('does not open relationship popover in readonly preview', () => {
        renderEdge('modify');
        const path = document.querySelector('.react-flow__edge-path');
        expect(path).toBeTruthy();
        fireEvent.click(path!, { detail: 2 });
        expect(openRelationshipPopover).not.toHaveBeenCalled();
    });
});
