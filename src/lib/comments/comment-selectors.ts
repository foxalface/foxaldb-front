import type { CommentsState } from './comment-reducer';
import type { DiagramComment, DiagramCommentTarget } from './comment-types';

export const EMPTY_COMMENTS: ReadonlyArray<DiagramComment> = Object.freeze([]);

/**
 * Chronological order via Date.parse(createdAt), then id ASC.
 *
 * Invalid timestamps (NaN): valid before invalid; if both invalid, compare
 * raw createdAt strings; if still equal, compare id. Never throws.
 */
const compareCommentsByCreatedAtThenId = (
    a: DiagramComment,
    b: DiagramComment
): number => {
    const aTime = Date.parse(a.createdAt);
    const bTime = Date.parse(b.createdAt);
    const aValid = Number.isFinite(aTime);
    const bValid = Number.isFinite(bTime);

    if (aValid && bValid) {
        if (aTime !== bTime) {
            return aTime - bTime;
        }

        return a.id - b.id;
    }

    if (aValid !== bValid) {
        return aValid ? -1 : 1;
    }

    if (a.createdAt !== b.createdAt) {
        return a.createdAt < b.createdAt ? -1 : 1;
    }

    return a.id - b.id;
};

const sortComments = (
    comments: DiagramComment[]
): ReadonlyArray<DiagramComment> =>
    [...comments].sort(compareCommentsByCreatedAtThenId);

export const selectAllComments = (
    state: CommentsState
): ReadonlyArray<DiagramComment> => {
    if (state.byId.size === 0) {
        return EMPTY_COMMENTS;
    }

    return sortComments(Array.from(state.byId.values()));
};

export const selectCommentsForTarget = (
    state: CommentsState,
    target: DiagramCommentTarget
): ReadonlyArray<DiagramComment> => {
    if (state.byId.size === 0) {
        return EMPTY_COMMENTS;
    }

    const matched: DiagramComment[] = [];

    for (const comment of state.byId.values()) {
        if (
            comment.targetType === target.targetType &&
            comment.targetId === target.targetId
        ) {
            matched.push(comment);
        }
    }

    if (matched.length === 0) {
        return EMPTY_COMMENTS;
    }

    return sortComments(matched);
};

export const selectCommentById = (
    state: CommentsState,
    commentId: number
): DiagramComment | undefined => state.byId.get(commentId);
