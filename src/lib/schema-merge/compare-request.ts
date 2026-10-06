import type { Diagram } from '@/lib/domain/diagram';
import type { SchemaMergeCompareSource } from './source-kinds';

/**
 * M3.2 Compare request body.
 *
 * M5 defines the type only. Source preparation does not call
 * `POST /api/diagrams/{diagram}/merge/compare`.
 *
 * `source` carries `kind` only. The backend derives `compareViews` and
 * rejects `viewsSupported`, `databaseType`, and `capabilities` on `source`.
 */
export interface SchemaMergeCompareRequest {
    incomingDiagram: Diagram;
    includeDeletions: boolean;
    source: SchemaMergeCompareSource;
}
