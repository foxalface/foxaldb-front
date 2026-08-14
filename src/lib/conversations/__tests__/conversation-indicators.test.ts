import { describe, expect, it } from 'vitest';
import { aliceAuthor } from '@/test/user-identity-fixtures';
import {
    conversationsReducer,
    initialConversationsState,
    type ConversationsState,
} from '../conversation-reducer';
import type { DiagramConversation } from '../conversation-types';
import {
    EMPTY_CONVERSATION_INDICATOR_INDEX,
    findActiveConversationForTarget,
    getActiveConversationIdForTarget,
    selectConversationIndicatorIndex,
} from '../conversation-indicators';

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
    lastMessageAuthor: aliceAuthor,
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

describe('selectConversationIndicatorIndex', () => {
    it('returns the stable empty index for an empty state', () => {
        expect(
            selectConversationIndicatorIndex(initialConversationsState())
        ).toBe(EMPTY_CONVERSATION_INDICATOR_INDEX);
    });

    it('indexes diagram conversations with null target id', () => {
        const state = loadActiveSucceeded(initialConversationsState(), [
            conversation({
                id: 1,
                targetType: 'diagram',
                targetId: null,
                messageCount: 1,
            }),
        ]);

        const index = selectConversationIndicatorIndex(state);
        expect(index.diagramConversationId).toBe(1);
        expect(getActiveConversationIdForTarget(index, 'diagram', null)).toBe(
            1
        );
    });

    it('indexes table, field, and relationship targets', () => {
        const state = loadActiveSucceeded(initialConversationsState(), [
            conversation({
                id: 2,
                targetType: 'table',
                targetId: 't1',
                messageCount: 1,
            }),
            conversation({
                id: 3,
                targetType: 'field',
                targetId: 'f1',
                messageCount: 1,
            }),
            conversation({
                id: 4,
                targetType: 'relationship',
                targetId: 'r1',
                messageCount: 1,
            }),
        ]);

        const index = selectConversationIndicatorIndex(state);
        expect(index.tables.get('t1')).toBe(2);
        expect(index.fields.get('f1')).toBe(3);
        expect(index.relationships.get('r1')).toBe(4);
    });

    it('does not index archived conversations', () => {
        const state = loadActiveSucceeded(initialConversationsState(), [
            conversation({
                id: 5,
                targetType: 'table',
                targetId: 't1',
                status: 'archived',
                archivedAt: '2026-01-05T10:00:00.000Z',
            }),
        ]);

        const index = selectConversationIndicatorIndex(state);
        expect(index.tables.size).toBe(0);
    });

    it('does not cross-match unrelated targets', () => {
        const state = loadActiveSucceeded(initialConversationsState(), [
            conversation({
                id: 6,
                targetType: 'table',
                targetId: 't1',
                messageCount: 1,
            }),
        ]);

        const index = selectConversationIndicatorIndex(state);
        expect(index.tables.get('other')).toBeUndefined();
        expect(index.fields.get('t1')).toBeUndefined();
    });

    it('does not index conversations without messages', () => {
        const state = loadActiveSucceeded(initialConversationsState(), [
            conversation({
                id: 9,
                targetType: 'table',
                targetId: 't1',
                messageCount: 0,
            }),
        ]);

        const index = selectConversationIndicatorIndex(state);
        expect(index.tables.size).toBe(0);
    });
});

describe('findActiveConversationForTarget', () => {
    it('matches diagram target with null target id', () => {
        const state = loadActiveSucceeded(initialConversationsState(), [
            conversation({
                id: 7,
                targetType: 'diagram',
                targetId: null,
                messageCount: 1,
            }),
        ]);

        const match = findActiveConversationForTarget(
            state.summariesById,
            'diagram',
            null
        );

        expect(match?.id).toBe(7);
    });

    it('returns undefined for archived conversations', () => {
        const state = loadActiveSucceeded(initialConversationsState(), [
            conversation({
                id: 8,
                targetType: 'field',
                targetId: 'f1',
                status: 'archived',
                archivedAt: '2026-01-05T10:00:00.000Z',
            }),
        ]);

        expect(
            findActiveConversationForTarget(state.summariesById, 'field', 'f1')
        ).toBeUndefined();
    });
});
