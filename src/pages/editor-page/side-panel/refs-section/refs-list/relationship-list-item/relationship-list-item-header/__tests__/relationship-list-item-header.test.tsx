import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DBRelationship } from '@/lib/domain/db-relationship';
import type { RemoteEditingViewModel } from '@/lib/realtime/editing-utils';
import { en } from '@/i18n/locales/en';
import { TooltipProvider } from '@/components/tooltip/tooltip';
import { RelationshipListItemHeader } from '../relationship-list-item-header';

const {
    chartDBState,
    conversationsState,
    remoteEditorsState,
    removeRelationship,
    deleteElements,
} = vi.hoisted(() => ({
    chartDBState: {
        readonly: false,
    },
    conversationsState: {
        isAvailable: true,
    },
    remoteEditorsState: {
        editors: [] as RemoteEditingViewModel[],
    },
    removeRelationship: vi.fn(),
    deleteElements: vi.fn(),
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        updateRelationship: vi.fn(),
        removeRelationship,
        readonly: chartDBState.readonly,
    }),
}));

vi.mock('@/hooks/use-conversations-availability', () => ({
    useConversationsAvailability: () => conversationsState.isAvailable,
}));

vi.mock('@/components/conversation-indicator/conversation-indicator', () => ({
    ConversationIndicator: ({
        target,
        targetName,
        className,
    }: {
        target: { targetType: string; targetId: string };
        targetName: string;
        className?: string;
    }) => (
        <span
            data-testid="conversation-indicator"
            data-target-type={target.targetType}
            data-target-id={target.targetId}
            data-target-name={targetName}
            className={className}
        />
    ),
}));

vi.mock('@xyflow/react', () => ({
    useReactFlow: () => ({
        deleteElements,
    }),
}));

