import { describe, expect, it } from 'vitest';
import { SelectionActionSubscriber } from '../selection-subscriber';
import {
    initialRemoteSelectionsState,
    selectionReducer,
} from '../selection-reducer';

describe('SelectionActionSubscriber', () => {
    it('dispatches selection actions to subscribers', () => {
        const subscriber = new SelectionActionSubscriber();
        let state = initialRemoteSelectionsState();

        const unsubscribe = subscriber.subscribe((action) => {
            state = selectionReducer(state, action);
        });

        subscriber.dispatch({
            type: 'UPDATE',
            userId: 2,
            selections: [{ entityType: 'table', entityId: 'table-1' }],
            receivedAt: 1_000,
        });

        expect(state.get(2)?.selections).toEqual([
            { entityType: 'table', entityId: 'table-1' },
        ]);

        subscriber.dispatch({ type: 'CLEAR' });
        expect(state.size).toBe(0);

        unsubscribe();
        subscriber.dispatch({
            type: 'UPDATE',
            userId: 3,
            selections: [{ entityType: 'table', entityId: 'table-2' }],
            receivedAt: 1_000,
        });

        expect(state.size).toBe(0);
    });
});
