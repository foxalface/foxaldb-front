import { describe, expect, it } from 'vitest';
import {
    nextReadBoundary,
    nextUnreadIncrementHighWaterMark,
    shouldApplyReadReconciliation,
    shouldIncrementUnreadForMessage,
} from '../conversation-read-sync';

describe('conversation-read-sync', () => {
    describe('shouldApplyReadReconciliation', () => {
        it('accepts the first authoritative boundary', () => {
            expect(shouldApplyReadReconciliation(undefined, 10)).toBe(true);
        });

        it('is idempotent for the same boundary', () => {
            expect(shouldApplyReadReconciliation(10, 10)).toBe(true);
        });

        it('rejects a backwards boundary move', () => {
            expect(shouldApplyReadReconciliation(20, 15)).toBe(false);
        });

        it('accepts a forward boundary move', () => {
            expect(shouldApplyReadReconciliation(20, 25)).toBe(true);
        });
    });

    describe('shouldIncrementUnreadForMessage', () => {
        it('skips messages at or behind the read boundary', () => {
            expect(shouldIncrementUnreadForMessage(50, undefined, 50)).toBe(
                false
            );
            expect(shouldIncrementUnreadForMessage(50, undefined, 40)).toBe(
                false
            );
        });

        it('skips duplicate message ids via the high-water mark', () => {
            expect(shouldIncrementUnreadForMessage(undefined, 60, 60)).toBe(
                false
            );
        });

        it('allows unread increments for newer messages', () => {
            expect(shouldIncrementUnreadForMessage(50, 50, 55)).toBe(true);
        });
    });

    describe('nextReadBoundary', () => {
        it('monotonically advances stored boundaries', () => {
            expect(nextReadBoundary(10, 15)).toBe(15);
            expect(nextReadBoundary(15, 12)).toBe(15);
        });
    });

    describe('nextUnreadIncrementHighWaterMark', () => {
        it('tracks the highest processed unread message id', () => {
            expect(nextUnreadIncrementHighWaterMark(10, 12)).toBe(12);
            expect(nextUnreadIncrementHighWaterMark(12, 8)).toBe(12);
        });
    });
});
