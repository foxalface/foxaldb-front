import type { Diagram } from '@/lib/domain/diagram';
import type { SchemaMergeCompareSource } from './source-kinds';

/**
 * M4 Apply request body.
 *
 * `selectedOperationIds` are opaque ids from Compare. The client does not
 * send operation bodies, `dependsOn`, or the current diagram.
 */
export interface SchemaMergeApplyRequest {
    baseContentHash: string;
    incomingDiagram: Diagram;
    includeDeletions: boolean;
    source: SchemaMergeCompareSource;
    selectedOperationIds: readonly string[];
}
