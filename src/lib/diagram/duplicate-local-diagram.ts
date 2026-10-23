import { cloneDiagram } from '@/lib/clone';
import type { Diagram } from '@/lib/domain/diagram';
import type { StorageContext } from '@/context/storage-context/storage-context';
import { generateDiagramId } from '@/lib/utils';
import { loadFullLocalDiagram } from './put-local-diagram-online';
import { nextDiagramCopyName } from './next-diagram-copy-name';

export const duplicateLocalDiagram = async (
    getDiagram: StorageContext['getDiagram'],
    listDiagrams: StorageContext['listDiagrams'],
    addDiagram: StorageContext['addDiagram'],
    sourceDiagramId: string
): Promise<string> => {
    const full = await loadFullLocalDiagram(getDiagram, sourceDiagramId);

    if (!full) {
        throw new Error('Local diagram not found');
    }

    const existing = await listDiagrams();
    const { diagram: cloned } = cloneDiagram(full);
    const now = new Date();

    const duplicate: Diagram = {
        ...cloned,
        id: generateDiagramId(),
        name: nextDiagramCopyName(
            full.name,
            existing.map((diagram) => diagram.name)
        ),
        createdAt: now,
        updatedAt: now,
    };

    await addDiagram({ diagram: duplicate });

    return duplicate.id;
};
