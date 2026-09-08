import React, { useCallback, useMemo } from 'react';
import { Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CodeSnippet } from '@/components/code-snippet/code-snippet';
import { Spinner } from '@/components/spinner/spinner';
import { Label } from '@/components/label/label';
import { databaseTypeToLabelMap } from '@/lib/databases';
import type { DatabaseType } from '@/lib/domain/database-type';
import { downloadBlob } from '@/lib/download-blob';
import { buildSqlExportFilename } from '@/lib/data/sql-export/build-sql-export-filename';

interface ExportSqlPreviewStepProps {
    diagramName: string;
    sourceDatabaseType: DatabaseType;
    targetDatabaseType: DatabaseType;
    script?: string;
    isLoading: boolean;
    hasError: boolean;
}

export const ExportSqlPreviewStep: React.FC<ExportSqlPreviewStepProps> = ({
    diagramName,
    sourceDatabaseType,
    targetDatabaseType,
    script,
    isLoading,
    hasError,
}) => {
    const { t } = useTranslation();
    const targetLabel = databaseTypeToLabelMap[targetDatabaseType];

    const downloadAction = useMemo(
        () => ({
            label: t('export_wizard.sql.preview_step.download'),
            icon: Download,
            onClick: () => {
                if (!script) {
                    return;
                }

                downloadBlob(
                    new Blob([script], { type: 'application/sql' }),
                    buildSqlExportFilename(
                        diagramName,
                        sourceDatabaseType,
                        targetDatabaseType
                    )
                );
            },
        }),
        [diagramName, script, sourceDatabaseType, targetDatabaseType, t]
    );

    const renderContent = useCallback(() => {
        if (hasError) {
            return (
                <p className="text-sm text-muted-foreground" role="alert">
                    {t('export_wizard.sql.preview_step.error')}
                </p>
            );
        }

        if (isLoading || script === undefined) {
            return (
                <div className="flex flex-col items-center gap-2 py-8">
                    <Spinner />
                    <Label className="text-sm">
                        {t('export_wizard.sql.preview_step.generating', {
                            database: targetLabel,
                        })}
                    </Label>
                </div>
            );
        }

        if (script.length === 0) {
            return (
                <p className="text-sm text-muted-foreground" role="alert">
                    {t('export_wizard.sql.preview_step.empty')}
                </p>
            );
        }

        return (
            <div
                className="h-96 min-h-72 w-full shrink-0"
                data-testid="export-sql-preview-container"
            >
                <CodeSnippet
                    className="size-full flex-none"
                    code={script}
                    language="sql"
                    autoScroll={true}
                    isComplete={!isLoading}
                    actions={[downloadAction]}
                    actionsTooltipSide="top"
                    editorProps={{
                        options: {
                            scrollbar: {
                                vertical: 'auto',
                                horizontal: 'auto',
                            },
                        },
                    }}
                />
            </div>
        );
    }, [downloadAction, hasError, isLoading, script, t, targetLabel]);

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-3">
            <p className="text-sm text-muted-foreground">
                {t('export_wizard.sql.preview_step.target_label', {
                    database: targetLabel,
                })}
            </p>
            <div className="flex min-h-0 flex-1 flex-col">
                {renderContent()}
            </div>
        </div>
    );
};
