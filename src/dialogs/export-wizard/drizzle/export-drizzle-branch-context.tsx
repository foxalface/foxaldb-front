import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    DRIZZLE_EXPORT_KIT_VERSION,
    DRIZZLE_EXPORT_ORM_VERSION,
} from '@/lib/export/drizzle-export-constants';

export const ExportDrizzleBranchContext: React.FC = () => {
    const { t } = useTranslation();

    const segments = [
        t('export_wizard.title'),
        t('export_wizard.targets.drizzle.title'),
        t('export_wizard.drizzle.result_step.drizzle_version', {
            orm: DRIZZLE_EXPORT_ORM_VERSION,
            kit: DRIZZLE_EXPORT_KIT_VERSION,
        }),
    ];

    return (
        <p
            className="text-xs text-muted-foreground"
            data-testid="export-drizzle-branch-context"
        >
            {segments.join(' → ')}
        </p>
    );
};
