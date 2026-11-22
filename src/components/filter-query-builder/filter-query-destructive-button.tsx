import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/button/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/tooltip/tooltip';

export const FilterQueryDestructiveButton: React.FC<{
    label: string;
    onClick: () => void;
    disabled?: boolean;
    testId?: string;
}> = ({ label, onClick, disabled = false, testId }) => {
    const button = (
        <Button
            type="button"
            variant="secondary"
            className="size-8 shrink-0 p-0 text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
            aria-label={label}
            disabled={disabled}
            data-testid={testId}
            onClick={onClick}
        >
            <Trash2 className="size-4" aria-hidden="true" />
        </Button>
    );

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                {disabled ? (
                    <span className="inline-flex">{button}</span>
                ) : (
                    button
                )}
            </TooltipTrigger>
            <TooltipContent side="top">{label}</TooltipContent>
        </Tooltip>
    );
};
