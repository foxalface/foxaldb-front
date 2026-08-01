import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DBField } from '@/lib/domain/db-field';
import type { DBTable } from '@/lib/domain/db-table';
import type { RemoteEditingViewModel } from '@/lib/realtime/editing-utils';
import type { NodeProps } from '@xyflow/react';
import type { TableNodeType } from '../table-node';

const {
    chartDBState,
    conversationsState,
    remoteEditorsState,
    openConversationMock,
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
    const openConversationMock = vi.fn();

    return {
        chartDBState: {
            readonly: false,
        },
        conversationsState: {
            isAvailable: true,
            isPending: false,
        },
        remoteEditorsState: {
            editors: [] as RemoteEditingViewModel[],
        },
        openConversationMock,
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

vi.mock('@/hooks/use-conversations-availability', () => ({
    useConversationsAvailability: () => conversationsState.isAvailable,
}));

vi.mock('@/components/conversation-indicator/conversation-indicator', () => ({
    ConversationIndicator: ({
        target,
        targetName,
        buttonClassName,
        highlightWhenActive,
    }: {
        target: { targetType: string; targetId: string };
        targetName: string;
        buttonClassName?: string;
        highlightWhenActive?: boolean;
    }) => (
        <button
            type="button"
            data-testid="conversation-indicator"
            data-target-type={target.targetType}
            data-target-id={target.targetId}
            data-target-name={targetName}
            data-button-class={buttonClassName ?? ''}
            data-highlight-when-active={String(highlightWhenActive ?? true)}
            aria-busy={conversationsState.isPending}
            disabled={conversationsState.isPending}
            onClick={(event) => {
                event.stopPropagation();
                openConversationMock(target);
            }}
        />
    ),
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

const getTableActionCluster = () => {
    const indicator = screen.getByTestId('conversation-indicator');
    const cluster = indicator.closest(
        '.group-hover\\:flex.group-focus-within\\:flex'
    );
    expect(cluster).not.toBeNull();
    return cluster as HTMLElement;
};

describe('TableNode conversation indicator', () => {
    afterEach(() => {
        cleanup();
    });

    beforeEach(() => {
        chartDBState.readonly = false;
        conversationsState.isAvailable = true;
        conversationsState.isPending = false;
        remoteEditorsState.editors = [];
        openConversationMock.mockClear();
        updateTable.mockClear();
        openTableFromSidebar.mockClear();
        selectSidebarSection.mockClear();
        closeAllTablesInSidebar.mockClear();
        setEditTableModeTable.mockClear();
        setHoveringTableId.mockClear();
        showCreateRelationshipNode.mockClear();
    });

    it('renders ConversationIndicator in the table contextual action cluster', () => {
        renderTableNode();

        const indicator = screen.getByTestId('conversation-indicator');
        expect(indicator).toHaveAttribute('data-target-type', 'table');
        expect(indicator).toHaveAttribute('data-target-id', 'table-1');
        expect(indicator).toHaveAttribute('data-target-name', 'Clients');

        const cluster = getTableActionCluster();
        expect(cluster.className).toContain('hidden');
        expect(cluster.className).toContain('group-hover:flex');
        expect(cluster.className).toContain('group-focus-within:flex');
    });

    it('uses canvas action styling without active highlight', () => {
        renderTableNode();

        const indicator = screen.getByTestId('conversation-indicator');
        expect(indicator).toHaveAttribute(
            'data-highlight-when-active',
            'false'
        );
        expect(indicator).toHaveAttribute(
            'data-button-class',
            'p-0 text-slate-500 hover:bg-primary-foreground hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
        );
    });

    it('does not leave a permanently visible duplicate beside the table name', () => {
        const { container } = renderTableNode();

        expect(screen.getAllByTestId('conversation-indicator')).toHaveLength(1);

        const nameArea = container.querySelector(
            '.flex.min-w-0.flex-1.items-center.gap-2'
        );
        expect(nameArea).not.toBeNull();
        expect(
            nameArea!.querySelector('[data-testid="conversation-indicator"]')
        ).toBeNull();
    });

    it('hides ConversationIndicator when conversations are unavailable', () => {
        conversationsState.isAvailable = false;
        renderTableNode();

        expect(
            screen.queryByTestId('conversation-indicator')
        ).not.toBeInTheDocument();
    });

    it('shows the indicator for readonly viewers when conversations are available', () => {
        chartDBState.readonly = true;
        renderTableNode();

        expect(
            screen.getByTestId('conversation-indicator')
        ).toBeInTheDocument();
        expect(screen.getByText('Clients')).toBeInTheDocument();
    });

    it('opens the table conversation without triggering edit mode', () => {
        const { container } = renderTableNode();

        fireEvent.click(screen.getByTestId('conversation-indicator'));

        expect(openConversationMock).toHaveBeenCalledWith({
            targetType: 'table',
            targetId: 'table-1',
        });
        expect(setEditTableModeTable).not.toHaveBeenCalled();

        const tableShell = container.querySelector('.relative');
        fireEvent.click(tableShell!, { detail: 2 });
        expect(setEditTableModeTable).toHaveBeenCalledWith({
            tableId: 'table-1',
        });
    });

    it('disables duplicate activation while pending', () => {
        conversationsState.isPending = true;
        renderTableNode();

        const indicator = screen.getByTestId('conversation-indicator');
        expect(indicator).toBeDisabled();
        expect(indicator).toHaveAttribute('aria-busy', 'true');
    });

    it('coexists with EntityEditingBadge', () => {
        remoteEditorsState.editors = [remoteEditor()];
        renderTableNode();

        expect(
            screen.getByTestId('conversation-indicator')
        ).toBeInTheDocument();
        expect(screen.getByText('editing')).toBeInTheDocument();
        expect(screen.getByTitle('Ada is editing')).toBeInTheDocument();
    });

    it('preserves selection chrome while the indicator is present', () => {
        const { container } = renderTableNode({
            selected: true,
            dragging: false,
        });

        expect(container.querySelector('.border-pink-600')).not.toBeNull();
        expect(
            screen.getByTestId('conversation-indicator')
        ).toBeInTheDocument();
    });

    it('keeps collapse control functional while the indicator is present', () => {
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

        expect(screen.getAllByTestId('conversation-indicator')).toHaveLength(1);
        fireEvent.click(screen.getByText('show_more'));

        expect(updateTable).toHaveBeenCalledWith('table-1', {
            expanded: true,
        });
    });

    it('keeps header open-sidebar action in the same contextual cluster', () => {
        renderTableNode();

        const cluster = getTableActionCluster();
        const buttons = cluster.querySelectorAll('button');
        expect(buttons.length).toBeGreaterThanOrEqual(2);

        fireEvent.click(buttons[0]!);

        expect(selectSidebarSection).toHaveBeenCalledWith('tables');
        expect(openTableFromSidebar).toHaveBeenCalledWith('table-1');
    });

    it('does not render the raw table id', () => {
        renderTableNode();

        expect(screen.getByText('Clients')).toBeInTheDocument();
        expect(screen.queryByText('table-1')).not.toBeInTheDocument();
    });
});
