import React from 'react';
import { useTranslation } from 'react-i18next';
import { DJANGO_EXPORT_VERSION } from '@/lib/export/django-export-constants';

export const ExportDjangoBranchContext: React.FC = () => {
    const { t } = useTranslation();

    const segments = [
        t('export_wizard.title'),
        t('export_wizard.targets.django.title'),
        t('export_wizard.django.result_step.django_version', {
            version: DJANGO_EXPORT_VERSION,
        }),
    ];

    return (
        <p
            className="text-xs text-muted-foreground"
            data-testid="export-django-branch-context"
        >
            {segments.join(' → ')}
        </p>
    );
};
