export interface DiagramPresenceUser {
    id: number;
    name: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

export const parseDiagramPresenceUser = (
    value: unknown
): DiagramPresenceUser | null => {
    if (!isRecord(value)) {
        return null;
    }

    const id = typeof value.id === 'number' ? value.id : Number(value.id);
    const name = typeof value.name === 'string' ? value.name : '';

    if (!Number.isInteger(id) || id <= 0 || name.length === 0) {
        return null;
    }

    return { id, name };
};

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
