import type { StorageContext } from '@/context/storage-context/storage-context';
import type { DiagramCreationDestination } from '@/lib/diagram/diagram-creation-destination';
import {
    persistNewDiagram,
    type PersistedNewDiagram,
} from '@/lib/diagram/persist-new-diagram';
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

/**
 * Parses a diagram backup and persists it for the given creation destination.
 * Opening the result is separate: device open sets location and loads memory;
 * online open navigates so the existing GET resolution can hydrate it.
 */
export const persistRestoredDiagramFromJson = async (
    json: string,
    options: {
        destination: DiagramCreationDestination;
        isAuthenticated: boolean;
        addDiagram: StorageContext['addDiagram'];
    }
): Promise<PersistedNewDiagram> => {
    const parsed = parseDiagramJsonContent(json);

    if (!parsed.ok) {
        throw new RestoreDiagramJsonParseError(parsed.failure);
    }

    return persistNewDiagram(parsed.diagram, options.destination, {
        addDiagram: options.addDiagram,
        isAuthenticated: options.isAuthenticated,
    });
};
