import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    type RefCallback,
} from 'react';
import type { DiagramComment } from '@/lib/comments/comment-types';
import {
    DISCUSSION_SCROLL_NEAR_BOTTOM_PX,
    findRemovedCommentIds,
    findScrollAnchorAfterDelete,
    getCommentIds,
    getLatestCommentId,
    getRadixScrollAreaViewport,
    isScrollNearBottom,
    type DiscussionScrollIntent,
} from '@/lib/comments/discussion-scroll';

export interface UseDiscussionScrollArgs {
    scopeKey: string;
    scrollToLatestOnOpen: boolean;
    comments: ReadonlyArray<DiagramComment>;
    /**
     * Narrow target-oriented navigation intent (e.g. local create).
     * Consumed by generation; no acknowledgement callback.
     */
    scrollIntent: DiscussionScrollIntent | null;
}

export interface UseDiscussionScrollResult {
    scrollAreaRef: RefCallback<HTMLDivElement | null>;
    setCommentItemRef: (commentId: number, node: HTMLElement | null) => void;
}

type PendingScroll =
    | {
          readonly mode: 'latest';
          readonly behavior: ScrollBehavior;
      }
    | {
          readonly mode: 'comment';
          readonly commentId: number;
          readonly behavior: ScrollBehavior;
          readonly block: ScrollLogicalPosition;
      };

/**
 * Owns Discussions list scrolling: scope open-to-latest, delete-neighbor
 * inference, near-bottom realtime stickiness, and explicit navigation intents.
 * Never steals focus.
 */
