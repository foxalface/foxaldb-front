import React from 'react';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DBField } from '@/lib/domain/db-field';
import type { RemoteEditingViewModel } from '@/lib/realtime/editing-utils';
import { TooltipProvider } from '@/components/tooltip/tooltip';
import {
    LEFT_HANDLE_ID_PREFIX,
    RIGHT_HANDLE_ID_PREFIX,
    TableNodeField,
} from '../table-node-field';

const {
    chartDBState,
    conversationsState,
    remoteEditorsState,
    openConversationMock,
    setEditTableModeTable,
    closeAllTablesInSidebar,
    stableConnection,
    stableDiffApi,
    updateNodeInternals,
} = vi.hoisted(() => {
    const emptyRelationships: never[] = [];
    const setEditTableModeTable = vi.fn();
    const closeAllTablesInSidebar = vi.fn();
    const updateNodeInternals = vi.fn();
    const openConversationMock = vi.fn();

    return {
        chartDBState: {
            readonly: false,
            relationships: emptyRelationships as Array<{
                sourceTableId?: string;
                targetTableId?: string;
                sourceFieldId?: string;
                targetFieldId?: string;
                sourceCardinality?: string;
                targetCardinality?: string;
            }>,
            highlightedCustomType: null as null,
            databaseType: 'sqlite',
        },
        conversationsState: {
            isAvailable: true,
            isPending: false,
        },
        remoteEditorsState: {
            editors: [] as RemoteEditingViewModel[],
        },
        openConversationMock,
        setEditTableModeTable,
        closeAllTablesInSidebar,
        updateNodeInternals,
        stableConnection: {
            inProgress: false,
            fromNode: { id: '' },
            fromHandle: { id: '' },
        },
        stableDiffApi: {
            checkIfFieldRemoved: () => false,
            checkIfNewField: () => false,
            getFieldNewName: () => null,
            getFieldNewType: () => null,
            getFieldNewNullable: () => null,
            getFieldNewPrimaryKey: () => null,
            getFieldNewCharacterMaximumLength: () => null,
            getFieldNewPrecision: () => null,
            getFieldNewScale: () => null,
            getFieldNewIsArray: () => null,
            checkIfFieldHasChange: () => false,
            isSummaryOnly: false,
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
        relationships: chartDBState.relationships,
        readonly: chartDBState.readonly,
        highlightedCustomType: chartDBState.highlightedCustomType,
        databaseType: chartDBState.databaseType,
    }),
}));

vi.mock('@/hooks/use-layout', () => ({
    useLayout: () => ({
        closeAllTablesInSidebar,
    }),
}));

vi.mock('@/hooks/use-canvas', () => ({
    useCanvas: () => ({
        setEditTableModeTable,
    }),
}));

vi.mock('@/hooks/use-remote-editing', () => ({
    useEntityRemoteEditing: () => remoteEditorsState.editors,
}));

vi.mock('@/hooks/use-local-config', () => ({
    useLocalConfig: () => ({
        showFieldAttributes: false,
    }),
}));

vi.mock('@/context/diff-context/use-diff', () => ({
    useDiff: () => stableDiffApi,
}));

vi.mock('@xyflow/react', () => ({
    Handle: ({ id, className }: { id?: string; className?: string }) => (
        <div
            data-testid={id ? `handle-${id}` : 'handle'}
            data-handle-id={id}
            className={className}
        />
    ),
    Position: { Top: 'top', Left: 'left', Right: 'right', Bottom: 'bottom' },
    useConnection: () => stableConnection,
    useUpdateNodeInternals: () => updateNodeInternals,
}));

const baseField: DBField = {
    id: 'field-1',
    name: 'email',
    type: { id: 'text', name: 'text' },
    primaryKey: false,
    unique: false,
    nullable: true,
    createdAt: 0,
};

const remoteEditor = (
    overrides: Partial<RemoteEditingViewModel> = {}
): RemoteEditingViewModel => ({
    userId: 3,
    name: 'Grace',
    initials: 'G',
    colorClass: 'bg-sky-500',
    borderColorClass: 'border-sky-500',
    strokeColorClass: 'stroke-sky-500',
    ringColorClass: 'ring-sky-500',
    isSelf: false,
    ...overrides,
});

type RenderOptions = {
    field?: DBField;
    focused?: boolean;
    visible?: boolean;
    readonly?: boolean;
    isConnectable?: boolean;
};

const renderField = ({
    field = baseField,
    focused = true,
    visible = true,
    readonly = false,
    isConnectable = true,
}: RenderOptions = {}) => {
    chartDBState.readonly = readonly;
    return render(
        <TooltipProvider>
            <TableNodeField
                tableNodeId="table-1"
                field={field}
                focused={focused}
                highlighted={false}
                visible={visible}
                isConnectable={isConnectable}
            />
        </TooltipProvider>
    );
};

const getFieldActionCluster = () => {
    const indicator = screen.getByTestId('conversation-indicator');
    const cluster = indicator.closest(
        '.group-hover\\:flex.group-focus-within\\:flex'
    );
    expect(cluster).not.toBeNull();
    return cluster as HTMLElement;
};

