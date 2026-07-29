import type { Diagram } from '@/lib/domain/diagram';

type DiagramListItem = Pick<Diagram, 'id'> | { id: string };

/** Guest local diagrams use non-numeric ids generated client-side. */
export const isGuestLocalDiagramId = (id: string): boolean => !/^\d+$/.test(id);

/**
 * Returns the first local guest diagram id.
 * Guest sessions store at most one diagram in IndexedDB.
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

/**
 * Returns a pending guest local diagram id for post-authentication migration.
 * Ignores numeric ids that may belong to previously synced remote diagrams.
 */
export const findGuestLocalDiagramIdForMigration = async (
    listDiagrams: () => Promise<DiagramListItem[]>
): Promise<string | null> => {
    const diagrams = await listDiagrams();
    const guestDiagram = diagrams.find((diagram) =>
        isGuestLocalDiagramId(diagram.id)
    );

    return guestDiagram?.id ?? null;
};
