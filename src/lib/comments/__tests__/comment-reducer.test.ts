import { describe, expect, it } from 'vitest';
import {
    commentsReducer,
    initialCommentsState,
    type CommentsState,
} from '../comment-reducer';
import {
    EMPTY_COMMENTS,
    selectAllComments,
    selectCommentById,
    selectCommentsForTarget,
} from '../comment-selectors';
import type { DiagramComment } from '../comment-types';

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

describe('commentsReducer', () => {
    it('starts from an idle empty initial state', () => {
        const state = initialCommentsState();

        expect(state).toEqual({
            diagramId: null,
            byId: new Map(),
            status: 'idle',
            error: null,
            loadGeneration: 0,
        });
        expect(state.byId).toBeInstanceOf(Map);
        expect(state.byId.size).toBe(0);
    });

    it('LOAD_SUCCEEDED replaces the map and marks ready', () => {
        const state = loadSucceeded(initialCommentsState(), [
            comment({ id: 2 }),
            comment({ id: 1 }),
        ]);

        expect(state.status).toBe('ready');
        expect(state.diagramId).toBe('42');
        expect(state.error).toBeNull();
        expect(state.loadGeneration).toBe(1);
        expect(state.byId.size).toBe(2);
        expect(state.byId.get(1)).toEqual(comment({ id: 1 }));
        expect(state.byId.get(2)).toEqual(comment({ id: 2 }));
    });

    it('LOAD_SUCCEEDED overwrites previous comments for the same generation', () => {
        const initial = loadSucceeded(initialCommentsState(), [
            comment({ id: 1 }),
            comment({ id: 2 }),
        ]);

        const state = commentsReducer(initial, {
            type: 'LOAD_SUCCEEDED',
            diagramId: '42',
            generation: 1,
            comments: [comment({ id: 3, body: 'only-three' })],
        });

        expect(state.byId.size).toBe(1);
        expect(state.byId.has(1)).toBe(false);
        expect(state.byId.has(2)).toBe(false);
        expect(state.byId.get(3)?.body).toBe('only-three');
    });

    it('LOAD_SUCCEEDED keeps the last duplicate id', () => {
        const first = comment({ id: 1, body: 'first' });
        const second = comment({ id: 1, body: 'second' });

        const state = loadSucceeded(initialCommentsState(), [first, second]);

        expect(state.byId.size).toBe(1);
        expect(state.byId.get(1)?.body).toBe('second');
    });

    it('ignores stale LOAD_SUCCEEDED and LOAD_FAILED responses', () => {
        const loading = commentsReducer(initialCommentsState(), {
            type: 'LOAD_STARTED',
            diagramId: '42',
            generation: 2,
        });

        const afterStaleSuccess = commentsReducer(loading, {
            type: 'LOAD_SUCCEEDED',
            diagramId: '42',
            generation: 1,
            comments: [comment({ id: 1 })],
        });
        const afterStaleFailure = commentsReducer(loading, {
            type: 'LOAD_FAILED',
            diagramId: '42',
            generation: 1,
            error: new Error('stale'),
        });
        const afterWrongDiagram = commentsReducer(loading, {
            type: 'LOAD_SUCCEEDED',
            diagramId: '99',
            generation: 2,
            comments: [comment({ id: 1 })],
        });

        expect(afterStaleSuccess).toBe(loading);
        expect(afterStaleFailure).toBe(loading);
        expect(afterWrongDiagram).toBe(loading);
    });

    it('COMMENT_UPSERTED inserts a new comment', () => {
        const initial = loadSucceeded(initialCommentsState(), [
            comment({ id: 1 }),
        ]);
        const inserted = comment({ id: 2, body: 'new' });

        const state = commentsReducer(initial, {
            type: 'COMMENT_UPSERTED',
            comment: inserted,
        });

        expect(state.byId.size).toBe(2);
        expect(state.byId.get(2)).toEqual(inserted);
        expect(state.byId).not.toBe(initial.byId);
    });

    it('COMMENT_UPSERTED replaces an existing id without knowing the source', () => {
        const initial = loadSucceeded(initialCommentsState(), [
            comment({
                id: 1,
                body: 'old',
                createdAt: '2026-01-01T10:00:00.000Z',
                updatedAt: '2026-01-01T10:00:00.000Z',
            }),
        ]);
        const replaced = comment({
            id: 1,
            body: 'updated',
            createdAt: '2026-01-01T10:00:00.000Z',
            updatedAt: '2026-01-02T10:00:00.000Z',
        });

        const state = commentsReducer(initial, {
            type: 'COMMENT_UPSERTED',
            comment: replaced,
        });

        expect(state.byId.size).toBe(1);
        expect(state.byId.get(1)).toEqual(replaced);
        expect(state.byId.get(1)).not.toBe(initial.byId.get(1));
    });

    it('COMMENT_UPSERTED accepts a comment whose diagramId matches as a string', () => {
        const initial = loadSucceeded(initialCommentsState(), [
            comment({ id: 1 }),
        ]);
        const matching = comment({ id: 2, diagramId: 42, body: 'matched' });

        const state = commentsReducer(initial, {
            type: 'COMMENT_UPSERTED',
            comment: matching,
        });

        expect(state.byId.size).toBe(2);
        expect(state.byId.get(2)).toEqual(matching);
    });

    it('COMMENT_UPSERTED ignores a comment from another diagram', () => {
        const initial = loadSucceeded(initialCommentsState(), [
            comment({ id: 1 }),
        ]);
        const previousMap = initial.byId;

        const state = commentsReducer(initial, {
            type: 'COMMENT_UPSERTED',
            comment: comment({ id: 2, diagramId: 84, body: 'foreign' }),
        });

        expect(state).toBe(initial);
        expect(state.byId).toBe(previousMap);
        expect(state.byId.has(2)).toBe(false);
    });

    it('COMMENT_UPSERTED is ignored when no active diagram is set', () => {
        const initial = initialCommentsState();

        const state = commentsReducer(initial, {
            type: 'COMMENT_UPSERTED',
            comment: comment({ id: 1 }),
        });

        expect(state).toBe(initial);
        expect(state.byId.size).toBe(0);
        expect(state.diagramId).toBeNull();
    });

    it('COMMENT_UPSERTED keeps one entry for duplicate matching HTTP and Echo upserts', () => {
        const initial = loadSucceeded(initialCommentsState(), []);
        const shared = comment({
            id: 5,
            body: 'same',
            createdAt: '2026-07-18T10:00:00.000000Z',
            updatedAt: '2026-07-18T10:00:00.000000Z',
        });

        const afterHttp = commentsReducer(initial, {
            type: 'COMMENT_UPSERTED',
            comment: shared,
        });
        const afterEcho = commentsReducer(afterHttp, {
            type: 'COMMENT_UPSERTED',
            comment: {
                ...shared,
                updatedAt: '2026-07-18T10:00:01.000000Z',
            },
        });

        expect(afterEcho.byId.size).toBe(1);
        expect(afterEcho.byId.get(5)?.body).toBe('same');
        expect(afterEcho.byId.get(5)?.updatedAt).toBe(
            '2026-07-18T10:00:01.000000Z'
        );
    });

    it('COMMENT_REMOVED deletes an existing comment', () => {
        const initial = loadSucceeded(initialCommentsState(), [
            comment({ id: 1 }),
            comment({ id: 2 }),
        ]);

        const state = commentsReducer(initial, {
            type: 'COMMENT_REMOVED',
            commentId: 1,
        });

        expect(state.byId.size).toBe(1);
        expect(state.byId.has(1)).toBe(false);
        expect(state.byId.get(2)).toEqual(comment({ id: 2 }));
        expect(state.byId).not.toBe(initial.byId);
    });

    it('COMMENT_REMOVED is a no-op for a missing id', () => {
        const initial = loadSucceeded(initialCommentsState(), [
            comment({ id: 1 }),
        ]);

        const state = commentsReducer(initial, {
            type: 'COMMENT_REMOVED',
            commentId: 99,
        });

        expect(state).toBe(initial);
    });

    it('RESET returns the idle empty state', () => {
        const initial = loadSucceeded(initialCommentsState(), [
            comment({ id: 1 }),
        ]);

        const state = commentsReducer(initial, { type: 'RESET' });

        expect(state).toEqual(initialCommentsState());
        expect(state).not.toBe(initial);
    });

    it('RESET is a no-op when already idle and empty', () => {
        const initial = initialCommentsState();
        const state = commentsReducer(initial, { type: 'RESET' });

        expect(state).toBe(initial);
    });

    it('does not mutate the previous byId map', () => {
        const initial = loadSucceeded(initialCommentsState(), [
            comment({ id: 1, body: 'original' }),
        ]);
        const previousMap = initial.byId;
        const previousComment = initial.byId.get(1);

        commentsReducer(initial, {
            type: 'COMMENT_UPSERTED',
            comment: comment({ id: 1, body: 'changed' }),
        });
        commentsReducer(initial, {
            type: 'COMMENT_REMOVED',
            commentId: 1,
        });
        commentsReducer(initial, {
            type: 'LOAD_SUCCEEDED',
            diagramId: '42',
            generation: 1,
            comments: [comment({ id: 2 })],
        });

        expect(previousMap.size).toBe(1);
        expect(previousMap.get(1)).toBe(previousComment);
        expect(previousComment?.body).toBe('original');
    });
});

