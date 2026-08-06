import type { ConversationsAction } from '@/lib/conversations/conversation-reducer';
import type { DiagramConversation } from '@/lib/conversations/conversation-types';
import type { DiagramPrivateEventChannel } from './diagram-private-channel';
import { isValidBackendDiagramId } from './diagram-id';
import {
    DIAGRAM_CONVERSATION_ARCHIVED_EVENT,
    DIAGRAM_CONVERSATION_CREATED_EVENT,
    DIAGRAM_CONVERSATION_DELETED_EVENT,
    DIAGRAM_CONVERSATION_MESSAGE_CREATED_EVENT,
    DIAGRAM_CONVERSATION_MESSAGE_DELETED_EVENT,
    DIAGRAM_CONVERSATION_MESSAGE_REACTIONS_UPDATED_EVENT,
    DIAGRAM_CONVERSATION_MESSAGE_UPDATED_EVENT,
    DIAGRAM_CONVERSATION_REOPENED_EVENT,
    parseDiagramConversationArchivedPayload,
    parseDiagramConversationCreatedPayload,
    parseDiagramConversationDeletedPayload,
    parseDiagramConversationMessageCreatedPayload,
    parseDiagramConversationMessageDeletedPayload,
    parseDiagramConversationMessageReactionsUpdatedPayload,
    parseDiagramConversationMessageUpdatedPayload,
    parseDiagramConversationReopenedPayload,
} from './conversation-events';

export interface SubscribeToDiagramConversationEventsOptions {
    channel: DiagramPrivateEventChannel;
    diagramId: string;
    dispatch: (action: ConversationsAction) => void;
    getCurrentUserId?: () => number | null;
}

const resolveActiveDiagramId = (diagramId: string): number | null => {
    if (!isValidBackendDiagramId(diagramId)) {
        return null;
    }

    const parsed = Number(diagramId);

    if (!Number.isSafeInteger(parsed)) {
        return null;
    }

    return parsed;
};

const upsertConversation = (
    dispatch: (action: ConversationsAction) => void,
    conversation: DiagramConversation,
    preserveUnreadCount = false
): void => {
    dispatch({
        type: 'CONVERSATION_UPSERTED',
        conversation,
        preserveUnreadCount,
    });
};

