import { useMemo } from 'react';
import { EMPTY_COMMENTS } from '@/lib/comments/comment-selectors';
import type {
    DiagramComment,
    DiagramCommentTarget,
} from '@/lib/comments/comment-types';
import { useDiagramComments } from './use-diagram-comments';

export const useTargetComments = (
    target: DiagramCommentTarget
): ReadonlyArray<DiagramComment> => {
    const { comments } = useDiagramComments();

    return useMemo(() => {
        const matched = comments.filter(
            (comment) =>
                comment.targetType === target.targetType &&
                comment.targetId === target.targetId
        );

        return matched.length === 0 ? EMPTY_COMMENTS : matched;
    }, [comments, target.targetType, target.targetId]);
};
