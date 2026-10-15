import type { Diagram } from '@/lib/domain/diagram';
import type { SchemaMergeCompareResponse } from '@/lib/schema-merge/compare-response';
import type { SchemaMergeCompareSource } from '@/lib/schema-merge/source-kinds';

/**
 * Retained for M8 Apply and M10 preview. The result step reads it and does not recompute it.
 * `baseDiagram` is a client-only Compare baseline snapshot (not sent to the API).
 */
export interface MergeWizardApplyContext {
    /** Diagram state after autosave flush at Compare time; frozen for preview projection. */
    baseDiagram: Diagram;
    incomingDiagram: Diagram;
    source: SchemaMergeCompareSource;
    includeDeletions: boolean;
    response: SchemaMergeCompareResponse;
    generation: number;
}
