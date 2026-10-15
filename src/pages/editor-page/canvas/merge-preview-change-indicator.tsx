import React from 'react';
import { useTranslation } from 'react-i18next';
import type { MergeChangeVisual } from '@/lib/schema-merge/preview/preview-types';
import { MERGE_CHANGE_VISUAL } from '@/lib/schema-merge/preview/merge-preview-visual';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/tooltip/tooltip';
import { cn } from '@/lib/utils';

export const MERGE_PREVIEW_INDICATOR_BUBBLE_CLASS =
    'inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-border bg-background/95 shadow-sm';

export const MergePreviewChangeIndicator: React.FC<{
    change: MergeChangeVisual;
    className?: string;
    variant?: 'inline' | 'bubble';
}> = ({ change, className, variant = 'inline' }) => {
    const { t } = useTranslation();
    const visual = MERGE_CHANGE_VISUAL[change];
    const Icon = visual.icon;
    const label = t(`merge_wizard.result.change.${change}`);

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span
                    className={cn(
                        variant === 'bubble'
                            ? MERGE_PREVIEW_INDICATOR_BUBBLE_CLASS
                            : 'inline-flex shrink-0 items-center justify-center',
                        visual.textClassName,
                        className
                    )}
                    data-merge-change={change}
                    data-merge-indicator-variant={variant}
                    aria-label={label}
                >
                    <Icon
                        className="size-3 shrink-0"
                        strokeWidth={2.5}
                        aria-hidden
                    />
                </span>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
        </Tooltip>
    );
};
