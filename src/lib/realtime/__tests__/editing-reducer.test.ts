import { describe, expect, it } from 'vitest';
import { editingReducer, initialRemoteEditingState } from '../editing-reducer';
import type { EditingItem } from '../editing-types';

const edits = (items: EditingItem[]) => items;

describe('editingReducer', () => {
    it('UPDATE upserts edits by userId', () => {
        const initial = editingReducer(initialRemoteEditingState(), {
            type: 'UPDATE',
            userId: 1,
            edits: edits([{ entityType: 'field', entityId: 'field-1' }]),
            receivedAt: 1_000,
        });

        const state = editingReducer(initial, {
            type: 'UPDATE',
            userId: 1,
            edits: edits([{ entityType: 'table', entityId: 'table-1' }]),
            receivedAt: 2_000,
        });

        expect(state.get(1)).toEqual({
            edits: [{ entityType: 'table', entityId: 'table-1' }],
            receivedAt: 2_000,
        });
    });

    it('UPDATE with empty edits removes the user entry', () => {
        const initial = editingReducer(initialRemoteEditingState(), {
            type: 'UPDATE',
            userId: 1,
            edits: edits([{ entityType: 'field', entityId: 'field-1' }]),
            receivedAt: 1_000,
        });

        const state = editingReducer(initial, {
            type: 'UPDATE',
            userId: 1,
            edits: [],
            receivedAt: 2_000,
        });

        expect(state.has(1)).toBe(false);
    });

    it('REMOVE deletes edits by userId', () => {
        const initial = editingReducer(initialRemoteEditingState(), {
            type: 'UPDATE',
            userId: 1,
            edits: edits([{ entityType: 'field', entityId: 'field-1' }]),
            receivedAt: 1_000,
        });

        const state = editingReducer(initial, {
            type: 'REMOVE',
            userId: 1,
        });

        expect(state.size).toBe(0);
    });

    it('REMOVE is a no-op for unknown user ids', () => {
        const initial = editingReducer(initialRemoteEditingState(), {
            type: 'UPDATE',
            userId: 1,
            edits: edits([{ entityType: 'field', entityId: 'field-1' }]),
            receivedAt: 1_000,
        });

        const state = editingReducer(initial, {
            type: 'REMOVE',
            userId: 99,
        });

        expect(state).toBe(initial);
    });

    it('CLEAR is a no-op when the editing map is already empty', () => {
        const initial = initialRemoteEditingState();
        const state = editingReducer(initial, { type: 'CLEAR' });

        expect(state).toBe(initial);
    });

    it('CLEAR empties the editing map', () => {
        const initial = editingReducer(initialRemoteEditingState(), {
            type: 'UPDATE',
            userId: 1,
            edits: edits([{ entityType: 'field', entityId: 'field-1' }]),
            receivedAt: 1_000,
        });

        const state = editingReducer(initial, { type: 'CLEAR' });

        expect(state.size).toBe(0);
    });
});
