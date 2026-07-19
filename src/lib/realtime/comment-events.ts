import {
    COMMENT_TARGET_TYPES,
    type CommentTargetType,
    type DiagramComment,
} from '@/lib/comments/comment-types';

export const DIAGRAM_COMMENT_CREATED_EVENT = '.DiagramCommentCreated';

export const DIAGRAM_COMMENT_UPDATED_EVENT = '.DiagramCommentUpdated';

export const DIAGRAM_COMMENT_DELETED_EVENT = '.DiagramCommentDeleted';

export interface DiagramCommentMutationPayload {
    diagramId: number;
    userId: number;
    comment: DiagramComment;
    sentAt: string;
}

export type DiagramCommentCreatedPayload = DiagramCommentMutationPayload;

export type DiagramCommentUpdatedPayload = DiagramCommentMutationPayload;

export interface DiagramCommentDeletedPayload {
    diagramId: number;
    commentId: number;
    userId: number;
    sentAt: string;
}

const COMMENT_TARGET_TYPE_SET: ReadonlySet<string> = new Set(
    COMMENT_TARGET_TYPES
);

const isRecord = (value: unknown): value is Record<string, unknown> => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return false;
    }

    const prototype = Object.getPrototypeOf(value);

    return prototype === Object.prototype || prototype === null;
};

const isFiniteInteger = (value: unknown): value is number =>
    typeof value === 'number' && Number.isInteger(value);

const isNonEmptyString = (value: unknown): value is string =>
    typeof value === 'string' && value.length > 0;

const isCommentTargetType = (value: unknown): value is CommentTargetType =>
    typeof value === 'string' && COMMENT_TARGET_TYPE_SET.has(value);

const parseCommentAuthor = (
    value: unknown
): DiagramComment['user'] | undefined => {
    if (value === null) {
        return null;
    }

    if (!isRecord(value)) {
        return undefined;
    }

    const { id, name } = value;

    if (!isFiniteInteger(id) || typeof name !== 'string') {
        return undefined;
    }

    return { id, name };
};

const isTargetConsistent = (
    targetType: CommentTargetType,
    targetId: unknown
): targetId is string | null => {
    if (targetType === 'diagram') {
        return targetId === null;
    }

    return typeof targetId === 'string' && targetId.length > 0;
};

const parseDiagramComment = (value: unknown): DiagramComment | null => {
    if (!isRecord(value)) {
        return null;
    }

    const {
        id,
        diagramId,
        targetType,
        targetId,
        body,
        user,
        createdAt,
        updatedAt,
    } = value;

    if (!isFiniteInteger(id) || !isFiniteInteger(diagramId)) {
        return null;
    }

    if (!isCommentTargetType(targetType)) {
        return null;
    }

    if (!isTargetConsistent(targetType, targetId)) {
        return null;
    }

    if (typeof body !== 'string') {
        return null;
    }

    const parsedUser = parseCommentAuthor(user);

    if (parsedUser === undefined) {
        return null;
    }

    if (!isNonEmptyString(createdAt) || !isNonEmptyString(updatedAt)) {
        return null;
    }

    return {
        id,
        diagramId,
        targetType,
        targetId,
        body,
        user: parsedUser,
        createdAt,
        updatedAt,
    };
};

const parseDiagramCommentMutationPayload = (
    value: unknown
): DiagramCommentMutationPayload | null => {
    if (!isRecord(value)) {
        return null;
    }

    const { diagramId, userId, comment, sentAt } = value;

    if (!isFiniteInteger(diagramId) || !isFiniteInteger(userId)) {
        return null;
    }

    if (!isNonEmptyString(sentAt)) {
        return null;
    }

    const parsedComment = parseDiagramComment(comment);

    if (parsedComment === null) {
        return null;
    }

    if (diagramId !== parsedComment.diagramId) {
        return null;
    }

    return {
        diagramId,
        userId,
        comment: parsedComment,
        sentAt,
    };
};

export const parseDiagramCommentCreatedPayload = (
    value: unknown
): DiagramCommentCreatedPayload | null =>
    parseDiagramCommentMutationPayload(value);

export const parseDiagramCommentUpdatedPayload = (
    value: unknown
): DiagramCommentUpdatedPayload | null =>
    parseDiagramCommentMutationPayload(value);

export const parseDiagramCommentDeletedPayload = (
    value: unknown
): DiagramCommentDeletedPayload | null => {
    if (!isRecord(value)) {
        return null;
    }

    const { diagramId, commentId, userId, sentAt } = value;

    if (
        !isFiniteInteger(diagramId) ||
        !isFiniteInteger(commentId) ||
        !isFiniteInteger(userId)
    ) {
        return null;
    }

    if (!isNonEmptyString(sentAt)) {
        return null;
    }

    return {
        diagramId,
        commentId,
        userId,
        sentAt,
    };
};
