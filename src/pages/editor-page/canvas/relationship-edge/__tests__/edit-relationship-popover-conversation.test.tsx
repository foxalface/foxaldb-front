import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LayoutProvider } from '@/context/layout-context/layout-provider';
import type { DiagramConversation } from '@/lib/conversations/conversation-types';
import { EditRelationshipPopover } from '../edit-relationship-popover';
import { resetConversationTargetPendingStoreForTests } from '@/lib/conversations/conversation-target-pending';

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

vi.mock('@/hooks/use-breakpoint', () => ({
    useBreakpoint: () => ({ isMd: true }),
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        diagramId: '42',
        relationships: [{ id: 'rel-1', name: 'Users → Orders' }],
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

vi.mock('@/hooks/use-canvas', () => ({
    useCanvas: () => ({
        closeRelationshipPopover: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-layout', () => ({
    useLayout: () => ({
        selectSidebarSection: vi.fn(),
        openRelationshipFromSidebar: vi.fn(),
        openConversationDetail: vi.fn(),
    }),
}));

vi.mock('react-use', () => ({
    useClickAway: vi.fn(),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <LayoutProvider>{children}</LayoutProvider>
);

describe('EditRelationshipPopover conversation integration', () => {
    beforeEach(() => {
        resetConversationTargetPendingStoreForTests();
        conversationsState.isActive = true;
        conversationsState.activeConversations = [];
        diagramAccessState.can_edit = true;
        findOrCreateConversation.mockReset();
    });

    it('calls find-or-create with the relationship target when starting a conversation', async () => {
        const user = userEvent.setup();
        findOrCreateConversation.mockResolvedValue({
            id: 11,
            diagramId: 42,
            targetType: 'relationship',
            targetId: 'rel-1',
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
            <EditRelationshipPopover
                anchorPosition={{ x: 100, y: 200 }}
                relationshipId="rel-1"
                sourceCardinality="one"
                targetCardinality="many"
                onCardinalityChange={vi.fn()}
                onSwitch={vi.fn()}
                onDelete={vi.fn()}
            />,
            { wrapper }
        );

        await user.click(screen.getByTitle('Conversation'));

        await waitFor(() => {
            expect(findOrCreateConversation).toHaveBeenCalledWith({
                targetType: 'relationship',
                targetId: 'rel-1',
            });
        });
    });

    it('opens an existing relationship conversation without calling find-or-create', async () => {
        const user = userEvent.setup();
        conversationsState.activeConversations = [
            {
                id: 10,
                diagramId: 42,
                targetType: 'relationship',
                targetId: 'rel-1',
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
            <EditRelationshipPopover
                anchorPosition={{ x: 100, y: 200 }}
                relationshipId="rel-1"
                sourceCardinality="one"
                targetCardinality="many"
                onCardinalityChange={vi.fn()}
                onSwitch={vi.fn()}
                onDelete={vi.fn()}
            />,
            { wrapper }
        );

        await user.click(screen.getByTitle('Conversation'));

        expect(findOrCreateConversation).not.toHaveBeenCalled();
    });
});
