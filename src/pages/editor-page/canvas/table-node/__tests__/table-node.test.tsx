import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DBField } from '@/lib/domain/db-field';
import type { DBTable } from '@/lib/domain/db-table';
import {
    EMPTY_DISCUSSION_INDICATOR,
    type DiscussionIndicator,
} from '@/lib/comments/discussion-indicators';
import type { RemoteEditingViewModel } from '@/lib/realtime/editing-utils';
import type { NodeProps } from '@xyflow/react';
import type { TableNodeType } from '../table-node';

const {
    chartDBState,
    remoteEditorsState,
    discussionIndicatorState,
    useTableDiscussionIndicator,
    useFieldDiscussionIndicator,
    useRelationshipDiscussionIndicator,
    updateTable,
    openTableFromSidebar,
    selectSidebarSection,
    closeAllTablesInSidebar,
    setEditTableModeTable,
    setHoveringTableId,
    showCreateRelationshipNode,
    emptyRelationships,
    emptyDependencies,
    emptyEdges,
    emptyCollaborators,
    stableConnection,
    stableDiffApi,
    stableCanvasApi,
} = vi.hoisted(() => {
    const emptyRelationships: never[] = [];
    const emptyDependencies: never[] = [];
    const emptyEdges: never[] = [];
    const emptyCollaborators: never[] = [];
    const updateTable = vi.fn();
    const openTableFromSidebar = vi.fn();
    const selectSidebarSection = vi.fn();
    const closeAllTablesInSidebar = vi.fn();
    const setEditTableModeTable = vi.fn();
    const setHoveringTableId = vi.fn();
    const showCreateRelationshipNode = vi.fn();

    const discussionIndicatorState = {
        indicator: {
            commentCount: 0,
            hasDiscussion: false,
        } as DiscussionIndicator,
    };

    return {
        chartDBState: {
            readonly: false,
        },
        remoteEditorsState: {
            editors: [] as RemoteEditingViewModel[],
        },
        discussionIndicatorState,
        useTableDiscussionIndicator: vi.fn(
            (): DiscussionIndicator => discussionIndicatorState.indicator
        ),
        useFieldDiscussionIndicator: vi.fn(),
        useRelationshipDiscussionIndicator: vi.fn(),
        updateTable,
        openTableFromSidebar,
        selectSidebarSection,
        closeAllTablesInSidebar,
        setEditTableModeTable,
        setHoveringTableId,
        showCreateRelationshipNode,
        emptyRelationships,
        emptyDependencies,
        emptyEdges,
        emptyCollaborators,
        stableConnection: {
            inProgress: false,
            fromNode: { id: '' },
            fromHandle: { id: '' },
        },
        stableDiffApi: {
            getTableNewName: () => null,
            getTableNewColor: () => null,
            checkIfTableHasChange: () => false,
            checkIfNewTable: () => false,
            checkIfTableRemoved: () => false,
            isSummaryOnly: false,
        },
        stableCanvasApi: {
            setEditTableModeTable,
            editTableModeTable: null as null,
            setHoveringTableId,
            showCreateRelationshipNode,
            tempFloatingEdge: null as null,
        },
    };
});

vi.mock('@/hooks/use-discussion-indicators', () => ({
    useTableDiscussionIndicator,
    useFieldDiscussionIndicator,
    useRelationshipDiscussionIndicator,
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        updateTable,
        relationships: emptyRelationships,
        readonly: chartDBState.readonly,
        dependencies: emptyDependencies,
        highlightedCustomType: null,
        databaseType: 'sqlite',
    }),
}));

vi.mock('@/hooks/use-layout', () => ({
    useLayout: () => ({
        openTableFromSidebar,
        selectSidebarSection,
        closeAllTablesInSidebar,
    }),
}));

vi.mock('@/hooks/use-canvas', () => ({
    useCanvas: () => stableCanvasApi,
}));

vi.mock('@/hooks/use-remote-selections', () => ({
    useEntityRemoteSelections: () => emptyCollaborators,
}));

vi.mock('@/hooks/use-remote-editing', () => ({
    useEntityRemoteEditing: () => remoteEditorsState.editors,
}));

vi.mock('@/context/diff-context/use-diff', () => ({
    useDiff: () => stableDiffApi,
}));

