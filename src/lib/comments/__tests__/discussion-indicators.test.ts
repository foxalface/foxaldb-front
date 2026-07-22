import { describe, expect, it } from 'vitest';
import {
    commentsReducer,
    initialCommentsState,
    type CommentsState,
} from '../comment-reducer';
import type { DiagramComment } from '../comment-types';
import {
    EMPTY_DISCUSSION_INDICATOR,
    EMPTY_DISCUSSION_INDICATOR_INDEX,
    getDiscussionIndicator,
    selectDiscussionIndicatorIndex,
} from '../discussion-indicators';

const comment = (
    overrides: Partial<DiagramComment> & Pick<DiagramComment, 'id'>
): DiagramComment => ({
    diagramId: 42,
    targetType: 'diagram',
    targetId: null,
    body: `body-${overrides.id}`,
    user: { id: 1, name: 'Alice' },
    createdAt: `2026-01-0${overrides.id}T10:00:00.000Z`,
    updatedAt: `2026-01-0${overrides.id}T10:00:00.000Z`,
    ...overrides,
});

const loadSucceeded = (
    state: CommentsState,
    comments: DiagramComment[],
    diagramId = '42',
    generation = 1
): CommentsState =>
    commentsReducer(
        commentsReducer(state, {
            type: 'LOAD_STARTED',
            diagramId,
            generation,
        }),
        {
            type: 'LOAD_SUCCEEDED',
            diagramId,
            generation,
            comments,
        }
    );

