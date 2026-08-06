import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DBRelationship } from '@/lib/domain/db-relationship';
import type { RemoteEditingViewModel } from '@/lib/realtime/editing-utils';
import { en } from '@/i18n/locales/en';
import { RelationshipListItemHeader } from '../relationship-list-item-header';

const {
    chartDBState,
    conversationsState,
    conversationMenuState,
    remoteEditorsState,
    useTargetConversationMenuAction,
    removeRelationship,
    deleteElements,
} = vi.hoisted(() => ({
    chartDBState: {
        readonly: false,
    },
    conversationsState: {
        isAvailable: true,
    },
    conversationMenuState: {
        showConversationAction: true,
        conversationLabel: 'Open conversation',
        isConversationPending: false,
        openConversationAction: vi.fn(),
    },
    remoteEditorsState: {
        editors: [] as RemoteEditingViewModel[],
    },
    useTargetConversationMenuAction: vi.fn(() => ({
        showConversationAction:
            conversationsState.isAvailable &&
            conversationMenuState.showConversationAction,
        conversationLabel: conversationMenuState.conversationLabel,
        isConversationPending: conversationMenuState.isConversationPending,
        openConversationAction: conversationMenuState.openConversationAction,
    })),
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

vi.mock('@/hooks/use-target-conversation-menu-action', () => ({
    useTargetConversationMenuAction,
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

const menuTrigger = () => screen.getByRole('button', { name: 'Actions' });

const renderHeader = (rel: DBRelationship = relationship) =>
    render(<RelationshipListItemHeader relationship={rel} />);

const openMenu = async (rel: DBRelationship = relationship) => {
    const user = userEvent.setup();
    renderHeader(rel);
    await user.click(menuTrigger());
    return user;
};

describe('RelationshipListItemHeader conversation entry', () => {
    beforeEach(() => {
        chartDBState.readonly = false;
        conversationsState.isAvailable = true;
        conversationMenuState.showConversationAction = true;
        conversationMenuState.conversationLabel = 'Open conversation';
        conversationMenuState.isConversationPending = false;
        remoteEditorsState.editors = [];
        useTargetConversationMenuAction.mockClear();
        conversationMenuState.openConversationAction.mockClear();
        removeRelationship.mockClear();
        deleteElements.mockClear();
    });

    it('calls useTargetConversationMenuAction with the relationship target', () => {
        renderHeader();

        expect(useTargetConversationMenuAction).toHaveBeenCalledWith({
            targetType: 'relationship',
            targetId: 'rel-1',
        });
    });

    it('exposes a translated accessible name on the dropdown trigger', async () => {
        const user = userEvent.setup();
        renderHeader();
        const trigger = menuTrigger();
        await user.click(trigger);
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
        expect(
            screen.getByRole('menuitem', { name: 'Open conversation' })
        ).toBeInTheDocument();
        await user.keyboard('{Escape}');
    });

    it('shows Open conversation when conversations are available and editable', async () => {
        await openMenu();

        expect(
            screen.getByRole('menuitem', { name: /Open conversation/i })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('menuitem', { name: /^Delete$/i })
        ).toBeInTheDocument();
    });

    it('shows Open conversation for readonly viewers when conversations are available', async () => {
        chartDBState.readonly = true;
        await openMenu();

        expect(
            screen.getByRole('menuitem', { name: /Open conversation/i })
        ).toBeInTheDocument();
    });

    it('hides destructive delete for readonly viewers', async () => {
        chartDBState.readonly = true;
        await openMenu();

        expect(
            screen.queryByRole('menuitem', { name: /^Delete$/i })
        ).not.toBeInTheDocument();
    });

    it('hides Open conversation when the menu action is unavailable', async () => {
        conversationMenuState.showConversationAction = false;
        await openMenu();

        expect(
            screen.queryByRole('menuitem', { name: /Open conversation/i })
        ).not.toBeInTheDocument();
        expect(
            screen.getByRole('menuitem', { name: /^Delete$/i })
        ).toBeInTheDocument();
    });

    it('does not render an empty dropdown when no action is available', () => {
        chartDBState.readonly = true;
        conversationsState.isAvailable = false;
        conversationMenuState.showConversationAction = false;
        renderHeader();

        expect(
            screen.queryByRole('button', { name: 'Actions' })
        ).not.toBeInTheDocument();
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('calls openConversationAction once when the menu item is selected', async () => {
        const user = await openMenu();

        await user.click(
            screen.getByRole('menuitem', { name: /Open conversation/i })
        );

        expect(
            conversationMenuState.openConversationAction
        ).toHaveBeenCalledTimes(1);
    });

    it('keeps existing delete behavior unchanged', async () => {
        const user = await openMenu();

        await user.click(screen.getByRole('menuitem', { name: /^Delete$/i }));

        expect(removeRelationship).toHaveBeenCalledTimes(1);
        expect(removeRelationship).toHaveBeenCalledWith('rel-1');
        expect(deleteElements).toHaveBeenCalledWith({
            edges: [{ id: 'rel-1' }],
        });
    });

    it('does not render a badge or comment count', async () => {
        await openMenu();

        expect(screen.queryByText(/\d+/)).not.toBeInTheDocument();
        expect(screen.queryByTestId(/badge|count/i)).not.toBeInTheDocument();
    });

    it('exposes an accessible translated menu-item name', async () => {
        await openMenu();

        expect(
            screen.getByRole('menuitem', { name: 'Open conversation' })
        ).toBeInTheDocument();
    });

    it('viewer menu contains only Open conversation without separators', async () => {
        chartDBState.readonly = true;
        await openMenu();

        const menu = screen.getByRole('menu');
        const items = within(menu).getAllByRole('menuitem');
        expect(items).toHaveLength(1);
        expect(items[0]).toHaveAccessibleName('Open conversation');
        expect(within(menu).queryAllByRole('separator')).toHaveLength(0);
        expect(
            screen.queryByRole('menuitem', { name: /^Delete$/i })
        ).not.toBeInTheDocument();
    });

    it('editable menu separates conversation from delete', async () => {
        await openMenu();

        const menu = screen.getByRole('menu');
        const separators = within(menu).getAllByRole('separator');
        expect(separators.length).toBeGreaterThanOrEqual(1);

        const children = Array.from(menu.children);
        const roles = children.map((child) => child.getAttribute('role'));
        expect(roles[0]).not.toBe('separator');
        expect(roles[roles.length - 1]).not.toBe('separator');

        for (let i = 0; i < roles.length - 1; i += 1) {
            if (roles[i] === 'separator') {
                expect(roles[i + 1]).not.toBe('separator');
            }
        }

        const conversation = screen.getByRole('menuitem', {
            name: 'Open conversation',
        });
        const deleteItem = screen.getByRole('menuitem', { name: 'Delete' });
        expect(
            conversation.compareDocumentPosition(deleteItem) &
                Node.DOCUMENT_POSITION_FOLLOWING
        ).toBeTruthy();
    });
});

describe('RelationshipListItemHeader conversation indicator', () => {
    beforeEach(() => {
        chartDBState.readonly = false;
        conversationsState.isAvailable = true;
        conversationMenuState.showConversationAction = true;
        remoteEditorsState.editors = [];
        useTargetConversationMenuAction.mockClear();
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
        expect(menuTrigger()).toBeInTheDocument();
    });

    it('hides the actions menu for readonly viewers when conversations are unavailable', () => {
        chartDBState.readonly = true;
        conversationsState.isAvailable = false;
        renderHeader();

        expect(
            screen.queryByTestId('conversation-indicator')
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: 'Actions' })
        ).not.toBeInTheDocument();
    });

    it('coexists with the relationship actions trigger', () => {
        renderHeader();

        expect(
            screen.getByTestId('conversation-indicator')
        ).toBeInTheDocument();
        expect(menuTrigger()).toBeInTheDocument();
    });

    it('coexists with EntityEditingBadge without overlapping controls', () => {
        remoteEditorsState.editors = [
            createRemoteEditor({ userId: 2, name: 'Alice' }),
        ];
        renderHeader();

        const indicator = screen.getByTestId('conversation-indicator');
        expect(indicator).toBeInTheDocument();
        expect(screen.getByTitle('Alice is editing')).toBeInTheDocument();
        expect(menuTrigger()).toBeInTheDocument();

        const actions = indicator.closest('.md\\:group-hover\\:flex');
        expect(actions).not.toBeNull();
        expect(actions).toHaveClass('flex', 'items-center');

        const row = actions?.closest('.overflow-hidden');
        expect(row).not.toBeNull();
        expect(row).toHaveClass('overflow-hidden');
    });

    it('keeps Open conversation functional while the indicator is visible', async () => {
        const user = await openMenu();

        expect(
            screen.getByTestId('conversation-indicator')
        ).toBeInTheDocument();
        await user.click(
            screen.getByRole('menuitem', { name: /Open conversation/i })
        );

        expect(
            conversationMenuState.openConversationAction
        ).toHaveBeenCalledTimes(1);
    });

    it('does not render raw relationship ids or badge count text', () => {
        renderHeader();

        expect(screen.queryByText('rel-1')).not.toBeInTheDocument();
        expect(screen.queryByTestId(/badge|count/i)).not.toBeInTheDocument();
    });

    it('preserves readonly menu behavior while the indicator is visible', async () => {
        chartDBState.readonly = true;
        await openMenu();

        expect(
            screen.getByTestId('conversation-indicator')
        ).toBeInTheDocument();
        expect(
            screen.getByRole('menuitem', { name: 'Open conversation' })
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('menuitem', { name: /^Delete$/i })
        ).not.toBeInTheDocument();
    });

    it('preserves delete behavior while the indicator is visible', async () => {
        const user = await openMenu();

        await user.click(screen.getByRole('menuitem', { name: /^Delete$/i }));

        expect(removeRelationship).toHaveBeenCalledWith('rel-1');
        expect(deleteElements).toHaveBeenCalledWith({
            edges: [{ id: 'rel-1' }],
        });
    });

    it('preserves separator structure while the indicator is visible', async () => {
        await openMenu();

        const menu = screen.getByRole('menu');
        const separators = within(menu).getAllByRole('separator');
        expect(separators.length).toBeGreaterThanOrEqual(1);

        const conversation = screen.getByRole('menuitem', {
            name: 'Open conversation',
        });
        const deleteItem = screen.getByRole('menuitem', { name: 'Delete' });
        expect(
            conversation.compareDocumentPosition(deleteItem) &
                Node.DOCUMENT_POSITION_FOLLOWING
        ).toBeTruthy();
    });
});

describe('RelationshipListItemHeader legacy actions', () => {
    beforeEach(() => {
        chartDBState.readonly = false;
        conversationsState.isAvailable = true;
        conversationMenuState.showConversationAction = true;
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
