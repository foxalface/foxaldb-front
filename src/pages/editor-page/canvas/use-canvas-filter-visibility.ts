import { useMemo } from 'react';
import { useDiagramFilter } from '@/context/diagram-filter-context/use-diagram-filter';
import { useEditorFilters } from '@/context/editor-filters-context/use-editor-filters';
import { useChartDB } from '@/hooks/use-chartdb';
import { useLocalConfig } from '@/hooks/use-local-config';
import { useDiff } from '@/context/diff-context/use-diff';
import { defaultSchemas } from '@/lib/data/default-schemas';
import {
    tablePassesAreaConstraint,
    tablePassesSchemaConstraint,
} from '@/lib/domain/editor-filter-eligibility';
import { tableToTableNode } from './diagram-flow-elements';
import type { TagCanvasVisibility } from './tag-canvas-visibility';
import { deriveTagCanvasVisibility } from './tag-canvas-visibility';

/**
 * One canvas-scoped derivation.
 * Null means the personal editor filters add no extra hiding.
 * Legacy gates run first, then area and schema constraints, then tag closure.
 */
export const useCanvasFilterVisibility = (): TagCanvasVisibility | null => {
    const { tables, relationships, tagAssignments, databaseType } =
        useChartDB();
    const { filter, loading: filterLoading } = useDiagramFilter();
    const { showDBViews } = useLocalConfig();
    const { checkIfNewTable } = useDiff();
    const {
        selectedTagIds,
        tagMatchMode,
        selectedAreaIds,
        selectedSchemaIds,
        hasTagConstraint,
        hasAreaConstraint,
        hasSchemaConstraint,
    } = useEditorFilters();

    return useMemo(() => {
        if (!hasTagConstraint && !hasAreaConstraint && !hasSchemaConstraint) {
            return null;
        }

        const defaultSchema = defaultSchemas[databaseType];
        const eligibleTableIds = new Set<string>();

        for (const table of tables) {
            const node = tableToTableNode(table, {
                filter,
                databaseType,
                filterLoading,
                showDBViews,
                forceShow: checkIfNewTable({ tableId: table.id }),
            });

            if (node.hidden) {
                continue;
            }

            if (
                !tablePassesAreaConstraint(table.parentAreaId, selectedAreaIds)
            ) {
                continue;
            }

            if (
                !tablePassesSchemaConstraint(
                    table,
                    selectedSchemaIds,
                    defaultSchema
                )
            ) {
                continue;
            }

            eligibleTableIds.add(table.id);
        }

        return deriveTagCanvasVisibility({
            tables,
            relationships,
            tagAssignments,
            selectedTagIds,
            matchMode: tagMatchMode,
            eligibleTableIds,
        });
    }, [
        hasTagConstraint,
        hasAreaConstraint,
        hasSchemaConstraint,
        tables,
        relationships,
        tagAssignments,
        selectedTagIds,
        tagMatchMode,
        selectedAreaIds,
        selectedSchemaIds,
        filter,
        databaseType,
        filterLoading,
        showDBViews,
        checkIfNewTable,
    ]);
};
