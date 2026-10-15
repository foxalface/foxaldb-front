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

export const MergePreviewChangeIndicator: React.FC<{
    change: MergeChangeVisual;
    className?: string;
}> = ({ change, className }) => {
    const { t } = useTranslation();
    const visual = MERGE_CHANGE_VISUAL[change];
    const Icon = visual.icon;
    const label = t(`merge_wizard.result.change.${change}`);

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span
                    className={cn(
                        'inline-flex shrink-0 items-center',
                        visual.textClassName,
                        className
                    )}
                    data-merge-change={change}
                    aria-label={label}
                >
                    <Icon className="size-3.5" strokeWidth={2.5} aria-hidden />
                </span>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
        </Tooltip>
    );
};
