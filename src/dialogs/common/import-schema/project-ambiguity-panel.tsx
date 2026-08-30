import React, { useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/toggle/toggle-group';
import type { ProjectDetectionCandidate } from '@/lib/project-import/project-types';
import {
    PROJECT_FRAMEWORK_LABEL_KEYS,
    getProjectCandidateKey,
} from '@/lib/project-import/framework-labels';
import { getProjectSummaryMetrics } from '@/lib/project-import/project-summary-metrics';
import { getSelectableCandidates } from '@/lib/project-import/detection/detect-project';
import { useTranslation } from 'react-i18next';

interface ProjectAmbiguityPanelProps {
    candidates: ProjectDetectionCandidate[];
    selectedCandidateKey: string | null;
    onSelect: (candidate: ProjectDetectionCandidate) => void;
}

export const ProjectAmbiguityPanel: React.FC<ProjectAmbiguityPanelProps> = ({
    candidates,
    selectedCandidateKey,
    onSelect,
}) => {
    const { t } = useTranslation();
    const selectableCandidates = useMemo(
        () => getSelectableCandidates(candidates),
        [candidates]
    );

    return (
        <div className="flex flex-col gap-3 rounded-md border border-border bg-muted/30 p-3 text-sm">
            <div className="flex items-start gap-2">
                <AlertTriangle
                    className="mt-0.5 size-4 shrink-0 text-amber-600"
                    aria-hidden
                />
                <div className="flex flex-col gap-1">
                    <p className="font-medium">
                        {t(
                            'new_diagram_dialog.import_schema.project.multiple_projects_title'
                        )}
                    </p>
                    <p className="text-muted-foreground">
                        {t(
                            'new_diagram_dialog.import_schema.project.multiple_projects_description'
                        )}
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <p className="text-xs font-medium text-muted-foreground">
                    {t(
                        'new_diagram_dialog.import_schema.project.choose_project'
                    )}
                </p>
                <ToggleGroup
                    type="single"
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
                    className="flex flex-col gap-2"
                    aria-label={t(
                        'new_diagram_dialog.import_schema.project.choose_project'
                    )}
                >
                    {selectableCandidates.map((candidate) => {
                        const candidateKey = getProjectCandidateKey(candidate);
                        const frameworkLabel = t(
                            PROJECT_FRAMEWORK_LABEL_KEYS[candidate.framework]
                        );
                        const metrics = getProjectSummaryMetrics(candidate);
                        const metricLabel =
                            metrics.kind === 'migrations'
                                ? t(
                                      'new_diagram_dialog.import_schema.project.migrations_found',
                                      { count: metrics.count }
                                  )
                                : t(
                                      'new_diagram_dialog.import_schema.project.schema_files_found',
                                      { count: metrics.count }
                                  );

                        return (
                            <ToggleGroupItem
                                key={candidateKey}
                                value={candidateKey}
                                className="h-auto w-full justify-start px-3 py-2 text-left"
                                aria-label={`${frameworkLabel} ${candidate.rootPath}`}
                            >
                                <div className="flex min-w-0 flex-col gap-0.5">
                                    <span className="font-medium">
                                        {frameworkLabel}
                                    </span>
                                    {candidate.rootPath.length > 0 ? (
                                        <span className="truncate text-xs text-muted-foreground">
                                            {candidate.rootPath}
                                        </span>
                                    ) : null}
                                    <span className="text-xs text-muted-foreground">
                                        {metricLabel}
                                    </span>
                                </div>
                            </ToggleGroupItem>
                        );
                    })}
                </ToggleGroup>
            </div>
        </div>
    );
};