vi.mock('@/hooks/use-focus-on', () => ({
    useFocusOn: () => ({
        focusOnRelationship: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-editing-broadcast', () => ({
    useEditingBroadcast: () => ({
        startEditing: vi.fn(),
        stopEditing: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-editing-conflict-warning', () => ({
    useEditingConflictWarning: () => ({
        message: '',
        editors: [],
        hasConflict: false,
    }),
}));

vi.mock('@/hooks/use-editing-conflict-explanation', () => ({
    useEditingConflictExplanation: () => null,
}));

vi.mock('@/hooks/use-remote-editing', () => ({
    useEntityRemoteEditing: () => remoteEditorsState.editors,
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const parts = key.split('.');
            let current: unknown = en.translation;
            for (const part of parts) {
                if (
                    typeof current !== 'object' ||
                    current === null ||
                    !(part in current)
                ) {
                    return key;
                }
                current = (current as Record<string, unknown>)[part];
            }
            return typeof current === 'string' ? current : key;
        },
    }),
}));

const relationship: DBRelationship = {
    id: 'rel-1',
    name: 'orders_clients_fk',
    sourceTableId: 'table-orders',
    targetTableId: 'table-clients',
    sourceFieldId: 'field-client-id',
    targetFieldId: 'field-id',
    sourceCardinality: 'many',
    targetCardinality: 'one',
    createdAt: 0,
};

const createRemoteEditor = (
    overrides: Partial<RemoteEditingViewModel> &
        Pick<RemoteEditingViewModel, 'userId' | 'name'>
): RemoteEditingViewModel => ({
    initials: 'AL',
    colorClass: 'bg-red-500',
    borderColorClass: 'border-red-500',
    strokeColorClass: '!stroke-red-500',
    ringColorClass: 'ring-red-500',
    isSelf: false,
    ...overrides,
});

const deleteButton = () => screen.getByRole('button', { name: 'Delete' });

const renderHeader = (rel: DBRelationship = relationship) =>
    render(
        <TooltipProvider>
            <RelationshipListItemHeader relationship={rel} />
        </TooltipProvider>
    );

describe('RelationshipListItemHeader actions', () => {
    beforeEach(() => {
        chartDBState.readonly = false;
        conversationsState.isAvailable = true;
        remoteEditorsState.editors = [];
        removeRelationship.mockClear();
        deleteElements.mockClear();
    });

    it('shows a delete button when editable', () => {
        renderHeader();

        expect(deleteButton()).toBeInTheDocument();
        expect(deleteButton()).toHaveClass('!text-red-700');
    });

    it('hides the delete button for readonly viewers', () => {
        chartDBState.readonly = true;
        renderHeader();

        expect(
            screen.queryByRole('button', { name: 'Delete' })
        ).not.toBeInTheDocument();
    });

    it('does not render an actions menu trigger', () => {
        renderHeader();

        expect(
            screen.queryByRole('button', { name: 'Actions' })
        ).not.toBeInTheDocument();
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('deletes the relationship when the delete button is clicked', async () => {
        const user = userEvent.setup();
        renderHeader();

        await user.click(deleteButton());

        expect(removeRelationship).toHaveBeenCalledTimes(1);
        expect(removeRelationship).toHaveBeenCalledWith('rel-1');
        expect(deleteElements).toHaveBeenCalledWith({
            edges: [{ id: 'rel-1' }],
        });
    });

    it('does not render a badge or comment count', () => {
        renderHeader();

        expect(screen.queryByText(/\d+/)).not.toBeInTheDocument();
        expect(screen.queryByTestId(/badge|count/i)).not.toBeInTheDocument();
    });
});

describe('RelationshipListItemHeader conversation indicator', () => {
    beforeEach(() => {
        chartDBState.readonly = false;
        conversationsState.isAvailable = true;
        remoteEditorsState.editors = [];
    });

    it('renders ConversationIndicator when conversations are available', () => {
        renderHeader();

        const indicator = screen.getByTestId('conversation-indicator');
        expect(indicator).toHaveAttribute('data-target-type', 'relationship');
        expect(indicator).toHaveAttribute('data-target-id', 'rel-1');
        expect(indicator).toHaveAttribute(
            'data-target-name',
            'orders_clients_fk'
        );
    });

    it('hides ConversationIndicator when conversations are unavailable', () => {
        conversationsState.isAvailable = false;
        renderHeader();

        expect(
            screen.queryByTestId('conversation-indicator')
        ).not.toBeInTheDocument();
    });

    it('passes the relationship target for another relationship id', () => {
        renderHeader({ ...relationship, id: 'rel-99' });

        expect(screen.getByTestId('conversation-indicator')).toHaveAttribute(
            'data-target-id',
            'rel-99'
        );
    });

    it('shows the indicator for readonly viewers when conversations are available', () => {
        chartDBState.readonly = true;
        renderHeader();

        expect(
            screen.getByTestId('conversation-indicator')
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: 'Delete' })
        ).not.toBeInTheDocument();
    });

    it('hides conversation controls for readonly viewers when conversations are unavailable', () => {
        chartDBState.readonly = true;
        conversationsState.isAvailable = false;
        renderHeader();

        expect(
            screen.queryByTestId('conversation-indicator')
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: 'Delete' })
        ).not.toBeInTheDocument();
    });

    it('coexists with the delete button when editable', () => {
        renderHeader();

        expect(
            screen.getByTestId('conversation-indicator')
        ).toBeInTheDocument();
        expect(deleteButton()).toBeInTheDocument();
    });

    it('coexists with EntityEditingBadge without overlapping controls', () => {
        remoteEditorsState.editors = [
            createRemoteEditor({ userId: 2, name: 'Alice' }),
        ];
        renderHeader();

        const indicator = screen.getByTestId('conversation-indicator');
        expect(indicator).toBeInTheDocument();
        expect(screen.getByTitle('Alice is editing')).toBeInTheDocument();
        expect(deleteButton()).toBeInTheDocument();

        const hoverActions = indicator.closest('.md\\:group-hover\\:flex');
        expect(hoverActions).not.toBeNull();
        expect(hoverActions).toHaveClass('flex', 'items-center');
        expect(hoverActions?.contains(deleteButton())).toBe(false);

        const row = hoverActions?.closest('.overflow-hidden');
        expect(row).not.toBeNull();
        expect(row).toHaveClass('overflow-hidden');
    });

    it('does not render raw relationship ids or badge count text', () => {
        renderHeader();

        expect(screen.queryByText('rel-1')).not.toBeInTheDocument();
        expect(screen.queryByTestId(/badge|count/i)).not.toBeInTheDocument();
    });

    it('keeps delete behavior while the indicator is visible', async () => {
        const user = userEvent.setup();
        renderHeader();

        await user.click(deleteButton());

        expect(removeRelationship).toHaveBeenCalledWith('rel-1');
        expect(deleteElements).toHaveBeenCalledWith({
            edges: [{ id: 'rel-1' }],
        });
    });
});

describe('RelationshipListItemHeader legacy actions', () => {
    beforeEach(() => {
        chartDBState.readonly = false;
        conversationsState.isAvailable = true;
        remoteEditorsState.editors = [];
        removeRelationship.mockClear();
        deleteElements.mockClear();
    });

    it('keeps relationship identity truncation and control shrink classes intact', () => {
        renderHeader();

        const identity = screen.getByText('orders_clients_fk');
        expect(identity).toHaveClass('truncate');
        expect(identity.parentElement).toHaveClass('min-w-0', 'flex-1');
        const indicator = screen.getByTestId('conversation-indicator');
        const actions = indicator.closest('.md\\:group-hover\\:flex');
        expect(actions).not.toBeNull();
        expect(actions).toHaveClass(
            'flex',
            'items-center',
            'md:hidden',
            'md:group-hover:flex'
        );
    });

    it('enters edit mode when the title is double-clicked', async () => {
        const user = userEvent.setup();
        renderHeader();

        await user.dblClick(screen.getByText('orders_clients_fk'));

        expect(
            screen.getByDisplayValue('orders_clients_fk')
        ).toBeInTheDocument();
    });

    it('keeps mobile-safe overflow and hover action classes intact', () => {
        renderHeader();

        const identity = screen.getByText('orders_clients_fk');
        const row = identity.closest('.overflow-hidden');
        expect(row).not.toBeNull();
        expect(row).toHaveClass(
            'group',
            'flex',
            'items-center',
            'justify-between',
            'overflow-hidden'
        );

        const hoverActions = row?.querySelector(
            '.md\\:hidden.md\\:group-focus-within\\:flex.md\\:group-hover\\:flex'
        );
        expect(hoverActions).not.toBeNull();
    });
});
