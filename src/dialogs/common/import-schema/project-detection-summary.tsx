import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { ProjectDetectionCandidate } from '@/lib/project-import/project-types';
import { PROJECT_FRAMEWORK_LABEL_KEYS } from '@/lib/project-import/framework-labels';
import { getProjectSummaryMetrics } from '@/lib/project-import/project-summary-metrics';
import { isRemoteParserFramework } from '@/lib/project-import/parser-location';
import { useTranslation } from 'react-i18next';

interface ProjectDetectionSummaryProps {
    candidate: ProjectDetectionCandidate;
    isAuthenticated: boolean;
}

export const ProjectDetectionSummary: React.FC<
    ProjectDetectionSummaryProps
> = ({ candidate, isAuthenticated }) => {
    const { t } = useTranslation();
    const frameworkLabel = t(PROJECT_FRAMEWORK_LABEL_KEYS[candidate.framework]);
    const metrics = getProjectSummaryMetrics(candidate);

    const metricLabel =
        metrics.kind === 'migrations'
            ? t('new_diagram_dialog.import_schema.project.migrations_found', {
                  count: metrics.count,
              })
            : t('new_diagram_dialog.import_schema.project.schema_files_found', {
                  count: metrics.count,
              });

    const showRootPath = candidate.rootPath.length > 0;

    return (
        <div className="flex flex-col gap-2 rounded-md border border-border bg-muted/30 p-3 text-sm">
            <div className="flex items-start gap-2">
                <CheckCircle2
                    className="mt-0.5 size-4 shrink-0 text-green-600"
                    aria-hidden
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
                    <p className="text-muted-foreground">{metricLabel}</p>
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

            {isRemoteParserFramework(candidate.framework) &&
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
