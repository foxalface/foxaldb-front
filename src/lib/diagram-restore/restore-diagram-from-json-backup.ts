import { createDiagram, getDiagram } from '@/lib/api/diagrams';
import { syncDiagramAutosaveFromApiLoad } from '@/lib/diagram-autosave/sync-diagram-autosave-from-api';
import type { Diagram } from '@/lib/domain/diagram';
import {
    parseDiagramJsonContent,
    type DiagramJsonParseFailure,
} from '@/lib/import/parse-diagram-json-content';

export class RestoreDiagramJsonParseError extends Error {
    readonly failure: DiagramJsonParseFailure;

    constructor(failure: DiagramJsonParseFailure) {
        super('invalid_diagram_json');
        this.name = 'RestoreDiagramJsonParseError';
        this.failure = failure;
    }
}

export interface PersistRestoredDiagramGuestDeps {
    addDiagram: (params: { diagram: Diagram }) => Promise<void>;
    loadDiagramFromData: (diagram: Diagram) => void;
}

/**
 * Restores a diagram backup JSON into a new diagram.
 * Guest: Dexie only. Authenticated: backend createDiagram only (no Dexie).
 */
export const persistRestoredDiagramFromJson = async (
    json: string,
    options: {
        isAuthenticated: boolean;
        guest: PersistRestoredDiagramGuestDeps;
    }
): Promise<string> => {
    const parsed = parseDiagramJsonContent(json);

    if (!parsed.ok) {
        throw new RestoreDiagramJsonParseError(parsed.failure);
    }

    const diagram = parsed.diagram;

    if (!options.isAuthenticated) {
        await options.guest.addDiagram({ diagram });
        options.guest.loadDiagramFromData(diagram);
        return diagram.id;
    }

    const result = await createDiagram({
        name: diagram.name,
        content: diagram,
    });

    const diagramId = String(result.diagram.id);
    const remote = await getDiagram(diagramId);
    syncDiagramAutosaveFromApiLoad(diagramId, remote);

    return diagramId;
};
