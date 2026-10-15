import type { MergeChangeVisual } from '@/lib/schema-merge/preview/preview-types';
import type { MergePreviewNodeDecoration } from './diagram-flow-elements';

/**
 * M10.1 decorations map at most one change per entity id.
 * Table and field entries are merged onto the table node as separate decoration rows.
 */
export const resolveTableMergeChange = (
    decorations?: MergePreviewNodeDecoration[]
): MergeChangeVisual | undefined =>
    decorations?.find((entry) => entry.entityKind === 'table')?.change;

export const buildFieldMergeChangeById = (
    decorations?: MergePreviewNodeDecoration[]
): ReadonlyMap<string, MergeChangeVisual> => {
    const map = new Map<string, MergeChangeVisual>();
    for (const entry of decorations ?? []) {
        if (entry.entityKind === 'field') {
            map.set(entry.entityId, entry.change);
        }
    }
    return map;
};
