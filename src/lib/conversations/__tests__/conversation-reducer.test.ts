import { describe, expect, it } from 'vitest';
import { aliceAuthor } from '@/test/user-identity-fixtures';
import {
    conversationsReducer,
    initialConversationsState,
    type ConversationsState,
} from '../conversation-reducer';
import {
    selectActiveConversations,
    selectArchivedConversations,
    selectConversationForTarget,
} from '../conversation-selectors';
import type { DiagramConversation } from '../conversation-types';

const conversation = (
    overrides: Partial<DiagramConversation> & Pick<DiagramConversation, 'id'>
): DiagramConversation => ({
    diagramId: 42,
    targetType: 'diagram',
    targetId: null,
    status: 'active',
    archivedAt: null,
    messageCount: 0,
    lastMessageAt: null,
    lastMessageBody: null,
    lastMessageAuthor: null,
    unreadCount: 0,
    createdAt: `2026-01-0${overrides.id}T10:00:00.000Z`,
    updatedAt: `2026-01-0${overrides.id}T11:00:00.000Z`,
    ...overrides,
});

const loadActiveSucceeded = (
    state: ConversationsState,
    conversations: DiagramConversation[],
    diagramId = '42',
    generation = 1
): ConversationsState =>
    conversationsReducer(
        conversationsReducer(state, {
            type: 'SUMMARIES_LOAD_STARTED',
            diagramId,
            generation,
        }),
        {
            type: 'SUMMARIES_LOAD_SUCCEEDED',
            diagramId,
            generation,
            conversations,
            status: 'active',
            nextCursor: null,
            append: false,
            totalUnreadCount: 0,
        }
    );

