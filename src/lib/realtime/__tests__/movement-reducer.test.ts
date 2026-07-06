import { describe, expect, it } from 'vitest';
import {
    initialRemoteMovementsState,
    movementReducer,
} from '../movement-reducer';
import type { MovementTablePosition } from '../movement-types';

const tables = (items: MovementTablePosition[]) => items;

describe('movementReducer', () => {
    it('UPDATE upserts movement state by userId', () => {
        const initial = movementReducer(initialRemoteMovementsState(), {
            type: 'UPDATE',
            userId: 1,
            phase: 'move',
            tables: tables([{ id: 'table-1', x: 10, y: 20 }]),
            receivedAt: 1_000,
        });

        const state = movementReducer(initial, {
            type: 'UPDATE',
            userId: 1,
            phase: 'end',
            tables: tables([{ id: 'table-1', x: 30, y: 40 }]),
            receivedAt: 2_000,
        });

        expect(state.get(1)).toEqual({
            phase: 'end',
            tables: [{ id: 'table-1', x: 30, y: 40 }],
            receivedAt: 2_000,
        });
    });

    it('UPDATE adds a new remote movement entry', () => {
        const state = movementReducer(initialRemoteMovementsState(), {
            type: 'UPDATE',
            userId: 2,
            phase: 'move',
            tables: tables([{ id: 'table-2', x: 5, y: 15 }]),
            receivedAt: 1_000,
        });

        expect(Array.from(state.keys())).toEqual([2]);
    });

    it('REMOVE deletes movement state by userId', () => {
        const initial = movementReducer(initialRemoteMovementsState(), {
            type: 'UPDATE',
            userId: 1,
            phase: 'move',
            tables: tables([{ id: 'table-1', x: 10, y: 20 }]),
            receivedAt: 1_000,
        });

        const state = movementReducer(initial, {
            type: 'REMOVE',
            userId: 1,
        });

        expect(state.size).toBe(0);
    });

    it('REMOVE is a no-op for unknown user ids', () => {
        const initial = movementReducer(initialRemoteMovementsState(), {
            type: 'UPDATE',
            userId: 1,
            phase: 'move',
            tables: tables([{ id: 'table-1', x: 10, y: 20 }]),
            receivedAt: 1_000,
        });

        const state = movementReducer(initial, {
            type: 'REMOVE',
            userId: 99,
        });

        expect(state).toBe(initial);
    });

    it('CLEAR is a no-op when the movement map is already empty', () => {
        const initial = initialRemoteMovementsState();
        const state = movementReducer(initial, { type: 'CLEAR' });

        expect(state).toBe(initial);
    });

    it('CLEAR empties the movement map', () => {
        const initial = movementReducer(initialRemoteMovementsState(), {
            type: 'UPDATE',
            userId: 1,
            phase: 'move',
            tables: tables([{ id: 'table-1', x: 10, y: 20 }]),
            receivedAt: 1_000,
        });

        const state = movementReducer(initial, { type: 'CLEAR' });

        expect(state.size).toBe(0);
    });
});