export const useDiscussionScroll = ({
    scopeKey,
    scrollToLatestOnOpen,
    comments,
    scrollIntent,
}: UseDiscussionScrollArgs): UseDiscussionScrollResult => {
    const scrollAreaNodeRef = useRef<HTMLDivElement | null>(null);
    const itemNodesRef = useRef<Map<number, HTMLElement>>(new Map());
    const isNearBottomRef = useRef(true);
    const prevScopeKeyRef = useRef<string | null>(null);
    const prevCommentIdsRef = useRef<ReadonlyArray<number>>([]);
    const pendingScrollRef = useRef<PendingScroll | null>(null);
    const lastConsumedGenerationRef = useRef(0);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            pendingScrollRef.current = null;
        };
    }, []);

    const syncNearBottomFromViewport = useCallback(() => {
        const viewport = getRadixScrollAreaViewport(scrollAreaNodeRef.current);
        if (viewport === null) {
            return;
        }

        isNearBottomRef.current = isScrollNearBottom(
            viewport,
            DISCUSSION_SCROLL_NEAR_BOTTOM_PX
        );
    }, []);

    const scrollAreaRef = useCallback<RefCallback<HTMLDivElement | null>>(
        (node) => {
            scrollAreaNodeRef.current = node;
            if (node !== null) {
                syncNearBottomFromViewport();
            }
        },
        [syncNearBottomFromViewport]
    );

    const runPendingScroll = useCallback(() => {
        if (!isMountedRef.current) {
            return;
        }

        const pending = pendingScrollRef.current;
        if (pending === null) {
            return;
        }

        let target: HTMLElement | null = null;
        let behavior: ScrollBehavior;
        let block: ScrollLogicalPosition;

        if (pending.mode === 'latest') {
            const latestId = getLatestCommentId(comments);
            if (latestId === null) {
                return;
            }
            target = itemNodesRef.current.get(latestId) ?? null;
            behavior = pending.behavior;
            block = 'end';
        } else {
            target = itemNodesRef.current.get(pending.commentId) ?? null;
            behavior = pending.behavior;
            block = pending.block;
        }

        if (target === null) {
            return;
        }

        target.scrollIntoView({
            behavior,
            block,
        });
        pendingScrollRef.current = null;

        if (pending.mode === 'latest' || block === 'end') {
            isNearBottomRef.current = true;
        } else {
            syncNearBottomFromViewport();
        }
    }, [comments, syncNearBottomFromViewport]);

    const setCommentItemRef = useCallback(
        (commentId: number, node: HTMLElement | null) => {
            if (node === null) {
                itemNodesRef.current.delete(commentId);
                return;
            }

            itemNodesRef.current.set(commentId, node);
            runPendingScroll();
        },
        [runPendingScroll]
    );

    useEffect(() => {
        const root = scrollAreaNodeRef.current;
        const viewport = getRadixScrollAreaViewport(root);
        if (viewport === null) {
            return;
        }

        const handleScroll = () => {
            isNearBottomRef.current = isScrollNearBottom(
                viewport,
                DISCUSSION_SCROLL_NEAR_BOTTOM_PX
            );
        };

        handleScroll();
        viewport.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            viewport.removeEventListener('scroll', handleScroll);
        };
    }, [scopeKey, comments.length]);

    useLayoutEffect(() => {
        const previousScopeKey = prevScopeKeyRef.current;
        const scopeChanged =
            previousScopeKey === null || previousScopeKey !== scopeKey;
        prevScopeKeyRef.current = scopeKey;

        const previousIds = prevCommentIdsRef.current;
        const nextIds = getCommentIds(comments);

        if (scopeChanged) {
            isNearBottomRef.current = true;
            pendingScrollRef.current = null;
            prevCommentIdsRef.current = nextIds;

            // Invalidate any intent that belonged to the previous scope by
            // consuming its generation without scrolling to it.
            if (
                scrollIntent !== null &&
                scrollIntent.generation > lastConsumedGenerationRef.current
            ) {
                lastConsumedGenerationRef.current = scrollIntent.generation;
            }

            if (scrollToLatestOnOpen && nextIds.length > 0) {
                pendingScrollRef.current = {
                    mode: 'latest',
                    behavior: 'auto',
                };
            }

            runPendingScroll();
            return;
        }

        // Explicit target-oriented navigation (e.g. local create).
        if (
            scrollIntent !== null &&
            scrollIntent.generation > lastConsumedGenerationRef.current
        ) {
            lastConsumedGenerationRef.current = scrollIntent.generation;
            pendingScrollRef.current = {
                mode: 'comment',
                commentId: scrollIntent.targetCommentId,
                behavior: 'smooth',
                block: 'end',
            };
            prevCommentIdsRef.current = nextIds;
            runPendingScroll();
            return;
        }

        const previousLastId =
            previousIds.length > 0
                ? previousIds[previousIds.length - 1]
                : undefined;
        const nextLastId =
            nextIds.length > 0 ? nextIds[nextIds.length - 1] : undefined;

        const appendedNewLatest =
            nextLastId !== undefined &&
            nextLastId !== previousLastId &&
            !previousIds.includes(nextLastId);

        const removedIds = findRemovedCommentIds(previousIds, nextIds);
        const remainingSet = new Set(nextIds);

        prevCommentIdsRef.current = nextIds;

        if (appendedNewLatest && isNearBottomRef.current) {
            const pending = pendingScrollRef.current;
            const alreadyPendingTarget =
                pending?.mode === 'comment' && pending.commentId === nextLastId;

            if (!alreadyPendingTarget) {
                pendingScrollRef.current = {
                    mode: 'comment',
                    commentId: nextLastId,
                    behavior: 'smooth',
                    block: 'end',
                };
            }
            runPendingScroll();
            return;
        }

        // Deletion: keep surrounding context; never jump to the bottom.
        if (removedIds.length > 0 && !appendedNewLatest) {
            const deletedId = removedIds[0];
            if (deletedId !== undefined) {
                const anchorId = findScrollAnchorAfterDelete(
                    previousIds,
                    deletedId,
                    remainingSet
                );
                if (anchorId !== null) {
                    pendingScrollRef.current = {
                        mode: 'comment',
                        commentId: anchorId,
                        behavior: 'auto',
                        block: 'nearest',
                    };
                }
            }
            runPendingScroll();
            return;
        }

        runPendingScroll();
    }, [
        comments,
        runPendingScroll,
        scopeKey,
        scrollIntent,
        scrollToLatestOnOpen,
    ]);

    return {
        scrollAreaRef,
        setCommentItemRef,
    };
};
