type LocalDraggingTableIdsListener = () => void;

let currentIds: ReadonlySet<string> = new Set<string>();
const listeners = new Set<LocalDraggingTableIdsListener>();

const areSetsEqual = (
    left: ReadonlySet<string>,
    right: ReadonlySet<string>
): boolean => {
    if (left.size !== right.size) {
        return false;
    }

    for (const id of left) {
        if (!right.has(id)) {
            return false;
        }
    }

    return true;
};

export const publishLocalDraggingTableIds = (
    ids: ReadonlySet<string>
): void => {
    if (areSetsEqual(currentIds, ids)) {
        return;
    }

    currentIds = ids;

    for (const listener of listeners) {
        listener();
    }
};

export const getLocalDraggingTableIds = (): ReadonlySet<string> => currentIds;

export const subscribeLocalDraggingTableIds = (
    listener: LocalDraggingTableIdsListener
): (() => void) => {
    listeners.add(listener);

    return () => {
        listeners.delete(listener);
    };
};

export const resetLocalDraggingTableIds = (): void => {
    publishLocalDraggingTableIds(new Set<string>());
};
