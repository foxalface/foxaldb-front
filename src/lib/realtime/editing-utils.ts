import {
    getInitialsFromName,
    getPresenceBorderColorClass,
    getPresenceColorClass,
    getPresenceRingColorClass,
    getPresenceStrokeColorClass,
} from './presence-utils';
import type {
    EditingEntityType,
    EditingItem,
    UserEditingState,
} from './editing-types';

// Local editors heartbeat their snapshot every ~1000ms
// (DEFAULT_EDITING_HEARTBEAT_MS), so this stale window tolerates ~2 missed
// heartbeats before a badge is treated as abandoned (tab crash / disconnect).
export const REMOTE_EDITING_STALE_MS = 3000;

export interface RemoteEditingViewModel {
    userId: number;
    name: string;
    initials: string;
    colorClass: string;
    borderColorClass: string;
    strokeColorClass: string;
    ringColorClass: string;
    isSelf: boolean;
}

export type EditingByEntity = Map<string, RemoteEditingViewModel[]>;

export const toEditingEntityKey = (
    entityType: EditingEntityType,
    entityId: string
): string => `${entityType}:${entityId}`;

export const createTableEditingItem = (tableId: string): EditingItem => ({
    entityType: 'table',
    entityId: tableId,
});

export const createFieldEditingItem = (fieldId: string): EditingItem => ({
    entityType: 'field',
    entityId: fieldId,
});

export const createRelationshipEditingItem = (
    relationshipId: string
): EditingItem => ({
    entityType: 'relationship',
    entityId: relationshipId,
});

export const shouldRemoveStaleEditing = (
    receivedAt: number,
    now: number,
    staleMs: number = REMOTE_EDITING_STALE_MS
): boolean => now - receivedAt >= staleMs;

const sortEditingItems = (items: EditingItem[]): EditingItem[] =>
    [...items].sort((left, right) => {
        const typeCompare = left.entityType.localeCompare(right.entityType);

        if (typeCompare !== 0) {
            return typeCompare;
        }

        return left.entityId.localeCompare(right.entityId);
    });

export const areEditingSnapshotsEqual = (
    left: EditingItem[],
    right: EditingItem[]
): boolean => {
    if (left.length !== right.length) {
        return false;
    }

    const sortedLeft = sortEditingItems(left);
    const sortedRight = sortEditingItems(right);

    return sortedLeft.every((item, index) => {
        const other = sortedRight[index];

        return (
            item.entityType === other.entityType &&
            item.entityId === other.entityId
        );
    });
};

const toViewModel = (
    userId: number,
    presenceMembers: ReadonlyMap<number, { name: string }>,
    selfUserId: number
): RemoteEditingViewModel => {
    const member = presenceMembers.get(userId);
    const name = member?.name ?? 'Collaborator';

    return {
        userId,
        name,
        initials: getInitialsFromName(name),
        colorClass: getPresenceColorClass(userId),
        borderColorClass: getPresenceBorderColorClass(userId),
        strokeColorClass: getPresenceStrokeColorClass(userId),
        ringColorClass: getPresenceRingColorClass(userId),
        isSelf: userId === selfUserId,
    };
};

export const buildEditingByEntity = (
    remoteEditing: ReadonlyMap<number, UserEditingState>,
    options: {
        selfUserId: number;
        presenceMembers: ReadonlyMap<number, { name: string }>;
        knownPresenceUserIds: ReadonlySet<number>;
        now?: number;
        staleMs?: number;
    }
): EditingByEntity => {
    const { selfUserId, presenceMembers, knownPresenceUserIds, now, staleMs } =
        options;
    const byEntity: EditingByEntity = new Map();

    for (const [userId, editing] of remoteEditing) {
        if (userId === selfUserId) {
            continue;
        }

        if (!knownPresenceUserIds.has(userId)) {
            continue;
        }

        if (editing.edits.length === 0) {
            continue;
        }

        if (
            now !== undefined &&
            shouldRemoveStaleEditing(editing.receivedAt, now, staleMs)
        ) {
            continue;
        }

        const viewModel = toViewModel(userId, presenceMembers, selfUserId);

        for (const item of editing.edits) {
            const entityKey = toEditingEntityKey(
                item.entityType,
                item.entityId
            );
            const existing = byEntity.get(entityKey) ?? [];

            if (existing.some((entry) => entry.userId === userId)) {
                continue;
            }

            byEntity.set(entityKey, [...existing, viewModel]);
        }
    }

    for (const [entityKey, collaborators] of byEntity) {
        byEntity.set(
            entityKey,
            [...collaborators].sort((left, right) =>
                left.name.localeCompare(right.name)
            )
        );
    }

    return byEntity;
};
