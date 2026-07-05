import { describe, expect, it } from 'vitest';
import { parseSelectionWhisperPayload } from '../selection-types';

describe('parseSelectionWhisperPayload', () => {
    it('parses a valid selection payload', () => {
        expect(
            parseSelectionWhisperPayload({
                userId: 7,
                selections: [
                    { entityType: 'table', entityId: 'table-1' },
                    { entityType: 'relationship', entityId: 'rel-1' },
                ],
            })
        ).toEqual({
            userId: 7,
            selections: [
                { entityType: 'table', entityId: 'table-1' },
                { entityType: 'relationship', entityId: 'rel-1' },
            ],
        });
    });

    it('parses an empty selections array as cleared selection', () => {
        expect(
            parseSelectionWhisperPayload({
                userId: 2,
                selections: [],
            })
        ).toEqual({
            userId: 2,
            selections: [],
        });
    });

    it('rejects non-object payloads', () => {
        expect(parseSelectionWhisperPayload(null)).toBeNull();
        expect(parseSelectionWhisperPayload('selection')).toBeNull();
        expect(parseSelectionWhisperPayload([])).toBeNull();
    });

    it('rejects missing fields', () => {
        expect(parseSelectionWhisperPayload({ userId: 1 })).toBeNull();
        expect(parseSelectionWhisperPayload({ selections: [] })).toBeNull();
    });

    it('rejects invalid entity types and ids', () => {
        expect(
            parseSelectionWhisperPayload({
                userId: 1,
                selections: [{ entityType: 'note', entityId: '1' }],
            })
        ).toBeNull();
        expect(
            parseSelectionWhisperPayload({
                userId: 1,
                selections: [{ entityType: 'table', entityId: '' }],
            })
        ).toBeNull();
    });

    it('does not accept timestamp in the payload', () => {
        const parsed = parseSelectionWhisperPayload({
            userId: 1,
            selections: [{ entityType: 'table', entityId: 'table-1' }],
            timestamp: Date.now(),
        });

        expect(parsed).toEqual({
            userId: 1,
            selections: [{ entityType: 'table', entityId: 'table-1' }],
        });
        expect(parsed).not.toHaveProperty('timestamp');
    });
});
