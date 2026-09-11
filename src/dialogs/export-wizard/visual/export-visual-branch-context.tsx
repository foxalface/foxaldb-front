import React from 'react';
import { useTranslation } from 'react-i18next';
import type { VisualExportFormat } from '@/lib/visual-export/visual-export-options';

interface ExportVisualBranchContextProps {
    format: VisualExportFormat;
}

export const ExportVisualBranchContext: React.FC<
    ExportVisualBranchContextProps
> = ({ format }) => {
    const { t } = useTranslation();

    const segments = [
        t('export_wizard.title'),
        t(`export_wizard.targets.${format}.title`),
    ];

    return (
        <p
            className="text-xs text-muted-foreground"
            data-testid="export-visual-branch-context"
        >
            {segments.join(' → ')}
        </p>
    );
};
