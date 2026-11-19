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
import { FilterConstraintHeader } from './filter-constraint-header';

export const AreasFilterTab: React.FC = () => {
    const { t } = useTranslation();
    const { currentDiagram } = useChartDB();
    const { selectedAreaIds, hasAreaConstraint, toggleArea, clearAreaFilter } =
        useEditorFilters();
    const areas = useMemo(
        () => currentDiagram.areas ?? [],
        [currentDiagram.areas]
    );
    const sortedAreas = useMemo(
        () =>
            [...areas].sort((left, right) =>
                left.name.localeCompare(right.name)
            ),
        [areas]
    );
    const selectedIds = useMemo(
        () => new Set(selectedAreaIds),
        [selectedAreaIds]
    );

    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <FilterConstraintHeader
                summary={
                    hasAreaConstraint
                        ? t('side_panel.filters_section.summary.selected', {
                              count: selectedAreaIds.length,
                          })
                        : t('side_panel.filters_section.areas.no_constraint')
                }
                showClear={hasAreaConstraint}
                onClear={clearAreaFilter}
            />
            {sortedAreas.length === 0 ? (
                <SidePanelEmptyStateViewport>
                    <SidePanelEmptyState
                        icon={sidePanelEmptyStateIcon}
                        title={t('side_panel.filters_section.areas.empty')}
                    />
                </SidePanelEmptyStateViewport>
            ) : (
                <ScrollArea className="min-h-0 flex-1">
                    <ul className="flex flex-col gap-1 pb-2">
                        {sortedAreas.map((area) => (
                            <li key={area.id}>
                                <label className="flex items-center gap-2 rounded-md p-1 hover:bg-muted/50">
                                    <Checkbox
                                        checked={selectedIds.has(area.id)}
                                        onCheckedChange={() =>
                                            toggleArea(area.id)
                                        }
                                        aria-label={area.name}
                                    />
                                    <span
                                        className="size-3 shrink-0 rounded-sm border border-muted"
                                        style={{ backgroundColor: area.color }}
                                        role="img"
                                        aria-label={t(
                                            'side_panel.filters_section.areas.color'
                                        )}
                                    />
                                    <span
                                        className="min-w-0 flex-1 truncate text-sm"
                                        title={area.name}
                                    >
                                        {area.name}
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
