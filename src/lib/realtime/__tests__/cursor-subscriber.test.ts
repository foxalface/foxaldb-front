import { describe, expect, it } from 'vitest';
import { CursorActionSubscriber } from '../cursor-subscriber';
import { cursorReducer, initialRemoteCursorsState } from '../cursor-reducer';

describe('CursorActionSubscriber', () => {
    it('dispatches cursor actions to subscribers', () => {
        const subscriber = new CursorActionSubscriber();
        let state = initialRemoteCursorsState();

        const unsubscribe = subscriber.subscribe((action) => {
            state = cursorReducer(state, action);
        });

        subscriber.dispatch({
            type: 'UPDATE',
            cursor: {
                userId: 2,
                x: 10,
                y: 20,
                receivedAt: 1_000,
                stale: false,
            },
        });

        expect(state.get(2)?.x).toBe(10);

        subscriber.dispatch({ type: 'CLEAR' });
        expect(state.size).toBe(0);

        unsubscribe();
        subscriber.dispatch({
            type: 'UPDATE',
            cursor: {
                userId: 3,
                x: 1,
                y: 2,
                receivedAt: 1_000,
                stale: false,
            },
        });

        expect(state.size).toBe(0);
    });
});
