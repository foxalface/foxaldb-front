import React, { useMemo, type RefCallback } from 'react';
import { ScrollArea } from '@/components/scroll-area/scroll-area';
import type { DiagramComment } from '@/lib/comments/comment-types';
import { CommentListItem } from './comment-list-item';

export interface CommentsListProps {
    comments: ReadonlyArray<DiagramComment>;
    labelledBy: string;
    scrollAreaRef: RefCallback<HTMLDivElement | null>;
    setCommentItemRef: (commentId: number, node: HTMLElement | null) => void;
}

/**
 * Presentational comment list. Scroll lifecycle and position state are owned
 * by {@link useDiscussionScroll} via a stable parent region.
 */
export const CommentsList: React.FC<CommentsListProps> = ({
    comments,
    labelledBy,
    scrollAreaRef,
    setCommentItemRef,
}) => {
    const itemRefCallbacks = useMemo(() => {
        const map = new Map<number, React.RefCallback<HTMLLIElement>>();
        for (const comment of comments) {
            map.set(comment.id, (node) => {
                setCommentItemRef(comment.id, node);
            });
        }
        return map;
    }, [comments, setCommentItemRef]);

    return (
        <ScrollArea
            ref={scrollAreaRef}
            className="h-full"
            data-testid="comments-scroll-area"
        >
            <ul
                className="flex list-none flex-col px-1 pb-2"
                aria-labelledby={labelledBy}
            >
                {comments.map((comment) => (
                    <li
                        key={comment.id}
                        ref={itemRefCallbacks.get(comment.id)}
                        className="border-b border-border/60 last:border-b-0"
                        data-comment-id={comment.id}
                    >
                        <CommentListItem comment={comment} />
                    </li>
                ))}
            </ul>
        </ScrollArea>
    );
};
