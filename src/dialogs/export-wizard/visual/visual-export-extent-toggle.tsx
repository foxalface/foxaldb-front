import React, { useCallback } from 'react';
import { Crop, Expand, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsList, TabsTrigger } from '@/components/tabs/tabs';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/tooltip/tooltip';
import { sidePanelSectionTabListClassName } from '@/components/side-panel-section-tabs/side-panel-section-tabs';
import type { VisualExportExtent } from '@/lib/visual-export/visual-export-options';
import { cn } from '@/lib/utils';

const visualExtentTabTriggerClassName =
    'group flex h-auto min-h-0 w-full min-w-0 flex-col items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-center text-sm transition-all data-[state=active]:bg-sky-600 data-[state=active]:text-white data-[state=inactive]:text-muted-foreground data-[state=active]:shadow-sm data-[state=inactive]:hover:bg-muted/50 data-[state=inactive]:hover:text-foreground dark:data-[state=active]:bg-sky-500';

interface ExtentOptionProps {
    value: VisualExportExtent;
    icon: LucideIcon;
    title: string;
    description: string;
    testId: string;
    disabled?: boolean;
}

const ExtentOption: React.FC<ExtentOptionProps> = ({
    value,
    icon: Icon,
    title,
    description,
    testId,
    disabled = false,
}) => (
    <TabsTrigger
        value={value}
        className={visualExtentTabTriggerClassName}
        disabled={disabled}
        data-testid={testId}
        aria-label={title}
    >
        <Tooltip>
            <TooltipTrigger asChild>
                <span className="inline-flex flex-col items-center gap-1.5">
                    <Icon className="size-6 shrink-0" aria-hidden />
                    <span className="font-medium leading-snug">{title}</span>
                </span>
            </TooltipTrigger>
            <TooltipContent
                side="bottom"
                className="max-w-xs whitespace-pre-line"
            >
                {description}
            </TooltipContent>
        </Tooltip>
    </TabsTrigger>
);

interface VisualExportExtentToggleProps {
    value: VisualExportExtent;
    onValueChange: (extent: VisualExportExtent) => void;
    disabled?: boolean;
}

export const VisualExportExtentToggle: React.FC<
    VisualExportExtentToggleProps
> = ({ value, onValueChange, disabled = false }) => {
    const { t } = useTranslation();

    const handleValueChange = useCallback(
        (next: string) => {
            if (next === 'diagram' || next === 'viewport') {
                onValueChange(next);
            }
        },
        [onValueChange]
    );

    return (
        <TooltipProvider>
            <Tabs
                value={value}
                onValueChange={handleValueChange}
                data-testid="visual-export-extent-toggle"
            >
                <TabsList
                    className={cn(
                        sidePanelSectionTabListClassName,
                        'h-auto items-stretch'
                    )}
                    aria-label={t(
                        'export_wizard.visual.options_step.extent_label'
                    )}
                >
                    <ExtentOption
                        value="diagram"
                        icon={Expand}
                        title={t(
                            'export_wizard.visual.options_step.extent_diagram'
                        )}
                        description={t(
                            'export_wizard.visual.options_step.extent_diagram_description'
                        )}
                        testId="visual-extent-diagram"
                        disabled={disabled}
                    />
                    <ExtentOption
                        value="viewport"
                        icon={Crop}
                        title={t(
                            'export_wizard.visual.options_step.extent_viewport'
                        )}
                        description={t(
                            'export_wizard.visual.options_step.extent_viewport_description'
                        )}
                        testId="visual-extent-viewport"
                        disabled={disabled}
                    />
                </TabsList>
            </Tabs>
        </TooltipProvider>
    );
};
