export const isValidBackendDiagramId = (id: unknown): id is string | number => {
    if (typeof id === 'number') {
        return Number.isInteger(id) && id > 0;
    }

    if (typeof id === 'string') {
        return /^\d+$/.test(id);
    }

    return false;
};
