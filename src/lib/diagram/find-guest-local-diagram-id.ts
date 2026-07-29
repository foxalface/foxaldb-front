import type { Diagram } from '@/lib/domain/diagram';

type DiagramListItem = Pick<Diagram, 'id'> | { id: string };

/**
 * Returns the first local guest diagram id, matching the legacy guest bootstrap
 * convention of one diagram per guest session.
 */
export const findGuestLocalDiagramId = async (
    listDiagrams: () => Promise<DiagramListItem[]>
): Promise<string | null> => {
    const diagrams = await listDiagrams();

    if (diagrams.length === 0) {
        return null;
    }

    return diagrams[0].id;
};
