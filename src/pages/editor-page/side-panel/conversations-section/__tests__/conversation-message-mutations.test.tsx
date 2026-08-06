import React from 'react';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
    act,
    fireEvent,
    render,
    screen,
    waitFor,
    within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api/client';
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

const deferred = <T,>() => {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
};

const {
    conversationsState,
    mutationsState,
    messagesState,
    chartDbState,
    authState,
    diagramAccessState,
} = vi.hoisted(() => ({
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
        createMessage: vi.fn(
            async (): Promise<DiagramConversationMessage> =>
                buildMessage({ id: 200, body: 'New message' })
        ),
        updateMessage: vi.fn(
            async (): Promise<DiagramConversationMessage> =>
                buildMessage({ body: 'Updated body' })
        ),
        deleteMessage: vi.fn(async () => undefined),
        addReaction: vi.fn(async () => undefined),
        removeReaction: vi.fn(async () => undefined),
        archiveConversation: vi.fn(),
        reopenConversation: vi.fn(),
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
    authState: {
        user: {
            id: 1,
            first_name: 'Alice',
            last_name: 'Anderson',
            full_name: 'Alice Anderson',
            email: 'a@example.com',
        },
    },
    diagramAccessState: {
        diagramAccess: {
            role: 'editor' as 'editor' | 'owner' | 'viewer' | null,
            can_edit: true,
            can_manage_members: false,
        },
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
        createMessage: mutationsState.createMessage,
        updateMessage: mutationsState.updateMessage,
        deleteMessage: mutationsState.deleteMessage,
        addReaction: mutationsState.addReaction,
        removeReaction: mutationsState.removeReaction,
    }),
}));

vi.mock('@/hooks/use-conversation-messages', () => ({
    useConversationMessages: () => messagesState.current,
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => chartDbState,
}));

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => authState,
}));

