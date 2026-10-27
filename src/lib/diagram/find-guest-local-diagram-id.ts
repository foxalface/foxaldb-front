import type { Diagram } from '@/lib/domain/diagram';
import { isLegacyNumericDexieShadowId } from '@/lib/diagram/diagram-location';

type DiagramListItem = Pick<Diagram, 'id'> | { id: string };

/** Guest local diagrams use non-numeric ids generated client-side. */
export const isGuestLocalDiagramId = (id: string): boolean =>
    !isLegacyNumericDexieShadowId(id);

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
