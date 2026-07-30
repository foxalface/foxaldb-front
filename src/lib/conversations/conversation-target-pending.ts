const pendingKeys = new Set<string>();
const listeners = new Set<() => void>();

const notifyListeners = (): void => {
    for (const listener of listeners) {
        listener();
    }
};

export const subscribeToConversationTargetPending = (
    listener: () => void
): (() => void) => {
    listeners.add(listener);

    return () => {
        listeners.delete(listener);
    };
};

export const getConversationTargetPendingSnapshot = (): number =>
    pendingKeys.size;

export const isConversationTargetPending = (key: string): boolean =>
    pendingKeys.has(key);

/**
 * Atomically acquires a pending lock for the scoped target key.
 * Returns false when the key is already pending.
 */
export const tryAcquireConversationTargetPending = (key: string): boolean => {
    if (pendingKeys.has(key)) {
        return false;
    }

    pendingKeys.add(key);
    notifyListeners();
    return true;
};

export const releaseConversationTargetPending = (key: string): void => {
    if (!pendingKeys.has(key)) {
        return;
    }

    pendingKeys.delete(key);
    notifyListeners();
};

/** Test-only reset to prevent store leakage between Vitest cases. */
export const resetConversationTargetPendingStoreForTests = (): void => {
    pendingKeys.clear();
    notifyListeners();
};
