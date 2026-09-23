import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsList, TabsTrigger } from '@/components/tabs/tabs';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/tooltip/tooltip';
import {
    sidePanelSectionTabListClassName,
    sidePanelSectionTabTriggerClassName,
} from '@/components/side-panel-section-tabs/side-panel-section-tabs';
import { cn } from '@/lib/utils';

const SCALE_OPTIONS = [1, 2, 4] as const;

interface VisualExportScaleToggleProps {
    value: number;
    onValueChange: (scale: number) => void;
    disabled?: boolean;
}

export const VisualExportScaleToggle: React.FC<
    VisualExportScaleToggleProps
> = ({ value, onValueChange, disabled = false }) => {
    const { t } = useTranslation();

    const handleValueChange = useCallback(
        (next: string) => {
            const scale = Number.parseInt(next, 10);

            if (scale === 1 || scale === 2 || scale === 4) {
                onValueChange(scale);
            }
        },
        [onValueChange]
    );

    const scaleLabel = t('export_wizard.visual.options_step.scale_label');
    const scaleDescription = t(
        'export_wizard.visual.options_step.scale_description'
    );

    return (
        <Tabs
            value={String(value)}
            onValueChange={handleValueChange}
            data-testid="visual-export-scale-toggle"
        >
            <Tooltip>
                <TooltipTrigger asChild>
                    <span className="block w-full">
                        <TabsList
                            className={cn(
                                sidePanelSectionTabListClassName,
                                'grid-cols-3'
                            )}
                            aria-label={scaleLabel}
                        >
                            {SCALE_OPTIONS.map((option) => (
                                <TabsTrigger
                                    key={option}
                                    value={String(option)}
                                    className={
                                        sidePanelSectionTabTriggerClassName
                                    }
                                    disabled={disabled}
                                    data-testid={`visual-scale-${option}x`}
                                >
                                    {t(
                                        `export_wizard.visual.options_step.scale_${option}x`
                                    )}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </span>
                </TooltipTrigger>
                <TooltipContent
                    side="bottom"
                    className="max-w-xs whitespace-pre-line"
                >
                    {scaleDescription}
                </TooltipContent>
            </Tooltip>
        </Tabs>
    );
};
