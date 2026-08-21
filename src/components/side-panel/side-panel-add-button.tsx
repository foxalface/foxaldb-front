import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/button/button';
import {
    ButtonWithAlternatives,
    type ButtonAlternative,
} from '@/components/button/button-with-alternatives';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/tooltip/tooltip';
import { cn } from '@/lib/utils';

export interface SidePanelAddButtonProps extends Omit<
    React.ComponentProps<typeof Button>,
    'children' | 'aria-label'
> {
    label: string;
}

export const SidePanelAddButton: React.FC<SidePanelAddButtonProps> = ({
    label,
    className,
    variant = 'secondary',
    ...props
}) => (
    <Tooltip>
        <TooltipTrigger asChild>
            <Button
                type="button"
                variant={variant}
                className={cn('h-8 w-8 shrink-0 p-0', className)}
                aria-label={label}
                {...props}
            >
                <Plus className="size-4" aria-hidden="true" />
            </Button>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
    </Tooltip>
);

export interface SidePanelAddButtonWithAlternativesProps {
    label: string;
    onClick: () => void;
    alternatives: ButtonAlternative[];
    className?: string;
}

export const SidePanelAddButtonWithAlternatives: React.FC<
    SidePanelAddButtonWithAlternativesProps
> = ({ label, onClick, alternatives, className }) => (
    <Tooltip>
        <TooltipTrigger asChild>
            <span className="inline-flex shrink-0">
                <ButtonWithAlternatives
                    variant="secondary"
                    className={cn('h-8 p-0 text-xs', className)}
                    onClick={onClick}
                    dropdownTriggerClassName="px-1"
                    chevronDownIconClassName="!size-3.5"
                    alternatives={alternatives}
                    aria-label={label}
                >
                    <span className="inline-flex size-8 items-center justify-center">
                        <Plus className="size-4" aria-hidden="true" />
                    </span>
                </ButtonWithAlternatives>
            </span>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
    </Tooltip>
);
