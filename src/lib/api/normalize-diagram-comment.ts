import {
    COMMENT_TARGET_TYPES,
    type CommentTargetType,
    type DiagramComment,
} from '@/lib/comments/comment-types';
import { parseUserIdentityFromHttp } from '@/lib/user';
import type { DiagramCommentDto } from './diagram-comments';

const COMMENT_TARGET_TYPE_SET: ReadonlySet<string> = new Set(
    COMMENT_TARGET_TYPES
);

const isFiniteInteger = (value: unknown): value is number =>
    typeof value === 'number' && Number.isInteger(value);

const isNonEmptyString = (value: unknown): value is string =>
    typeof value === 'string' && value.length > 0;

const isCommentTargetType = (value: unknown): value is CommentTargetType =>
    typeof value === 'string' && COMMENT_TARGET_TYPE_SET.has(value);

const isTargetConsistent = (
    targetType: CommentTargetType,
    targetId: unknown
): targetId is string | null => {
    if (targetType === 'diagram') {
        return targetId === null;
    }

    return typeof targetId === 'string' && targetId.length > 0;
};

const invalidPayload = (detail: string): Error =>
    new Error(`Invalid diagram comment payload: ${detail}`);

/**
 * Converts a backend HTTP snake_case comment DTO to the camelCase domain model.
 * Throws when the payload is structurally invalid at the API boundary.
 */
export const normalizeDiagramCommentFromApi = (
    comment: DiagramCommentDto
): DiagramComment => {
    if (!isFiniteInteger(comment.id)) {
        throw invalidPayload('id must be a finite integer');
    }

    if (!isFiniteInteger(comment.diagram_id)) {
        throw invalidPayload('diagram_id must be a finite integer');
    }

    if (!isCommentTargetType(comment.target_type)) {
        throw invalidPayload('target_type is invalid');
    }

    if (!isTargetConsistent(comment.target_type, comment.target_id)) {
        throw invalidPayload('target_id is inconsistent with target_type');
    }

    if (typeof comment.body !== 'string') {
        throw invalidPayload('body must be a string');
    }

    let user: DiagramComment['user'] = null;

    if (comment.user !== null) {
        const parsedUser = parseUserIdentityFromHttp(comment.user);

        if (parsedUser === null) {
            throw invalidPayload('user is malformed');
        }

        user = parsedUser;
    }

    if (!isNonEmptyString(comment.created_at)) {
        throw invalidPayload('created_at must be a non-empty string');
    }

    if (!isNonEmptyString(comment.updated_at)) {
        throw invalidPayload('updated_at must be a non-empty string');
    }

    return {
        id: comment.id,
        diagramId: comment.diagram_id,
        targetType: comment.target_type,
        targetId: comment.target_id,
        body: comment.body,
        user,
        createdAt: comment.created_at,
        updatedAt: comment.updated_at,
    };
};
