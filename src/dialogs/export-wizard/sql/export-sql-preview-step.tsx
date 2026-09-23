import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { CodeSnippet } from '@/components/code-snippet/code-snippet';
import { Spinner } from '@/components/spinner/spinner';
import { Label } from '@/components/label/label';
import { databaseTypeToLabelMap } from '@/lib/databases';
import type { DatabaseType } from '@/lib/domain/database-type';

interface ExportSqlPreviewStepProps {
    targetDatabaseType: DatabaseType;
    script?: string;
    isLoading: boolean;
    hasError: boolean;
}

export const ExportSqlPreviewStep: React.FC<ExportSqlPreviewStepProps> = ({
    targetDatabaseType,
    script,
    isLoading,
    hasError,
}) => {
    const { t } = useTranslation();
    const targetLabel = databaseTypeToLabelMap[targetDatabaseType];

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
                    isComplete={!isLoading}
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
    }, [hasError, isLoading, script, t, targetLabel]);

    return (
        <div className="flex min-h-0 flex-1 flex-col">{renderContent()}</div>
    );
};
