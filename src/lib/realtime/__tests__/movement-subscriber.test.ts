import { describe, expect, it } from 'vitest';
import { MovementActionSubscriber } from '../movement-subscriber';
import {
    initialRemoteMovementsState,
    movementReducer,
} from '../movement-reducer';

describe('MovementActionSubscriber', () => {
    it('dispatches movement actions to subscribers', () => {
        const subscriber = new MovementActionSubscriber();
        let state = initialRemoteMovementsState();

        const unsubscribe = subscriber.subscribe((action) => {
            state = movementReducer(state, action);
        });

        subscriber.dispatch({
            type: 'UPDATE',
            userId: 2,
            phase: 'move',
            tables: [{ id: 'table-1', x: 10, y: 20 }],
            receivedAt: 1_000,
        });

        expect(state.get(2)?.tables).toEqual([{ id: 'table-1', x: 10, y: 20 }]);

        subscriber.dispatch({ type: 'CLEAR' });
        expect(state.size).toBe(0);

        unsubscribe();
        subscriber.dispatch({
            type: 'UPDATE',
            userId: 3,
            phase: 'move',
            tables: [{ id: 'table-2', x: 1, y: 2 }],
            receivedAt: 1_000,
        });

        expect(state.size).toBe(0);
    });
});
