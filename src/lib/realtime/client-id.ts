const CLIENT_ID_KEY = 'foxaldb_client_id';

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
    const existing = sessionStorage.getItem(CLIENT_ID_KEY);
    if (existing !== null && existing.length > 0) {
        return existing;
    }

    const id = generateClientId();
    sessionStorage.setItem(CLIENT_ID_KEY, id);
    return id;
};
