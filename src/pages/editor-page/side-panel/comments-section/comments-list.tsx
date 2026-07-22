import React from 'react';
import { ScrollArea } from '@/components/scroll-area/scroll-area';
import type { DiagramComment } from '@/lib/comments/comment-types';
import { CommentListItem } from './comment-list-item';

export interface CommentsListProps {
    comments: ReadonlyArray<DiagramComment>;
    labelledBy: string;
}

export const CommentsList: React.FC<CommentsListProps> = ({
    comments,
    labelledBy,
}) => {
    return (
        <ScrollArea className="h-full" data-testid="comments-scroll-area">
            <ul
                className="flex list-none flex-col px-1 pb-2"
                aria-labelledby={labelledBy}
            >
                {comments.map((comment) => (
                    <li
                        key={comment.id}
                        className="border-b border-border/60 last:border-b-0"
                    >
                        <CommentListItem comment={comment} />
                    </li>
                ))}
            </ul>
        </ScrollArea>
    );
};
