import { createDiagram, getDiagrams } from '@/lib/api/diagrams';
import type { Diagram } from '@/lib/domain/diagram';
import type { StorageContext } from '@/context/storage-context/storage-context';
import { nextDiagramCopyName } from './next-diagram-copy-name';

const FULL_DIAGRAM_LOAD_OPTIONS = {
    includeTables: true,
    includeRelationships: true,
    includeDependencies: true,
    includeAreas: true,
    includeCustomTypes: true,
    includeNotes: true,
} as const;

export const loadFullLocalDiagram = async (
    getDiagram: StorageContext['getDiagram'],
    diagramId: string
): Promise<Diagram | undefined> =>
    getDiagram(diagramId, FULL_DIAGRAM_LOAD_OPTIONS);

export const createBackendDiagramFromLocal = async (
    diagram: Diagram
): Promise<string> => {
    const result = await createDiagram({
        name: diagram.name,
        content: diagram,
    });

    const remoteId = result.diagram.id;

    if (remoteId === undefined || remoteId === null || remoteId === '') {
        throw new Error('Backend diagram creation returned no id');
    }

    return String(remoteId);
};

export const putLocalDiagramOnlineCopy = async (
    getDiagram: StorageContext['getDiagram'],
    localDiagramId: string
): Promise<string> => {
    const full = await loadFullLocalDiagram(getDiagram, localDiagramId);

    if (!full) {
        throw new Error('Local diagram not found');
    }

    const existing = await getDiagrams();

    return createBackendDiagramFromLocal({
        ...full,
        name: nextDiagramCopyName(
            full.name,
            existing.map((diagram) => diagram.name)
        ),
    });
};

export const putLocalDiagramOnlineMove = async (
    getDiagram: StorageContext['getDiagram'],
    deleteDiagram: StorageContext['deleteDiagram'],
    localDiagramId: string
): Promise<string> => {
    const full = await loadFullLocalDiagram(getDiagram, localDiagramId);

    if (!full) {
        throw new Error('Local diagram not found');
    }

    const remoteDiagramId = await createBackendDiagramFromLocal(full);

    await deleteDiagram(localDiagramId);

    return remoteDiagramId;
};
