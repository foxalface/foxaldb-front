import React, { useMemo } from 'react';
import { ScrollArea } from '@/components/scroll-area/scroll-area';
import { useDiscussionScroll } from '@/hooks/use-discussion-scroll';
import type { DiagramComment } from '@/lib/comments/comment-types';
import type { DiscussionScrollIntent } from '@/lib/comments/discussion-scroll';
import { CommentListItem } from './comment-list-item';

export interface CommentsListProps {
    comments: ReadonlyArray<DiagramComment>;
    labelledBy: string;
    scopeKey: string;
    scrollToLatestOnOpen: boolean;
    scrollIntent: DiscussionScrollIntent | null;
}

export const CommentsList: React.FC<CommentsListProps> = ({
    comments,
    labelledBy,
    scopeKey,
    scrollToLatestOnOpen,
    scrollIntent,
}) => {
    const { scrollAreaRef, setCommentItemRef } = useDiscussionScroll({
        scopeKey,
        scrollToLatestOnOpen,
        comments,
        scrollIntent,
    });

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
