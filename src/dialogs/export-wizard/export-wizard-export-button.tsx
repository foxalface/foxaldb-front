import React from 'react';
import { Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, type ButtonProps } from '@/components/button/button';

export const ExportWizardExportButton = React.forwardRef<
    HTMLButtonElement,
    ButtonProps
>(({ children, ...props }, ref) => {
    const { t } = useTranslation();

    return (
        <Button ref={ref} {...props}>
            <Download className="mr-1 size-4" aria-hidden />
            {children ?? t('export_wizard.export')}
        </Button>
    );
});

ExportWizardExportButton.displayName = 'ExportWizardExportButton';
