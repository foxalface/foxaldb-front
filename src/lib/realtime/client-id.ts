let currentClientId: string | null = null;

const generateClientId = (): string => {
    if (
        typeof crypto !== 'undefined' &&
        typeof crypto.randomUUID === 'function'
    ) {
        return crypto.randomUUID();
    }

    return `foxaldb-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};

export const getClientId = (): string => {
    if (currentClientId !== null) {
        return currentClientId;
    }

    currentClientId = generateClientId();

    return currentClientId;
};
