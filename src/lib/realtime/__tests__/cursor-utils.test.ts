import { describe, expect, it } from 'vitest';
import {
    cursorReducer,
    initialRemoteCursorsState,
    REMOTE_CURSOR_STALE_MS,
} from '../cursor-reducer';
import type { CursorState } from '../cursor-types';
import {
    CURSOR_INTERPOLATION_FACTOR,
    getRenderableRemoteCursors,
    hasReachedTarget,
    interpolatePosition,
    isRemoteCursorRenderable,
    shouldMarkCursorStale,
} from '../cursor-utils';

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

describe('cursor-utils', () => {
    describe('shouldMarkCursorStale', () => {
        it('returns false when cursor is already stale', () => {
            expect(
                shouldMarkCursorStale(
                    cursor(1, 0, 0, { stale: true, receivedAt: 0 }),
                    REMOTE_CURSOR_STALE_MS + 100
                )
            ).toBe(false);
        });

        it('returns true when last update is older than the stale timeout', () => {
            const receivedAt = 5_000;

            expect(
                shouldMarkCursorStale(
                    cursor(1, 0, 0, { receivedAt }),
                    receivedAt + REMOTE_CURSOR_STALE_MS
                )
            ).toBe(true);
        });

        it('returns false when last update is within the stale timeout', () => {
            const receivedAt = 5_000;

            expect(
                shouldMarkCursorStale(
                    cursor(1, 0, 0, { receivedAt }),
                    receivedAt + REMOTE_CURSOR_STALE_MS - 1
                )
            ).toBe(false);
        });
    });

    describe('isRemoteCursorRenderable', () => {
        const baseOptions = {
            selfUserId: 1,
            knownPresenceUserIds: new Set([2, 3]),
            now: 2_000,
        };

        it('hides self cursor', () => {
            expect(
                isRemoteCursorRenderable(cursor(1, 10, 20), baseOptions)
            ).toBe(false);
        });

        it('hides cursors for users not in presence', () => {
            expect(
                isRemoteCursorRenderable(cursor(99, 10, 20), baseOptions)
            ).toBe(false);
        });

        it('hides stale cursors', () => {
            expect(
                isRemoteCursorRenderable(
                    cursor(2, 10, 20, { stale: true }),
                    baseOptions
                )
            ).toBe(false);
        });

        it('hides cursors older than the stale timeout', () => {
            expect(
                isRemoteCursorRenderable(
                    cursor(2, 10, 20, { receivedAt: 0 }),
                    baseOptions
                )
            ).toBe(false);
        });

        it('shows fresh remote cursors for known presence users', () => {
            expect(
                isRemoteCursorRenderable(
                    cursor(2, 10, 20, { receivedAt: 1_500 }),
                    baseOptions
                )
            ).toBe(true);
        });
    });

    describe('getRenderableRemoteCursors', () => {
        it('filters self, unknown, and stale cursors', () => {
            const state = cursorReducer(initialRemoteCursorsState(), {
                type: 'UPDATE',
                cursor: cursor(2, 1, 2, { receivedAt: 1_500 }),
            });
            const withSelf = cursorReducer(state, {
                type: 'UPDATE',
                cursor: cursor(1, 3, 4, { receivedAt: 1_500 }),
            });
            const withStale = cursorReducer(withSelf, {
                type: 'UPDATE',
                cursor: cursor(3, 5, 6, { receivedAt: 0, stale: true }),
            });

            const renderable = getRenderableRemoteCursors(withStale, {
                selfUserId: 1,
                knownPresenceUserIds: new Set([2, 3]),
                now: 2_000,
            });

            expect(renderable.map((item) => item.userId)).toEqual([2]);
        });
    });

    describe('interpolatePosition', () => {
        it('moves current position toward the target', () => {
            const next = interpolatePosition(
                { x: 0, y: 0 },
                { x: 100, y: 200 },
                CURSOR_INTERPOLATION_FACTOR
            );

            expect(next).toEqual({
                x: 25,
                y: 50,
            });
        });
    });

    describe('hasReachedTarget', () => {
        it('returns true when current and target are within threshold', () => {
            expect(
                hasReachedTarget({ x: 10, y: 10 }, { x: 10.2, y: 10.2 })
            ).toBe(true);
        });

        it('returns false when current and target are far apart', () => {
            expect(hasReachedTarget({ x: 0, y: 0 }, { x: 10, y: 10 })).toBe(
                false
            );
        });
    });
});
