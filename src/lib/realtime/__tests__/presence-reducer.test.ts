import { describe, expect, it } from 'vitest';
import { initialPresenceState, presenceReducer } from '../presence-reducer';
import {
    getInitialsFromName,
    getPresenceColorClass,
    hashUserId,
} from '../presence-utils';

const member = (id: number, name: string) => ({ id, name });

describe('presenceReducer', () => {
    it('HERE rebuilds the complete member map', () => {
        const state = presenceReducer(
            {
                ...initialPresenceState(),
                members: new Map([[1, member(1, 'Alice')]]),
                status: 'joining',
            },
            {
                type: 'HERE',
                members: [member(2, 'Bob'), member(3, 'Carol')],
            }
        );

        expect(Array.from(state.members.keys())).toEqual([2, 3]);
        expect(state.status).toBe('active');
    });

    it('JOINING upserts a member in the existing map', () => {
        const initial = presenceReducer(initialPresenceState(), {
            type: 'HERE',
            members: [member(1, 'Alice')],
        });

        const state = presenceReducer(initial, {
            type: 'JOINING',
            member: member(2, 'Bob'),
        });

        expect(Array.from(state.members.keys())).toEqual([1, 2]);
    });

    it('JOINING replaces an existing member with the same id', () => {
        const initial = presenceReducer(initialPresenceState(), {
            type: 'HERE',
            members: [member(1, 'Alice')],
        });

        const state = presenceReducer(initial, {
            type: 'JOINING',
            member: member(1, 'Alice Updated'),
        });

        expect(state.members.get(1)).toEqual(member(1, 'Alice Updated'));
    });

    it('LEAVING removes a member from the map', () => {
        const initial = presenceReducer(initialPresenceState(), {
            type: 'HERE',
            members: [member(1, 'Alice'), member(2, 'Bob')],
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
                member(1, 'Alice'),
                member(1, 'Alice Duplicate'),
                member(2, 'Bob'),
            ],
        });

        expect(state.members.size).toBe(2);
        expect(state.members.get(1)).toEqual(member(1, 'Alice Duplicate'));
    });

    it('RESET clears members and returns idle status', () => {
        const initial = presenceReducer(initialPresenceState(), {
            type: 'HERE',
            members: [member(1, 'Alice')],
        });

        const state = presenceReducer(initial, { type: 'RESET' });

        expect(state.members.size).toBe(0);
        expect(state.status).toBe('idle');
    });

    it('SET_DISCONNECTED clears members for reconnect', () => {
        const initial = presenceReducer(initialPresenceState(), {
            type: 'HERE',
            members: [member(1, 'Alice'), member(2, 'Bob')],
        });

        const disconnected = presenceReducer(initial, {
            type: 'SET_DISCONNECTED',
        });

        expect(disconnected.members.size).toBe(0);
        expect(disconnected.status).toBe('disconnected');

        const reconnected = presenceReducer(disconnected, {
            type: 'HERE',
            members: [member(1, 'Alice')],
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
});

describe('presence-utils', () => {
    it('generates initials from a full name', () => {
        expect(getInitialsFromName('Jane Doe')).toBe('JD');
    });

    it('generates initials from a single name', () => {
        expect(getInitialsFromName('Jane')).toBe('JA');
    });

    it('returns a fallback for empty names', () => {
        expect(getInitialsFromName('   ')).toBe('?');
    });

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
