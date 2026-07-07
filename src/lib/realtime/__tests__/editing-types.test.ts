import { describe, expect, it } from 'vitest';
import { parseEditingWhisperPayload } from '../editing-types';

describe('parseEditingWhisperPayload', () => {
    it('parses a valid editing payload', () => {
        expect(
            parseEditingWhisperPayload({
                userId: 7,
                edits: [
                    { entityType: 'table', entityId: 'table-1' },
                    { entityType: 'field', entityId: 'field-1' },
                    { entityType: 'relationship', entityId: 'rel-1' },
                ],
            })
        ).toEqual({
            userId: 7,
            edits: [
                { entityType: 'table', entityId: 'table-1' },
                { entityType: 'field', entityId: 'field-1' },
                { entityType: 'relationship', entityId: 'rel-1' },
            ],
        });
    });

    it('parses an empty edits array as cleared editing', () => {
        expect(
            parseEditingWhisperPayload({
                userId: 2,
                edits: [],
            })
        ).toEqual({
            userId: 2,
            edits: [],
        });
    });

    it('rejects non-object payloads', () => {
        expect(parseEditingWhisperPayload(null)).toBeNull();
        expect(parseEditingWhisperPayload('editing')).toBeNull();
        expect(parseEditingWhisperPayload([])).toBeNull();
    });

    it('rejects missing fields', () => {
        expect(parseEditingWhisperPayload({ userId: 1 })).toBeNull();
        expect(parseEditingWhisperPayload({ edits: [] })).toBeNull();
    });

    it('rejects invalid entity types and ids', () => {
        expect(
            parseEditingWhisperPayload({
                userId: 1,
                edits: [{ entityType: 'note', entityId: '1' }],
            })
        ).toBeNull();
        expect(
            parseEditingWhisperPayload({
                userId: 1,
                edits: [{ entityType: 'field', entityId: '' }],
            })
        ).toBeNull();
    });

    it('does not accept timestamp in the payload', () => {
        const parsed = parseEditingWhisperPayload({
            userId: 1,
            edits: [{ entityType: 'field', entityId: 'field-1' }],
            timestamp: Date.now(),
        });

        expect(parsed).toEqual({
            userId: 1,
            edits: [{ entityType: 'field', entityId: 'field-1' }],
        });
        expect(parsed).not.toHaveProperty('timestamp');
    });
});
