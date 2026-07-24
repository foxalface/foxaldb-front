import React from 'react';
import { useDiscussionScroll } from '@/hooks/use-discussion-scroll';
import type { DiagramComment } from '@/lib/comments/comment-types';
import type { DiscussionScrollIntent } from '@/lib/comments/discussion-scroll';
import { CommentsList } from './comments-list';

export interface CommentsScrollRegionProps {
    comments: ReadonlyArray<DiagramComment>;
    emptyContent: React.ReactNode;
    labelledBy: string;
    scopeKey: string;
    scrollToLatestOnOpen: boolean;
    scrollIntent: DiscussionScrollIntent | null;
    reloadErrorBanner?: React.ReactNode;
}

/**
 * Keeps {@link useDiscussionScroll} mounted for the life of the ready
 * Discussions content area — including empty scopes — so per-scope scroll
 * positions survive All → empty target → All.
 */
export const CommentsScrollRegion: React.FC<CommentsScrollRegionProps> = ({
    comments,
    emptyContent,
    labelledBy,
    scopeKey,
    scrollToLatestOnOpen,
    scrollIntent,
    reloadErrorBanner = null,
}) => {
    const { scrollAreaRef, setCommentItemRef } = useDiscussionScroll({
        scopeKey,
        scrollToLatestOnOpen,
        comments,
        scrollIntent,
    });

    return (
        <div
            className="flex min-h-0 flex-1 flex-col"
            data-testid="comments-scroll-region"
        >
            {reloadErrorBanner}
            {comments.length === 0 ? (
                emptyContent
            ) : (
                <div className="min-h-0 flex-1">
                    <CommentsList
                        comments={comments}
                        labelledBy={labelledBy}
                        scrollAreaRef={scrollAreaRef}
                        setCommentItemRef={setCommentItemRef}
                    />
                </div>
            )}
        </div>
    );
};
