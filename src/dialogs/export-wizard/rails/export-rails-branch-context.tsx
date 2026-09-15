import React from 'react';
import { useTranslation } from 'react-i18next';

export const ExportRailsBranchContext: React.FC = () => {
    const { t } = useTranslation();

    const segments = [
        t('export_wizard.title'),
        t('export_wizard.targets.rails.title'),
        t('export_wizard.rails.result_step.rails_8_1'),
    ];

    return (
        <p
            className="text-xs text-muted-foreground"
            data-testid="export-rails-branch-context"
        >
            {segments.join(' → ')}
        </p>
    );
};
