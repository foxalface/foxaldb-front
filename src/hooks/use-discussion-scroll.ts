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
    discussionScrollScopeDiagramNamespace,
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
 * inference, near-bottom realtime stickiness, explicit navigation intents,
 * and ephemeral per-scope scrollTop restoration (especially All).
 * Never steals focus.
 *
 * Imperative behavior depends only on committed layout-effect lifecycle.
 * Render performs no ref mutation that influences listeners, capture,
 * restoration, or the position cache.
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
    /** Authoritative scope for listener attribution — layout setup only. */
    const committedScopeKeyRef = useRef<string | null>(null);
    /**
     * Last trusted scrollTop for capture/restore. Updated by user scrolls,
     * programmatic restore, scrollIntoView, and empty-scope viewport detach.
     * Not overwritten by content-collapse clamps (see handleScroll).
     */
    const liveScrollTopRef = useRef(0);
    const hasTrustedLiveScrollTopRef = useRef(false);
    const scopeScrollTopRef = useRef<Map<string, number>>(new Map());
    const prevCommentIdsRef = useRef<ReadonlyArray<number>>([]);
    const pendingScrollRef = useRef<PendingScroll | null>(null);
    const lastConsumedGenerationRef = useRef(0);
    const isMountedRef = useRef(true);
    const boundViewportRef = useRef<HTMLElement | null>(null);
    const boundScrollHandlerRef = useRef<(() => void) | null>(null);

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

    const rememberCommittedScrollTop = useCallback(
        (key: string, scrollTop: number) => {
            liveScrollTopRef.current = scrollTop;
            hasTrustedLiveScrollTopRef.current = true;
            scopeScrollTopRef.current.set(key, scrollTop);
        },
        []
    );

    const captureOutgoingPosition = useCallback((outgoingKey: string) => {
        // Authoritative value: last trusted live scrollTop for this scope
        // (user scroll, restore, scrollIntoView, or empty-scope detach).
        // Never invent geometry from a possibly clamped viewport.
        if (!hasTrustedLiveScrollTopRef.current) {
            return;
        }

        scopeScrollTopRef.current.set(outgoingKey, liveScrollTopRef.current);
    }, []);

    const unbindViewportScroll = useCallback(() => {
        const viewport = boundViewportRef.current;
        const handler = boundScrollHandlerRef.current;
        if (viewport !== null && handler !== null) {
            viewport.removeEventListener('scroll', handler);
        }
        boundViewportRef.current = null;
        boundScrollHandlerRef.current = null;
    }, []);

    const bindViewportScroll = useCallback(
        (viewport: HTMLElement) => {
            unbindViewportScroll();

            const handleScroll = () => {
                const committedKey = committedScopeKeyRef.current;
                if (committedKey === null) {
                    return;
                }

                isNearBottomRef.current = isScrollNearBottom(
                    viewport,
                    DISCUSSION_SCROLL_NEAR_BOTTOM_PX
                );

                const nextTop = viewport.scrollTop;
                if (hasTrustedLiveScrollTopRef.current) {
                    const maxScroll = Math.max(
                        0,
                        viewport.scrollHeight - viewport.clientHeight
                    );
                    // Content-collapse clamp: previous offset is no longer
                    // representable. Keep the trusted outgoing value so layout
                    // cleanup can still capture it. Same-scope layouts adopt
                    // the clamped viewport after commit when scope is unchanged.
                    if (
                        nextTop < liveScrollTopRef.current &&
                        maxScroll < liveScrollTopRef.current
                    ) {
                        return;
                    }
                }

                rememberCommittedScrollTop(committedKey, nextTop);
            };

            boundViewportRef.current = viewport;
            boundScrollHandlerRef.current = handleScroll;
            isNearBottomRef.current = isScrollNearBottom(
                viewport,
                DISCUSSION_SCROLL_NEAR_BOTTOM_PX
            );
            viewport.addEventListener('scroll', handleScroll, {
                passive: true,
            });
        },
        [rememberCommittedScrollTop, unbindViewportScroll]
    );

    const rebindViewportScroll = useCallback(() => {
        const viewport = getRadixScrollAreaViewport(scrollAreaNodeRef.current);
        if (viewport !== null) {
            bindViewportScroll(viewport);
        }
    }, [bindViewportScroll]);

    const scrollAreaRef = useCallback<RefCallback<HTMLDivElement | null>>(
        (node) => {
            if (node === null) {
                const viewport = boundViewportRef.current;
                const committedKey = committedScopeKeyRef.current;
                if (
                    isMountedRef.current &&
                    viewport !== null &&
                    committedKey !== null
                ) {
                    // Empty-scope list unmount: scrollTop is still outgoing.
                    rememberCommittedScrollTop(
                        committedKey,
                        viewport.scrollTop
                    );
                }
                unbindViewportScroll();
                scrollAreaNodeRef.current = null;
                return;
            }

            if (!isMountedRef.current) {
                return;
            }

            scrollAreaNodeRef.current = node;
            const viewport = getRadixScrollAreaViewport(node);
            if (viewport !== null) {
                bindViewportScroll(viewport);
            } else {
                syncNearBottomFromViewport();
            }
        },
        [
            bindViewportScroll,
            rememberCommittedScrollTop,
            syncNearBottomFromViewport,
            unbindViewportScroll,
        ]
    );

    // Genuine mount/unmount. Strict Mode replays cleanup+setup: rebind the
    // still-mounted viewport after replay. Pending work is gated by
    // isMountedRef so replay does not need to wipe layout-queued scrolls.
    useEffect(() => {
        isMountedRef.current = true;
        rebindViewportScroll();

        return () => {
            isMountedRef.current = false;
            unbindViewportScroll();
        };
    }, [rebindViewportScroll, unbindViewportScroll]);

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

        const viewport = getRadixScrollAreaViewport(scrollAreaNodeRef.current);
        const committedKey = committedScopeKeyRef.current;
        if (viewport !== null && committedKey !== null) {
            rememberCommittedScrollTop(committedKey, viewport.scrollTop);
        }
    }, [comments, rememberCommittedScrollTop, syncNearBottomFromViewport]);

    const setCommentItemRef = useCallback(
        (commentId: number, node: HTMLElement | null) => {
            if (!isMountedRef.current) {
                return;
            }

            if (node === null) {
                itemNodesRef.current.delete(commentId);
                return;
            }

            itemNodesRef.current.set(commentId, node);
            runPendingScroll();
        },
        [runPendingScroll]
    );

    useLayoutEffect(() => {
        const effectScopeKey = scopeKey;
        const previousScopeKey = prevScopeKeyRef.current;
        const scopeChanged =
            previousScopeKey === null || previousScopeKey !== effectScopeKey;

        const previousIds = prevCommentIdsRef.current;
        const nextIds = getCommentIds(comments);
        const viewport = getRadixScrollAreaViewport(scrollAreaNodeRef.current);

        if (scopeChanged) {
            // Outgoing cleanup already captured under the previous key.
            if (
                previousScopeKey !== null &&
                discussionScrollScopeDiagramNamespace(previousScopeKey) !==
                    discussionScrollScopeDiagramNamespace(effectScopeKey)
            ) {
                scopeScrollTopRef.current.clear();
                liveScrollTopRef.current = 0;
                hasTrustedLiveScrollTopRef.current = false;
            }

            pendingScrollRef.current = null;
            prevCommentIdsRef.current = nextIds;
            prevScopeKeyRef.current = effectScopeKey;

            if (
                scrollIntent !== null &&
                scrollIntent.generation > lastConsumedGenerationRef.current
            ) {
                lastConsumedGenerationRef.current = scrollIntent.generation;
            }

            if (scrollToLatestOnOpen && nextIds.length > 0) {
                isNearBottomRef.current = true;
                pendingScrollRef.current = {
                    mode: 'latest',
                    behavior: 'auto',
                };
            } else if (!scrollToLatestOnOpen) {
                const storedScrollTop =
                    scopeScrollTopRef.current.get(effectScopeKey);
                if (viewport !== null && storedScrollTop !== undefined) {
                    viewport.scrollTop = storedScrollTop;
                    rememberCommittedScrollTop(effectScopeKey, storedScrollTop);
                }
                syncNearBottomFromViewport();
            } else {
                isNearBottomRef.current = true;
            }
        } else if (
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
        } else {
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
                    pending?.mode === 'comment' &&
                    pending.commentId === nextLastId;

                if (!alreadyPendingTarget) {
                    pendingScrollRef.current = {
                        mode: 'comment',
                        commentId: nextLastId,
                        behavior: 'smooth',
                        block: 'end',
                    };
                }
            } else if (removedIds.length > 0 && !appendedNewLatest) {
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
            }

            // Same-scope content may have clamped the viewport; adopt it now
            // so trusted live matches committed geometry after the guard.
            if (viewport !== null && hasTrustedLiveScrollTopRef.current) {
                rememberCommittedScrollTop(effectScopeKey, viewport.scrollTop);
            }
        }

        committedScopeKeyRef.current = effectScopeKey;
        // Rebind after cleanup unbind (and after Strict Mode useEffect replay).
        rebindViewportScroll();
        runPendingScroll();

        return () => {
            // Capture under this effect's closed-over outgoing key, then detach
            // the listener so post-cleanup transitional events cannot write.
            // Do not clear pendingScrollRef: Strict Mode replays cleanup before
            // setup, and deferred item-ref flushes still need the queued work.
            captureOutgoingPosition(effectScopeKey);
            unbindViewportScroll();
        };
    }, [
        captureOutgoingPosition,
        comments,
        rebindViewportScroll,
        rememberCommittedScrollTop,
        runPendingScroll,
        scopeKey,
        scrollIntent,
        scrollToLatestOnOpen,
        syncNearBottomFromViewport,
        unbindViewportScroll,
    ]);

    return {
        scrollAreaRef,
        setCommentItemRef,
    };
};
