import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/button/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/tooltip/tooltip';

export const FilterQueryGroupFoldToggle: React.FC<{
    groupId: string;
    expanded: boolean;
    expandLabel: string;
    collapseLabel: string;
    onToggle: () => void;
}> = ({ groupId, expanded, expandLabel, collapseLabel, onToggle }) => {
    const label = expanded ? collapseLabel : expandLabel;

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="size-7 shrink-0 p-0 text-slate-500 hover:bg-primary-foreground hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    aria-label={label}
                    aria-expanded={expanded}
                    data-testid={`filter-query-fold-toggle-${groupId}`}
                    onClick={onToggle}
                >
                    {expanded ? (
                        <ChevronDown className="size-3.5" aria-hidden="true" />
                    ) : (
                        <ChevronRight className="size-3.5" aria-hidden="true" />
                    )}
                </Button>
            </TooltipTrigger>
            <TooltipContent side="top">{label}</TooltipContent>
        </Tooltip>
    );
};
