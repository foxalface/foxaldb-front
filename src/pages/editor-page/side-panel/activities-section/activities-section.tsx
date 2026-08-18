import React, { useCallback, useMemo, useRef, useState } from 'react';
import { History } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Input } from '@/components/input/input';
import { ScrollArea } from '@/components/scroll-area/scroll-area';
import { Spinner } from '@/components/spinner/spinner';
import { Button } from '@/components/button/button';
import { SidePanelEmptyState } from '@/components/side-panel-empty-state/side-panel-empty-state';
import { SidePanelFilterEmptyState } from '@/components/side-panel-empty-state/side-panel-filter-empty-state';
import { useAuth } from '@/hooks/use-auth';
import { ActivityListItem } from './activity-list-item';
import {
    filterActivities,
    hasActiveActivitiesFilter,
    DEFAULT_SELECTED_ACTIVITY_ENTITY_TYPES,
} from './filter-activities';
import { useActivitiesPanel } from './use-activities-panel';
import { ActivityEntityTypeFilter } from './activity-entity-type-filter';
import type { ActivityEntityType } from '@/components/side-panel/side-panel-entity-type-icons';

export interface ActivitiesSectionProps {}

export const ActivitiesSection: React.FC<ActivitiesSectionProps> = () => {
    const { t } = useTranslation();
    const { diagramId } = useParams<{ diagramId: string }>();
    const { user } = useAuth();
    const [filterText, setFilterText] = useState('');
    const [selectedEntityTypes, setSelectedEntityTypes] = useState<
        ActivityEntityType[]
    >(DEFAULT_SELECTED_ACTIVITY_ENTITY_TYPES);
    const filterInputRef = useRef<HTMLInputElement>(null);
    const { activities, status, isRetrying, handleRetry } =
        useActivitiesPanel(diagramId);

    const filterOptions = useMemo(
        () => ({
            filterText,
            selectedEntityTypes,
        }),
        [filterText, selectedEntityTypes]
    );

    const filterContext = useMemo(
        () => ({
            t,
            currentUserId: user?.id,
        }),
        [t, user?.id]
    );

    const filteredActivities = useMemo(
        () => filterActivities(activities, filterOptions, filterContext),
        [activities, filterContext, filterOptions]
    );

    const hasActiveFilter = hasActiveActivitiesFilter(filterOptions);

    const handleClearFilter = useCallback(() => {
        setFilterText('');
        setSelectedEntityTypes(DEFAULT_SELECTED_ACTIVITY_ENTITY_TYPES);
    }, []);

    const isInitialLoading = status === 'loading' || status === 'idle';
    const isLoadError = status === 'error';

    return (
        <section
            className="flex h-full min-h-0 flex-1 flex-col overflow-hidden"
            aria-label={t('side_panel.activities_section.title')}
            data-vaul-no-drag
        >
            <div className="flex items-center gap-2 px-2 py-1">
                <div className="flex-1">
                    <Input
                        ref={filterInputRef}
                        type="text"
                        placeholder={t('side_panel.activities_section.filter')}
                        className="h-8 w-full focus-visible:ring-0"
                        value={filterText}
                        onChange={(event) => setFilterText(event.target.value)}
                    />
                </div>
                <ActivityEntityTypeFilter
                    selectedEntityTypes={selectedEntityTypes}
                    onSelectedEntityTypesChange={setSelectedEntityTypes}
                />
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-2">
                {isInitialLoading ? (
                    <div
                        className="flex flex-1 flex-col items-center justify-center gap-2 py-8"
                        aria-busy="true"
                        role="status"
                    >
                        <Spinner size="small" />
                        <span className="text-sm text-muted-foreground">
                            {t('side_panel.activities_section.loading')}
                        </span>
                    </div>
                ) : isLoadError ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-8 text-center">
                        <p className="text-sm text-muted-foreground">
                            {t(
                                'side_panel.activities_section.errors.load_failed'
                            )}
                        </p>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleRetry}
                            disabled={isRetrying}
                        >
                            {t('side_panel.activities_section.retry')}
                        </Button>
                    </div>
                ) : (
                    <ScrollArea className="h-full">
                        {activities.length === 0 ? (
                            <SidePanelEmptyState
                                icon={
                                    <History
                                        className="size-12"
                                        strokeWidth={1.25}
                                        aria-hidden="true"
                                    />
                                }
                                title={t(
                                    'side_panel.activities_section.empty_state.title'
                                )}
                                description={t(
                                    'side_panel.activities_section.empty_state.description'
                                )}
                            />
                        ) : hasActiveFilter &&
                          filteredActivities.length === 0 ? (
                            <SidePanelFilterEmptyState
                                title={t(
                                    'side_panel.activities_section.no_results'
                                )}
                                clearLabel={t(
                                    'side_panel.activities_section.clear'
                                )}
                                onClearFilter={handleClearFilter}
                            />
                        ) : (
                            <ul>
                                {filteredActivities.map((activity) => (
                                    <ActivityListItem
                                        key={activity.id}
                                        activity={activity}
                                        currentUserId={user?.id}
                                    />
                                ))}
                            </ul>
                        )}
                    </ScrollArea>
                )}
            </div>
        </section>
    );
};
