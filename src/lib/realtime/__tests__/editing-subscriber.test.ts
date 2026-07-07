import { describe, expect, it } from 'vitest';
import { EditingActionSubscriber } from '../editing-subscriber';
import { editingReducer, initialRemoteEditingState } from '../editing-reducer';

describe('EditingActionSubscriber', () => {
    it('dispatches editing actions to subscribers', () => {
        const subscriber = new EditingActionSubscriber();
        let state = initialRemoteEditingState();

        const unsubscribe = subscriber.subscribe((action) => {
            state = editingReducer(state, action);
        });

        subscriber.dispatch({
            type: 'UPDATE',
            userId: 2,
            edits: [{ entityType: 'field', entityId: 'field-1' }],
            receivedAt: 1_000,
        });

        expect(state.get(2)?.edits).toEqual([
            { entityType: 'field', entityId: 'field-1' },
        ]);

        subscriber.dispatch({ type: 'CLEAR' });
        expect(state.size).toBe(0);

        unsubscribe();
        subscriber.dispatch({
            type: 'UPDATE',
            userId: 3,
            edits: [{ entityType: 'table', entityId: 'table-2' }],
            receivedAt: 1_000,
        });

        expect(state.size).toBe(0);
    });
});
