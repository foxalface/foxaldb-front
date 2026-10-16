import React from 'react';
import { Info } from 'lucide-react';
import type { MergeChangeVisual } from '@/lib/schema-merge/preview/preview-types';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/tooltip/tooltip';
import type { MergeText } from './format-merge-change';
import { MergeChangeBadge } from './merge-change-badge';

const MERGE_CHANGE_LEGEND_ORDER: readonly MergeChangeVisual[] = [
    'add',
    'modify',
    'rename',
    'delete',
];

export const MergeChangeLegend: React.FC<{ text: MergeText }> = ({ text }) => (
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>
                <button
                    type="button"
                    className="inline-flex size-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 data-[state=open]:text-foreground"
                    aria-label={text('merge_wizard.result.change_legend_aria')}
                    data-testid="merge-change-legend-trigger"
                >
                    <Info className="size-3.5" aria-hidden />
                </button>
            </TooltipTrigger>
            <TooltipContent
                side="bottom"
                align="start"
                className="max-w-xs border bg-popover p-3 text-popover-foreground shadow-md"
                data-testid="merge-change-legend-content"
            >
                <p
                    className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    data-testid="merge-change-legend-title"
                >
                    {text('merge_wizard.result.change_legend_title')}
                </p>
                <ul className="flex flex-col gap-2 text-xs">
                    {MERGE_CHANGE_LEGEND_ORDER.map((change) => (
                        <li
                            key={change}
                            className="flex items-center gap-2"
                            data-testid={`merge-change-legend-item-${change}`}
                        >
                            <MergeChangeBadge
                                type={change}
                                text={text}
                                decorative
                            />
                            <span>
                                {text(`merge_wizard.result.change.${change}`)}
                            </span>
                        </li>
                    ))}
                </ul>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
);
