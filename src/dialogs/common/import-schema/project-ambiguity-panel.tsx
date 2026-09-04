import React, { useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/toggle/toggle-group';
import { TOGGLE_OUTLINE_SELECTION_CLASS } from '@/components/toggle/toggle-variants';
import type { ProjectDetectionCandidate } from '@/lib/project-import/project-types';
import {
    PROJECT_FRAMEWORK_LABEL_KEYS,
    getProjectCandidateKey,
} from '@/lib/project-import/framework-labels';
import { toDisplayLabel } from '@/lib/project-import/detection/database-groups/group-utils';
import { getSelectableCandidates } from '@/lib/project-import/detection/detect-project';
import {
    getProjectSummaryMetricButtonTranslationKey,
    getProjectSummaryMetricTranslationKey,
    getProjectSummaryMetrics,
} from '@/lib/project-import/project-summary-metrics';
import { ProjectDetectionSummary } from './project-detection-summary';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface ProjectAmbiguityPanelProps {
    candidates: ProjectDetectionCandidate[];
    selectedCandidateKey: string | null;
    detectionCandidate: ProjectDetectionCandidate;
    isAuthenticated: boolean;
    onSelect: (candidate: ProjectDetectionCandidate) => void;
}

const getCandidateDisplayLabel = (
    candidate: ProjectDetectionCandidate
): string => {
    if (candidate.rootPath.length === 0) {
        return candidate.framework;
    }

    const segment =
        candidate.rootPath.split('/').filter(Boolean).pop() ??
        candidate.rootPath;

    return toDisplayLabel(segment);
};

export const ProjectAmbiguityPanel: React.FC<ProjectAmbiguityPanelProps> = ({
    candidates,
    selectedCandidateKey,
    detectionCandidate,
    isAuthenticated,
    onSelect,
}) => {
    const { t } = useTranslation();
    const selectableCandidates = useMemo(
        () => getSelectableCandidates(candidates),
        [candidates]
    );

    return (
        <div
            role="region"
            aria-labelledby="project-ambiguity-resolution-title"
            className="flex flex-col gap-5 text-sm"
        >
            <ProjectDetectionSummary
                candidate={detectionCandidate}
                isAuthenticated={isAuthenticated}
                variant="detected-only"
            />

            <div className="flex items-start gap-3 rounded-lg border border-amber-500 bg-amber-500/10 px-4 py-3 dark:border-amber-500/70 dark:bg-amber-500/15">
                <AlertTriangle
                    className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-500"
                    aria-hidden
                />
                <p
                    id="project-ambiguity-resolution-title"
                    className="font-medium"
                >
                    {t(
                        'new_diagram_dialog.import_schema.project.multiple_projects_title'
                    )}
                </p>
            </div>

            <div className="flex flex-col items-start gap-3">
                <p className="font-medium">
                    {t(
                        'new_diagram_dialog.import_schema.project.choose_project'
                    )}
                </p>
                <ToggleGroup
                    type="single"
                    variant="outline"
                    value={selectedCandidateKey ?? undefined}
                    onValueChange={(value) => {
                        if (!value) {
                            return;
                        }

                        const candidate = selectableCandidates.find(
                            (item) => getProjectCandidateKey(item) === value
                        );

                        if (candidate) {
                            onSelect(candidate);
                        }
                    }}
                    className="flex w-full flex-wrap justify-start gap-3 pb-2 pl-1.5 pt-1.5"
                    aria-label={t(
                        'new_diagram_dialog.import_schema.project.choose_project'
                    )}
                >
                    {selectableCandidates.map((candidate) => {
                        const candidateKey = getProjectCandidateKey(candidate);
                        const frameworkLabel = t(
                            PROJECT_FRAMEWORK_LABEL_KEYS[candidate.framework]
                        );
                        const displayLabel =
                            getCandidateDisplayLabel(candidate);
                        const metrics = getProjectSummaryMetrics(candidate);
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
                                key={candidateKey}
                                value={candidateKey}
                                className={cn(
                                    'h-auto shrink-0 flex-col gap-0.5 px-4 py-2',
                                    TOGGLE_OUTLINE_SELECTION_CLASS
                                )}
                                aria-label={`${frameworkLabel} ${candidate.rootPath} ${metricLabel}`}
                            >
                                <span>{displayLabel}</span>
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
