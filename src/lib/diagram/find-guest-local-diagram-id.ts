import type { Diagram } from '@/lib/domain/diagram';
import { isLegacyNumericDexieShadowId } from '@/lib/diagram/diagram-location';

type DiagramListItem = Pick<Diagram, 'id'> | { id: string };

/**
 * Returns the first local guest diagram id.
 * Guest sessions store at most one diagram in IndexedDB.
 */
export const findGuestLocalDiagramId = async (
    listDiagrams: () => Promise<DiagramListItem[]>
): Promise<string | null> => {
    const diagrams = await listDiagrams();
    const deviceDiagram = diagrams.find(
        (diagram) => !isLegacyNumericDexieShadowId(diagram.id)
    );

    return deviceDiagram?.id ?? null;
};
