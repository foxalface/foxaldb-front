import React from 'react';
import { Info } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/tooltip/tooltip';
import type { MergeText } from './format-merge-change';

export const MergeOperationDetailInfo: React.FC<{
    detail: string;
    text: MergeText;
}> = ({ detail, text }) => (
    <TooltipProvider delayDuration={0}>
        <Tooltip>
            <TooltipTrigger asChild>
                <button
                    type="button"
                    className="inline-flex size-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 data-[state=open]:text-foreground"
                    aria-label={text(
                        'merge_wizard.result.operation_detail_aria'
                    )}
                    data-testid="merge-operation-detail-trigger"
                    onPointerDown={(event) => {
                        event.stopPropagation();
                    }}
                >
                    <Info className="size-3.5" aria-hidden />
                </button>
            </TooltipTrigger>
            <TooltipContent
                side="bottom"
                align="end"
                className="max-w-sm border bg-popover p-3 text-xs text-popover-foreground shadow-md"
                data-testid="merge-operation-detail-content"
            >
                {detail}
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
);
