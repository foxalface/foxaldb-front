import type { ConversationsAction } from '@/lib/conversations/conversation-reducer';
import type { DiagramPrivateEventChannel } from './diagram-private-channel';
import {
    DIAGRAM_CONVERSATION_READ_UPDATED_EVENT,
    parseDiagramConversationReadUpdatedPayload,
} from './conversation-events';
import { isValidBackendDiagramId } from './diagram-id';

export interface SubscribeToUserConversationReadEventsOptions {
    channel: DiagramPrivateEventChannel;
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

export const subscribeToUserConversationReadEvents = (
    options: SubscribeToUserConversationReadEventsOptions
): (() => void) => {
    const { channel, diagramId, dispatch } = options;
    const activeDiagramId = resolveActiveDiagramId(diagramId);

    const onReadUpdated = (raw: unknown): void => {
        if (activeDiagramId === null) {
            return;
        }

        const payload = parseDiagramConversationReadUpdatedPayload(raw);

        if (payload === null || payload.diagramId !== activeDiagramId) {
            return;
        }

        dispatch({
            type: 'CONVERSATION_UNREAD_SET',
            conversationId: payload.conversationId,
            unreadCount: payload.unreadCount,
        });
        dispatch({
            type: 'UNREAD_TOTAL_SET',
            totalUnreadCount: payload.totalUnreadCount,
        });
    };

    channel.listen(DIAGRAM_CONVERSATION_READ_UPDATED_EVENT, onReadUpdated);

    let cleanedUp = false;

    return () => {
        if (cleanedUp) {
            return;
        }

        cleanedUp = true;

        channel.stopListening(
            DIAGRAM_CONVERSATION_READ_UPDATED_EVENT,
            onReadUpdated
        );
    };
};