describe('selectDiscussionIndicatorIndex', () => {
    it('returns the stable empty index for an empty state', () => {
        const index = selectDiscussionIndicatorIndex(initialCommentsState());

        expect(index).toBe(EMPTY_DISCUSSION_INDICATOR_INDEX);
        expect(index.tables.size).toBe(0);
        expect(index.fields.size).toBe(0);
        expect(index.relationships.size).toBe(0);
    });

    it('returns the stable empty index for diagram-only comments', () => {
        const state = loadSucceeded(initialCommentsState(), [
            comment({ id: 1 }),
            comment({ id: 2, body: 'another diagram' }),
        ]);

        expect(selectDiscussionIndicatorIndex(state)).toBe(
            EMPTY_DISCUSSION_INDICATOR_INDEX
        );
    });

    it('indexes one table comment', () => {
        const state = loadSucceeded(initialCommentsState(), [
            comment({ id: 1, targetType: 'table', targetId: 't1' }),
        ]);

        const index = selectDiscussionIndicatorIndex(state);
        const indicator = index.tables.get('t1');

        expect(indicator).toEqual({
            commentCount: 1,
            hasDiscussion: true,
        });
        expect(index.fields.size).toBe(0);
        expect(index.relationships.size).toBe(0);
    });

    it('increments count for multiple comments on the same table', () => {
        const state = loadSucceeded(initialCommentsState(), [
            comment({ id: 1, targetType: 'table', targetId: 't1' }),
            comment({ id: 2, targetType: 'table', targetId: 't1' }),
            comment({ id: 3, targetType: 'table', targetId: 't1' }),
        ]);

        expect(selectDiscussionIndicatorIndex(state).tables.get('t1')).toEqual({
            commentCount: 3,
            hasDiscussion: true,
        });
    });

    it('indexes multiple table targets independently', () => {
        const state = loadSucceeded(initialCommentsState(), [
            comment({ id: 1, targetType: 'table', targetId: 't1' }),
            comment({ id: 2, targetType: 'table', targetId: 't2' }),
            comment({ id: 3, targetType: 'table', targetId: 't1' }),
        ]);

        const index = selectDiscussionIndicatorIndex(state);

        expect(index.tables.get('t1')?.commentCount).toBe(2);
        expect(index.tables.get('t2')?.commentCount).toBe(1);
        expect(index.tables.has('missing')).toBe(false);
    });

    it('indexes field comments', () => {
        const state = loadSucceeded(initialCommentsState(), [
            comment({ id: 1, targetType: 'field', targetId: 'f1' }),
            comment({ id: 2, targetType: 'field', targetId: 'f1' }),
        ]);

        const index = selectDiscussionIndicatorIndex(state);

        expect(index.fields.get('f1')).toEqual({
            commentCount: 2,
            hasDiscussion: true,
        });
        expect(index.tables.size).toBe(0);
    });

    it('indexes relationship comments', () => {
        const state = loadSucceeded(initialCommentsState(), [
            comment({ id: 1, targetType: 'relationship', targetId: 'r1' }),
        ]);

        expect(
            selectDiscussionIndicatorIndex(state).relationships.get('r1')
        ).toEqual({
            commentCount: 1,
            hasDiscussion: true,
        });
    });

    it('indexes all three entity kinds together and keeps exact counts', () => {
        const state = loadSucceeded(initialCommentsState(), [
            comment({ id: 1, targetType: 'diagram', targetId: null }),
            comment({ id: 2, targetType: 'table', targetId: 't1' }),
            comment({ id: 3, targetType: 'table', targetId: 't1' }),
            comment({ id: 4, targetType: 'field', targetId: 'f1' }),
            comment({ id: 5, targetType: 'relationship', targetId: 'r1' }),
            comment({ id: 6, targetType: 'relationship', targetId: 'r1' }),
            comment({ id: 7, targetType: 'relationship', targetId: 'r2' }),
        ]);

        const index = selectDiscussionIndicatorIndex(state);

        expect(index.tables.get('t1')?.commentCount).toBe(2);
        expect(index.fields.get('f1')?.commentCount).toBe(1);
        expect(index.relationships.get('r1')?.commentCount).toBe(2);
        expect(index.relationships.get('r2')?.commentCount).toBe(1);
    });

    it('stores hasDiscussion true and never stores zero-count entries', () => {
        const state = loadSucceeded(initialCommentsState(), [
            comment({ id: 1, targetType: 'table', targetId: 't1' }),
        ]);

        const index = selectDiscussionIndicatorIndex(state);

        for (const map of [index.tables, index.fields, index.relationships]) {
            for (const indicator of map.values()) {
                expect(indicator.commentCount).toBeGreaterThan(0);
                expect(indicator.hasDiscussion).toBe(true);
            }
        }

        expect(index.tables.has('absent')).toBe(false);
    });

    it('follows reducer duplicate-id semantics before selecting', () => {
        const state = loadSucceeded(initialCommentsState(), [
            comment({
                id: 1,
                targetType: 'table',
                targetId: 't1',
                body: 'first',
            }),
            comment({
                id: 1,
                targetType: 'table',
                targetId: 't2',
                body: 'second',
            }),
        ]);

        expect(state.byId.size).toBe(1);
        expect(state.byId.get(1)?.targetId).toBe('t2');

        const index = selectDiscussionIndicatorIndex(state);

        expect(index.tables.has('t1')).toBe(false);
        expect(index.tables.get('t2')?.commentCount).toBe(1);
    });

    it('decrements count when one of several comments is deleted', () => {
        let state = loadSucceeded(initialCommentsState(), [
            comment({ id: 1, targetType: 'table', targetId: 't1' }),
            comment({ id: 2, targetType: 'table', targetId: 't1' }),
            comment({ id: 3, targetType: 'table', targetId: 't1' }),
        ]);

        state = commentsReducer(state, {
            type: 'COMMENT_REMOVED',
            commentId: 2,
        });

        expect(selectDiscussionIndicatorIndex(state).tables.get('t1')).toEqual({
            commentCount: 2,
            hasDiscussion: true,
        });
    });

    it('removes the entry when the last comment for a target is deleted', () => {
        let state = loadSucceeded(initialCommentsState(), [
            comment({ id: 1, targetType: 'field', targetId: 'f1' }),
        ]);

        state = commentsReducer(state, {
            type: 'COMMENT_REMOVED',
            commentId: 1,
        });

        const index = selectDiscussionIndicatorIndex(state);

        expect(index).toBe(EMPTY_DISCUSSION_INDICATOR_INDEX);
        expect(index.fields.has('f1')).toBe(false);
    });

    it('load replacement removes stale target entries', () => {
        const initial = loadSucceeded(initialCommentsState(), [
            comment({ id: 1, targetType: 'table', targetId: 'old' }),
            comment({ id: 2, targetType: 'field', targetId: 'stale' }),
        ]);

        const replaced = commentsReducer(initial, {
            type: 'LOAD_SUCCEEDED',
            diagramId: '42',
            generation: 1,
            comments: [
                comment({ id: 3, targetType: 'table', targetId: 'new' }),
            ],
        });

        const index = selectDiscussionIndicatorIndex(replaced);

        expect(index.tables.has('old')).toBe(false);
        expect(index.fields.has('stale')).toBe(false);
        expect(index.tables.get('new')?.commentCount).toBe(1);
    });

    it('body edit keeps the count and hasDiscussion semantics', () => {
        let state = loadSucceeded(initialCommentsState(), [
            comment({
                id: 1,
                targetType: 'relationship',
                targetId: 'r1',
                body: 'before',
            }),
            comment({
                id: 2,
                targetType: 'relationship',
                targetId: 'r1',
                body: 'other',
            }),
        ]);

        const before =
            selectDiscussionIndicatorIndex(state).relationships.get('r1');

        state = commentsReducer(state, {
            type: 'COMMENT_UPSERTED',
            comment: comment({
                id: 1,
                targetType: 'relationship',
                targetId: 'r1',
                body: 'after',
            }),
        });

        const after =
            selectDiscussionIndicatorIndex(state).relationships.get('r1');

        expect(before).toEqual({ commentCount: 2, hasDiscussion: true });
        expect(after).toEqual({ commentCount: 2, hasDiscussion: true });
    });

    it('does not mutate input state or comments', () => {
        const fixture = comment({
            id: 1,
            targetType: 'table',
            targetId: 't1',
        });
        const state = loadSucceeded(initialCommentsState(), [fixture]);
        const byIdBefore = state.byId;
        const sizeBefore = state.byId.size;
        const bodyBefore = fixture.body;

        selectDiscussionIndicatorIndex(state);

        expect(state.byId).toBe(byIdBefore);
        expect(state.byId.size).toBe(sizeBefore);
        expect(fixture.body).toBe(bodyBefore);
        expect(state.byId.get(1)).toBe(fixture);
    });

    it('isolates table and field partitions when IDs collide', () => {
        const state = loadSucceeded(initialCommentsState(), [
            comment({ id: 1, targetType: 'table', targetId: 'same' }),
            comment({ id: 2, targetType: 'field', targetId: 'same' }),
            comment({ id: 3, targetType: 'field', targetId: 'same' }),
        ]);

        const index = selectDiscussionIndicatorIndex(state);

        expect(index.tables.get('same')?.commentCount).toBe(1);
        expect(index.fields.get('same')?.commentCount).toBe(2);
        expect(index.relationships.has('same')).toBe(false);
    });

    it('isolates relationship and table partitions when IDs collide', () => {
        const state = loadSucceeded(initialCommentsState(), [
            comment({ id: 1, targetType: 'table', targetId: 'shared' }),
            comment({
                id: 2,
                targetType: 'relationship',
                targetId: 'shared',
            }),
        ]);

        const index = selectDiscussionIndicatorIndex(state);

        expect(index.tables.get('shared')?.commentCount).toBe(1);
        expect(index.relationships.get('shared')?.commentCount).toBe(1);
    });

    it('keeps empty-string target IDs partition-scoped without collision', () => {
        const state = loadSucceeded(initialCommentsState(), [
            comment({ id: 1, targetType: 'table', targetId: '' }),
            comment({ id: 2, targetType: 'field', targetId: '' }),
            comment({ id: 3, targetType: 'relationship', targetId: '' }),
            comment({ id: 4, targetType: 'table', targetId: '' }),
        ]);

        const index = selectDiscussionIndicatorIndex(state);

        expect(index.tables.get('')?.commentCount).toBe(2);
        expect(index.fields.get('')?.commentCount).toBe(1);
        expect(index.relationships.get('')?.commentCount).toBe(1);
    });
});

describe('getDiscussionIndicator', () => {
    it('returns the stable empty indicator for missing targets', () => {
        const first = getDiscussionIndicator(
            EMPTY_DISCUSSION_INDICATOR_INDEX,
            'table',
            'missing'
        );
        const second = getDiscussionIndicator(
            EMPTY_DISCUSSION_INDICATOR_INDEX,
            'field',
            'missing'
        );

        expect(first).toBe(EMPTY_DISCUSSION_INDICATOR);
        expect(second).toBe(EMPTY_DISCUSSION_INDICATOR);
        expect(first).toBe(second);
    });

    it('returns the stored indicator for a present target', () => {
        const state = loadSucceeded(initialCommentsState(), [
            comment({ id: 1, targetType: 'table', targetId: 't1' }),
        ]);
        const index = selectDiscussionIndicatorIndex(state);

        expect(getDiscussionIndicator(index, 'table', 't1')).toBe(
            index.tables.get('t1')
        );
        expect(getDiscussionIndicator(index, 'field', 't1')).toBe(
            EMPTY_DISCUSSION_INDICATOR
        );
    });
});
