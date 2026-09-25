import React from 'react';
import { Info } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/tooltip/tooltip';

interface ExportWizardInfoTooltipProps {
    ariaLabel: string;
    content: string;
    testId: string;
}

export const ExportWizardInfoTooltip: React.FC<
    ExportWizardInfoTooltipProps
> = ({ ariaLabel, content, testId }) => (
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>
                <button
                    type="button"
                    className="inline-flex size-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={ariaLabel}
                    data-testid={testId}
                >
                    <Info className="size-3.5" aria-hidden />
                </button>
            </TooltipTrigger>
            <TooltipContent
                side="top"
                sideOffset={8}
                className="z-[1100] max-w-xs whitespace-pre-line"
            >
                {content}
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
);
