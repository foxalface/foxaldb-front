import type { CommentsState } from './comment-reducer';

/**
 * Derived presence metadata for an entity that may host a discussion.
 * `hasDiscussion` is the sole UI visibility predicate (`commentCount > 0`).
 */
export interface DiscussionIndicator {
    readonly commentCount: number;
    readonly hasDiscussion: boolean;
}

/**
 * Partitioned O(1) lookup index for entity discussion indicators.
 * Diagram-level comments are intentionally excluded from all three maps.
 *
 * Maps are treated as immutable by contract: callers must never mutate them.
 * JavaScript `Map` cannot be deeply frozen without wrapping; do not expose
 * write access through public APIs.
 */
export interface DiscussionIndicatorIndex {
    readonly tables: ReadonlyMap<string, DiscussionIndicator>;
    readonly fields: ReadonlyMap<string, DiscussionIndicator>;
    readonly relationships: ReadonlyMap<string, DiscussionIndicator>;
}

export type DiscussionIndicatorEntityType = 'table' | 'field' | 'relationship';

export const EMPTY_DISCUSSION_INDICATOR: DiscussionIndicator = Object.freeze({
    commentCount: 0,
    hasDiscussion: false,
});

const EMPTY_TABLES: ReadonlyMap<string, DiscussionIndicator> = new Map();
const EMPTY_FIELDS: ReadonlyMap<string, DiscussionIndicator> = new Map();
const EMPTY_RELATIONSHIPS: ReadonlyMap<string, DiscussionIndicator> = new Map();

/**
 * Stable empty index shared when inactive, when `byId` is empty, or when
 * comments exist only at the diagram level (no entity entries).
 */
export const EMPTY_DISCUSSION_INDICATOR_INDEX: DiscussionIndicatorIndex =
    Object.freeze({
        tables: EMPTY_TABLES,
        fields: EMPTY_FIELDS,
        relationships: EMPTY_RELATIONSHIPS,
    });

const createIndicator = (commentCount: number): DiscussionIndicator =>
    Object.freeze({
        commentCount,
        hasDiscussion: commentCount > 0,
    });

const toIndicatorMap = (
    counts: Map<string, number>
): ReadonlyMap<string, DiscussionIndicator> => {
    const result = new Map<string, DiscussionIndicator>();

    for (const [targetId, commentCount] of counts) {
        result.set(targetId, createIndicator(commentCount));
    }

    return result;
};

/**
 * Builds a partitioned indicator index in a single O(C) pass over `state.byId`.
 * Absent targets have no map entry; stored entries always have `hasDiscussion: true`.
 */
export const selectDiscussionIndicatorIndex = (
    state: Pick<CommentsState, 'byId'>
): DiscussionIndicatorIndex => {
    if (state.byId.size === 0) {
        return EMPTY_DISCUSSION_INDICATOR_INDEX;
    }

    const tableCounts = new Map<string, number>();
    const fieldCounts = new Map<string, number>();
    const relationshipCounts = new Map<string, number>();

    for (const comment of state.byId.values()) {
        const { targetType, targetId } = comment;

        if (targetType === 'diagram' || targetId === null) {
            continue;
        }

        switch (targetType) {
            case 'table':
                tableCounts.set(targetId, (tableCounts.get(targetId) ?? 0) + 1);
                break;
            case 'field':
                fieldCounts.set(targetId, (fieldCounts.get(targetId) ?? 0) + 1);
                break;
            case 'relationship':
                relationshipCounts.set(
                    targetId,
                    (relationshipCounts.get(targetId) ?? 0) + 1
                );
                break;
            default: {
                const _exhaustive: never = targetType;
                void _exhaustive;
                break;
            }
        }
    }

    if (
        tableCounts.size === 0 &&
        fieldCounts.size === 0 &&
        relationshipCounts.size === 0
    ) {
        return EMPTY_DISCUSSION_INDICATOR_INDEX;
    }

    return Object.freeze({
        tables:
            tableCounts.size === 0 ? EMPTY_TABLES : toIndicatorMap(tableCounts),
        fields:
            fieldCounts.size === 0 ? EMPTY_FIELDS : toIndicatorMap(fieldCounts),
        relationships:
            relationshipCounts.size === 0
                ? EMPTY_RELATIONSHIPS
                : toIndicatorMap(relationshipCounts),
    });
};

/**
 * Shared O(1) lookup used by the specialized indicator hooks.
 * Missing targets return the stable {@link EMPTY_DISCUSSION_INDICATOR}.
 */
export const getDiscussionIndicator = (
    index: DiscussionIndicatorIndex,
    targetType: DiscussionIndicatorEntityType,
    targetId: string
): DiscussionIndicator => {
    let map: ReadonlyMap<string, DiscussionIndicator>;

    switch (targetType) {
        case 'table':
            map = index.tables;
            break;
        case 'field':
            map = index.fields;
            break;
        case 'relationship':
            map = index.relationships;
            break;
        default: {
            const _exhaustive: never = targetType;
            return _exhaustive;
        }
    }

    return map.get(targetId) ?? EMPTY_DISCUSSION_INDICATOR;
};
