import { getDiagram } from '@/lib/api/diagrams';
import { normalizeDiagramFromApi } from '@/lib/api/normalize-diagram-from-api';
import { cloneDiagram } from '@/lib/clone';
import type { Diagram } from '@/lib/domain/diagram';
import type { StorageContext } from '@/context/storage-context/storage-context';
import { generateDiagramId } from '@/lib/utils';
import { nextDiagramCopyName } from './next-diagram-copy-name';
import { assertGuestDeviceOnlyWriteAllowed } from './guest-device-diagram-limit';

export const copyOnlineDiagramToDevice = async (
    listDiagrams: StorageContext['listDiagrams'],
    addDiagram: StorageContext['addDiagram'],
    onlineDiagramId: string,
    isAuthenticated: boolean
): Promise<string> => {
    await assertGuestDeviceOnlyWriteAllowed(isAuthenticated, listDiagrams);

    const raw = await getDiagram(onlineDiagramId);
    const source = normalizeDiagramFromApi(raw, onlineDiagramId);
    const existing = await listDiagrams();
    const { diagram: cloned } = cloneDiagram(source);
    const now = new Date();

    // Local copies are owned by this device. Keep schema content only:
    // new diagram id, new entity ids, no backend id and no access role.
    const copy: Diagram = {
        id: generateDiagramId(),
        name: nextDiagramCopyName(
            source.name,
            existing.map((diagram) => diagram.name)
        ),
        databaseType: cloned.databaseType,
        databaseEdition: cloned.databaseEdition,
        tables: cloned.tables,
        relationships: cloned.relationships,
        dependencies: cloned.dependencies,
        areas: cloned.areas,
        customTypes: cloned.customTypes,
        notes: cloned.notes,
        createdAt: now,
        updatedAt: now,
    };

    await addDiagram({ diagram: copy });

    return copy.id;
};