describe('comment selectors', () => {
    it('selectAllComments orders by createdAt ASC then id ASC', () => {
        const state = loadSucceeded(initialCommentsState(), [
            comment({
                id: 3,
                createdAt: '2026-01-02T10:00:00.000Z',
            }),
            comment({
                id: 1,
                createdAt: '2026-01-01T10:00:00.000Z',
            }),
            comment({
                id: 4,
                createdAt: '2026-01-02T10:00:00.000Z',
            }),
            comment({
                id: 2,
                createdAt: '2026-01-01T10:00:00.000Z',
            }),
        ]);

        expect(selectAllComments(state).map((item) => item.id)).toEqual([
            1, 2, 3, 4,
        ]);
    });

    it('orders equivalent HTTP and realtime timestamps by id ASC', () => {
        const state = loadSucceeded(initialCommentsState(), [
            comment({
                id: 2,
                createdAt: '2026-07-18T10:00:00+00:00',
            }),
            comment({
                id: 1,
                createdAt: '2026-07-18T10:00:00.000000Z',
            }),
        ]);

        expect(selectAllComments(state).map((item) => item.id)).toEqual([1, 2]);
    });

    it('orders by parsed timezone offsets chronologically', () => {
        const state = loadSucceeded(initialCommentsState(), [
            comment({
                id: 2,
                createdAt: '2026-07-18T10:00:01Z',
            }),
            comment({
                id: 1,
                createdAt: '2026-07-18T12:00:00+02:00',
            }),
        ]);

        expect(selectAllComments(state).map((item) => item.id)).toEqual([1, 2]);
    });

    it('uses a deterministic invalid-timestamp fallback without throwing', () => {
        const state = loadSucceeded(initialCommentsState(), [
            comment({
                id: 3,
                createdAt: 'not-a-date-b',
            }),
            comment({
                id: 1,
                createdAt: '2026-07-18T10:00:00.000Z',
            }),
            comment({
                id: 2,
                createdAt: 'not-a-date-a',
            }),
            comment({
                id: 4,
                createdAt: 'not-a-date-a',
            }),
        ]);

        expect(() => selectAllComments(state)).not.toThrow();
        expect(selectAllComments(state).map((item) => item.id)).toEqual([
            1, 2, 4, 3,
        ]);
    });

    it('updating body does not reorder comments', () => {
        const state = loadSucceeded(initialCommentsState(), [
            comment({
                id: 1,
                body: 'first',
                createdAt: '2026-01-01T10:00:00.000Z',
                updatedAt: '2026-01-01T10:00:00.000Z',
            }),
            comment({
                id: 2,
                body: 'second',
                createdAt: '2026-01-02T10:00:00.000Z',
                updatedAt: '2026-01-02T10:00:00.000Z',
            }),
        ]);

        const updated = commentsReducer(state, {
            type: 'COMMENT_UPSERTED',
            comment: comment({
                id: 1,
                body: 'first-edited',
                createdAt: '2026-01-01T10:00:00.000Z',
                updatedAt: '2026-01-03T10:00:00.000Z',
            }),
        });

        expect(selectAllComments(updated).map((item) => item.id)).toEqual([
            1, 2,
        ]);
        expect(selectAllComments(updated)[0]?.body).toBe('first-edited');
    });

    it('selectCommentsForTarget filters by target type and id', () => {
        const state = loadSucceeded(initialCommentsState(), [
            comment({
                id: 1,
                targetType: 'table',
                targetId: 'users',
                createdAt: '2026-01-02T10:00:00.000Z',
            }),
            comment({
                id: 2,
                targetType: 'diagram',
                targetId: null,
                createdAt: '2026-01-01T10:00:00.000Z',
            }),
            comment({
                id: 3,
                targetType: 'table',
                targetId: 'posts',
                createdAt: '2026-01-03T10:00:00.000Z',
            }),
            comment({
                id: 4,
                targetType: 'table',
                targetId: 'users',
                createdAt: '2026-01-01T12:00:00.000Z',
            }),
        ]);

        expect(
            selectCommentsForTarget(state, {
                targetType: 'table',
                targetId: 'users',
            }).map((item) => item.id)
        ).toEqual([4, 1]);

        expect(
            selectCommentsForTarget(state, {
                targetType: 'diagram',
                targetId: null,
            }).map((item) => item.id)
        ).toEqual([2]);
    });

    it('selectCommentById looks up a comment or returns undefined', () => {
        const state = loadSucceeded(initialCommentsState(), [
            comment({ id: 7, body: 'found' }),
        ]);

        expect(selectCommentById(state, 7)?.body).toBe('found');
        expect(selectCommentById(state, 99)).toBeUndefined();
    });

    it('returns the shared frozen EMPTY_COMMENTS constant for empty results', () => {
        const empty = initialCommentsState();
        const withOtherTarget = loadSucceeded(initialCommentsState(), [
            comment({
                id: 1,
                targetType: 'table',
                targetId: 'users',
            }),
        ]);

        expect(selectAllComments(empty)).toBe(EMPTY_COMMENTS);
        expect(
            selectCommentsForTarget(empty, {
                targetType: 'diagram',
                targetId: null,
            })
        ).toBe(EMPTY_COMMENTS);
        expect(
            selectCommentsForTarget(withOtherTarget, {
                targetType: 'field',
                targetId: 'users.id',
            })
        ).toBe(EMPTY_COMMENTS);
        expect(Object.isFrozen(EMPTY_COMMENTS)).toBe(true);

        // Narrow cast only to exercise Object.freeze at runtime.
        const mutableView = EMPTY_COMMENTS as DiagramComment[];
        expect(() => {
            mutableView.push(
                comment({
                    id: 99,
                    body: 'should-not-stick',
                })
            );
        }).toThrow();
        expect(EMPTY_COMMENTS).toHaveLength(0);
    });

    it('non-empty selector results are independent arrays', () => {
        const state = loadSucceeded(initialCommentsState(), [
            comment({ id: 1 }),
            comment({ id: 2 }),
        ]);

        const first = selectAllComments(state);
        const second = selectAllComments(state);

        expect(first).not.toBe(second);
        expect(first).not.toBe(EMPTY_COMMENTS);

        const mutableFirst = first as DiagramComment[];
        mutableFirst.reverse();

        expect(selectAllComments(state).map((item) => item.id)).toEqual([1, 2]);
        expect(state.byId.get(1)?.id).toBe(1);
    });

    it('selectors do not mutate state', () => {
        const state = loadSucceeded(initialCommentsState(), [
            comment({
                id: 2,
                createdAt: '2026-01-02T10:00:00.000Z',
            }),
            comment({
                id: 1,
                createdAt: '2026-01-01T10:00:00.000Z',
            }),
        ]);
        const keysBefore = Array.from(state.byId.keys());

        const all = [...selectAllComments(state)];
        all.reverse();

        expect(Array.from(state.byId.keys())).toEqual(keysBefore);
        expect(selectAllComments(state).map((item) => item.id)).toEqual([1, 2]);
    });
});
