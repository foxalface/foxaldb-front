import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/button/button';
import { Checkbox } from '@/components/checkbox/checkbox';
import { ScrollArea } from '@/components/scroll-area/scroll-area';
import {
    SidePanelEmptyState,
    SidePanelEmptyStateViewport,
    sidePanelEmptyStateIcon,
} from '@/components/side-panel-empty-state/side-panel-empty-state';
import {
    sidePanelFilterClearButtonClassName,
    sidePanelFilterClearButtonIcon,
} from '@/components/side-panel-empty-state/side-panel-filter-clear-action';
import { ToggleGroup, ToggleGroupItem } from '@/components/toggle/toggle-group';
import { useChartDB } from '@/hooks/use-chartdb';
import { useTagFilter } from '@/context/tag-filter-context/use-tag-filter';
import type { TagMatchMode } from '@/lib/domain/diagram-tag';

const matchModes: readonly TagMatchMode[] = ['any', 'all', 'none'];

export const FiltersSection: React.FC = () => {
    const { t } = useTranslation();
    const { currentDiagram } = useChartDB();
    const {
        selectedTagIds,
        matchMode,
        hasTagConstraint,
        toggleTag,
        setMatchMode,
        clearTagFilter,
    } = useTagFilter();
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
    const showClear = hasTagConstraint || matchMode !== 'any';

    return (
        <section
            className="flex flex-1 flex-col overflow-hidden px-2"
            data-vaul-no-drag
        >
            <div className="flex items-start justify-between gap-2 py-2">
                <div className="min-w-0">
                    <h2 className="text-sm font-semibold">
                        {t('side_panel.filters_section.title')}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                        {hasTagConstraint
                            ? t('side_panel.filters_section.summary.selected', {
                                  count: selectedTagIds.length,
                              })
                            : t(
                                  'side_panel.filters_section.summary.no_constraint'
                              )}
                    </p>
                </div>
                {showClear ? (
                    <Button
                        type="button"
                        variant="outline"
                        className={sidePanelFilterClearButtonClassName}
                        onClick={clearTagFilter}
                    >
                        {sidePanelFilterClearButtonIcon}
                        {t('side_panel.filters_section.clear')}
                    </Button>
                ) : null}
            </div>
            <div className="flex flex-col gap-1 pb-2">
                <p className="text-xs font-medium">
                    {t('side_panel.filters_section.match_label')}
                </p>
                <ToggleGroup
                    type="single"
                    value={matchMode}
                    onValueChange={(value) => {
                        if (
                            value === 'any' ||
                            value === 'all' ||
                            value === 'none'
                        ) {
                            setMatchMode(value);
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
                    {t(`side_panel.filters_section.match.${matchMode}_hint`)}
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
        </section>
    );
};
