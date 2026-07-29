import { describe, expect, it } from 'vitest';
import { initialPresenceState, presenceReducer } from '../presence-reducer';
import { getPresenceColorClass, hashUserId } from '../presence-utils';
import { createDiagramPresenceUser } from '../diagram-presence';

const member = (
    id: number,
    firstName: string,
    lastName: string,
    active = true
) => createDiagramPresenceUser(id, firstName, lastName, active);

describe('presenceReducer', () => {
    it('HERE rebuilds the complete member map', () => {
        const state = presenceReducer(
            {
                ...initialPresenceState(),
                members: new Map([[1, member(1, 'Alice', 'Anderson')]]),
                status: 'joining',
            },
            {
                type: 'HERE',
                members: [
                    member(2, 'Bob', 'Smith'),
                    member(3, 'Carol', 'Jones'),
                ],
            }
        );

        expect(Array.from(state.members.keys())).toEqual([2, 3]);
        expect(state.status).toBe('active');
    });

    it('JOINING upserts a member in the existing map', () => {
        const initial = presenceReducer(initialPresenceState(), {
            type: 'HERE',
            members: [member(1, 'Alice', 'Anderson')],
        });

        const state = presenceReducer(initial, {
            type: 'JOINING',
            member: member(2, 'Bob', 'Smith'),
        });

        expect(Array.from(state.members.keys())).toEqual([1, 2]);
    });

    it('JOINING replaces an existing member with the same id', () => {
        const initial = presenceReducer(initialPresenceState(), {
            type: 'HERE',
            members: [member(1, 'Alice', 'Anderson')],
        });

        const state = presenceReducer(initial, {
            type: 'JOINING',
            member: member(1, 'Alice', 'Updated'),
        });

        expect(state.members.get(1)).toEqual(member(1, 'Alice', 'Updated'));
    });

    it('LEAVING removes a member from the map', () => {
        const initial = presenceReducer(initialPresenceState(), {
            type: 'HERE',
            members: [
                member(1, 'Alice', 'Anderson'),
                member(2, 'Bob', 'Smith'),
            ],
        });

        const state = presenceReducer(initial, {
            type: 'LEAVING',
            memberId: 1,
        });

        expect(Array.from(state.members.keys())).toEqual([2]);
    });

    it('HERE deduplicates duplicate user ids', () => {
        const state = presenceReducer(initialPresenceState(), {
            type: 'HERE',
            members: [
                member(1, 'Alice', 'Anderson'),
                member(1, 'Alice', 'Duplicate'),
                member(2, 'Bob', 'Smith'),
            ],
        });

        expect(state.members.size).toBe(2);
        expect(state.members.get(1)).toEqual(member(1, 'Alice', 'Duplicate'));
    });

    it('RESET clears members and returns idle status', () => {
        const initial = presenceReducer(initialPresenceState(), {
            type: 'HERE',
            members: [member(1, 'Alice', 'Anderson')],
        });

        const state = presenceReducer(initial, { type: 'RESET' });

        expect(state.members.size).toBe(0);
        expect(state.status).toBe('idle');
    });

    it('SET_DISCONNECTED clears members for reconnect', () => {
        const initial = presenceReducer(initialPresenceState(), {
            type: 'HERE',
            members: [
                member(1, 'Alice', 'Anderson'),
                member(2, 'Bob', 'Smith'),
            ],
        });

        const disconnected = presenceReducer(initial, {
            type: 'SET_DISCONNECTED',
        });

        expect(disconnected.members.size).toBe(0);
        expect(disconnected.status).toBe('disconnected');

        const reconnected = presenceReducer(disconnected, {
            type: 'HERE',
            members: [member(1, 'Alice', 'Anderson')],
        });

        expect(Array.from(reconnected.members.keys())).toEqual([1]);
        expect(reconnected.status).toBe('active');
    });

    it('SET_JOINING marks the state as joining', () => {
        const state = presenceReducer(initialPresenceState(), {
            type: 'SET_JOINING',
        });

        expect(state.status).toBe('joining');
    });

    it('SET_ACTIVITY updates only the targeted member activity state', () => {
        const initial = presenceReducer(initialPresenceState(), {
            type: 'HERE',
            members: [
                member(1, 'Alice', 'Anderson'),
                member(2, 'Bob', 'Smith'),
            ],
        });

        const inactive = presenceReducer(initial, {
            type: 'SET_ACTIVITY',
            memberId: 2,
            active: false,
        });

        expect(inactive.members.get(1)?.active).toBe(true);
        expect(inactive.members.get(2)?.active).toBe(false);

        const unchanged = presenceReducer(inactive, {
            type: 'SET_ACTIVITY',
            memberId: 2,
            active: false,
        });

        expect(unchanged).toBe(inactive);
    });
});

describe('presence-utils', () => {
    it('assigns deterministic colors from user id', () => {
        const first = getPresenceColorClass(42);
        const second = getPresenceColorClass(42);

        expect(first).toBe(second);
        expect(first.startsWith('bg-')).toBe(true);
    });

    it('can produce different colors for different user ids', () => {
        const colors = new Set(
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((id) =>
                getPresenceColorClass(id)
            )
        );

        expect(colors.size).toBeGreaterThan(1);
        expect(hashUserId(7)).toBe(hashUserId(7));
    });
});
