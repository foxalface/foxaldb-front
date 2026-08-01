import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DBRelationship } from '@/lib/domain/db-relationship';
import { EditRelationshipPopover } from '../edit-relationship-popover';

const {
    chartDBState,
    conversationsState,
    conversationHookState,
    closeRelationshipPopover,
    openConversation,
    onCardinalityChange,
    onSwitch,
    onDelete,
    useOpenTargetConversationMock,
} = vi.hoisted(() => {
    const openConversation = vi.fn();
    const closeRelationshipPopover = vi.fn();
    const onCardinalityChange = vi.fn();
    const onSwitch = vi.fn();
    const onDelete = vi.fn();
    const useOpenTargetConversationMock = vi.fn();

    return {
        chartDBState: {
            relationships: [
                {
                    id: 'rel-1',
                    name: 'Users → Orders',
                },
            ] as Pick<DBRelationship, 'id' | 'name'>[],
        },
        conversationsState: {
            isAvailable: true,
        },
        conversationHookState: {
            hasActiveConversation: false,
            canCreate: true,
            isPending: false,
            openConversation,
        },
        closeRelationshipPopover,
        openConversation,
        onCardinalityChange,
        onSwitch,
        onDelete,
        useOpenTargetConversationMock,
    };
});

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: { name?: string }) => {
            if (key.endsWith('action_tooltip')) {
                return 'Conversation';
            }
            if (key.endsWith('open_aria')) {
                return `Open conversation for ${options?.name ?? ''}`;
            }
            if (key.endsWith('start_aria')) {
                return `Start conversation for ${options?.name ?? ''}`;
            }
            return key;
        },
    }),
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        relationships: chartDBState.relationships,
    }),
}));

vi.mock('@/hooks/use-conversations-availability', () => ({
    useConversationsAvailability: () => conversationsState.isAvailable,
}));

vi.mock('@/hooks/use-open-target-conversation', () => ({
    useOpenTargetConversation: (target: unknown) => {
        useOpenTargetConversationMock(target);
        return conversationHookState;
    },
}));

vi.mock('@/hooks/use-canvas', () => ({
    useCanvas: () => ({
        closeRelationshipPopover,
    }),
}));

vi.mock('@/hooks/use-layout', () => ({
    useLayout: () => ({
        selectSidebarSection: vi.fn(),
        openRelationshipFromSidebar: vi.fn(),
    }),
}));

vi.mock('react-use', () => ({
    useClickAway: vi.fn(),
}));

const renderPopover = () =>
    render(
        <EditRelationshipPopover
            anchorPosition={{ x: 100, y: 200 }}
            relationshipId="rel-1"
            sourceCardinality="one"
            targetCardinality="many"
            onCardinalityChange={onCardinalityChange}
            onSwitch={onSwitch}
            onDelete={onDelete}
        />
    );

const getActionButtons = () => {
    const row = document.querySelector('.flex.items-center.gap-1');
    expect(row).not.toBeNull();
    return Array.from(row!.querySelectorAll('button'));
};

const conversationButton = () => screen.getByTitle('Conversation');

describe('EditRelationshipPopover conversation action', () => {
    afterEach(() => {
        cleanup();
    });

    beforeEach(() => {
        conversationsState.isAvailable = true;
        conversationHookState.hasActiveConversation = false;
        conversationHookState.canCreate = true;
        conversationHookState.isPending = false;
        openConversation.mockClear();
        onCardinalityChange.mockClear();
        onSwitch.mockClear();
        onDelete.mockClear();
        closeRelationshipPopover.mockClear();
        useOpenTargetConversationMock.mockClear();
    });

    it('renders the Conversation action in the relationship action list', () => {
        renderPopover();

        expect(conversationButton()).toBeInTheDocument();
        expect(conversationButton().querySelector('svg')).not.toBeNull();
    });

    it('places the Conversation action before the Delete action', () => {
        renderPopover();

        const buttons = getActionButtons();
        const conversationIndex = buttons.findIndex(
            (button) => button.title === 'Conversation'
        );
        const deleteIndex = buttons.findIndex(
            (button) => button.title === 'Delete relationship'
        );

        expect(conversationIndex).toBeGreaterThan(-1);
        expect(deleteIndex).toBeGreaterThan(conversationIndex);
    });

    it('uses the same ghost action-button structure as neighboring actions', () => {
        renderPopover();

        const conversation = conversationButton();
        const sidebarButton = screen.getByTitle('Open in sidebar');

        expect(conversation.className).toContain('size-7');
        expect(conversation.className).toContain('p-0');
        expect(sidebarButton.className).toContain('size-7');
        expect(sidebarButton.className).toContain('p-0');
    });

    it('uses the native title tooltip with short text', () => {
        renderPopover();

        expect(conversationButton()).toHaveAttribute('title', 'Conversation');
    });

    it('exposes a descriptive accessible label for starting a conversation', () => {
        renderPopover();

        expect(conversationButton()).toHaveAccessibleName(
            'Start conversation for Users → Orders'
        );
    });

    it('exposes an open accessible label when a conversation already exists', () => {
        conversationHookState.hasActiveConversation = true;
        renderPopover();

        expect(conversationButton()).toHaveAccessibleName(
            'Open conversation for Users → Orders'
        );
    });

    it('wires useOpenTargetConversation to the relationship target', () => {
        renderPopover();

        expect(useOpenTargetConversationMock).toHaveBeenCalledWith({
            targetType: 'relationship',
            targetId: 'rel-1',
        });
    });

    it('calls openConversation for the relationship target', async () => {
        const user = userEvent.setup();
        renderPopover();

        await user.click(conversationButton());

        expect(openConversation).toHaveBeenCalledTimes(1);
    });

    it('disables duplicate activation while pending', () => {
        conversationHookState.isPending = true;
        renderPopover();

        expect(conversationButton()).toBeDisabled();
        expect(conversationButton()).toHaveAttribute('aria-busy', 'true');
    });

    it('hides the start action for read-only viewers without an active conversation', () => {
        conversationHookState.canCreate = false;
        conversationHookState.hasActiveConversation = false;
        renderPopover();

        expect(screen.queryByTitle('Conversation')).not.toBeInTheDocument();
    });

    it('keeps an existing conversation openable for read-only viewers', () => {
        conversationHookState.canCreate = false;
        conversationHookState.hasActiveConversation = true;
        renderPopover();

        expect(conversationButton()).toBeInTheDocument();
    });

    it('does not trigger reverse, delete, or cardinality handlers', async () => {
        const user = userEvent.setup();
        renderPopover();

        await user.click(conversationButton());

        expect(onSwitch).not.toHaveBeenCalled();
        expect(onDelete).not.toHaveBeenCalled();
        expect(onCardinalityChange).not.toHaveBeenCalled();
    });

    it('keeps the existing delete action unchanged', async () => {
        const user = userEvent.setup();
        renderPopover();

        await user.click(screen.getByTitle('Delete relationship'));

        expect(onDelete).toHaveBeenCalledTimes(1);
        expect(openConversation).not.toHaveBeenCalled();
    });
});
