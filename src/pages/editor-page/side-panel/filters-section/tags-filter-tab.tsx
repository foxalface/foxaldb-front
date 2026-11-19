import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox } from '@/components/checkbox/checkbox';
import { ScrollArea } from '@/components/scroll-area/scroll-area';
import {
    SidePanelEmptyState,
    SidePanelEmptyStateViewport,
    sidePanelEmptyStateIcon,
} from '@/components/side-panel-empty-state/side-panel-empty-state';
import { ToggleGroup, ToggleGroupItem } from '@/components/toggle/toggle-group';
import { useEditorFilters } from '@/context/editor-filters-context/use-editor-filters';
import { useChartDB } from '@/hooks/use-chartdb';
import type { TagMatchMode } from '@/lib/domain/diagram-tag';
import { FilterConstraintHeader } from './filter-constraint-header';

const matchModes: readonly TagMatchMode[] = ['any', 'all', 'none'];

export const TagsFilterTab: React.FC = () => {
    const { t } = useTranslation();
    const { currentDiagram } = useChartDB();
    const {
        selectedTagIds,
        tagMatchMode,
        hasTagConstraint,
        toggleTag,
        setTagMatchMode,
        clearTagFilter,
    } = useEditorFilters();
    const tags = useMemo(
        () => currentDiagram.tags ?? [],
        [currentDiagram.tags]
    );
    const sortedTags = useMemo(
        () =>
            [...tags].sort((left, right) =>
                left.name.localeCompare(right.name)
            ),
        [tags]
    );
    const selectedIds = useMemo(
        () => new Set(selectedTagIds),
        [selectedTagIds]
    );

    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <FilterConstraintHeader
                summary={
                    hasTagConstraint
                        ? t('side_panel.filters_section.summary.selected', {
                              count: selectedTagIds.length,
                          })
                        : t('side_panel.filters_section.summary.no_constraint')
                }
                showClear={hasTagConstraint || tagMatchMode !== 'any'}
                onClear={clearTagFilter}
            />
            <div className="flex flex-col gap-1 pb-2">
                <p className="text-xs font-medium">
                    {t('side_panel.filters_section.match_label')}
                </p>
                <ToggleGroup
                    type="single"
                    value={tagMatchMode}
                    onValueChange={(value) => {
                        if (
                            value === 'any' ||
                            value === 'all' ||
                            value === 'none'
                        ) {
                            setTagMatchMode(value);
                        }
                    }}
                    className="w-full justify-stretch"
                    aria-label={t('side_panel.filters_section.match_label')}
                >
                    {matchModes.map((mode) => (
                        <ToggleGroupItem
                            key={mode}
                            value={mode}
                            className="h-8 flex-1 text-xs"
                            aria-label={t(
                                `side_panel.filters_section.match.${mode}`
                            )}
                        >
                            {t(`side_panel.filters_section.match.${mode}`)}
                        </ToggleGroupItem>
                    ))}
                </ToggleGroup>
                <p className="text-xs text-muted-foreground">
                    {t(`side_panel.filters_section.match.${tagMatchMode}_hint`)}
                </p>
            </div>
            {sortedTags.length === 0 ? (
                <SidePanelEmptyStateViewport>
                    <SidePanelEmptyState
                        icon={sidePanelEmptyStateIcon}
                        title={t('side_panel.filters_section.empty')}
                    />
                </SidePanelEmptyStateViewport>
            ) : (
                <ScrollArea className="min-h-0 flex-1">
                    <ul className="flex flex-col gap-1 pb-2">
                        {sortedTags.map((tag) => (
                            <li key={tag.id}>
                                <label className="flex items-center gap-2 rounded-md p-1 hover:bg-muted/50">
                                    <Checkbox
                                        checked={selectedIds.has(tag.id)}
                                        onCheckedChange={() =>
                                            toggleTag(tag.id)
                                        }
                                        aria-label={tag.name}
                                    />
                                    <span
                                        className="size-3 shrink-0 rounded-sm border border-muted"
                                        style={{ backgroundColor: tag.color }}
                                        role="img"
                                        aria-label={t(
                                            'side_panel.filters_section.tag_color'
                                        )}
                                    />
                                    <span
                                        className="min-w-0 flex-1 truncate text-sm"
                                        title={tag.name}
                                    >
                                        {tag.name}
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
