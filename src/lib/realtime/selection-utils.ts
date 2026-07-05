import {
    getInitialsFromName,
    getPresenceBorderColorClass,
    getPresenceColorClass,
    getPresenceRingColorClass,
    getPresenceStrokeColorClass,
} from './presence-utils';
import type {
    SelectionEntityType,
    SelectionItem,
    UserSelectionState,
} from './selection-types';

export interface RemoteSelectionViewModel {
    userId: number;
    name: string;
    initials: string;
    colorClass: string;
    borderColorClass: string;
    strokeColorClass: string;
    ringColorClass: string;
    isSelf: boolean;
}

export type SelectionsByEntity = Map<string, RemoteSelectionViewModel[]>;

export const toEntityKey = (
    entityType: SelectionEntityType,
    entityId: string
): string => `${entityType}:${entityId}`;

const sortSelectionItems = (items: SelectionItem[]): SelectionItem[] =>
    [...items].sort((left, right) => {
        const typeCompare = left.entityType.localeCompare(right.entityType);

        if (typeCompare !== 0) {
            return typeCompare;
        }

        return left.entityId.localeCompare(right.entityId);
    });

export const areSelectionSnapshotsEqual = (
    left: SelectionItem[],
    right: SelectionItem[]
): boolean => {
    if (left.length !== right.length) {
        return false;
    }

    const sortedLeft = sortSelectionItems(left);
    const sortedRight = sortSelectionItems(right);

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
): RemoteSelectionViewModel => {
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

export const buildSelectionsByEntity = (
    remoteSelections: ReadonlyMap<number, UserSelectionState>,
    options: {
        selfUserId: number;
        presenceMembers: ReadonlyMap<number, { name: string }>;
        knownPresenceUserIds: ReadonlySet<number>;
    }
): SelectionsByEntity => {
    const { selfUserId, presenceMembers, knownPresenceUserIds } = options;
    const byEntity: SelectionsByEntity = new Map();

    for (const [userId, selection] of remoteSelections) {
        if (userId === selfUserId) {
            continue;
        }

        if (!knownPresenceUserIds.has(userId)) {
            continue;
        }

        if (selection.selections.length === 0) {
            continue;
        }

        const viewModel = toViewModel(userId, presenceMembers, selfUserId);

        for (const item of selection.selections) {
            const entityKey = toEntityKey(item.entityType, item.entityId);
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

export const buildSelectionSnapshotFromFlowSelection = (options: {
    selectedNodeIds: readonly string[];
    selectedEdgeIds: readonly string[];
    tableNodeIds: ReadonlySet<string>;
    relationshipEdgeIds: ReadonlySet<string>;
}): SelectionItem[] => {
    const {
        selectedNodeIds,
        selectedEdgeIds,
        tableNodeIds,
        relationshipEdgeIds,
    } = options;
    const selections: SelectionItem[] = [];

    for (const nodeId of selectedNodeIds) {
        if (tableNodeIds.has(nodeId)) {
            selections.push({ entityType: 'table', entityId: nodeId });
        }
    }

    for (const edgeId of selectedEdgeIds) {
        if (relationshipEdgeIds.has(edgeId)) {
            selections.push({
                entityType: 'relationship',
                entityId: edgeId,
            });
        }
    }

    return sortSelectionItems(selections);
};