describe('TableNodeField conversation indicator', () => {
    afterEach(() => {
        cleanup();
    });

    beforeEach(() => {
        chartDBState.readonly = false;
        chartDBState.relationships = [];
        conversationsState.isAvailable = true;
        conversationsState.isPending = false;
        remoteEditorsState.editors = [];
        openConversationMock.mockClear();
        setEditTableModeTable.mockClear();
        closeAllTablesInSidebar.mockClear();
        updateNodeInternals.mockClear();
    });

    it('places ConversationIndicator beside the Edit action in the shared cluster', () => {
        renderField();

        const cluster = getFieldActionCluster();
        expect(cluster.className).toContain('hidden');
        expect(cluster.className).toContain('group-hover:flex');
        expect(cluster.className).toContain('group-focus-within:flex');

        const buttons = cluster.querySelectorAll('button');
        expect(buttons).toHaveLength(2);
        expect(buttons[0]).toHaveAttribute(
            'data-testid',
            'conversation-indicator'
        );
        expect(buttons[1]?.querySelector('.lucide-pencil')).not.toBeNull();
    });

    it('uses canvas action styling without active highlight', () => {
        renderField();

        const indicator = screen.getByTestId('conversation-indicator');
        expect(indicator).toHaveAttribute(
            'data-highlight-when-active',
            'false'
        );
        expect(indicator).toHaveAttribute(
            'data-button-class',
            'p-0 hover:bg-primary-foreground'
        );
    });

    it('does not leave a permanently visible duplicate beside the field name', () => {
        const { container } = renderField();

        expect(screen.getAllByTestId('conversation-indicator')).toHaveLength(1);

        const nameArea = container.querySelector(
            '.flex.items-center.gap-1.min-w-0.text-left'
        );
        expect(nameArea).not.toBeNull();
        expect(
            nameArea!.querySelector('[data-testid="conversation-indicator"]')
        ).toBeNull();
    });

    it('hides ConversationIndicator when conversations are unavailable', () => {
        conversationsState.isAvailable = false;
        renderField();

        expect(
            screen.queryByTestId('conversation-indicator')
        ).not.toBeInTheDocument();
    });

    it('passes the field target for another field id', () => {
        renderField({
            field: { ...baseField, id: 'field-99', name: 'status' },
        });

        const indicator = screen.getByTestId('conversation-indicator');
        expect(indicator).toHaveAttribute('data-target-id', 'field-99');
        expect(indicator).toHaveAttribute('data-target-name', 'status');
    });

    it('shows the indicator for readonly viewers when conversations are available', () => {
        renderField({ readonly: true });

        expect(
            screen.getByTestId('conversation-indicator')
        ).toBeInTheDocument();
        expect(screen.getByText('email')).toBeInTheDocument();
        expect(
            getFieldActionCluster().querySelector('.lucide-pencil')
        ).toBeNull();
    });

    it('opens the field conversation without triggering edit mode', async () => {
        const user = userEvent.setup();
        renderField();

        await user.click(screen.getByTestId('conversation-indicator'));

        expect(openConversationMock).toHaveBeenCalledWith({
            targetType: 'field',
            targetId: 'field-1',
        });
        expect(setEditTableModeTable).not.toHaveBeenCalled();
    });

    it('disables duplicate activation while pending', () => {
        conversationsState.isPending = true;
        renderField();

        const indicator = screen.getByTestId('conversation-indicator');
        expect(indicator).toBeDisabled();
        expect(indicator).toHaveAttribute('aria-busy', 'true');
    });

    it('coexists with PK, nullable, and schema-comment markers', () => {
        renderField({
            field: {
                ...baseField,
                primaryKey: true,
                nullable: true,
                comments: 'db schema note',
            },
        });

        expect(
            screen.getByTestId('conversation-indicator')
        ).toBeInTheDocument();
        expect(screen.getByText('email')).toBeInTheDocument();
        expect(
            document.querySelector('.lucide-message-circle-more')
        ).not.toBeNull();
        expect(document.querySelector('.lucide-key-round')).not.toBeNull();
        expect(screen.getByText('text?')).toBeInTheDocument();
    });

    it('coexists with EntityEditingBadge when remote editors are present', () => {
        remoteEditorsState.editors = [remoteEditor()];
        renderField();

        expect(
            screen.getByTestId('conversation-indicator')
        ).toBeInTheDocument();
        expect(screen.getByTitle('Grace is editing')).toBeInTheDocument();
    });

    it('keeps relationship handles present while the indicator is present', () => {
        renderField({ focused: true });

        expect(
            screen.getByTestId(`handle-${RIGHT_HANDLE_ID_PREFIX}field-1`)
        ).toBeInTheDocument();
        expect(
            screen.getByTestId(`handle-${LEFT_HANDLE_ID_PREFIX}field-1`)
        ).toBeInTheDocument();
        expect(
            screen.getByTestId('conversation-indicator')
        ).toBeInTheDocument();
    });

    it('does not render the raw field id or numeric badge text', () => {
        renderField();

        expect(screen.queryByText('field-1')).not.toBeInTheDocument();
        expect(
            within(screen.getByTestId('conversation-indicator')).queryByText(
                /\d+/
            )
        ).not.toBeInTheDocument();
    });

    it('preserves truncation on the field identity', () => {
        const { container } = renderField();

        expect(container.querySelector('.truncate.min-w-0')).not.toBeNull();
    });

    it('still mounts ConversationIndicator when the row is collapsed away', () => {
        const { container } = renderField({ visible: false });

        const row = container.firstElementChild as HTMLElement;
        expect(row).toHaveClass('max-h-0', 'overflow-hidden', 'opacity-0');
        expect(
            screen.getByTestId('conversation-indicator')
        ).toBeInTheDocument();
    });

    it('keeps the pencil edit control functional and separate from conversation', async () => {
        const user = userEvent.setup();
        renderField();

        const cluster = getFieldActionCluster();
        const editButton = cluster.querySelector(
            'button:not([data-testid="conversation-indicator"])'
        ) as HTMLButtonElement;
        expect(editButton).not.toBeNull();

        await user.click(editButton);

        expect(setEditTableModeTable).toHaveBeenCalledWith({
            tableId: 'table-1',
            fieldId: 'field-1',
        });
        expect(openConversationMock).not.toHaveBeenCalled();
    });
});
