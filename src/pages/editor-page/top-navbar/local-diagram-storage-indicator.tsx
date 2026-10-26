import React from 'react';
import { Laptop } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/tooltip/tooltip';
import { useChartDB } from '@/hooks/use-chartdb';
import { isValidBackendDiagramId } from '@/lib/realtime/diagram-id';
import { useTranslation } from 'react-i18next';

export const LocalDiagramStorageIndicator: React.FC = () => {
    const { t } = useTranslation();
    const { currentDiagram } = useChartDB();

    if (!currentDiagram?.id || isValidBackendDiagramId(currentDiagram.id)) {
        return null;
    }

    const title = t('open_diagram_dialog.tabs.device');

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span
                    aria-label={title}
                    className="inline-flex shrink-0 items-center justify-center text-muted-foreground"
                >
                    <Laptop className="size-3.5 shrink-0" aria-hidden="true" />
                </span>
            </TooltipTrigger>
            <TooltipContent
                side="bottom"
                sideOffset={8}
                className="z-[1100] max-w-xs"
            >
                <div className="flex flex-col gap-1">
                    <p className="font-medium">{title}</p>
                    <p className="text-primary-foreground/90">
                        {t(
                            'open_diagram_dialog.local_storage_indicator.description'
                        )}
                    </p>
                </div>
            </TooltipContent>
        </Tooltip>
    );
};
