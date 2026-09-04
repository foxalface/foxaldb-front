import React from 'react';
import type { ProjectDetectionCandidate } from '@/lib/project-import/project-types';
import { PROJECT_FRAMEWORK_LABEL_KEYS } from '@/lib/project-import/framework-labels';
import { ProjectFrameworkIcon } from '@/lib/project-import/project-framework-icon';
import {
    getProjectSummaryMetricTranslationKey,
    getProjectSummaryMetrics,
} from '@/lib/project-import/project-summary-metrics';
import { isRemoteParserFramework } from '@/lib/project-import/parser-location';
import { useTranslation } from 'react-i18next';

interface ProjectDetectionSummaryProps {
    candidate: ProjectDetectionCandidate;
    isAuthenticated: boolean;
    variant?: 'full' | 'detected-only';
}

export const ProjectDetectionSummary: React.FC<
    ProjectDetectionSummaryProps
> = ({ candidate, isAuthenticated, variant = 'full' }) => {
    const { t } = useTranslation();
    const frameworkLabel = t(PROJECT_FRAMEWORK_LABEL_KEYS[candidate.framework]);
    const metrics = getProjectSummaryMetrics(candidate);
    const metricLabel = t(getProjectSummaryMetricTranslationKey(metrics), {
        count: metrics.count,
    });

    const showRootPath = variant === 'full' && candidate.rootPath.length > 0;

    return (
        <div className="flex flex-col gap-2 rounded-md border border-border bg-muted/30 p-3 text-sm">
            <div className="flex items-start gap-2">
                <ProjectFrameworkIcon
                    framework={candidate.framework}
                    className="mt-0.5 size-4 shrink-0"
                />
                <div className="flex min-w-0 flex-col gap-1">
                    <p className="font-medium">
                        {t(
                            'new_diagram_dialog.import_schema.project.detected',
                            {
                                framework: frameworkLabel,
                            }
                        )}
                    </p>
                    {variant === 'full' ? (
                        <p className="text-muted-foreground">{metricLabel}</p>
                    ) : null}
                    {showRootPath ? (
                        <p className="text-muted-foreground">
                            {t(
                                'new_diagram_dialog.import_schema.project.project_root',
                                { path: candidate.rootPath }
                            )}
                        </p>
                    ) : null}
                </div>
            </div>

            {variant === 'full' &&
            isRemoteParserFramework(candidate.framework) &&
            !isAuthenticated ? (
                <div className="border-t border-border pt-2 text-xs text-muted-foreground">
                    <p className="text-foreground">
                        {t(
                            'new_diagram_dialog.import_schema.project.sign_in_to_import_framework',
                            { framework: frameworkLabel }
                        )}
                    </p>
                </div>
            ) : null}
        </div>
    );
};
