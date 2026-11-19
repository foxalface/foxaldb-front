import { useMemo } from 'react';
import { useEditorFilters } from '@/context/editor-filters-context/use-editor-filters';
import { useChartDB } from '@/hooks/use-chartdb';
import { useDiff } from '@/context/diff-context/use-diff';
import { defaultSchemas } from '@/lib/data/default-schemas';
import {
    tablePassesAreaConstraint,
    tablePassesSchemaConstraint,
} from '@/lib/domain/editor-filter-eligibility';
import type { TagCanvasVisibility } from './tag-canvas-visibility';
import { deriveTagCanvasVisibility } from './tag-canvas-visibility';

/**
 * Canvas visibility for the final editor filters.
 * Null means every table is eligible and no tag, area, or schema constraint is active.
 * Order: diff force-show, Show views, areas, schemas, then tag closure.
 * A table excluded before tag closure cannot be added back.
 */
export const useCanvasFilterVisibility = (): TagCanvasVisibility | null => {
    const { tables, relationships, tagAssignments, databaseType } =
        useChartDB();
    const { checkIfNewTable } = useDiff();
    const {
        selectedTagIds,
        tagMatchMode,
        selectedAreaIds,
        selectedSchemaIds,
        hasTagConstraint,
        hasAreaConstraint,
        hasSchemaConstraint,
        showViews,
    } = useEditorFilters();

    return useMemo(() => {
        const defaultSchema = defaultSchemas[databaseType];
        const eligibleTableIds = new Set<string>();

        for (const table of tables) {
            if (checkIfNewTable({ tableId: table.id })) {
                eligibleTableIds.add(table.id);
                continue;
            }

            if (!showViews && table.isView) {
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

        const everyTableEligible = tables.every((table) =>
            eligibleTableIds.has(table.id)
        );

        if (
            everyTableEligible &&
            !hasTagConstraint &&
            !hasAreaConstraint &&
            !hasSchemaConstraint
        ) {
            return null;
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
        databaseType,
        showViews,
        checkIfNewTable,
    ]);
};
