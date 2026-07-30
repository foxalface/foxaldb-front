import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LayoutProvider } from '@/context/layout-context/layout-provider';
import { TooltipProvider } from '@/components/tooltip/tooltip';
import { ConversationIndicator } from '@/components/conversation-indicator/conversation-indicator';
import type { DiagramConversation } from '@/lib/conversations/conversation-types';

const { findOrCreateConversation, conversationsState, diagramAccessState } =
    vi.hoisted(() => ({
        findOrCreateConversation: vi.fn(),
        conversationsState: {
            isActive: true,
            activeConversations: [] as DiagramConversation[],
        },
        diagramAccessState: {
            can_edit: true,
            role: 'editor' as const,
        },
    }));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: { name?: string }) => {
            if (key.endsWith('start_aria')) {
                return `Start conversation for ${options?.name ?? ''}`;
            }
            if (key.endsWith('open_aria')) {
                return `Open conversation for ${options?.name ?? ''}`;
            }
            if (key.endsWith('start_tooltip')) {
                return `Start conversation for ${options?.name ?? ''}`;
            }
            if (key.endsWith('open_tooltip')) {
                return `Open conversation for ${options?.name ?? ''}`;
            }
            if (key.endsWith('pending_tooltip')) {
                return `Starting conversation for ${options?.name ?? ''}`;
            }
            return key;
        },
    }),
}));

vi.mock('@/hooks/use-breakpoint', () => ({
    useBreakpoint: () => ({ isMd: true }),
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        diagramId: '42',
        tables: [
            { id: 't1', name: 'Users', fields: [{ id: 'f1', name: 'id' }] },
        ],
        relationships: [],
    }),
}));

vi.mock('@/hooks/use-conversations-availability', () => ({
    useConversationsAvailability: () => true,
}));

vi.mock('@/hooks/use-diagram-access', () => ({
    useDiagramAccess: () => ({ diagramAccess: diagramAccessState }),
}));

vi.mock('@/hooks/use-conversation-mutations', () => ({
    useConversationMutations: () => ({ findOrCreateConversation }),
}));

vi.mock('@/hooks/use-diagram-conversations', () => ({
    useDiagramConversations: () => ({
        activeConversations: conversationsState.activeConversations,
        archivedConversations: [],
        isActive: conversationsState.isActive,
    }),
}));

vi.mock('@/context/conversations-context/conversations-context', async () => {
    const actual = await vi.importActual(
        '@/context/conversations-context/conversations-context'
    );

    return {
        ...actual,
        ConversationsContext: React.createContext({
            ...(actual as { INACTIVE_CONVERSATIONS_CONTEXT: object })
                .INACTIVE_CONVERSATIONS_CONTEXT,
            get isActive() {
                return conversationsState.isActive;
            },
            get activeConversations() {
                return conversationsState.activeConversations;
            },
        }),
    };
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <LayoutProvider>
        <TooltipProvider>{children}</TooltipProvider>
    </LayoutProvider>
);

import { resetConversationTargetPendingStoreForTests } from '@/lib/conversations/conversation-target-pending';

describe('ConversationIndicator', () => {
    beforeEach(() => {
        resetConversationTargetPendingStoreForTests();
        conversationsState.isActive = true;
        conversationsState.activeConversations = [];
        diagramAccessState.can_edit = true;
        findOrCreateConversation.mockReset();
    });

    it('renders a start action when the user may create a conversation', () => {
        render(
            <ConversationIndicator
                target={{ targetType: 'table', targetId: 't1' }}
                targetName="Users"
            />,
            { wrapper }
        );

        expect(
            screen.getByTestId('conversation-indicator')
        ).toBeInTheDocument();
        expect(
            screen.getByLabelText('Start conversation for Users')
        ).toBeInTheDocument();
    });

    it('opens an existing conversation without calling find-or-create', async () => {
        const user = userEvent.setup();
        conversationsState.activeConversations = [
            {
                id: 10,
                diagramId: 42,
                targetType: 'table',
                targetId: 't1',
                status: 'active',
                archivedAt: null,
                messageCount: 1,
                lastMessageAt: null,
                lastMessagePreview: null,
                lastMessageAuthor: null,
                createdAt: '2026-01-01T10:00:00.000Z',
                updatedAt: '2026-01-01T10:00:00.000Z',
            },
        ];

        render(
            <ConversationIndicator
                target={{ targetType: 'table', targetId: 't1' }}
                targetName="Users"
            />,
            { wrapper }
        );

        await user.click(screen.getByTestId('conversation-indicator'));

        expect(findOrCreateConversation).not.toHaveBeenCalled();
    });

    it('calls find-or-create for a new conversation and opens the result', async () => {
        const user = userEvent.setup();
        findOrCreateConversation.mockResolvedValue({
            id: 11,
            diagramId: 42,
            targetType: 'table',
            targetId: 't1',
            status: 'active',
            archivedAt: null,
            messageCount: 0,
            lastMessageAt: null,
            lastMessagePreview: null,
            lastMessageAuthor: null,
            createdAt: '2026-01-01T10:00:00.000Z',
            updatedAt: '2026-01-01T10:00:00.000Z',
        });

        render(
            <ConversationIndicator
                target={{ targetType: 'table', targetId: 't1' }}
                targetName="Users"
            />,
            { wrapper }
        );

        await user.click(screen.getByTestId('conversation-indicator'));

        await waitFor(() => {
            expect(findOrCreateConversation).toHaveBeenCalledWith({
                targetType: 'table',
                targetId: 't1',
            });
        });
    });

    it('does not render when the user cannot create and no active conversation exists', () => {
        diagramAccessState.can_edit = false;

        const { container } = render(
            <ConversationIndicator
                target={{ targetType: 'table', targetId: 't1' }}
                targetName="Users"
            />,
            { wrapper }
        );

        expect(container).toBeEmptyDOMElement();
    });

    it('supports keyboard activation', async () => {
        const user = userEvent.setup();
        conversationsState.activeConversations = [
            {
                id: 12,
                diagramId: 42,
                targetType: 'field',
                targetId: 'f1',
                status: 'active',
                archivedAt: null,
                messageCount: 0,
                lastMessageAt: null,
                lastMessagePreview: null,
                lastMessageAuthor: null,
                createdAt: '2026-01-01T10:00:00.000Z',
                updatedAt: '2026-01-01T10:00:00.000Z',
            },
        ];

        render(
            <ConversationIndicator
                target={{ targetType: 'field', targetId: 'f1' }}
                targetName="id"
            />,
            { wrapper }
        );

        const button = screen.getByTestId('conversation-indicator');
        button.focus();
        await user.keyboard('{Enter}');

        expect(findOrCreateConversation).not.toHaveBeenCalled();
    });
});
