import { describe, expect, it } from 'vitest';
import type {
    DiagramComment,
    DiagramCommentTarget,
} from '@/lib/comments/comment-types';
import {
    DISCUSSION_SCROLL_NEAR_BOTTOM_PX,
    buildDiscussionScrollScopeKey,
    discussionScrollScopeDiagramNamespace,
    findRemovedCommentIds,
    findScrollAnchorAfterDelete,
    getCommentIds,
    getLatestCommentId,
    getRadixScrollAreaViewport,
    isScrollNearBottom,
    shouldScrollToLatestOnOpen,
    type DiscussionScrollView,
} from '@/lib/comments/discussion-scroll';

describe('discussion-scroll helpers', () => {
    describe('buildDiscussionScrollScopeKey', () => {
        const diagramTarget: DiagramCommentTarget = {
            targetType: 'diagram',
            targetId: null,
        };

        it('uses a diagram-namespaced key for the all view', () => {
            expect(
                buildDiscussionScrollScopeKey(
                    'all',
                    {
                        targetType: 'table',
                        targetId: 't1',
                    },
                    42
                )
            ).toBe('42:all');
            expect(
                buildDiscussionScrollScopeKey('all', diagramTarget, '84')
            ).toBe('84:all');
        });

        it('uses a diagram-namespaced key for diagram view', () => {
            expect(
                buildDiscussionScrollScopeKey('diagram', diagramTarget, 42)
            ).toBe('42:diagram');
        });

        it('partitions target scopes by type and id', () => {
            expect(
                buildDiscussionScrollScopeKey(
                    'target',
                    {
                        targetType: 'table',
                        targetId: 't1',
                    },
                    42
                )
            ).toBe('42:target:table:t1');
            expect(
                buildDiscussionScrollScopeKey(
                    'target',
                    {
                        targetType: 'field',
                        targetId: 'f1',
                    },
                    42
                )
            ).toBe('42:target:field:f1');
            expect(
                buildDiscussionScrollScopeKey(
                    'target',
                    {
                        targetType: 'relationship',
                        targetId: 'r1',
                    },
                    42
                )
            ).toBe('42:target:relationship:r1');
        });

        it('does not leak table scroll state into field scopes', () => {
            const tableKey = buildDiscussionScrollScopeKey(
                'target',
                {
                    targetType: 'table',
                    targetId: 'same-id',
                },
                42
            );
            const fieldKey = buildDiscussionScrollScopeKey(
                'target',
                {
                    targetType: 'field',
                    targetId: 'same-id',
                },
                42
            );
            expect(tableKey).not.toBe(fieldKey);
        });

        it('does not share All keys across diagrams', () => {
            expect(
                buildDiscussionScrollScopeKey('all', diagramTarget, 42)
            ).not.toBe(buildDiscussionScrollScopeKey('all', diagramTarget, 84));
        });

        it('uses a placeholder namespace when diagramId is null', () => {
            expect(
                buildDiscussionScrollScopeKey('all', diagramTarget, null)
            ).toBe('_:all');
        });
    });

    describe('discussionScrollScopeDiagramNamespace', () => {
        it('reads the diagram namespace from a scope key', () => {
            expect(discussionScrollScopeDiagramNamespace('42:all')).toBe('42');
            expect(
                discussionScrollScopeDiagramNamespace('84:target:table:t1')
            ).toBe('84');
        });
    });

    describe('shouldScrollToLatestOnOpen', () => {
        it.each([
            ['diagram', true],
            ['target', true],
            ['all', false],
        ] as const satisfies ReadonlyArray<
            readonly [DiscussionScrollView, boolean]
        >)('%s → %s', (view, expected) => {
            expect(shouldScrollToLatestOnOpen(view)).toBe(expected);
        });
    });

    describe('isScrollNearBottom', () => {
        it('returns true at the bottom', () => {
            expect(
                isScrollNearBottom({
                    scrollHeight: 1000,
                    scrollTop: 900,
                    clientHeight: 100,
                })
            ).toBe(true);
        });

        it('returns true within the threshold', () => {
            expect(
                isScrollNearBottom(
                    {
                        scrollHeight: 1000,
                        scrollTop: 820,
                        clientHeight: 100,
                    },
                    DISCUSSION_SCROLL_NEAR_BOTTOM_PX
                )
            ).toBe(true);
        });

        it('returns false when scrolled upward beyond the threshold', () => {
            expect(
                isScrollNearBottom({
                    scrollHeight: 1000,
                    scrollTop: 100,
                    clientHeight: 100,
                })
            ).toBe(false);
        });
    });

    describe('getLatestCommentId / getCommentIds', () => {
        it('returns null for an empty list', () => {
            expect(getLatestCommentId([])).toBeNull();
            expect(getCommentIds([])).toEqual([]);
        });

        it('returns the last comment id in chronological order', () => {
            const comments: ReadonlyArray<Pick<DiagramComment, 'id'>> = [
                { id: 1 },
                { id: 7 },
                { id: 3 },
            ];
            expect(getLatestCommentId(comments)).toBe(3);
            expect(getCommentIds(comments)).toEqual([1, 7, 3]);
        });

        it('does not mutate the input array', () => {
            const comments = [{ id: 1 }, { id: 2 }];
            const frozen = Object.freeze([...comments]);
            expect(getCommentIds(frozen)).toEqual([1, 2]);
            expect(frozen).toEqual([{ id: 1 }, { id: 2 }]);
        });
    });

    describe('findRemovedCommentIds', () => {
        it('returns removed ids in previous order', () => {
            expect(findRemovedCommentIds([1, 2, 3], [1, 3])).toEqual([2]);
            expect(findRemovedCommentIds([1, 2, 3], [3])).toEqual([1, 2]);
        });

        it('returns an empty array when nothing was removed', () => {
            expect(findRemovedCommentIds([1, 2], [1, 2, 3])).toEqual([]);
            expect(findRemovedCommentIds([], [1])).toEqual([]);
        });

        it('does not mutate inputs', () => {
            const previous = Object.freeze([1, 2, 3]);
            const next = Object.freeze([1, 3]);
            expect(findRemovedCommentIds(previous, next)).toEqual([2]);
            expect(previous).toEqual([1, 2, 3]);
            expect(next).toEqual([1, 3]);
        });
    });

    describe('findScrollAnchorAfterDelete', () => {
        it('prefers the previous neighbor for a middle delete', () => {
            expect(
                findScrollAnchorAfterDelete([1, 2, 3], 2, new Set([1, 3]))
            ).toBe(1);
        });

        it('falls back to the next neighbor when deleting the first', () => {
            expect(
                findScrollAnchorAfterDelete([1, 2, 3], 1, new Set([2, 3]))
            ).toBe(2);
        });

        it('anchors to the previous neighbor when deleting the last', () => {
            expect(
                findScrollAnchorAfterDelete([1, 2, 3], 3, new Set([1, 2]))
            ).toBe(2);
        });

        it('returns null when the list becomes empty', () => {
            expect(findScrollAnchorAfterDelete([5], 5, new Set())).toBeNull();
        });
    });

    describe('getRadixScrollAreaViewport', () => {
        it('returns null for a null root', () => {
            expect(getRadixScrollAreaViewport(null)).toBeNull();
        });

        it('finds the radix viewport element', () => {
            const root = document.createElement('div');
            const viewport = document.createElement('div');
            viewport.setAttribute('data-radix-scroll-area-viewport', '');
            root.appendChild(viewport);
            expect(getRadixScrollAreaViewport(root)).toBe(viewport);
        });
    });
});
