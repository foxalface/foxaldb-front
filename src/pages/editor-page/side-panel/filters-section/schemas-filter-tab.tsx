import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox } from '@/components/checkbox/checkbox';
import { ScrollArea } from '@/components/scroll-area/scroll-area';
import {
    SidePanelEmptyState,
    SidePanelEmptyStateViewport,
    sidePanelEmptyStateIcon,
} from '@/components/side-panel-empty-state/side-panel-empty-state';
import { useEditorFilters } from '@/context/editor-filters-context/use-editor-filters';
import { useChartDB } from '@/hooks/use-chartdb';
import { listDiagramSchemaOptions } from '@/lib/domain/editor-filter-eligibility';
import { FilterConstraintHeader } from './filter-constraint-header';

export const SchemasFilterTab: React.FC = () => {
    const { t } = useTranslation();
    const { currentDiagram } = useChartDB();
    const {
        selectedSchemaIds,
        hasSchemaConstraint,
        toggleSchema,
        clearSchemaFilter,
    } = useEditorFilters();
    const tables = useMemo(
        () => currentDiagram.tables ?? [],
        [currentDiagram.tables]
    );
    const schemas = useMemo(
        () => listDiagramSchemaOptions(tables, currentDiagram.databaseType),
        [tables, currentDiagram.databaseType]
    );
    const selectedIds = useMemo(
        () => new Set(selectedSchemaIds),
        [selectedSchemaIds]
    );

    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <FilterConstraintHeader
                summary={
                    hasSchemaConstraint
                        ? t('side_panel.filters_section.summary.selected', {
                              count: selectedSchemaIds.length,
                          })
                        : t('side_panel.filters_section.schemas.no_constraint')
                }
                showClear={hasSchemaConstraint}
                onClear={clearSchemaFilter}
            />
            {schemas.length === 0 ? (
                <SidePanelEmptyStateViewport>
                    <SidePanelEmptyState
                        icon={sidePanelEmptyStateIcon}
                        title={t('side_panel.filters_section.schemas.empty')}
                    />
                </SidePanelEmptyStateViewport>
            ) : (
                <ScrollArea className="min-h-0 flex-1">
                    <ul className="flex flex-col gap-1 pb-2">
                        {schemas.map((schema) => (
                            <li key={schema.id}>
                                <label className="flex items-center gap-2 rounded-md p-1 hover:bg-muted/50">
                                    <Checkbox
                                        checked={selectedIds.has(schema.id)}
                                        onCheckedChange={() =>
                                            toggleSchema(schema.id)
                                        }
                                        aria-label={schema.name}
                                    />
                                    <span
                                        className="min-w-0 flex-1 truncate text-sm"
                                        title={schema.name}
                                    >
                                        {schema.name}
                                    </span>
                                </label>
                            </li>
                        ))}
                    </ul>
                </ScrollArea>
            )}
        </div>
    );
};
