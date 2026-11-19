import { useMemo } from 'react';
import { useDiagramFilter } from '@/context/diagram-filter-context/use-diagram-filter';
import { useTagFilter } from '@/context/tag-filter-context/use-tag-filter';
import { useChartDB } from '@/hooks/use-chartdb';
import { useLocalConfig } from '@/hooks/use-local-config';
import { useDiff } from '@/context/diff-context/use-diff';
import { tableToTableNode } from './diagram-flow-elements';
import type { TagCanvasVisibility } from './tag-canvas-visibility';
import { deriveTagCanvasVisibility } from './tag-canvas-visibility';

/**
 * One canvas-scoped derivation. Null means the personal tag filter imposes
 * no extra hiding, so existing gate behavior stays untouched.
 */
export const useTagCanvasVisibility = (): TagCanvasVisibility | null => {
    const { tables, relationships, tagAssignments, databaseType } =
        useChartDB();
    const { filter, loading: filterLoading } = useDiagramFilter();
    const { showDBViews } = useLocalConfig();
    const { checkIfNewTable } = useDiff();
    const { selectedTagIds, matchMode, hasTagConstraint } = useTagFilter();

    return useMemo(() => {
        if (!hasTagConstraint) {
            return null;
        }

        const eligibleTableIds = new Set<string>();

        for (const table of tables) {
            const node = tableToTableNode(table, {
                filter,
                databaseType,
                filterLoading,
                showDBViews,
                forceShow: checkIfNewTable({ tableId: table.id }),
            });

            if (!node.hidden) {
                eligibleTableIds.add(table.id);
            }
        }

        return deriveTagCanvasVisibility({
            tables,
            relationships,
            tagAssignments,
            selectedTagIds,
            matchMode,
            eligibleTableIds,
        });
    }, [
        hasTagConstraint,
        tables,
        relationships,
        tagAssignments,
        selectedTagIds,
        matchMode,
        filter,
        databaseType,
        filterLoading,
        showDBViews,
        checkIfNewTable,
    ]);
};
