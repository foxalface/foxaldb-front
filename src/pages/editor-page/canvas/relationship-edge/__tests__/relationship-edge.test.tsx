import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { EdgeProps } from '@xyflow/react';
import type { RelationshipEdgeType } from '../relationship-edge';

const { stableCanvasApi } = vi.hoisted(() => ({
    stableCanvasApi: {
        editRelationshipPopover: {
            relationshipId: 'rel-1',
            position: { x: 10, y: 20 },
        },
        openRelationshipPopover: vi.fn(),
        closeRelationshipPopover: vi.fn(),
    },
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        relationships: [
            {
                id: 'rel-1',
                name: 'Users → Orders',
                sourceTableId: 'table-1',
                targetTableId: 'table-2',
                sourceFieldId: 'field-1',
                targetFieldId: 'field-2',
                sourceCardinality: 'one',
                targetCardinality: 'many',
            },
        ],
        updateRelationship: vi.fn(),
        removeRelationship: vi.fn(),
    }),
}));

vi.mock('@/context/diff-context/use-diff', () => ({
    useDiff: () => ({
        checkIfRelationshipRemoved: () => false,
        checkIfNewRelationship: () => false,
    }),
}));

vi.mock('@/hooks/use-local-config', () => ({
    useLocalConfig: () => ({
        showCardinality: true,
    }),
}));

vi.mock('@/hooks/use-canvas', () => ({
    useCanvas: () => stableCanvasApi,
}));

vi.mock('../edit-relationship-popover', () => ({
    EditRelationshipPopover: () => (
        <div data-testid="edit-relationship-popover" />
    ),
}));

vi.mock('@xyflow/react', () => ({
    getSmoothStepPath: () => ['M0 0'],
    Position: { Left: 'left', Right: 'right' },
    useReactFlow: () => ({
        getInternalNode: () => ({ measured: { width: 200 } }),
        getEdge: () => ({ sourceHandle: 'left_rel_field-1' }),
    }),
}));

import { RelationshipEdge } from '../relationship-edge';

const renderRelationshipEdge = (selected = true) => {
    const props = {
        id: 'rel-1',
        source: 'table-1',
        target: 'table-2',
        sourceX: 0,
        sourceY: 0,
        targetX: 200,
        targetY: 0,
        selected,
        data: {
            relationship: {
                id: 'rel-1',
                name: 'Users → Orders',
                sourceTableId: 'table-1',
                targetTableId: 'table-2',
                sourceFieldId: 'field-1',
                targetFieldId: 'field-2',
                sourceCardinality: 'one',
                targetCardinality: 'many',
            },
        },
    } as EdgeProps<RelationshipEdgeType>;

    return render(<RelationshipEdge {...props} />);
};

describe('RelationshipEdge conversation entry', () => {
    afterEach(() => {
        cleanup();
    });

    beforeEach(() => {
        stableCanvasApi.editRelationshipPopover = {
            relationshipId: 'rel-1',
            position: { x: 10, y: 20 },
        };
    });

    it('does not render a permanent Conversation button on the edge', () => {
        renderRelationshipEdge(true);

        expect(screen.getByTitle('Edit relationship')).toBeInTheDocument();
        expect(screen.queryByTitle('Conversation')).not.toBeInTheDocument();
        expect(
            document.querySelector('[data-testid="conversation-indicator"]')
        ).toBeNull();
    });

    it('opens the existing relationship action popover instead of a standalone conversation control', () => {
        renderRelationshipEdge(true);

        expect(
            screen.getByTestId('edit-relationship-popover')
        ).toBeInTheDocument();
    });
});
