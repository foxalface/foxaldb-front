import type { Diagram } from '@/lib/domain/diagram';
import type { SchemaMergeCompareSource } from './source-kinds';

/**
 * M3.2 Compare request body.
 *
 * Source preparation does not call Compare. The API client in
 * `frontend/src/lib/api/schema-merge-compare.ts` posts this body.
 *
 * `source` carries `kind` only. The backend derives `compareViews` and
 * rejects `viewsSupported`, `databaseType`, and `capabilities` on `source`.
 */
export interface SchemaMergeCompareRequest {
    incomingDiagram: Diagram;
    includeDeletions: boolean;
    source: SchemaMergeCompareSource;
}
