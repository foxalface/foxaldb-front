import { describe, expect, it } from 'vitest';
import {
    REMOTE_CURSOR_STALE_MS,
    cursorReducer,
    initialRemoteCursorsState,
} from '../cursor-reducer';
import type { CursorState } from '../cursor-types';

const cursor = (
    userId: number,
    x: number,
    y: number,
    overrides: Partial<CursorState> = {}
): CursorState => ({
    userId,
    x,
    y,
    receivedAt: 1_000,
    stale: false,
    ...overrides,
});

describe('cursorReducer', () => {
    it('UPDATE upserts a cursor by userId', () => {
        const initial = cursorReducer(initialRemoteCursorsState(), {
            type: 'UPDATE',
            cursor: cursor(1, 10, 20),
        });

        const state = cursorReducer(initial, {
            type: 'UPDATE',
            cursor: cursor(1, 30, 40, { receivedAt: 2_000 }),
        });

        expect(state.get(1)).toEqual(cursor(1, 30, 40, { receivedAt: 2_000 }));
    });

    it('UPDATE adds a new remote cursor', () => {
        const state = cursorReducer(initialRemoteCursorsState(), {
            type: 'UPDATE',
            cursor: cursor(2, 5, 15),
        });

        expect(Array.from(state.keys())).toEqual([2]);
    });

    it('REMOVE deletes a cursor by userId', () => {
        const initial = cursorReducer(initialRemoteCursorsState(), {
            type: 'UPDATE',
            cursor: cursor(1, 10, 20),
        });

        const updated = cursorReducer(initial, {
            type: 'UPDATE',
            cursor: cursor(2, 30, 40),
        });

        const state = cursorReducer(updated, {
            type: 'REMOVE',
            userId: 1,
        });

        expect(Array.from(state.keys())).toEqual([2]);
    });

    it('REMOVE is a no-op for unknown user ids', () => {
        const initial = cursorReducer(initialRemoteCursorsState(), {
            type: 'UPDATE',
            cursor: cursor(1, 10, 20),
        });

        const state = cursorReducer(initial, {
            type: 'REMOVE',
            userId: 99,
        });

        expect(state).toBe(initial);
    });

    it('CLEAR empties the cursor map', () => {
        const initial = cursorReducer(initialRemoteCursorsState(), {
            type: 'UPDATE',
            cursor: cursor(1, 10, 20),
        });

        const state = cursorReducer(initial, { type: 'CLEAR' });

        expect(state.size).toBe(0);
    });

    it('MARK_STALE marks an existing cursor as stale without deleting it', () => {
        const initial = cursorReducer(initialRemoteCursorsState(), {
            type: 'UPDATE',
            cursor: cursor(1, 10, 20),
        });

        const state = cursorReducer(initial, {
            type: 'MARK_STALE',
            userId: 1,
        });

        expect(state.get(1)).toEqual(
            cursor(1, 10, 20, { stale: true, receivedAt: 1_000 })
        );
        expect(state.has(1)).toBe(true);
    });

    it('MARK_STALE is a no-op for unknown user ids', () => {
        const initial = cursorReducer(initialRemoteCursorsState(), {
            type: 'UPDATE',
            cursor: cursor(1, 10, 20),
        });

        const state = cursorReducer(initial, {
            type: 'MARK_STALE',
            userId: 99,
        });

        expect(state).toBe(initial);
    });

    it('exposes a stale timeout constant for future rendering', () => {
        expect(REMOTE_CURSOR_STALE_MS).toBe(2000);
    });
});
