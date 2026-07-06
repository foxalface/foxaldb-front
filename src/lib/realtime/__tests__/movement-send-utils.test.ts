import { describe, expect, it } from 'vitest';
import {
    CURSOR_SEND_MIN_INTERVAL_MS,
    CURSOR_SEND_MIN_MOVEMENT_PX,
} from '../cursor-send-utils';
import {
    areMovementSnapshotsEqual,
    hasMinimumMovementSnapshot,
    shouldSendMovementUpdate,
} from '../movement-send-utils';

describe('areMovementSnapshotsEqual', () => {
    it('treats identical table batches as equal', () => {
        const snapshot = [
            { id: 'a', x: 10, y: 20 },
            { id: 'b', x: 30, y: 40 },
        ];

        expect(areMovementSnapshotsEqual(snapshot, [...snapshot])).toBe(true);
    });

    it('treats different positions as unequal', () => {
        expect(
            areMovementSnapshotsEqual(
                [{ id: 'a', x: 0, y: 0 }],
                [{ id: 'a', x: 1, y: 0 }]
            )
        ).toBe(false);
    });
});

describe('hasMinimumMovementSnapshot', () => {
    it('allows the first movement snapshot', () => {
        expect(
            hasMinimumMovementSnapshot(null, [{ id: 'a', x: 0, y: 0 }])
        ).toBe(true);
    });

    it('rejects movement below the minimum delta for every table', () => {
        expect(
            hasMinimumMovementSnapshot(
                [{ id: 'a', x: 0, y: 0 }],
                [{ id: 'a', x: 1, y: 0 }],
                CURSOR_SEND_MIN_MOVEMENT_PX
            )
        ).toBe(false);
    });

    it('accepts movement when any dragged table exceeds the threshold', () => {
        expect(
            hasMinimumMovementSnapshot(
                [
                    { id: 'a', x: 0, y: 0 },
                    { id: 'b', x: 100, y: 100 },
                ],
                [
                    { id: 'a', x: 0, y: 0 },
                    { id: 'b', x: 102, y: 100 },
                ],
                CURSOR_SEND_MIN_MOVEMENT_PX
            )
        ).toBe(true);
    });
});

describe('shouldSendMovementUpdate', () => {
    it('does not send duplicate snapshots', () => {
        const snapshot = [{ id: 'a', x: 42, y: 84 }];

        expect(shouldSendMovementUpdate(snapshot, snapshot, 0, 1_000)).toBe(
            false
        );
    });

    it('throttles sends to the configured maximum rate', () => {
        const lastSent = [{ id: 'a', x: 0, y: 0 }];
        const next = [{ id: 'a', x: 10, y: 0 }];
        const lastSentAt = 1_000;
        const tooSoon = lastSentAt + CURSOR_SEND_MIN_INTERVAL_MS - 1;
        const ready = lastSentAt + CURSOR_SEND_MIN_INTERVAL_MS;

        expect(
            shouldSendMovementUpdate(lastSent, next, lastSentAt, tooSoon)
        ).toBe(false);

        expect(
            shouldSendMovementUpdate(lastSent, next, lastSentAt, ready)
        ).toBe(true);
    });

    it('requires minimum movement before sending again', () => {
        const lastSent = [{ id: 'a', x: 100, y: 100 }];
        const next = [{ id: 'a', x: 101, y: 100 }];

        expect(
            shouldSendMovementUpdate(
                lastSent,
                next,
                0,
                CURSOR_SEND_MIN_INTERVAL_MS
            )
        ).toBe(false);
    });
});
