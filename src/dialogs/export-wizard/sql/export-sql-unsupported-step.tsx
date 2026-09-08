import React from 'react';
import { useTranslation } from 'react-i18next';
import { databaseTypeToLabelMap } from '@/lib/databases';
import type { DatabaseType } from '@/lib/domain/database-type';

interface ExportSqlUnsupportedStepProps {
    sourceDatabaseType: DatabaseType;
}

export const ExportSqlUnsupportedStep: React.FC<
    ExportSqlUnsupportedStepProps
> = ({ sourceDatabaseType }) => {
    const { t } = useTranslation();
    const sourceLabel = databaseTypeToLabelMap[sourceDatabaseType];

    return (
        <div className="flex flex-col gap-3" role="alert">
            <p className="text-sm font-medium">
                {t('export_wizard.sql.unsupported_source.title', {
                    database: sourceLabel,
                })}
            </p>
            <p className="text-sm text-muted-foreground">
                {t('export_wizard.sql.unsupported_source.description')}
            </p>
        </div>
    );
};
