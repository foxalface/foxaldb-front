import React from 'react';
import { Info } from 'lucide-react';
import { Label } from '@/components/label/label';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/tooltip/tooltip';

interface ExportWizardFieldLabelProps {
    htmlFor: string;
    label: string;
    tooltipAriaLabel: string;
    tooltipContent: string;
}

export const ExportWizardFieldLabel: React.FC<ExportWizardFieldLabelProps> = ({
    htmlFor,
    label,
    tooltipAriaLabel,
    tooltipContent,
}) => (
    <div className="flex items-center gap-1.5">
        <Label htmlFor={htmlFor}>{label}</Label>
        <Tooltip>
            <TooltipTrigger asChild>
                <button
                    type="button"
                    className="inline-flex size-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={tooltipAriaLabel}
                    data-testid={`${htmlFor}-info`}
                >
                    <Info className="size-3.5" aria-hidden />
                </button>
            </TooltipTrigger>
            <TooltipContent
                side="bottom"
                className="max-w-xs whitespace-pre-line"
            >
                {tooltipContent}
            </TooltipContent>
        </Tooltip>
    </div>
);
