import React from 'react';
import { useTranslation } from 'react-i18next';
import { databaseTypeToLabelMap } from '@/lib/databases';
import type { DatabaseType } from '@/lib/domain/database-type';

interface ExportSqlBranchContextProps {
    targetDatabaseType?: DatabaseType | null;
}

export const ExportSqlBranchContext: React.FC<ExportSqlBranchContextProps> = ({
    targetDatabaseType,
}) => {
    const { t } = useTranslation();

    const segments = [
        t('export_wizard.title'),
        t('export_wizard.targets.sql.title'),
    ];

    if (targetDatabaseType) {
        segments.push(databaseTypeToLabelMap[targetDatabaseType]);
    }

    return (
        <p
            className="text-xs text-muted-foreground"
            data-testid="export-sql-branch-context"
        >
            {segments.join(' → ')}
        </p>
    );
};
