import { describe, expect, it } from 'vitest';
import {
    initialRemoteSelectionsState,
    selectionReducer,
} from '../selection-reducer';
import type { SelectionItem } from '../selection-types';

const selections = (items: SelectionItem[]) => items;

describe('selectionReducer', () => {
    it('UPDATE upserts selections by userId', () => {
        const initial = selectionReducer(initialRemoteSelectionsState(), {
            type: 'UPDATE',
            userId: 1,
            selections: selections([
                { entityType: 'table', entityId: 'table-1' },
            ]),
            receivedAt: 1_000,
        });

        const state = selectionReducer(initial, {
            type: 'UPDATE',
            userId: 1,
            selections: selections([
                { entityType: 'relationship', entityId: 'rel-1' },
            ]),
            receivedAt: 2_000,
        });

        expect(state.get(1)).toEqual({
            selections: [{ entityType: 'relationship', entityId: 'rel-1' }],
            receivedAt: 2_000,
        });
    });

    it('UPDATE with empty selections removes the user entry', () => {
        const initial = selectionReducer(initialRemoteSelectionsState(), {
            type: 'UPDATE',
            userId: 1,
            selections: selections([
                { entityType: 'table', entityId: 'table-1' },
            ]),
            receivedAt: 1_000,
        });

        const state = selectionReducer(initial, {
            type: 'UPDATE',
            userId: 1,
            selections: [],
            receivedAt: 2_000,
        });

        expect(state.has(1)).toBe(false);
    });

    it('REMOVE deletes selections by userId', () => {
        const initial = selectionReducer(initialRemoteSelectionsState(), {
            type: 'UPDATE',
            userId: 1,
            selections: selections([
                { entityType: 'table', entityId: 'table-1' },
            ]),
            receivedAt: 1_000,
        });

        const state = selectionReducer(initial, {
            type: 'REMOVE',
            userId: 1,
        });

        expect(state.size).toBe(0);
    });

    it('REMOVE is a no-op for unknown user ids', () => {
        const initial = selectionReducer(initialRemoteSelectionsState(), {
            type: 'UPDATE',
            userId: 1,
            selections: selections([
                { entityType: 'table', entityId: 'table-1' },
            ]),
            receivedAt: 1_000,
        });

        const state = selectionReducer(initial, {
            type: 'REMOVE',
            userId: 99,
        });

        expect(state).toBe(initial);
    });

    it('CLEAR is a no-op when the selection map is already empty', () => {
        const initial = initialRemoteSelectionsState();
        const state = selectionReducer(initial, { type: 'CLEAR' });

        expect(state).toBe(initial);
    });

    it('CLEAR empties the selection map', () => {
        const initial = selectionReducer(initialRemoteSelectionsState(), {
            type: 'UPDATE',
            userId: 1,
            selections: selections([
                { entityType: 'table', entityId: 'table-1' },
            ]),
            receivedAt: 1_000,
        });

        const state = selectionReducer(initial, { type: 'CLEAR' });

        expect(state.size).toBe(0);
    });
});