describe('conversationsReducer', () => {
    it('starts from an idle empty initial state', () => {
        const state = initialConversationsState();

        expect(state.summariesStatus).toBe('idle');
        expect(state.summariesById.size).toBe(0);
    });

    it('SUMMARIES_LOAD_SUCCEEDED stores active conversations', () => {
        const state = loadActiveSucceeded(initialConversationsState(), [
            conversation({ id: 2 }),
            conversation({ id: 1 }),
        ]);

        expect(state.summariesStatus).toBe('ready');
        expect(state.summariesById.size).toBe(2);
        expect(
            selectActiveConversations(state.summariesById).map((c) => c.id)
        ).toEqual([2, 1]);
    });

    it('CONVERSATION_UPSERTED updates an existing summary', () => {
        const state = conversationsReducer(
            loadActiveSucceeded(initialConversationsState(), [
                conversation({ id: 1, messageCount: 0 }),
            ]),
            {
                type: 'CONVERSATION_UPSERTED',
                conversation: conversation({
                    id: 1,
                    messageCount: 3,
                    lastMessageBody: 'Updated full body',
                }),
            }
        );

        expect(state.summariesById.get(1)?.messageCount).toBe(3);
        expect(state.summariesById.get(1)?.lastMessageBody).toBe(
            'Updated full body'
        );
    });

    it('CONVERSATION_REMOVED deletes summary and message slice', () => {
        const withMessages = conversationsReducer(
            loadActiveSucceeded(initialConversationsState(), [
                conversation({ id: 1 }),
            ]),
            {
                type: 'MESSAGES_LOAD_SUCCEEDED',
                conversationId: 1,
                generation: 1,
                messages: [
                    {
                        id: 5,
                        conversationId: 1,
                        body: 'hello',
                        user: aliceAuthor,
                        createdAt: '2026-01-01T10:00:00.000Z',
                        updatedAt: '2026-01-01T10:00:00.000Z',
                        reactions: [],
                    },
                ],
                nextCursor: null,
                append: false,
            }
        );

        const state = conversationsReducer(withMessages, {
            type: 'CONVERSATION_REMOVED',
            conversationId: 1,
        });

        expect(state.summariesById.has(1)).toBe(false);
        expect(state.messagesByConversationId.has(1)).toBe(false);
    });

    it('archived summaries replace only archived entries', () => {
        const activeState = loadActiveSucceeded(initialConversationsState(), [
            conversation({ id: 1, status: 'active' }),
        ]);

        const state = conversationsReducer(
            conversationsReducer(activeState, {
                type: 'SUMMARIES_LOAD_STARTED',
                diagramId: '42',
                generation: 2,
                append: true,
            }),
            {
                type: 'SUMMARIES_LOAD_SUCCEEDED',
                diagramId: '42',
                generation: 2,
                conversations: [
                    conversation({
                        id: 2,
                        status: 'archived',
                        archivedAt: '2026-02-01T00:00:00.000Z',
                    }),
                ],
                status: 'archived',
                nextCursor: null,
                append: false,
                totalUnreadCount: 0,
            }
        );

        expect(
            selectActiveConversations(state.summariesById).map((c) => c.id)
        ).toEqual([1]);
        expect(
            selectArchivedConversations(state.summariesById).map((c) => c.id)
        ).toEqual([2]);
    });

    it('selectConversationForTarget finds by target', () => {
        const state = loadActiveSucceeded(initialConversationsState(), [
            conversation({
                id: 1,
                targetType: 'table',
                targetId: 'table-1',
            }),
        ]);

        expect(
            selectConversationForTarget(state, {
                targetType: 'table',
                targetId: 'table-1',
            })?.id
        ).toBe(1);
    });

    it('RESET returns to initial state', () => {
        const state = conversationsReducer(
            loadActiveSucceeded(initialConversationsState(), [
                conversation({ id: 1 }),
            ]),
            { type: 'RESET' }
        );

        expect(state).toEqual(initialConversationsState());
    });

    it('MESSAGE_REACTIONS_UPDATED patches a loaded message', () => {
        const withMessages = conversationsReducer(
            conversationsReducer(
                loadActiveSucceeded(initialConversationsState(), [
                    conversation({ id: 1 }),
                ]),
                {
                    type: 'MESSAGES_LOAD_STARTED',
                    conversationId: 1,
                    generation: 1,
                }
            ),
            {
                type: 'MESSAGES_LOAD_SUCCEEDED',
                conversationId: 1,
                generation: 1,
                messages: [
                    {
                        id: 5,
                        conversationId: 1,
                        body: 'hello',
                        user: aliceAuthor,
                        createdAt: '2026-01-01T10:00:00.000Z',
                        updatedAt: '2026-01-01T10:00:00.000Z',
                        reactions: [],
                    },
                ],
                nextCursor: null,
                append: false,
            }
        );

        const state = conversationsReducer(withMessages, {
            type: 'MESSAGE_REACTIONS_UPDATED',
            conversationId: 1,
            messageId: 5,
            ownership: 'authoritative',
            reactions: [
                {
                    emoji: '👍',
                    count: 1,
                    reactedByMe: true,
                    previewUsers: [aliceAuthor],
                    previewTruncated: false,
                },
            ],
        });

        expect(
            state.messagesByConversationId.get(1)?.byId.get(5)?.reactions
        ).toEqual([
            {
                emoji: '👍',
                count: 1,
                reactedByMe: true,
                previewUsers: [aliceAuthor],
                previewTruncated: false,
            },
        ]);
        expect(state.messagesByConversationId.get(1)?.byId.get(5)?.body).toBe(
            'hello'
        );
    });

    it('MESSAGE_REACTIONS_UPDATED ignores unloaded messages', () => {
        const state = conversationsReducer(initialConversationsState(), {
            type: 'MESSAGE_REACTIONS_UPDATED',
            conversationId: 1,
            messageId: 5,
            ownership: 'authoritative',
            reactions: [],
        });

        expect(state).toEqual(initialConversationsState());
    });
});

