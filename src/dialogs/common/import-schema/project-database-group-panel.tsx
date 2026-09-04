import React, { useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/toggle/toggle-group';
import { TOGGLE_OUTLINE_SELECTION_CLASS } from '@/components/toggle/toggle-variants';
import type {
    ProjectDatabaseGroup,
    ProjectDetectionCandidate,
} from '@/lib/project-import/project-types';
import { getDatabaseGroupSummaryMetrics } from '@/lib/project-import/database-group-summary-metrics';
import {
    getProjectSummaryMetricButtonTranslationKey,
    getProjectSummaryMetricTranslationKey,
} from '@/lib/project-import/project-summary-metrics';
import { getDatabaseGroupKey } from '@/lib/project-import/detection/database-groups/detect-database-groups';
import { ProjectDetectionSummary } from './project-detection-summary';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface ProjectDatabaseGroupPanelProps {
    groups: ProjectDatabaseGroup[];
    selectedGroupKey: string | null;
    detectedCandidate: ProjectDetectionCandidate;
    isAuthenticated: boolean;
    onSelect: (group: ProjectDatabaseGroup) => void;
}

export const ProjectDatabaseGroupPanel: React.FC<
    ProjectDatabaseGroupPanelProps
> = ({
    groups,
    selectedGroupKey,
    detectedCandidate,
    isAuthenticated,
    onSelect,
}) => {
    const { t } = useTranslation();
    const sortedGroups = useMemo(
        () =>
            [...groups].sort((left, right) =>
                left.label.localeCompare(right.label)
            ),
        [groups]
    );

    return (
        <div
            role="region"
            aria-labelledby="database-group-resolution-title"
            className="flex flex-col gap-5 text-sm"
        >
            <ProjectDetectionSummary
                candidate={detectedCandidate}
                isAuthenticated={isAuthenticated}
                variant="detected-only"
            />

            <div className="flex items-start gap-3 rounded-lg border border-amber-500 bg-amber-500/10 px-4 py-3 dark:border-amber-500/70 dark:bg-amber-500/15">
                <AlertTriangle
                    className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-500"
                    aria-hidden
                />
                <p id="database-group-resolution-title" className="font-medium">
                    {t(
                        'new_diagram_dialog.import_schema.project.multiple_database_groups_title'
                    )}
                </p>
            </div>

            <div className="flex flex-col items-start gap-3">
                <p className="font-medium">
                    {t(
                        'new_diagram_dialog.import_schema.project.choose_database_group'
                    )}
                </p>
                <ToggleGroup
                    type="single"
                    variant="outline"
                    value={selectedGroupKey ?? undefined}
                    onValueChange={(value) => {
                        if (!value) {
                            return;
                        }

                        const group = sortedGroups.find(
                            (item) => getDatabaseGroupKey(item) === value
                        );

                        if (group) {
                            onSelect(group);
                        }
                    }}
                    className="flex w-full flex-wrap justify-start gap-3 pb-2 pl-1.5 pt-1.5"
                    aria-label={t(
                        'new_diagram_dialog.import_schema.project.choose_database_group'
                    )}
                >
                    {sortedGroups.map((group) => {
                        const groupKey = getDatabaseGroupKey(group);
                        const metrics = getDatabaseGroupSummaryMetrics(group);
                        const metricLabel = t(
                            getProjectSummaryMetricTranslationKey(metrics),
                            { count: metrics.count }
                        );
                        const metricButtonLabel = t(
                            getProjectSummaryMetricButtonTranslationKey(
                                metrics
                            ),
                            { count: metrics.count }
                        );

                        return (
                            <ToggleGroupItem
                                key={groupKey}
                                value={groupKey}
                                className={cn(
                                    'h-auto shrink-0 flex-col gap-0.5 px-4 py-2',
                                    TOGGLE_OUTLINE_SELECTION_CLASS
                                )}
                                aria-label={`${group.label} ${metricLabel}`}
                            >
                                <span>{group.label}</span>
                                <span className="text-xs font-normal text-muted-foreground">
                                    {metricButtonLabel}
                                </span>
                            </ToggleGroupItem>
                        );
                    })}
                </ToggleGroup>
            </div>
        </div>
    );
};
