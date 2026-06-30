import type { DiagramPresenceUser } from './diagram-presence';

export type PresenceStatus =
    | 'idle'
    | 'joining'
    | 'active'
    | 'error'
    | 'disconnected';

export interface PresenceState {
    members: Map<number, DiagramPresenceUser>;
    status: PresenceStatus;
    error: unknown;
}

export type PresenceAction =
    | { type: 'RESET' }
    | { type: 'SET_JOINING' }
    | { type: 'HERE'; members: DiagramPresenceUser[] }
    | { type: 'JOINING'; member: DiagramPresenceUser }
    | { type: 'LEAVING'; memberId: number }
    | { type: 'SET_ERROR'; error: unknown }
    | { type: 'SET_DISCONNECTED' };

export const initialPresenceState = (): PresenceState => ({
    members: new Map(),
    status: 'idle',
    error: null,
});

const dedupeMembers = (
    members: DiagramPresenceUser[]
): DiagramPresenceUser[] => {
    const byId = new Map<number, DiagramPresenceUser>();

    for (const member of members) {
        byId.set(member.id, member);
    }

    return Array.from(byId.values());
};

const membersToMap = (
    members: DiagramPresenceUser[]
): Map<number, DiagramPresenceUser> =>
    new Map(dedupeMembers(members).map((member) => [member.id, member]));

export const presenceReducer = (
    state: PresenceState,
    action: PresenceAction
): PresenceState => {
    switch (action.type) {
        case 'RESET':
            return initialPresenceState();

        case 'SET_JOINING':
            return {
                ...state,
                status: 'joining',
                error: null,
            };

        case 'HERE':
            return {
                members: membersToMap(action.members),
                status: 'active',
                error: null,
            };

        case 'JOINING': {
            const members = new Map(state.members);
            members.set(action.member.id, action.member);

            return {
                ...state,
                members,
                status: 'active',
                error: null,
            };
        }

        case 'LEAVING': {
            if (!state.members.has(action.memberId)) {
                return state;
            }

            const members = new Map(state.members);
            members.delete(action.memberId);

            return {
                ...state,
                members,
            };
        }

        case 'SET_ERROR':
            return {
                ...state,
                status: 'error',
                error: action.error,
            };

        case 'SET_DISCONNECTED':
            return {
                members: new Map(),
                status: 'disconnected',
                error: null,
            };

        default:
            return state;
    }
};