export const subscribeToDiagramConversationEvents = (
    options: SubscribeToDiagramConversationEventsOptions
): (() => void) => {
    const { channel, diagramId, dispatch, getCurrentUserId } = options;
    const activeDiagramId = resolveActiveDiagramId(diagramId);

    const onConversationCreated = (raw: unknown): void => {
        if (activeDiagramId === null) {
            return;
        }

        const payload = parseDiagramConversationCreatedPayload(raw);

        if (
            payload === null ||
            payload.conversation.diagramId !== activeDiagramId
        ) {
            return;
        }

        upsertConversation(dispatch, payload.conversation);
    };

    const onConversationArchived = (raw: unknown): void => {
        if (activeDiagramId === null) {
            return;
        }

        const payload = parseDiagramConversationArchivedPayload(raw);

        if (
            payload === null ||
            payload.conversation.diagramId !== activeDiagramId
        ) {
            return;
        }

        upsertConversation(dispatch, payload.conversation);
    };

    const onConversationReopened = (raw: unknown): void => {
        if (activeDiagramId === null) {
            return;
        }

        const payload = parseDiagramConversationReopenedPayload(raw);

        if (
            payload === null ||
            payload.conversation.diagramId !== activeDiagramId
        ) {
            return;
        }

        upsertConversation(dispatch, payload.conversation);
    };

    const onConversationDeleted = (raw: unknown): void => {
        if (activeDiagramId === null) {
            return;
        }

        const payload = parseDiagramConversationDeletedPayload(raw);

        if (payload === null || payload.diagramId !== activeDiagramId) {
            return;
        }

        dispatch({
            type: 'CONVERSATION_REMOVED',
            conversationId: payload.conversationId,
        });
    };

    const onMessageCreated = (raw: unknown): void => {
        if (activeDiagramId === null) {
            return;
        }

        const payload = parseDiagramConversationMessageCreatedPayload(raw);

        if (
            payload === null ||
            payload.conversation.diagramId !== activeDiagramId
        ) {
            return;
        }

        upsertConversation(dispatch, payload.conversation, true);
        dispatch({
            type: 'MESSAGE_UPSERTED',
            message: payload.message,
        });

        const currentUserId = getCurrentUserId?.() ?? null;

        if (currentUserId === null || payload.userId !== currentUserId) {
            dispatch({
                type: 'CONVERSATION_UNREAD_INCREMENT',
                conversationId: payload.conversation.id,
            });
            dispatch({ type: 'UNREAD_TOTAL_INCREMENT' });
        }
    };

    const onMessageUpdated = (raw: unknown): void => {
        if (activeDiagramId === null) {
            return;
        }

        const payload = parseDiagramConversationMessageUpdatedPayload(raw);

        if (
            payload === null ||
            payload.conversation.diagramId !== activeDiagramId
        ) {
            return;
        }

        upsertConversation(dispatch, payload.conversation, true);
        dispatch({
            type: 'MESSAGE_UPSERTED',
            message: payload.message,
        });
    };

    const onMessageDeleted = (raw: unknown): void => {
        if (activeDiagramId === null) {
            return;
        }

        const payload = parseDiagramConversationMessageDeletedPayload(raw);

        if (
            payload === null ||
            payload.conversation.diagramId !== activeDiagramId
        ) {
            return;
        }

        upsertConversation(dispatch, payload.conversation, true);
        dispatch({
            type: 'MESSAGE_REMOVED',
            conversationId: payload.conversationId,
            messageId: payload.messageId,
        });
    };

    const onMessageReactionsUpdated = (raw: unknown): void => {
        if (activeDiagramId === null) {
            return;
        }

        const payload =
            parseDiagramConversationMessageReactionsUpdatedPayload(raw);

        if (payload === null || payload.diagramId !== activeDiagramId) {
            return;
        }

        dispatch({
            type: 'MESSAGE_REACTIONS_UPDATED',
            conversationId: payload.conversationId,
            messageId: payload.messageId,
            reactions: payload.reactions,
            ownership: 'reconcile',
            currentUserId: getCurrentUserId?.() ?? null,
        });
    };

    channel.listen(DIAGRAM_CONVERSATION_CREATED_EVENT, onConversationCreated);
    channel.listen(DIAGRAM_CONVERSATION_ARCHIVED_EVENT, onConversationArchived);
    channel.listen(DIAGRAM_CONVERSATION_REOPENED_EVENT, onConversationReopened);
    channel.listen(DIAGRAM_CONVERSATION_DELETED_EVENT, onConversationDeleted);
    channel.listen(
        DIAGRAM_CONVERSATION_MESSAGE_CREATED_EVENT,
        onMessageCreated
    );
    channel.listen(
        DIAGRAM_CONVERSATION_MESSAGE_UPDATED_EVENT,
        onMessageUpdated
    );
    channel.listen(
        DIAGRAM_CONVERSATION_MESSAGE_DELETED_EVENT,
        onMessageDeleted
    );
    channel.listen(
        DIAGRAM_CONVERSATION_MESSAGE_REACTIONS_UPDATED_EVENT,
        onMessageReactionsUpdated
    );

    let cleanedUp = false;

    return () => {
        if (cleanedUp) {
            return;
        }

        cleanedUp = true;

        channel.stopListening(
            DIAGRAM_CONVERSATION_CREATED_EVENT,
            onConversationCreated
        );
        channel.stopListening(
            DIAGRAM_CONVERSATION_ARCHIVED_EVENT,
            onConversationArchived
        );
        channel.stopListening(
            DIAGRAM_CONVERSATION_REOPENED_EVENT,
            onConversationReopened
        );
        channel.stopListening(
            DIAGRAM_CONVERSATION_DELETED_EVENT,
            onConversationDeleted
        );
        channel.stopListening(
            DIAGRAM_CONVERSATION_MESSAGE_CREATED_EVENT,
            onMessageCreated
        );
        channel.stopListening(
            DIAGRAM_CONVERSATION_MESSAGE_UPDATED_EVENT,
            onMessageUpdated
        );
        channel.stopListening(
            DIAGRAM_CONVERSATION_MESSAGE_DELETED_EVENT,
            onMessageDeleted
        );
        channel.stopListening(
            DIAGRAM_CONVERSATION_MESSAGE_REACTIONS_UPDATED_EVENT,
            onMessageReactionsUpdated
        );
    };
};
