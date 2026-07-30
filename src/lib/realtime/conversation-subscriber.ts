import type { ConversationsAction } from '@/lib/conversations/conversation-reducer';
import type { DiagramConversation } from '@/lib/conversations/conversation-types';
import { isValidBackendDiagramId } from './diagram-id';
import {
    DIAGRAM_CONVERSATION_ARCHIVED_EVENT,
    DIAGRAM_CONVERSATION_CREATED_EVENT,
    DIAGRAM_CONVERSATION_DELETED_EVENT,
    DIAGRAM_CONVERSATION_MESSAGE_CREATED_EVENT,
    DIAGRAM_CONVERSATION_MESSAGE_DELETED_EVENT,
    DIAGRAM_CONVERSATION_MESSAGE_UPDATED_EVENT,
    DIAGRAM_CONVERSATION_REOPENED_EVENT,
    parseDiagramConversationArchivedPayload,
    parseDiagramConversationCreatedPayload,
    parseDiagramConversationDeletedPayload,
    parseDiagramConversationMessageCreatedPayload,
    parseDiagramConversationMessageDeletedPayload,
    parseDiagramConversationMessageUpdatedPayload,
    parseDiagramConversationReopenedPayload,
} from './conversation-events';

/**
 * Narrow Echo private-channel surface used by the conversation subscriber.
 * Matches ChannelManager's PrivateChannel listen / stopListening API.
 */
export interface DiagramConversationEventChannel {
    listen(
        event: string,
        callback: (payload: unknown) => void
    ): DiagramConversationEventChannel;
    stopListening(
        event: string,
        callback?: (payload: unknown) => void
    ): DiagramConversationEventChannel;
}

export interface SubscribeToDiagramConversationEventsOptions {
    channel: DiagramConversationEventChannel;
    diagramId: string;
    dispatch: (action: ConversationsAction) => void;
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
    conversation: DiagramConversation
): void => {
    dispatch({
        type: 'CONVERSATION_UPSERTED',
        conversation,
    });
};

export const subscribeToDiagramConversationEvents = (
    options: SubscribeToDiagramConversationEventsOptions
): (() => void) => {
    const { channel, diagramId, dispatch } = options;
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

        upsertConversation(dispatch, payload.conversation);
        dispatch({
            type: 'MESSAGE_UPSERTED',
            message: payload.message,
        });
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

        upsertConversation(dispatch, payload.conversation);
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

        upsertConversation(dispatch, payload.conversation);
        dispatch({
            type: 'MESSAGE_REMOVED',
            conversationId: payload.conversationId,
            messageId: payload.messageId,
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
    };
};
