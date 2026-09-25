import React from 'react';
import { Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/tooltip/tooltip';

export const EfCoreExportInfoTooltip: React.FC = () => {
    const { t } = useTranslation();

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        type="button"
                        className="inline-flex size-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground"
                        aria-label={t(
                            'export_wizard.ef_core.options_step.export_info_aria'
                        )}
                        data-testid="ef-core-export-info"
                    >
                        <Info className="size-3.5" aria-hidden />
                    </button>
                </TooltipTrigger>
                <TooltipContent
                    side="top"
                    sideOffset={8}
                    className="z-[1100] max-w-xs whitespace-pre-line"
                >
                    {t('export_wizard.ef_core.options_step.export_info')}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};
