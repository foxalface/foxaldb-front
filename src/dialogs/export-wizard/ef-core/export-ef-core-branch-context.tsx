import React from 'react';
import { useTranslation } from 'react-i18next';

interface ExportEfCoreBranchContextProps {
    showResult: boolean;
}

export const ExportEfCoreBranchContext: React.FC<
    ExportEfCoreBranchContextProps
> = ({ showResult }) => {
    const { t } = useTranslation();

    const segments = [
        t('export_wizard.title'),
        t('export_wizard.targets.ef_core.title'),
    ];

    if (showResult) {
        segments.push(t('export_wizard.ef_core.options_step.ef_core_10'));
    }

    return (
        <p
            className="text-xs text-muted-foreground"
            data-testid="export-ef-core-branch-context"
        >
            {segments.join(' → ')}
        </p>
    );
};
