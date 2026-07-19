import type { CommentsAction } from '@/lib/comments/comment-reducer';
import { isValidBackendDiagramId } from './diagram-id';
import {
    DIAGRAM_COMMENT_CREATED_EVENT,
    DIAGRAM_COMMENT_DELETED_EVENT,
    DIAGRAM_COMMENT_UPDATED_EVENT,
    parseDiagramCommentCreatedPayload,
    parseDiagramCommentDeletedPayload,
    parseDiagramCommentUpdatedPayload,
} from './comment-events';

/**
 * Narrow Echo private-channel surface used by the comment subscriber.
 * Matches ChannelManager's PrivateChannel listen / stopListening API.
 */
export interface DiagramCommentEventChannel {
    listen(
        event: string,
        callback: (payload: unknown) => void
    ): DiagramCommentEventChannel;
    stopListening(
        event: string,
        callback?: (payload: unknown) => void
    ): DiagramCommentEventChannel;
}

export interface SubscribeToDiagramCommentEventsOptions {
    channel: DiagramCommentEventChannel;
    diagramId: string;
    dispatch: (action: CommentsAction) => void;
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

export const subscribeToDiagramCommentEvents = (
    options: SubscribeToDiagramCommentEventsOptions
): (() => void) => {
    const { channel, diagramId, dispatch } = options;
    const activeDiagramId = resolveActiveDiagramId(diagramId);

    const onCreated = (raw: unknown): void => {
        if (activeDiagramId === null) {
            return;
        }

        const payload = parseDiagramCommentCreatedPayload(raw);

        if (payload === null || payload.diagramId !== activeDiagramId) {
            return;
        }

        dispatch({
            type: 'COMMENT_UPSERTED',
            comment: payload.comment,
        });
    };

    const onUpdated = (raw: unknown): void => {
        if (activeDiagramId === null) {
            return;
        }

        const payload = parseDiagramCommentUpdatedPayload(raw);

        if (payload === null || payload.diagramId !== activeDiagramId) {
            return;
        }

        dispatch({
            type: 'COMMENT_UPSERTED',
            comment: payload.comment,
        });
    };

    const onDeleted = (raw: unknown): void => {
        if (activeDiagramId === null) {
            return;
        }

        const payload = parseDiagramCommentDeletedPayload(raw);

        if (payload === null || payload.diagramId !== activeDiagramId) {
            return;
        }

        dispatch({
            type: 'COMMENT_REMOVED',
            commentId: payload.commentId,
        });
    };

    channel.listen(DIAGRAM_COMMENT_CREATED_EVENT, onCreated);
    channel.listen(DIAGRAM_COMMENT_UPDATED_EVENT, onUpdated);
    channel.listen(DIAGRAM_COMMENT_DELETED_EVENT, onDeleted);

    let cleanedUp = false;

    return () => {
        if (cleanedUp) {
            return;
        }

        cleanedUp = true;

        channel.stopListening(DIAGRAM_COMMENT_CREATED_EVENT, onCreated);
        channel.stopListening(DIAGRAM_COMMENT_UPDATED_EVENT, onUpdated);
        channel.stopListening(DIAGRAM_COMMENT_DELETED_EVENT, onDeleted);
    };
};
