import { describe, expect, it } from 'vitest';
import { parseCursorWhisperPayload } from '../cursor-types';

describe('parseCursorWhisperPayload', () => {
    it('parses a valid cursor payload', () => {
        expect(
            parseCursorWhisperPayload({ userId: 7, x: 120.5, y: -40 })
        ).toEqual({
            userId: 7,
            x: 120.5,
            y: -40,
        });
    });

    it('parses numeric strings for finite values', () => {
        expect(
            parseCursorWhisperPayload({ userId: '3', x: '10.25', y: '0' })
        ).toEqual({
            userId: 3,
            x: 10.25,
            y: 0,
        });
    });

    it('rejects non-object payloads', () => {
        expect(parseCursorWhisperPayload(null)).toBeNull();
        expect(parseCursorWhisperPayload('cursor')).toBeNull();
        expect(parseCursorWhisperPayload([])).toBeNull();
    });

    it('rejects missing fields', () => {
        expect(parseCursorWhisperPayload({ userId: 1, x: 10 })).toBeNull();
        expect(parseCursorWhisperPayload({ userId: 1, y: 10 })).toBeNull();
        expect(parseCursorWhisperPayload({ x: 10, y: 20 })).toBeNull();
    });

    it('rejects non-finite numbers', () => {
        expect(
            parseCursorWhisperPayload({ userId: NaN, x: 1, y: 2 })
        ).toBeNull();
        expect(
            parseCursorWhisperPayload({ userId: 1, x: Infinity, y: 2 })
        ).toBeNull();
        expect(
            parseCursorWhisperPayload({ userId: 1, x: 2, y: 'invalid' })
        ).toBeNull();
    });

    it('does not accept timestamp in the payload', () => {
        const parsed = parseCursorWhisperPayload({
            userId: 1,
            x: 10,
            y: 20,
            timestamp: Date.now(),
        });

        expect(parsed).toEqual({ userId: 1, x: 10, y: 20 });
        expect(parsed).not.toHaveProperty('timestamp');
    });
});
