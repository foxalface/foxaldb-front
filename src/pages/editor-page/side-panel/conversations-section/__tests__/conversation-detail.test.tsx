import React from 'react';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { UseConversationMessagesResult } from '@/hooks/use-conversation-messages';
import type { UseDiagramConversationsResult } from '@/hooks/use-diagram-conversations';
import type { UseConversationMutationsResult } from '@/hooks/use-conversation-mutations';
import type {
    DiagramConversation,
    DiagramConversationMessage,
} from '@/lib/conversations/conversation-types';
import { en } from '@/i18n/locales/en';
import { aliceWonderAuthor, bobAuthor } from '@/test/user-identity-fixtures';

const buildActiveConversation = (
    overrides: Partial<DiagramConversation> = {}
): DiagramConversation => ({
    id: 10,
    diagramId: 42,
    targetType: 'table',
    targetId: 'table-1',
    status: 'active',
    archivedAt: null,
    messageCount: 2,
    lastMessageAt: '2026-01-02T12:00:00.000Z',
    lastMessageBody: 'Latest update',
    lastMessageAuthor: aliceWonderAuthor,
    unreadCount: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T12:00:00.000Z',
    ...overrides,
});

const buildArchivedConversation = (
    overrides: Partial<DiagramConversation> = {}
): DiagramConversation => ({
    ...buildActiveConversation({
        id: 20,
        status: 'archived',
        archivedAt: '2026-01-03T00:00:00.000Z',
    }),
    ...overrides,
});

const buildMessage = (
    overrides: Partial<DiagramConversationMessage> = {}
): DiagramConversationMessage => ({
    id: 100,
    conversationId: 10,
    body: 'Hello team',
    user: aliceWonderAuthor,
    createdAt: '2026-01-02T10:00:00.000Z',
    updatedAt: '2026-01-02T10:00:00.000Z',
    reactions: [],
    ...overrides,
});

const { conversationsState, mutationsState, messagesState, chartDbState } =
    vi.hoisted(() => ({
        conversationsState: {
            current: {
                activeConversations: [] as DiagramConversation[],
                archivedConversations: [] as DiagramConversation[],
                status: 'ready' as UseDiagramConversationsResult['status'],
                error: null,
                isActive: true as boolean,
                diagramId: '42',
                activeSummariesNextCursor: null as string | null,
                archivedSummariesNextCursor: null as string | null,
                reload: vi.fn(async () => undefined),
                loadArchivedSummaries: vi.fn(async () => undefined),
                loadMoreActiveSummaries: vi.fn(async () => undefined),
                loadMoreArchivedSummaries: vi.fn(async () => undefined),
                totalUnreadCount: 0,
            } satisfies UseDiagramConversationsResult,
        },
        mutationsState: {
            archiveConversation: vi.fn(
                async (id: number): Promise<DiagramConversation> =>
                    buildArchivedConversation({ id })
            ),
            reopenConversation: vi.fn(
                async (id: number): Promise<DiagramConversation> =>
                    buildActiveConversation({ id })
            ),
        },
        messagesState: {
            current: {
                messages: [] as DiagramConversationMessage[],
                status: 'idle' as UseConversationMessagesResult['status'],
                error: null,
                hasMore: false as boolean,
                loadMessages: vi.fn(async () => undefined),
                loadMoreMessages: vi.fn(async () => undefined),
            } satisfies UseConversationMessagesResult,
        },
        chartDbState: {
            diagramName: 'Billing',
            tables: [
                {
                    id: 'table-1',
                    name: 'Clients',
                    x: 0,
                    y: 0,
                    fields: [],
                    indexes: [],
                    color: '#fff',
                    isView: false,
                    createdAt: 0,
                },
            ],
            relationships: [],
        },
    }));

vi.mock('@/hooks/use-diagram-conversations', () => ({
    useDiagramConversations: () => conversationsState.current,
}));

vi.mock('@/hooks/use-conversation-mutations', () => ({
    useConversationMutations: (): UseConversationMutationsResult => ({
        findOrCreateConversation: vi.fn(),
        archiveConversation: mutationsState.archiveConversation,
        reopenConversation: mutationsState.reopenConversation,
        deleteConversation: vi.fn(),
        createMessage: vi.fn(),
        updateMessage: vi.fn(),
        deleteMessage: vi.fn(),
        addReaction: vi.fn(),
        removeReaction: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-conversation-messages', () => ({
    useConversationMessages: () => messagesState.current,
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => chartDbState,
}));

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => ({ user: { id: 1 } }),
}));

vi.mock('@/hooks/use-diagram-access', () => ({
    useDiagramAccess: () => ({
        diagramAccess: {
            role: 'editor',
            can_edit: true,
            can_manage_members: false,
        },
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: Record<string, unknown>) => {
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

            if (typeof current !== 'string') {
                return key;
            }

            return current.replace(/\{\{(\w+)\}\}/g, (_, token: string) => {
                const value = options?.[token];
                return value === undefined || value === null
                    ? ''
                    : String(value);
            });
        },
        i18n: { language: 'en' },
    }),
}));

