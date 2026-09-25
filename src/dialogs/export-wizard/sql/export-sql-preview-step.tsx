import React from 'react';
import { useTranslation } from 'react-i18next';
import { databaseTypeToLabelMap } from '@/lib/databases';
import type { DatabaseType } from '@/lib/domain/database-type';
import { ExportCodePreviewBlock } from '../export-code-preview-block';

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
    const generatingLabel = t('export_wizard.sql.preview_step.generating', {
        database: targetLabel,
    });
    const isContentReady =
        !isLoading && script !== undefined && script.length > 0;

    if (hasError) {
        return (
            <p className="text-sm text-muted-foreground" role="alert">
                {t('export_wizard.sql.preview_step.error')}
            </p>
        );
    }

    if (!isLoading && script !== undefined && script.length === 0) {
        return (
            <p className="text-sm text-muted-foreground" role="alert">
                {t('export_wizard.sql.preview_step.empty')}
            </p>
        );
    }

    return (
        <ExportCodePreviewBlock
            code={isContentReady ? script : undefined}
            isLoading={!isContentReady}
            language="sql"
            loadingAriaLabel={generatingLabel}
            loadingTestId="export-sql-generating"
            containerTestId={
                isContentReady ? 'export-sql-preview-container' : undefined
            }
        />
    );
};
