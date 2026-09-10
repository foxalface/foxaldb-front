import React from 'react';
import { useTranslation } from 'react-i18next';

export const ExportDbmlBranchContext: React.FC = () => {
    const { t } = useTranslation();

    const segments = [
        t('export_wizard.title'),
        t('export_wizard.targets.dbml.title'),
    ];

    return (
        <p
            className="text-xs text-muted-foreground"
            data-testid="export-dbml-branch-context"
        >
            {segments.join(' → ')}
        </p>
    );
};
