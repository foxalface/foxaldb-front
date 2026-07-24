import type {
    DiagramComment,
    DiagramCommentTarget,
} from '@/lib/comments/comment-types';

/** Distance from the bottom (px) treated as "near bottom" for stick-to-latest. */
export const DISCUSSION_SCROLL_NEAR_BOTTOM_PX = 80;

/**
 * Mirrors layout `DiscussionView` without importing the layout context into
 * the comments lib layer.
 */
export type DiscussionScrollView = 'all' | 'diagram' | 'target';

/**
 * Narrow, target-oriented navigation intent.
 *
 * Not a CRUD event bus. Reasons describe why a specific comment should be
 * brought into view when that cannot be inferred from list transitions alone.
 * `generation` allows repeating navigation to the same comment ID.
 */
export type DiscussionScrollReason = 'local-create' | 'explicit-navigation';

export interface DiscussionScrollIntent {
    readonly targetCommentId: number;
    readonly reason: DiscussionScrollReason;
    readonly generation: number;
}

/**
 * Stable key for the active discussion scope. Scroll state must never leak
 * across different keys.
 */
export const buildDiscussionScrollScopeKey = (
    view: DiscussionScrollView,
    target: DiagramCommentTarget
): string => {
    if (view === 'all') {
        return 'all';
    }

    if (view === 'diagram' || target.targetType === 'diagram') {
        return 'diagram';
    }

    return `target:${target.targetType}:${target.targetId}`;
};

/**
 * Whether opening this view should scroll to the latest comment.
 * "All discussions" preserves scroll and must not jump to the bottom.
 */
export const shouldScrollToLatestOnOpen = (
    view: DiscussionScrollView
): boolean => view === 'diagram' || view === 'target';

export const isScrollNearBottom = (
    element: Pick<HTMLElement, 'scrollHeight' | 'scrollTop' | 'clientHeight'>,
    thresholdPx: number = DISCUSSION_SCROLL_NEAR_BOTTOM_PX
): boolean => {
    const distanceFromBottom =
        element.scrollHeight - element.scrollTop - element.clientHeight;
    return distanceFromBottom <= thresholdPx;
};

export const getLatestCommentId = (
    comments: ReadonlyArray<Pick<DiagramComment, 'id'>>
): number | null => {
    if (comments.length === 0) {
        return null;
    }

    return comments[comments.length - 1]?.id ?? null;
};

export const getCommentIds = (
    comments: ReadonlyArray<Pick<DiagramComment, 'id'>>
): ReadonlyArray<number> => comments.map((comment) => comment.id);

/**
 * IDs present in `previousIds` but absent from `nextIds`, preserving previous
 * order. Does not mutate inputs.
 */
export const findRemovedCommentIds = (
    previousIds: ReadonlyArray<number>,
    nextIds: ReadonlyArray<number>
): ReadonlyArray<number> => {
    if (previousIds.length === 0) {
        return [];
    }

    const nextSet = new Set(nextIds);
    return previousIds.filter((id) => !nextSet.has(id));
};

export const findScrollAnchorAfterDelete = (
    previousIds: ReadonlyArray<number>,
    deletedId: number,
    remainingIds: ReadonlySet<number>
): number | null => {
    const index = previousIds.indexOf(deletedId);
    if (index === -1) {
        return remainingIds.size > 0
            ? (previousIds.find((id) => remainingIds.has(id)) ?? null)
            : null;
    }

    for (let i = index - 1; i >= 0; i -= 1) {
        const candidate = previousIds[i];
        if (candidate !== undefined && remainingIds.has(candidate)) {
            return candidate;
        }
    }

    for (let i = index + 1; i < previousIds.length; i += 1) {
        const candidate = previousIds[i];
        if (candidate !== undefined && remainingIds.has(candidate)) {
            return candidate;
        }
    }

    return null;
};

export const getRadixScrollAreaViewport = (
    root: ParentNode | null
): HTMLElement | null => {
    if (root === null) {
        return null;
    }

    const viewport = root.querySelector('[data-radix-scroll-area-viewport]');
    return viewport instanceof HTMLElement ? viewport : null;
};