vi.mock('../table-node-context-menu', () => ({
    TableNodeContextMenu: ({ children }: { children: React.ReactNode }) =>
        children,
}));

vi.mock('../table-edit-mode/table-edit-mode', () => ({
    TableEditMode: () => null,
}));

vi.mock('../table-node-field', () => ({
    TableNodeField: () => null,
}));

vi.mock('../table-node-dependency-indicator', () => ({
    TableNodeDependencyIndicator: () => null,
}));

vi.mock('@xyflow/react', () => ({
    NodeResizer: () => null,
    Handle: () => null,
    Position: { Top: 'top', Left: 'left', Right: 'right', Bottom: 'bottom' },
    useConnection: () => stableConnection,
    useStore: (selector: (store: { edges: unknown[] }) => unknown) =>
        selector({ edges: emptyEdges }),
    useUpdateNodeInternals: () => vi.fn(),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

import { TableNode } from '../table-node';

const baseField: DBField = {
    id: 'field-1',
    name: 'email',
    type: { id: 'text', name: 'text' },
    primaryKey: false,
    unique: false,
    nullable: true,
    createdAt: 0,
};

const baseTable: DBTable = {
    id: 'table-1',
    name: 'Clients',
    x: 0,
    y: 0,
    fields: [baseField],
    indexes: [],
    color: '#64748b',
    isView: false,
    createdAt: 0,
    expanded: true,
};

const withDiscussion = (commentCount: number): DiscussionIndicator => ({
    commentCount,
    hasDiscussion: commentCount > 0,
});

const remoteEditor = (): RemoteEditingViewModel => ({
    userId: 7,
    name: 'Ada',
    initials: 'A',
    colorClass: 'bg-pink-500',
    borderColorClass: 'border-pink-500',
    strokeColorClass: 'stroke-pink-500',
    ringColorClass: 'ring-pink-500',
    isSelf: false,
});

const renderTableNode = (
    overrides: Partial<NodeProps<TableNodeType>> = {},
    table: DBTable = baseTable
) => {
    const props = {
        id: table.id,
        type: 'table',
        dragging: false,
        selected: false,
        selectable: true,
        deletable: true,
        draggable: true,
        isConnectable: true,
        positionAbsoluteX: 0,
        positionAbsoluteY: 0,
        zIndex: 0,
        width: 224,
        height: 100,
        data: {
            table,
            isOverlapping: false,
        },
        ...overrides,
    } as NodeProps<TableNodeType>;

    return render(<TableNode {...props} />);
};

describe('TableNode discussion indicator', () => {
    afterEach(() => {
        cleanup();
    });

    beforeEach(() => {
        chartDBState.readonly = false;
        remoteEditorsState.editors = [];
        discussionIndicatorState.indicator = EMPTY_DISCUSSION_INDICATOR;
        useTableDiscussionIndicator.mockClear();
        useFieldDiscussionIndicator.mockClear();
        useRelationshipDiscussionIndicator.mockClear();
        updateTable.mockClear();
        openTableFromSidebar.mockClear();
        selectSidebarSection.mockClear();
        closeAllTablesInSidebar.mockClear();
        setEditTableModeTable.mockClear();
        setHoveringTableId.mockClear();
        showCreateRelationshipNode.mockClear();
    });

    it('calls useTableDiscussionIndicator with the exact table id', () => {
        renderTableNode();

        expect(useTableDiscussionIndicator).toHaveBeenCalledWith('table-1');
    });

    it('does not use field or relationship indicator hooks', () => {
        renderTableNode({}, { ...baseTable, fields: [] });

        expect(useTableDiscussionIndicator).toHaveBeenCalled();
        expect(useFieldDiscussionIndicator).not.toHaveBeenCalled();
        expect(useRelationshipDiscussionIndicator).not.toHaveBeenCalled();
    });

    it('hides the indicator when the table hook returns the empty indicator', () => {
        discussionIndicatorState.indicator = EMPTY_DISCUSSION_INDICATOR;
        renderTableNode();

        expect(
            screen.queryByTestId('discussion-indicator')
        ).not.toBeInTheDocument();
    });

    it('shows the indicator when hasDiscussion is true', () => {
        discussionIndicatorState.indicator = withDiscussion(1);
        renderTableNode();

        const indicator = screen.getByTestId('discussion-indicator');
        expect(indicator).toBeInTheDocument();
        expect(indicator).toHaveAttribute('aria-hidden', 'true');
    });

    it('hides when hasDiscussion is false even with a positive commentCount', () => {
        discussionIndicatorState.indicator = {
            commentCount: 5,
            hasDiscussion: false,
        };
        renderTableNode();

        expect(
            screen.queryByTestId('discussion-indicator')
        ).not.toBeInTheDocument();
    });

    it('does not render a numeric count', () => {
        discussionIndicatorState.indicator = withDiscussion(4);
        renderTableNode();

        expect(screen.getByTestId('discussion-indicator')).toBeInTheDocument();
        expect(screen.queryByText('4')).not.toBeInTheDocument();
    });

    it('shows the indicator for readonly viewers', () => {
        chartDBState.readonly = true;
        discussionIndicatorState.indicator = withDiscussion(2);
        renderTableNode();

        expect(screen.getByTestId('discussion-indicator')).toBeInTheDocument();
        expect(screen.getByText('Clients')).toBeInTheDocument();
    });

    it('coexists with EntityEditingBadge', () => {
        remoteEditorsState.editors = [remoteEditor()];
        discussionIndicatorState.indicator = withDiscussion(1);
        renderTableNode();

        expect(screen.getByTestId('discussion-indicator')).toBeInTheDocument();
        expect(screen.getByText('editing')).toBeInTheDocument();
        expect(screen.getByTitle('Ada is editing')).toBeInTheDocument();
    });

    it('is decorative and does not navigate when clicked', () => {
        discussionIndicatorState.indicator = withDiscussion(1);
        renderTableNode();

        const indicator = screen.getByTestId('discussion-indicator');
        expect(indicator.tagName).toBe('SPAN');
        expect(indicator).toHaveClass('pointer-events-none', 'shrink-0');
        expect(indicator).not.toHaveAttribute('tabindex');
        expect(indicator).not.toHaveAttribute('role');

        fireEvent.click(indicator);

        expect(openTableFromSidebar).not.toHaveBeenCalled();
        expect(selectSidebarSection).not.toHaveBeenCalled();
        expect(setEditTableModeTable).not.toHaveBeenCalled();
    });

    it('preserves selection chrome and does not intercept pointer events', () => {
        discussionIndicatorState.indicator = withDiscussion(1);
        const { container } = renderTableNode({
            selected: true,
            dragging: false,
        });

        expect(container.querySelector('.border-pink-600')).not.toBeNull();
        expect(screen.getByTestId('discussion-indicator')).toHaveClass(
            'pointer-events-none'
        );
    });

    it('keeps collapse control functional while the indicator is visible', () => {
        discussionIndicatorState.indicator = withDiscussion(1);
        const manyFields: DBField[] = Array.from(
            { length: 12 },
            (_, index) => ({
                ...baseField,
                id: `field-${index}`,
                name: `col_${index}`,
            })
        );
        renderTableNode(
            {},
            { ...baseTable, fields: manyFields, expanded: false }
        );

        expect(screen.getAllByTestId('discussion-indicator')).toHaveLength(1);
        fireEvent.click(screen.getByText('show_more'));

        expect(updateTable).toHaveBeenCalledWith('table-1', {
            expanded: true,
        });
    });

    it('keeps header open-sidebar action available', () => {
        discussionIndicatorState.indicator = withDiscussion(1);
        const { container } = renderTableNode();

        const header = container.querySelector('.group.flex.h-9');
        expect(header).not.toBeNull();
        const openSidebarButton = header!.querySelector('button');
        expect(openSidebarButton).not.toBeNull();

        fireEvent.click(openSidebarButton!);

        expect(selectSidebarSection).toHaveBeenCalledWith('tables');
        expect(openTableFromSidebar).toHaveBeenCalledWith('table-1');
    });

    it('does not render the raw table id', () => {
        discussionIndicatorState.indicator = withDiscussion(1);
        renderTableNode();

        expect(screen.getByText('Clients')).toBeInTheDocument();
        expect(screen.queryByText('table-1')).not.toBeInTheDocument();
    });
});