import { ConversationsSection } from '../conversations-section';

const resetState = () => {
    conversationsState.current = {
        activeConversations: [],
        archivedConversations: [],
        status: 'ready',
        error: null,
        isActive: true,
        diagramId: '42',
        activeSummariesNextCursor: null,
        archivedSummariesNextCursor: null,
        reload: vi.fn(async () => undefined),
        loadArchivedSummaries: vi.fn(async () => undefined),
        loadMoreActiveSummaries: vi.fn(async () => undefined),
        loadMoreArchivedSummaries: vi.fn(async () => undefined),
        totalUnreadCount: 0,
    };
    messagesState.current = {
        messages: [],
        status: 'idle',
        error: null,
        hasMore: false,
        loadMessages: vi.fn(async () => undefined),
        loadMoreMessages: vi.fn(async () => undefined),
    };
};

describe('ConversationsSection detail view (M9)', () => {
    beforeEach(() => {
        resetState();
    });

    it('opens a conversation from the active list', async () => {
        const user = userEvent.setup();
        conversationsState.current.activeConversations = [
            buildActiveConversation(),
        ];
        messagesState.current.messages = [buildMessage()];
        messagesState.current.status = 'ready';

        render(<ConversationsSection />);

        await user.click(
            screen.getByRole('button', {
                name: 'Open conversation for Clients',
            })
        );

        expect(
            screen.getByTestId('conversation-detail-10')
        ).toBeInTheDocument();
        expect(screen.getByText('Hello team')).toBeInTheDocument();
        expect(screen.queryByText('Alice Wonder')).not.toBeInTheDocument();
        expect(
            screen.getByTestId('conversation-message-timestamp')
        ).toBeInTheDocument();
    });

    it('lazy-loads messages when a conversation is opened', async () => {
        const user = userEvent.setup();
        conversationsState.current.activeConversations = [
            buildActiveConversation(),
        ];
        messagesState.current.status = 'idle';

        render(<ConversationsSection />);

        await user.click(
            screen.getByRole('button', {
                name: 'Open conversation for Clients',
            })
        );

        await waitFor(() => {
            expect(messagesState.current.loadMessages).toHaveBeenCalledTimes(1);
        });
    });

    it('reuses cached messages when reopening a conversation', async () => {
        const user = userEvent.setup();
        conversationsState.current.activeConversations = [
            buildActiveConversation(),
        ];
        messagesState.current.messages = [buildMessage()];
        messagesState.current.status = 'ready';

        render(<ConversationsSection />);

        await user.click(
            screen.getByRole('button', {
                name: 'Open conversation for Clients',
            })
        );
        expect(screen.getByText('Hello team')).toBeInTheDocument();

        await user.click(
            screen.getByRole('button', { name: 'Back to conversation list' })
        );
        expect(screen.getByText('Clients')).toBeInTheDocument();

        await user.click(
            screen.getByRole('button', {
                name: 'Open conversation for Clients',
            })
        );

        expect(messagesState.current.loadMessages).not.toHaveBeenCalled();
        expect(screen.getByText('Hello team')).toBeInTheDocument();
    });

    it('loads older messages when pagination is available', async () => {
        const user = userEvent.setup();
        conversationsState.current.activeConversations = [
            buildActiveConversation(),
        ];
        messagesState.current.messages = [
            buildMessage({ id: 101, body: 'Older message' }),
            buildMessage({ id: 100, body: 'Newer message' }),
        ];
        messagesState.current.status = 'ready';
        messagesState.current.hasMore = true;

        render(<ConversationsSection />);

        await user.click(
            screen.getByRole('button', {
                name: 'Open conversation for Clients',
            })
        );

        await user.click(
            screen.getByRole('button', { name: 'Load older messages' })
        );

        await waitFor(() => {
            expect(
                messagesState.current.loadMoreMessages
            ).toHaveBeenCalledTimes(1);
        });
    });

    it('shows a loading state while messages are loading', async () => {
        const user = userEvent.setup();
        conversationsState.current.activeConversations = [
            buildActiveConversation(),
        ];
        messagesState.current.status = 'loading';

        render(<ConversationsSection />);

        await user.click(
            screen.getByRole('button', {
                name: 'Open conversation for Clients',
            })
        );

        expect(screen.getByText('Loading messages…')).toBeInTheDocument();
    });

    it('shows an empty state for conversations without messages', async () => {
        const user = userEvent.setup();
        conversationsState.current.activeConversations = [
            buildActiveConversation({ messageCount: 0 }),
        ];
        messagesState.current.status = 'ready';

        render(<ConversationsSection />);

        await user.click(
            screen.getByRole('button', {
                name: 'Open conversation for Clients',
            })
        );

        expect(screen.getByText('No messages yet')).toBeInTheDocument();
    });

    it('shows an error state with retry for message loading failures', async () => {
        const user = userEvent.setup();
        conversationsState.current.activeConversations = [
            buildActiveConversation(),
        ];
        messagesState.current.status = 'error';

        render(<ConversationsSection />);

        await user.click(
            screen.getByRole('button', {
                name: 'Open conversation for Clients',
            })
        );

        expect(screen.getByText('Could not load messages')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Retry' }));

        await waitFor(() => {
            expect(messagesState.current.loadMessages).toHaveBeenCalledTimes(1);
        });
    });

    it('updates the detail view when realtime message state changes', async () => {
        const user = userEvent.setup();
        conversationsState.current.activeConversations = [
            buildActiveConversation(),
        ];
        messagesState.current.messages = [buildMessage()];
        messagesState.current.status = 'ready';

        const { rerender } = render(<ConversationsSection />);

        await user.click(
            screen.getByRole('button', {
                name: 'Open conversation for Clients',
            })
        );

        messagesState.current = {
            ...messagesState.current,
            messages: [
                buildMessage(),
                buildMessage({
                    id: 102,
                    body: 'Realtime reply',
                    user: bobAuthor,
                    createdAt: '2026-01-02T11:00:00.000Z',
                    updatedAt: '2026-01-02T11:00:00.000Z',
                }),
            ],
        };

        rerender(<ConversationsSection />);

        expect(screen.getByText('Realtime reply')).toBeInTheDocument();
        expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument();
        expect(
            screen.getByTestId('conversation-message-avatar-trigger')
        ).toHaveAttribute('aria-label', 'Bob Smith');
    });

    it('shows a read-only banner for archived conversations', async () => {
        const user = userEvent.setup();
        conversationsState.current.archivedConversations = [
            buildArchivedConversation(),
        ];
        messagesState.current.messages = [buildMessage({ conversationId: 20 })];
        messagesState.current.status = 'ready';

        render(<ConversationsSection />);
        await user.click(screen.getByRole('tab', { name: 'Archived' }));

        await user.click(
            screen.getByRole('button', {
                name: 'Open conversation for Clients',
            })
        );

        expect(
            screen.getByTestId('conversation-archive-banner')
        ).toBeInTheDocument();
        expect(screen.getByText('Archived conversation')).toBeInTheDocument();
        expect(
            screen.getByText(
                'This conversation is read-only. Messages cannot be added, edited, or deleted.'
            )
        ).toBeInTheDocument();
    });

    it('navigates back to the conversation list', async () => {
        const user = userEvent.setup();
        conversationsState.current.activeConversations = [
            buildActiveConversation(),
        ];
        messagesState.current.messages = [buildMessage()];
        messagesState.current.status = 'ready';

        render(<ConversationsSection />);

        await user.click(
            screen.getByRole('button', {
                name: 'Open conversation for Clients',
            })
        );
        expect(
            screen.getByTestId('conversation-detail-10')
        ).toBeInTheDocument();

        await user.click(
            screen.getByRole('button', { name: 'Back to conversation list' })
        );

        expect(screen.getByRole('tab', { name: 'Active' })).toBeInTheDocument();
        expect(
            screen.queryByTestId('conversation-detail-10')
        ).not.toBeInTheDocument();
    });

    it('renders edited state when message timestamps differ', async () => {
        const user = userEvent.setup();
        conversationsState.current.activeConversations = [
            buildActiveConversation(),
        ];
        messagesState.current.messages = [
            buildMessage({
                updatedAt: '2026-01-02T11:00:00.000Z',
            }),
        ];
        messagesState.current.status = 'ready';

        render(<ConversationsSection />);

        await user.click(
            screen.getByRole('button', {
                name: 'Open conversation for Clients',
            })
        );

        expect(screen.getByText('(edited)')).toBeInTheDocument();
    });

    it('does not import the conversations API client in detail UI files', () => {
        const testDir = dirname(fileURLToPath(import.meta.url));
        const sectionDir = join(testDir, '..');
        const files = [
            'conversation-detail.tsx',
            'conversation-detail-header.tsx',
            'conversation-message-list.tsx',
            'conversation-message-item.tsx',
            'conversation-message-composer.tsx',
            'conversation-message-edit-form.tsx',
            'conversation-message-delete-dialog.tsx',
            'conversation-archive-banner.tsx',
            'use-conversation-detail.ts',
            'use-conversation-message-composer-session.ts',
            'use-conversation-message-edit-session.ts',
            'use-conversation-message-delete-session.ts',
            'use-conversation-panel-navigation.ts',
        ];

        for (const file of files) {
            const source = readFileSync(join(sectionDir, file), 'utf8');
            expect(source).not.toContain('@/lib/api/diagram-conversations');
            expect(source).not.toContain(
                'subscribeToDiagramConversationEvents'
            );
            expect(source).not.toContain('useRealtime');
        }
    });
});
