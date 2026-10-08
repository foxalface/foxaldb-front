import type { Diagram } from '@/lib/domain/diagram';
import type { SchemaMergeCompareResponse } from '@/lib/schema-merge/compare-response';
import type { SchemaMergeCompareSource } from '@/lib/schema-merge/source-kinds';

/**
 * Retained for M8 Apply. The result step reads it and does not recompute it.
 */
export interface MergeWizardApplyContext {
    incomingDiagram: Diagram;
    source: SchemaMergeCompareSource;
    includeDeletions: boolean;
    response: SchemaMergeCompareResponse;
    generation: number;
}
