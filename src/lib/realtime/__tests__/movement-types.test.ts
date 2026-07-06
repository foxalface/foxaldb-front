import { describe, expect, it } from 'vitest';
import { parseMovementWhisperPayload } from '../movement-types';

describe('parseMovementWhisperPayload', () => {
    it('parses a valid movement payload', () => {
        expect(
            parseMovementWhisperPayload({
                userId: 7,
                phase: 'move',
                tables: [
                    { id: 'table-1', x: 120.5, y: -40 },
                    { id: 'table-2', x: 0, y: 200 },
                ],
            })
        ).toEqual({
            userId: 7,
            phase: 'move',
            tables: [
                { id: 'table-1', x: 120.5, y: -40 },
                { id: 'table-2', x: 0, y: 200 },
            ],
        });
    });

    it('parses an end phase payload', () => {
        expect(
            parseMovementWhisperPayload({
                userId: 2,
                phase: 'end',
                tables: [{ id: 'table-1', x: 50, y: 75 }],
            })
        ).toEqual({
            userId: 2,
            phase: 'end',
            tables: [{ id: 'table-1', x: 50, y: 75 }],
        });
    });

    it('parses numeric strings for finite values', () => {
        expect(
            parseMovementWhisperPayload({
                userId: '3',
                phase: 'move',
                tables: [{ id: 'table-1', x: '10.25', y: '0' }],
            })
        ).toEqual({
            userId: 3,
            phase: 'move',
            tables: [{ id: 'table-1', x: 10.25, y: 0 }],
        });
    });

    it('parses an empty tables array', () => {
        expect(
            parseMovementWhisperPayload({
                userId: 1,
                phase: 'end',
                tables: [],
            })
        ).toEqual({
            userId: 1,
            phase: 'end',
            tables: [],
        });
    });

    it('rejects non-object payloads', () => {
        expect(parseMovementWhisperPayload(null)).toBeNull();
        expect(parseMovementWhisperPayload('movement')).toBeNull();
        expect(parseMovementWhisperPayload([])).toBeNull();
    });

    it('rejects missing fields', () => {
        expect(
            parseMovementWhisperPayload({ userId: 1, phase: 'move' })
        ).toBeNull();
        expect(
            parseMovementWhisperPayload({ userId: 1, tables: [] })
        ).toBeNull();
        expect(
            parseMovementWhisperPayload({ phase: 'move', tables: [] })
        ).toBeNull();
    });

    it('rejects invalid phase values', () => {
        expect(
            parseMovementWhisperPayload({
                userId: 1,
                phase: 'start',
                tables: [],
            })
        ).toBeNull();
    });

    it('rejects non-finite numbers', () => {
        expect(
            parseMovementWhisperPayload({
                userId: NaN,
                phase: 'move',
                tables: [],
            })
        ).toBeNull();
        expect(
            parseMovementWhisperPayload({
                userId: 1,
                phase: 'move',
                tables: [{ id: 'table-1', x: Infinity, y: 2 }],
            })
        ).toBeNull();
        expect(
            parseMovementWhisperPayload({
                userId: 1,
                phase: 'move',
                tables: [{ id: 'table-1', x: 2, y: 'invalid' }],
            })
        ).toBeNull();
    });

    it('rejects empty table ids', () => {
        expect(
            parseMovementWhisperPayload({
                userId: 1,
                phase: 'move',
                tables: [{ id: '', x: 1, y: 2 }],
            })
        ).toBeNull();
    });

    it('rejects duplicate table ids', () => {
        expect(
            parseMovementWhisperPayload({
                userId: 1,
                phase: 'move',
                tables: [
                    { id: 'table-1', x: 1, y: 2 },
                    { id: 'table-1', x: 3, y: 4 },
                ],
            })
        ).toBeNull();
    });

    it('does not accept timestamp in the payload', () => {
        const parsed = parseMovementWhisperPayload({
            userId: 1,
            phase: 'move',
            tables: [{ id: 'table-1', x: 10, y: 20 }],
            timestamp: Date.now(),
        });

        expect(parsed).toEqual({
            userId: 1,
            phase: 'move',
            tables: [{ id: 'table-1', x: 10, y: 20 }],
        });
        expect(parsed).not.toHaveProperty('timestamp');
    });
});