describe('conversationsReducer unread actions', () => {
    it('SUMMARIES_LOAD_SUCCEEDED sets totalUnreadCount from backend', () => {
        const state = conversationsReducer(
            conversationsReducer(initialConversationsState(), {
                type: 'SUMMARIES_LOAD_STARTED',
                diagramId: '42',
                generation: 1,
            }),
            {
                type: 'SUMMARIES_LOAD_SUCCEEDED',
                diagramId: '42',
                generation: 1,
                conversations: [conversation({ id: 1, unreadCount: 4 })],
                status: 'active',
                nextCursor: null,
                append: false,
                totalUnreadCount: 4,
            }
        );

        expect(state.totalUnreadCount).toBe(4);
        expect(state.summariesById.get(1)?.unreadCount).toBe(4);
    });

    it('UNREAD_TOTAL_SET replaces the total unread count', () => {
        const loaded = loadActiveSucceeded(initialConversationsState(), [
            conversation({ id: 1 }),
        ]);

        const state = conversationsReducer(loaded, {
            type: 'UNREAD_TOTAL_SET',
            totalUnreadCount: 9,
        });

        expect(state.totalUnreadCount).toBe(9);
    });

    it('UNREAD_TOTAL_INCREMENT increases the total unread count', () => {
        const loaded = loadActiveSucceeded(initialConversationsState(), [
            conversation({ id: 1 }),
        ]);

        const state = conversationsReducer(loaded, {
            type: 'UNREAD_TOTAL_INCREMENT',
            amount: 2,
        });

        expect(state.totalUnreadCount).toBe(2);
    });

    it('CONVERSATION_UNREAD_SET updates an existing summary only', () => {
        const loaded = loadActiveSucceeded(initialConversationsState(), [
            conversation({ id: 1, unreadCount: 3 }),
        ]);

        const updated = conversationsReducer(loaded, {
            type: 'CONVERSATION_UNREAD_SET',
            conversationId: 1,
            unreadCount: 0,
        });

        expect(updated.summariesById.get(1)?.unreadCount).toBe(0);

        const ignored = conversationsReducer(loaded, {
            type: 'CONVERSATION_UNREAD_SET',
            conversationId: 99,
            unreadCount: 0,
        });

        expect(ignored).toBe(loaded);
    });

    it('CONVERSATION_UNREAD_INCREMENT updates an existing summary only', () => {
        const loaded = loadActiveSucceeded(initialConversationsState(), [
            conversation({ id: 1, unreadCount: 1 }),
        ]);

        const state = conversationsReducer(loaded, {
            type: 'CONVERSATION_UNREAD_INCREMENT',
            conversationId: 1,
        });

        expect(state.summariesById.get(1)?.unreadCount).toBe(2);
    });

    it('CONVERSATION_UPSERTED preserves unread when requested', () => {
        const loaded = loadActiveSucceeded(initialConversationsState(), [
            conversation({ id: 1, unreadCount: 5 }),
        ]);

        const state = conversationsReducer(loaded, {
            type: 'CONVERSATION_UPSERTED',
            conversation: conversation({
                id: 1,
                unreadCount: 0,
                messageCount: 9,
            }),
            preserveUnreadCount: true,
        });

        expect(state.summariesById.get(1)?.unreadCount).toBe(5);
        expect(state.summariesById.get(1)?.messageCount).toBe(9);
    });

    it('CONVERSATION_REMOVED subtracts unread from total', () => {
        const loaded = conversationsReducer(
            conversationsReducer(initialConversationsState(), {
                type: 'SUMMARIES_LOAD_STARTED',
                diagramId: '42',
                generation: 1,
            }),
            {
                type: 'SUMMARIES_LOAD_SUCCEEDED',
                diagramId: '42',
                generation: 1,
                conversations: [conversation({ id: 1, unreadCount: 3 })],
                status: 'active',
                nextCursor: null,
                append: false,
                totalUnreadCount: 3,
            }
        );

        const state = conversationsReducer(loaded, {
            type: 'CONVERSATION_REMOVED',
            conversationId: 1,
        });

        expect(state.totalUnreadCount).toBe(0);
        expect(state.summariesById.has(1)).toBe(false);
    });
});
