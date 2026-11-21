import { useMemo } from 'react';
import { useEditorFilters } from '@/context/editor-filters-context/use-editor-filters';
import { useChartDB } from '@/hooks/use-chartdb';
import { useDiff } from '@/context/diff-context/use-diff';
import type { Diagram } from '@/lib/domain/diagram';
import { projectCanvasVisibility } from './canvas-filter-visibility';
import type { CanvasFilterVisibility } from './canvas-filter-visibility';

/**
 * One canvas-level visibility memo.
 * Null means every table is eligible and the filter expression is inactive.
 */
export const useCanvasFilterVisibility = (): CanvasFilterVisibility | null => {
    const {
        tables,
        relationships,
        dependencies,
        tagAssignments,
        databaseType,
    } = useChartDB();
    const { checkIfNewTable } = useDiff();
    const { expression, showViews } = useEditorFilters();

    return useMemo(() => {
        const forceShownTableIds = new Set<string>();

        for (const table of tables) {
            if (checkIfNewTable({ tableId: table.id })) {
                forceShownTableIds.add(table.id);
            }
        }

        const diagram: Diagram = {
            id: 'canvas-filter',
            name: '',
            databaseType,
            tables,
            relationships,
            dependencies,
            tagAssignments,
            createdAt: new Date(0),
            updatedAt: new Date(0),
        };

        return projectCanvasVisibility({
            diagram,
            expression,
            showViews,
            forceShownTableIds,
        });
    }, [
        tables,
        relationships,
        dependencies,
        tagAssignments,
        databaseType,
        expression,
        showViews,
        checkIfNewTable,
    ]);
};
