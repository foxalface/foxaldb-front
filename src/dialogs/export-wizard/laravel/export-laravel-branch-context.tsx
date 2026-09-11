import React from 'react';
import { useTranslation } from 'react-i18next';

export const ExportLaravelBranchContext: React.FC = () => {
    const { t } = useTranslation();

    const segments = [
        t('export_wizard.title'),
        t('export_wizard.targets.laravel.title'),
    ];

    return (
        <p
            className="text-xs text-muted-foreground"
            data-testid="export-laravel-branch-context"
        >
            {segments.join(' → ')}
        </p>
    );
};
