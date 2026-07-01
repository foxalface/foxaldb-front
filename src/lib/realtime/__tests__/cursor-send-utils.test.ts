import { describe, expect, it } from 'vitest';
import {
    CURSOR_SEND_MIN_INTERVAL_MS,
    CURSOR_SEND_MIN_MOVEMENT_PX,
    hasMinimumCursorMovement,
    shouldSendCursorUpdate,
} from '../cursor-send-utils';

describe('hasMinimumCursorMovement', () => {
    it('allows the first cursor position', () => {
        expect(hasMinimumCursorMovement(null, { x: 10, y: 20 })).toBe(true);
    });

    it('rejects movement below the minimum delta', () => {
        expect(
            hasMinimumCursorMovement(
                { x: 0, y: 0 },
                { x: 1, y: 1 },
                CURSOR_SEND_MIN_MOVEMENT_PX
            )
        ).toBe(false);
    });

    it('accepts movement at or above the minimum delta', () => {
        expect(
            hasMinimumCursorMovement(
                { x: 0, y: 0 },
                { x: 2, y: 0 },
                CURSOR_SEND_MIN_MOVEMENT_PX
            )
        ).toBe(true);

        expect(
            hasMinimumCursorMovement(
                { x: 0, y: 0 },
                { x: 0, y: -2 },
                CURSOR_SEND_MIN_MOVEMENT_PX
            )
        ).toBe(true);
    });
});

describe('shouldSendCursorUpdate', () => {
    it('throttles sends to the configured maximum rate', () => {
        const lastSent = { x: 0, y: 0 };
        const next = { x: 10, y: 0 };
        const lastSentAt = 1_000;
        const tooSoon = lastSentAt + CURSOR_SEND_MIN_INTERVAL_MS - 1;
        const ready = lastSentAt + CURSOR_SEND_MIN_INTERVAL_MS;

        expect(
            shouldSendCursorUpdate(lastSent, next, lastSentAt, tooSoon)
        ).toBe(false);

        expect(shouldSendCursorUpdate(lastSent, next, lastSentAt, ready)).toBe(
            true
        );
    });

    it('does not send duplicate positions', () => {
        const position = { x: 42, y: 84 };

        expect(shouldSendCursorUpdate(position, position, 0, 1_000)).toBe(
            false
        );
    });

    it('requires minimum movement before sending again', () => {
        const lastSent = { x: 100, y: 100 };
        const next = { x: 101, y: 100 };

        expect(
            shouldSendCursorUpdate(
                lastSent,
                next,
                0,
                CURSOR_SEND_MIN_INTERVAL_MS
            )
        ).toBe(false);
    });
});
