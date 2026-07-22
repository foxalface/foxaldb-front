import React from 'react';
import type { DiagramComment } from '@/lib/comments/comment-types';
import { CommentAuthor } from './comment-author';
import { CommentTargetContext } from './comment-target-context';

export interface CommentListItemProps {
    comment: DiagramComment;
}

export const CommentListItem: React.FC<CommentListItemProps> = ({
    comment,
}) => {
    return (
        <article className="flex flex-col gap-1.5 px-1 py-3">
            <CommentAuthor user={comment.user} createdAt={comment.createdAt} />
            <p className="whitespace-pre-wrap break-words text-sm text-foreground [overflow-wrap:anywhere]">
                {comment.body}
            </p>
            <CommentTargetContext targetType={comment.targetType} />
        </article>
    );
};
