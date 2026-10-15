import type { Diagram } from '@/lib/domain/diagram';

/**
 * Immutable Compare baseline for merge preview (client-only).
 * Uses structuredClone like ChartDB replaceDiagram history snapshots.
 */
export const snapshotMergeBaseDiagram = (diagram: Diagram): Diagram =>
    structuredClone(diagram);
