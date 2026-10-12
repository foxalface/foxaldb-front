import { readDiagramContentHashFromApi } from '@/lib/api/diagram-content-hash';
import type { DiagramApiResource } from '@/lib/api/diagrams';
import { initializeDiagramAutosaveFromServer } from './diagram-autosave-controller';

/**
 * Seeds optimistic-concurrency state after a persisted diagram load.
 */
export const syncDiagramAutosaveFromApiLoad = (
    diagramId: string,
    raw: DiagramApiResource | unknown
): void => {
    const contentHash = readDiagramContentHashFromApi(raw);

    if (contentHash === null) {
        return;
    }

    initializeDiagramAutosaveFromServer(diagramId, contentHash);
};
