import { describe, expect, it } from 'vitest';
import type { DiagramConversation } from '@/lib/conversations/conversation-types';
import { buildUserIdentity } from '@/lib/user';
import {
    DIAGRAM_CONVERSATION_ARCHIVED_EVENT,
    DIAGRAM_CONVERSATION_CREATED_EVENT,
    DIAGRAM_CONVERSATION_DELETED_EVENT,
    DIAGRAM_CONVERSATION_MESSAGE_CREATED_EVENT,
    DIAGRAM_CONVERSATION_MESSAGE_DELETED_EVENT,
    parseDiagramConversationArchivedPayload,
    parseDiagramConversationCreatedPayload,
    parseDiagramConversationDeletedPayload,
    parseDiagramConversationMessageCreatedPayload,
    parseDiagramConversationMessageDeletedPayload,
} from '../conversation-events';

const baseConversation = (
    overrides: Partial<DiagramConversation> = {}
): DiagramConversation => ({
    id: 10,
    diagramId: 42,
    targetType: 'diagram',
    targetId: null,
    status: 'active',
    archivedAt: null,
    messageCount: 1,
    lastMessageAt: '2026-07-19T10:00:00.000Z',
    lastMessagePreview: 'Hello',
    lastMessageAuthor: buildUserIdentity(7, 'Alice', 'Martin'),
    createdAt: '2026-07-19T10:00:00.000Z',
    updatedAt: '2026-07-19T10:05:00.000Z',
    ...overrides,
});

describe('conversation event names', () => {
    it('uses exact event names with leading dot', () => {
        expect(DIAGRAM_CONVERSATION_CREATED_EVENT).toBe(
            '.DiagramConversationCreated'
        );
        expect(DIAGRAM_CONVERSATION_ARCHIVED_EVENT).toBe(
            '.DiagramConversationArchived'
        );
        expect(DIAGRAM_CONVERSATION_DELETED_EVENT).toBe(
            '.DiagramConversationDeleted'
        );
        expect(DIAGRAM_CONVERSATION_MESSAGE_CREATED_EVENT).toBe(
            '.DiagramConversationMessageCreated'
        );
        expect(DIAGRAM_CONVERSATION_MESSAGE_DELETED_EVENT).toBe(
            '.DiagramConversationMessageDeleted'
        );
    });
});

describe('parseDiagramConversationCreatedPayload', () => {
    it('parses a valid conversation summary', () => {
        const conversation = baseConversation();
        const input = { conversation, userId: 7 };

        expect(parseDiagramConversationCreatedPayload(input)).toEqual(input);
    });

    it('rejects malformed payloads', () => {
        expect(parseDiagramConversationCreatedPayload(null)).toBeNull();
        expect(parseDiagramConversationCreatedPayload({})).toBeNull();
    });
});

describe('parseDiagramConversationArchivedPayload', () => {
    it('parses archived conversation summaries', () => {
        const conversation = baseConversation({
            status: 'archived',
            archivedAt: '2026-07-20T00:00:00.000Z',
        });

        expect(
            parseDiagramConversationArchivedPayload({
                conversation,
                userId: 7,
            })?.conversation.status
        ).toBe('archived');
    });
});

describe('parseDiagramConversationDeletedPayload', () => {
    it('parses delete payloads', () => {
        expect(
            parseDiagramConversationDeletedPayload({
                conversationId: 10,
                diagramId: 42,
                userId: 7,
            })
        ).toEqual({
            conversationId: 10,
            diagramId: 42,
            userId: 7,
        });
    });
});

describe('parseDiagramConversationMessageCreatedPayload', () => {
    it('parses message and conversation together', () => {
        const conversation = baseConversation({ messageCount: 2 });
        const input = {
            message: {
                id: 99,
                conversationId: 10,
                body: 'New message',
                user: buildUserIdentity(7, 'Alice', 'Martin'),
                createdAt: '2026-07-19T11:00:00.000Z',
                updatedAt: '2026-07-19T11:00:00.000Z',
            },
            conversation,
            userId: 7,
        };

        expect(parseDiagramConversationMessageCreatedPayload(input)).toEqual(
            input
        );
    });

    it('rejects mismatched conversation ids', () => {
        expect(
            parseDiagramConversationMessageCreatedPayload({
                message: {
                    id: 99,
                    conversationId: 11,
                    body: 'New message',
                    user: null,
                    createdAt: '2026-07-19T11:00:00.000Z',
                    updatedAt: '2026-07-19T11:00:00.000Z',
                },
                conversation: baseConversation({ id: 10 }),
                userId: 7,
            })
        ).toBeNull();
    });
});

describe('parseDiagramConversationMessageDeletedPayload', () => {
    it('parses delete payloads with updated conversation summary', () => {
        const conversation = baseConversation({ messageCount: 0 });

        expect(
            parseDiagramConversationMessageDeletedPayload({
                messageId: 99,
                conversationId: 10,
                conversation,
                userId: 7,
            })
        ).toEqual({
            messageId: 99,
            conversationId: 10,
            conversation,
            userId: 7,
        });
    });
});
