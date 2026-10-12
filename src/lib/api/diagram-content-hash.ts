import type { DiagramApiResource } from './diagrams';

export const DIAGRAM_CONTENT_HASH_PATTERN = /^[a-f0-9]{64}$/;

export const readDiagramContentHashFromApi = (
    raw: DiagramApiResource | unknown
): string | null => {
    if (typeof raw !== 'object' || raw === null) {
        return null;
    }

    const record = raw as Record<string, unknown>;
    const candidate = record.content_hash ?? record.contentHash;

    if (
        typeof candidate === 'string' &&
        DIAGRAM_CONTENT_HASH_PATTERN.test(candidate)
    ) {
        return candidate;
    }

    return null;
};