vi.mock('@/hooks/use-diagram-access', () => ({
    useDiagramAccess: () => diagramAccessState,
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
    authState.user = {
        id: 1,
        first_name: 'Alice',
        last_name: 'Anderson',
        full_name: 'Alice Anderson',
        email: 'a@example.com',
    };
    diagramAccessState.diagramAccess = {
        role: 'editor',
        can_edit: true,
        can_manage_members: false,
    };
    mutationsState.createMessage = vi.fn(
        async (): Promise<DiagramConversationMessage> =>
            buildMessage({ id: 200, body: 'New message' })
    );
    mutationsState.updateMessage = vi.fn(
        async (): Promise<DiagramConversationMessage> =>
            buildMessage({ body: 'Updated body' })
    );
    mutationsState.deleteMessage = vi.fn(async () => undefined);
};

const openActiveConversation = async (
    user: ReturnType<typeof userEvent.setup>,
    options?: { messages?: DiagramConversationMessage[] }
) => {
    conversationsState.current.activeConversations = [
        buildActiveConversation(),
    ];
    messagesState.current.messages = options?.messages ?? [buildMessage()];
    messagesState.current.status = 'ready';

    render(<ConversationsSection />);

    await user.click(
        screen.getByRole('button', {
            name: 'Open conversation for Clients',
        })
    );
};

describe('Conversation message mutations (M10)', () => {
    beforeEach(() => {
        resetState();
    });

    describe('composer', () => {
        it('shows composer for active conversations with edit access', async () => {
            const user = userEvent.setup();
            await openActiveConversation(user);

            expect(
                screen.getByTestId('conversation-message-composer')
            ).toBeInTheDocument();
            expect(
                screen.getByRole('textbox', { name: 'Message' })
            ).toBeInTheDocument();
            expect(
                screen.getByText(
                    'Press Enter to send. Shift+Enter adds a new line.'
                )
            ).toBeInTheDocument();
        });

        it('hides composer for archived conversations', async () => {
            const user = userEvent.setup();
            conversationsState.current.archivedConversations = [
                buildArchivedConversation(),
            ];
            messagesState.current.messages = [
                buildMessage({ conversationId: 20 }),
            ];
            messagesState.current.status = 'ready';

            render(<ConversationsSection />);
            await user.click(screen.getByRole('tab', { name: 'Archived' }));
            await user.click(
                screen.getByRole('button', {
                    name: 'Open conversation for Clients',
                })
            );

            expect(
                screen.queryByTestId('conversation-message-composer')
            ).not.toBeInTheDocument();
        });

        it('rejects empty message submission', async () => {
            const user = userEvent.setup();
            await openActiveConversation(user);

            expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();

            fireEvent.submit(
                screen.getByTestId('conversation-message-composer')
            );

            expect(
                screen.getByText('Enter a message to send.')
            ).toBeInTheDocument();
            expect(mutationsState.createMessage).not.toHaveBeenCalled();
        });

        it('rejects whitespace-only message submission', async () => {
            const user = userEvent.setup();
            await openActiveConversation(user);

            const textarea = screen.getByRole('textbox', { name: 'Message' });
            await user.type(textarea, '   \n\t  ');

            expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
            expect(mutationsState.createMessage).not.toHaveBeenCalled();
        });

        it('creates a valid message through the mutation hook', async () => {
            const user = userEvent.setup();
            await openActiveConversation(user);

            await user.type(
                screen.getByRole('textbox', { name: 'Message' }),
                '  Team update  '
            );
            await user.click(screen.getByRole('button', { name: 'Send' }));

            await waitFor(() => {
                expect(mutationsState.createMessage).toHaveBeenCalledWith(10, {
                    body: 'Team update',
                });
            });
        });

        it('disables duplicate send while pending', async () => {
            const user = userEvent.setup();
            const pending = deferred<DiagramConversationMessage>();
            mutationsState.createMessage = vi.fn(() => pending.promise);

            await openActiveConversation(user);

            const textarea = screen.getByRole('textbox', { name: 'Message' });
            await user.type(textarea, 'Pending message');
            await user.click(screen.getByRole('button', { name: 'Send' }));

            expect(
                screen.getByRole('button', { name: 'Sending…' })
            ).toBeDisabled();

            await act(async () => {
                pending.resolve(buildMessage({ body: 'Pending message' }));
            });
        });

        it('clears draft after successful creation', async () => {
            const user = userEvent.setup();
            await openActiveConversation(user);

            const textarea = screen.getByRole('textbox', { name: 'Message' });
            await user.type(textarea, 'Saved message');
            await user.click(screen.getByRole('button', { name: 'Send' }));

            await waitFor(() => {
                expect(textarea).toHaveValue('');
            });
        });

        it('preserves draft after failed creation', async () => {
            const user = userEvent.setup();
            mutationsState.createMessage = vi.fn(async () => {
                throw new ApiError('Forbidden', 403, {});
            });

            await openActiveConversation(user);

            const textarea = screen.getByRole('textbox', { name: 'Message' });
            await user.type(textarea, 'Keep this draft');
            await user.click(screen.getByRole('button', { name: 'Send' }));

            await waitFor(() => {
                expect(textarea).toHaveValue('Keep this draft');
            });
            expect(
                screen.getByText(
                    'You do not have permission to change this message.'
                )
            ).toBeInTheDocument();
        });

        it('enforces maximum length', async () => {
            const user = userEvent.setup();
            await openActiveConversation(user);

            const textarea = screen.getByRole('textbox', { name: 'Message' });
            fireEvent.change(textarea, {
                target: { value: 'x'.repeat(2001) },
            });

            expect(
                screen.getByText('Messages cannot exceed 2000 characters.')
            ).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
        });

        it('submits on Enter and documents shortcut in UI', async () => {
            const user = userEvent.setup();
            await openActiveConversation(user);

            const textarea = screen.getByRole('textbox', { name: 'Message' });
            await user.type(textarea, 'Enter send');
            await user.keyboard('{Enter}');

            await waitFor(() => {
                expect(mutationsState.createMessage).toHaveBeenCalledWith(10, {
                    body: 'Enter send',
                });
            });
        });
    });

    describe('editing', () => {
        it('shows edit action only for permitted messages', async () => {
            const user = userEvent.setup();
            authState.user = {
                id: aliceWonderAuthor.id,
                first_name: aliceWonderAuthor.firstName,
                last_name: aliceWonderAuthor.lastName,
                full_name: aliceWonderAuthor.fullName,
                email: 'alice@example.com',
            };
            messagesState.current.messages = [
                buildMessage({ id: 100, user: aliceWonderAuthor }),
                buildMessage({
                    id: 101,
                    body: 'Bob message',
                    user: bobAuthor,
                }),
            ];
            await openActiveConversation(user, {
                messages: messagesState.current.messages,
            });

            const actionButtons = screen.getAllByRole('button', {
                name: 'Message actions',
            });
            expect(actionButtons).toHaveLength(1);
        });

        it('enters edit mode and cancels', async () => {
            const user = userEvent.setup();
            await openActiveConversation(user);

            await user.click(
                screen.getByRole('button', { name: 'Message actions' })
            );
            await user.click(screen.getByRole('menuitem', { name: 'Edit' }));

            expect(
                screen.getByTestId('conversation-message-edit-form-100')
            ).toBeInTheDocument();

            await user.click(screen.getByRole('button', { name: 'Cancel' }));

            expect(
                screen.queryByTestId('conversation-message-edit-form-100')
            ).not.toBeInTheDocument();
            expect(screen.getByText('Hello team')).toBeInTheDocument();
        });

        it('updates message on successful save', async () => {
            const user = userEvent.setup();
            await openActiveConversation(user);

            await user.click(
                screen.getByRole('button', { name: 'Message actions' })
            );
            await user.click(screen.getByRole('menuitem', { name: 'Edit' }));

            const textarea = within(
                screen.getByTestId('conversation-message-edit-form-100')
            ).getByRole('textbox', { name: 'Message' });
            await user.clear(textarea);
            await user.type(textarea, 'Updated body');
            await user.click(screen.getByRole('button', { name: 'Save' }));

            await waitFor(() => {
                expect(mutationsState.updateMessage).toHaveBeenCalledWith(
                    10,
                    100,
                    { body: 'Updated body' }
                );
            });
        });

        it('preserves edit draft on failed update', async () => {
            const user = userEvent.setup();
            mutationsState.updateMessage = vi.fn(async () => {
                throw new ApiError('Server error', 500, {});
            });

            await openActiveConversation(user);

            await user.click(
                screen.getByRole('button', { name: 'Message actions' })
            );
            await user.click(screen.getByRole('menuitem', { name: 'Edit' }));

            const textarea = within(
                screen.getByTestId('conversation-message-edit-form-100')
            ).getByRole('textbox', { name: 'Message' });
            await user.clear(textarea);
            await user.type(textarea, 'Failed draft');
            await user.click(screen.getByRole('button', { name: 'Save' }));

            await waitFor(() => {
                expect(textarea).toHaveValue('Failed draft');
            });
            expect(
                screen.getByText(
                    'Could not update the message. Please try again.'
                )
            ).toBeInTheDocument();
        });

        it('rejects empty update', async () => {
            const user = userEvent.setup();
            await openActiveConversation(user);

            await user.click(
                screen.getByRole('button', { name: 'Message actions' })
            );
            await user.click(screen.getByRole('menuitem', { name: 'Edit' }));

            const form = screen.getByTestId(
                'conversation-message-edit-form-100'
            );
            const textarea = within(form).getByRole('textbox', {
                name: 'Message',
            });
            await user.clear(textarea);

            expect(
                within(form).getByRole('button', { name: 'Save' })
            ).toBeDisabled();

            fireEvent.submit(form);

            expect(
                screen.getByText('Enter a message to save.')
            ).toBeInTheDocument();
            expect(mutationsState.updateMessage).not.toHaveBeenCalled();
        });

        it('allows only one editor open at a time', async () => {
            const user = userEvent.setup();
            authState.user = {
                id: aliceWonderAuthor.id,
                first_name: aliceWonderAuthor.firstName,
                last_name: aliceWonderAuthor.lastName,
                full_name: aliceWonderAuthor.fullName,
                email: 'alice@example.com',
            };
            await openActiveConversation(user, {
                messages: [
                    buildMessage({ id: 100 }),
                    buildMessage({
                        id: 101,
                        body: 'Second',
                        user: aliceWonderAuthor,
                    }),
                ],
            });

            const actionButtons = screen.getAllByRole('button', {
                name: 'Message actions',
            });
            expect(actionButtons).toHaveLength(2);

            await user.click(
                within(
                    screen.getByTestId('conversation-message-100')
                ).getByRole('button', { name: 'Message actions' })
            );
            await user.click(screen.getByRole('menuitem', { name: 'Edit' }));
            expect(
                screen.getByTestId('conversation-message-edit-form-100')
            ).toBeInTheDocument();

            await user.click(
                within(
                    screen.getByTestId('conversation-message-101')
                ).getByRole('button', { name: 'Message actions' })
            );
            await user.click(screen.getByRole('menuitem', { name: 'Edit' }));

            expect(
                screen.queryByTestId('conversation-message-edit-form-100')
            ).not.toBeInTheDocument();
            expect(
                screen.getByTestId('conversation-message-edit-form-101')
            ).toBeInTheDocument();
        });

        it('hides edit actions in archived conversations', async () => {
            const user = userEvent.setup();
            conversationsState.current.archivedConversations = [
                buildArchivedConversation(),
            ];
            messagesState.current.messages = [
                buildMessage({ conversationId: 20 }),
            ];
            messagesState.current.status = 'ready';

            render(<ConversationsSection />);
            await user.click(screen.getByRole('tab', { name: 'Archived' }));
            await user.click(
                screen.getByRole('button', {
                    name: 'Open conversation for Clients',
                })
            );

            expect(
                screen.queryByRole('button', { name: 'Message actions' })
            ).not.toBeInTheDocument();
        });
    });

    describe('deletion', () => {
        it('shows delete action only for permitted messages', async () => {
            const user = userEvent.setup();
            diagramAccessState.diagramAccess = {
                role: 'owner',
                can_edit: true,
                can_manage_members: true,
            };
            messagesState.current.messages = [
                buildMessage({ id: 100, user: bobAuthor }),
            ];
            await openActiveConversation(user);

            await user.click(
                screen.getByRole('button', { name: 'Message actions' })
            );

            expect(
                screen.getByRole('menuitem', { name: 'Delete' })
            ).toBeInTheDocument();
        });

        it('requires confirmation before deletion', async () => {
            const user = userEvent.setup();
            await openActiveConversation(user);

            await user.click(
                screen.getByRole('button', { name: 'Message actions' })
            );
            await user.click(screen.getByRole('menuitem', { name: 'Delete' }));

            expect(screen.getByText('Delete message')).toBeInTheDocument();
            expect(mutationsState.deleteMessage).not.toHaveBeenCalled();
        });

        it('cancels deletion from the dialog', async () => {
            const user = userEvent.setup();
            await openActiveConversation(user);

            await user.click(
                screen.getByRole('button', { name: 'Message actions' })
            );
            await user.click(screen.getByRole('menuitem', { name: 'Delete' }));
            await user.click(screen.getByRole('button', { name: 'Cancel' }));

            expect(
                screen.queryByText('Delete message')
            ).not.toBeInTheDocument();
            expect(mutationsState.deleteMessage).not.toHaveBeenCalled();
            expect(screen.getByText('Hello team')).toBeInTheDocument();
        });

        it('deletes message after confirmation', async () => {
            const user = userEvent.setup();
            await openActiveConversation(user);

            await user.click(
                screen.getByRole('button', { name: 'Message actions' })
            );
            await user.click(screen.getByRole('menuitem', { name: 'Delete' }));
            await user.click(screen.getByRole('button', { name: 'Delete' }));

            await waitFor(() => {
                expect(mutationsState.deleteMessage).toHaveBeenCalledWith(
                    10,
                    100
                );
            });
        });

        it('keeps message visible and shows error on failed deletion', async () => {
            const user = userEvent.setup();
            mutationsState.deleteMessage = vi.fn(async () => {
                throw new ApiError('Forbidden', 403, {});
            });

            await openActiveConversation(user);

            await user.click(
                screen.getByRole('button', { name: 'Message actions' })
            );
            await user.click(screen.getByRole('menuitem', { name: 'Delete' }));
            await user.click(screen.getByRole('button', { name: 'Delete' }));

            await waitFor(() => {
                expect(
                    screen.getByText(
                        'You do not have permission to change this message.'
                    )
                ).toBeInTheDocument();
            });
            expect(screen.getByText('Hello team')).toBeInTheDocument();
        });

        it('prevents repeated deletion while pending', async () => {
            const user = userEvent.setup();
            const pending = deferred<void>();
            mutationsState.deleteMessage = vi.fn(() => pending.promise);

            await openActiveConversation(user);

            await user.click(
                screen.getByRole('button', { name: 'Message actions' })
            );
            await user.click(screen.getByRole('menuitem', { name: 'Delete' }));
            await user.click(screen.getByRole('button', { name: 'Delete' }));

            expect(
                screen.getByRole('button', { name: 'Deleting…' })
            ).toBeDisabled();

            await act(async () => {
                pending.resolve();
            });
        });

        it('hides delete actions in archived conversations', async () => {
            const user = userEvent.setup();
            conversationsState.current.archivedConversations = [
                buildArchivedConversation(),
            ];
            messagesState.current.messages = [
                buildMessage({ conversationId: 20 }),
            ];
            messagesState.current.status = 'ready';

            render(<ConversationsSection />);
            await user.click(screen.getByRole('tab', { name: 'Archived' }));
            await user.click(
                screen.getByRole('button', {
                    name: 'Open conversation for Clients',
                })
            );

            expect(
                screen.queryByRole('button', { name: 'Message actions' })
            ).not.toBeInTheDocument();
        });
    });

    describe('architecture', () => {
        it('does not import the conversations API client in mutation UI files', () => {
            const testDir = dirname(fileURLToPath(import.meta.url));
            const sectionDir = join(testDir, '..');
            const files = [
                'conversation-detail.tsx',
                'conversation-message-composer.tsx',
                'conversation-message-edit-form.tsx',
                'conversation-message-delete-dialog.tsx',
                'conversation-message-item.tsx',
                'use-conversation-message-composer-session.ts',
                'use-conversation-message-edit-session.ts',
                'use-conversation-message-delete-session.ts',
            ];

            for (const file of files) {
                const source = readFileSync(join(sectionDir, file), 'utf8');
                expect(source).not.toContain('@/lib/api/diagram-conversations');
            }
        });

        it('does not add UI draft state to ConversationsProvider', () => {
            const providerPath = join(
                dirname(fileURLToPath(import.meta.url)),
                '../../../../../context/conversations-context/conversations-provider.tsx'
            );
            const source = readFileSync(providerPath, 'utf8');
            expect(source).not.toContain('editingMessageId');
            expect(source).not.toContain('composerDraft');
        });
    });
});
