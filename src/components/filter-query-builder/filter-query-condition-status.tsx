import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/tooltip/tooltip';
import { isFilterConditionComplete } from '@/lib/domain/filter-expression';
import type { FilterCondition } from '@/lib/domain/filter-expression';
import { cn } from '@/lib/utils';

export const FilterQueryConditionStatus: React.FC<{
    condition: FilterCondition;
    activeLabel: string;
    incompleteLabel: string;
}> = ({ condition, activeLabel, incompleteLabel }) => {
    const complete = isFilterConditionComplete(condition);

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span
                    className="flex size-7 shrink-0 items-center justify-center"
                    role="img"
                    aria-label={complete ? activeLabel : incompleteLabel}
                    data-testid={`filter-query-status-${condition.id}`}
                    data-complete={complete ? 'true' : 'false'}
                >
                    {complete ? (
                        <CheckCircle2
                            className={cn(
                                'size-3.5',
                                'text-emerald-600 dark:text-emerald-500'
                            )}
                            aria-hidden="true"
                        />
                    ) : (
                        <AlertTriangle
                            className={cn(
                                'size-3.5',
                                'text-amber-600 dark:text-amber-500'
                            )}
                            aria-hidden="true"
                        />
                    )}
                </span>
            </TooltipTrigger>
            <TooltipContent side="top">
                {complete ? activeLabel : incompleteLabel}
            </TooltipContent>
        </Tooltip>
    );
};
