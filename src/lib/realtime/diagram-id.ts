/**
 * Validates a Laravel diagram id (positive integer, or a decimal string).
 *
 * API identifier check only. It is not the current diagram's storage
 * location. Storage identity is DiagramLocation.
 */
export const isValidBackendDiagramId = (id: unknown): id is string | number => {
    if (typeof id === 'number') {
        return Number.isInteger(id) && id > 0;
    }

    if (typeof id === 'string') {
        return /^\d+$/.test(id);
    }

    return false;
};
