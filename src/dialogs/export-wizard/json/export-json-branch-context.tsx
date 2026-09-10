import React from 'react';
import { useTranslation } from 'react-i18next';

export const ExportJsonBranchContext: React.FC = () => {
    const { t } = useTranslation();

    const segments = [
        t('export_wizard.title'),
        t('export_wizard.targets.diagram_json.title'),
    ];

    return (
        <p
            className="text-xs text-muted-foreground"
            data-testid="export-json-branch-context"
        >
            {segments.join(' → ')}
        </p>
    );
};
