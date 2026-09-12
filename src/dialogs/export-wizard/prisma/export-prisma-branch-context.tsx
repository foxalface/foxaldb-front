import React from 'react';
import { useTranslation } from 'react-i18next';
import type { PrismaExportVersion } from '@/lib/api/prisma-export-types';

interface ExportPrismaBranchContextProps {
    version: PrismaExportVersion | null;
}

export const ExportPrismaBranchContext: React.FC<
    ExportPrismaBranchContextProps
> = ({ version }) => {
    const { t } = useTranslation();

    const segments = [
        t('export_wizard.title'),
        t('export_wizard.targets.prisma.title'),
    ];

    if (version === '6') {
        segments.push(t('export_wizard.prisma.version_step.prisma_6'));
    } else if (version === '7') {
        segments.push(t('export_wizard.prisma.version_step.prisma_7'));
    }

    return (
        <p
            className="text-xs text-muted-foreground"
            data-testid="export-prisma-branch-context"
        >
            {segments.join(' → ')}
        </p>
    );
};
