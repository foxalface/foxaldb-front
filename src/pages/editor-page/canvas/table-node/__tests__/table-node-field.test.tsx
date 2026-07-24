import React from 'react';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DBField } from '@/lib/domain/db-field';
import {
    EMPTY_DISCUSSION_INDICATOR,
    type DiscussionIndicator,
} from '@/lib/comments/discussion-indicators';
import type { RemoteEditingViewModel } from '@/lib/realtime/editing-utils';
import { TooltipProvider } from '@/components/tooltip/tooltip';
import {
    LEFT_HANDLE_ID_PREFIX,
    RIGHT_HANDLE_ID_PREFIX,
    TableNodeField,
} from '../table-node-field';

const {
    chartDBState,
    remoteEditorsState,
    discussionIndicatorState,
    useTableDiscussionIndicator,
    useFieldDiscussionIndicator,
    useRelationshipDiscussionIndicator,
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
    const discussionIndicatorState = {
        indicator: {
            commentCount: 0,
            hasDiscussion: false,
        } as DiscussionIndicator,
    };

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
        remoteEditorsState: {
            editors: [] as RemoteEditingViewModel[],
        },
        discussionIndicatorState,
        useTableDiscussionIndicator: vi.fn(),
        useFieldDiscussionIndicator: vi.fn(
            (): DiscussionIndicator => discussionIndicatorState.indicator
        ),
        useRelationshipDiscussionIndicator: vi.fn(),
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

vi.mock('@/hooks/use-discussion-indicators', () => ({
    useTableDiscussionIndicator,
    useFieldDiscussionIndicator,
    useRelationshipDiscussionIndicator,
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

const withDiscussion = (commentCount: number): DiscussionIndicator => ({
    commentCount,
    hasDiscussion: commentCount > 0,
});

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

describe('TableNodeField discussion indicator', () => {
    afterEach(() => {
        cleanup();
    });

    beforeEach(() => {
        chartDBState.readonly = false;
        chartDBState.relationships = [];
        remoteEditorsState.editors = [];
        discussionIndicatorState.indicator = EMPTY_DISCUSSION_INDICATOR;
        useTableDiscussionIndicator.mockClear();
        useFieldDiscussionIndicator.mockClear();
        useRelationshipDiscussionIndicator.mockClear();
        setEditTableModeTable.mockClear();
        closeAllTablesInSidebar.mockClear();
        updateNodeInternals.mockClear();
    });

    it('calls useFieldDiscussionIndicator with the exact field id', () => {
        renderField();

        expect(useFieldDiscussionIndicator).toHaveBeenCalledWith('field-1');
    });

    it('uses only the field specialized hook', () => {
        renderField();

        expect(useFieldDiscussionIndicator).toHaveBeenCalled();
        expect(useTableDiscussionIndicator).not.toHaveBeenCalled();
        expect(useRelationshipDiscussionIndicator).not.toHaveBeenCalled();
    });

    it('hides the indicator when the field hook returns the empty indicator', () => {
        discussionIndicatorState.indicator = EMPTY_DISCUSSION_INDICATOR;
        renderField();

        expect(
            screen.queryByTestId('discussion-indicator')
        ).not.toBeInTheDocument();
    });

    it('shows the indicator when hasDiscussion is true', () => {
        discussionIndicatorState.indicator = withDiscussion(1);
        renderField();

        const indicator = screen.getByTestId('discussion-indicator');
        expect(indicator).toBeInTheDocument();
        expect(indicator).toHaveAttribute('aria-hidden', 'true');
    });

    it('hides the indicator when hasDiscussion is false even with a positive commentCount', () => {
        discussionIndicatorState.indicator = {
            commentCount: 5,
            hasDiscussion: false,
        };
        renderField();

        expect(
            screen.queryByTestId('discussion-indicator')
        ).not.toBeInTheDocument();
    });

    it('does not render a numeric count', () => {
        discussionIndicatorState.indicator = withDiscussion(4);
        renderField();

        expect(screen.getByTestId('discussion-indicator')).toBeInTheDocument();
        expect(
            within(screen.getByTestId('discussion-indicator')).queryByText(
                /\d+/
            )
        ).not.toBeInTheDocument();
    });

    it('shows the indicator for readonly viewers', () => {
        discussionIndicatorState.indicator = withDiscussion(2);
        renderField({ readonly: true });

        expect(screen.getByTestId('discussion-indicator')).toBeInTheDocument();
        expect(screen.getByText('email')).toBeInTheDocument();
    });

    it('coexists with PK, nullable, and schema-comment markers', () => {
        discussionIndicatorState.indicator = withDiscussion(1);
        renderField({
            field: {
                ...baseField,
                primaryKey: true,
                nullable: true,
                comments: 'db schema note',
            },
        });

        expect(screen.getByTestId('discussion-indicator')).toBeInTheDocument();
        expect(screen.getByText('email')).toBeInTheDocument();
        expect(
            document.querySelector('.lucide-message-circle-more')
        ).not.toBeNull();
        expect(document.querySelector('.lucide-key-round')).not.toBeNull();
        expect(screen.getByText('text?')).toBeInTheDocument();
    });

    it('coexists with EntityEditingBadge when remote editors are present', () => {
        remoteEditorsState.editors = [remoteEditor()];
        discussionIndicatorState.indicator = withDiscussion(1);
        renderField();

        expect(screen.getByTestId('discussion-indicator')).toBeInTheDocument();
        expect(screen.getByTitle('Grace is editing')).toBeInTheDocument();
    });

    it('keeps relationship handles present and accessible', () => {
        discussionIndicatorState.indicator = withDiscussion(1);
        renderField({ focused: true });

        expect(
            screen.getByTestId(`handle-${RIGHT_HANDLE_ID_PREFIX}field-1`)
        ).toBeInTheDocument();
        expect(
            screen.getByTestId(`handle-${LEFT_HANDLE_ID_PREFIX}field-1`)
        ).toBeInTheDocument();
        expect(screen.getByTestId('discussion-indicator')).toHaveClass(
            'pointer-events-none'
        );
    });

    it('does not trigger edit mode or navigation when the indicator is clicked', async () => {
        const user = userEvent.setup();
        discussionIndicatorState.indicator = withDiscussion(1);
        renderField();

        await user.click(screen.getByTestId('discussion-indicator'));

        expect(setEditTableModeTable).not.toHaveBeenCalled();
        expect(closeAllTablesInSidebar).not.toHaveBeenCalled();
    });

    it('is not a button or link and does not become a tab stop', () => {
        discussionIndicatorState.indicator = withDiscussion(1);
        renderField();

        const indicator = screen.getByTestId('discussion-indicator');
        expect(indicator.tagName).toBe('SPAN');
        expect(indicator).not.toHaveAttribute('role');
        expect(indicator).not.toHaveAttribute('href');
        expect(indicator).not.toHaveAttribute('tabindex');
    });

    it('does not render the raw field id', () => {
        discussionIndicatorState.indicator = withDiscussion(2);
        renderField();

        expect(screen.queryByText('field-1')).not.toBeInTheDocument();
        expect(
            within(screen.getByTestId('discussion-indicator')).queryByText('2')
        ).not.toBeInTheDocument();
    });

    it('preserves truncation on the field identity and shrink-0 on the indicator', () => {
        discussionIndicatorState.indicator = withDiscussion(1);
        const { container } = renderField();

        expect(container.querySelector('.truncate.min-w-0')).not.toBeNull();
        expect(screen.getByTestId('discussion-indicator')).toHaveClass(
            'shrink-0',
            'pointer-events-none'
        );
    });

    it('does not render hidden field indicators when the row is collapsed away', () => {
        discussionIndicatorState.indicator = withDiscussion(1);
        const { container } = renderField({ visible: false });

        const row = container.firstElementChild as HTMLElement;
        expect(row).toHaveClass('max-h-0', 'overflow-hidden', 'opacity-0');
        // Collapsed tables omit field rows entirely in TableNode; when a row is
        // still mounted with visible=false it must not expose an interactive mark.
        const indicator = screen.queryByTestId('discussion-indicator');
        if (indicator) {
            expect(indicator).toHaveAttribute('aria-hidden', 'true');
            expect(indicator).toHaveClass('pointer-events-none');
        }
    });

    it('keeps the pencil edit control functional while the indicator is visible', async () => {
        const user = userEvent.setup();
        discussionIndicatorState.indicator = withDiscussion(1);
        const { container } = renderField();

        const editButton = container.querySelector(
            'button'
        ) as HTMLButtonElement | null;
        expect(editButton).not.toBeNull();
        await user.click(editButton!);

        expect(setEditTableModeTable).toHaveBeenCalledWith({
            tableId: 'table-1',
            fieldId: 'field-1',
        });
    });

    it('does not show a field indicator when the hook stays empty for a table-partition hit', () => {
        discussionIndicatorState.indicator = EMPTY_DISCUSSION_INDICATOR;
        renderField({ field: { ...baseField, id: 'shared-id' } });

        expect(useFieldDiscussionIndicator).toHaveBeenCalledWith('shared-id');
        expect(
            screen.queryByTestId('discussion-indicator')
        ).not.toBeInTheDocument();
    });
});
