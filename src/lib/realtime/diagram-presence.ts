import {
    buildUserIdentity,
    parsePresenceUserIdentityFromChannel,
} from '@/lib/user';

export interface DiagramPresenceUser {
    id: number;
    firstName: string;
    lastName: string;
    fullName: string;
    active: boolean;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

export const parseDiagramPresenceUser = (
    value: unknown
): DiagramPresenceUser | null => {
    const identity = parsePresenceUserIdentityFromChannel(value);

    if (identity === null) {
        return null;
    }

    if (!isRecord(value)) {
        return null;
    }

    const active = value.active === false ? false : true;

    return {
        ...identity,
        active,
    };
};

export const createDiagramPresenceUser = (
    id: number,
    firstName: string,
    lastName: string,
    active = true
): DiagramPresenceUser => ({
    ...buildUserIdentity(id, firstName, lastName),
    active,
});

export const parseDiagramPresenceMemberInfo = (
    member: unknown
): DiagramPresenceUser | null => {
    if (!isRecord(member)) {
        return null;
    }

    if ('info' in member) {
        return parseDiagramPresenceUser(member.info);
    }

    return parseDiagramPresenceUser(member);
};

export const toPresenceMemberIdentity = (
    member: DiagramPresenceUser
): Pick<DiagramPresenceUser, 'firstName' | 'lastName' | 'fullName'> => ({
    firstName: member.firstName,
    lastName: member.lastName,
    fullName: member.fullName,
});
