import React from 'react';
import { Checkbox } from '@/components/checkbox/checkbox';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/tooltip/tooltip';

interface WizardCheckboxOptionProps {
    id: string;
    label: string;
    description: string;
    checked: boolean;
    disabled?: boolean;
    onCheckedChange: (checked: boolean) => void;
}

export const WizardCheckboxOption: React.FC<WizardCheckboxOptionProps> = ({
    id,
    label,
    description,
    checked,
    disabled = false,
    onCheckedChange,
}) => (
    <div className="flex items-center gap-3">
        <Checkbox
            id={id}
            checked={checked}
            disabled={disabled}
            onCheckedChange={(value) => onCheckedChange(value === true)}
        />
        <Tooltip>
            <TooltipTrigger asChild>
                <label
                    htmlFor={id}
                    className="cursor-pointer text-sm font-normal"
                >
                    {label}
                </label>
            </TooltipTrigger>
            <TooltipContent
                side="bottom"
                className="max-w-xs whitespace-pre-line"
            >
                {description}
            </TooltipContent>
        </Tooltip>
    </div>
);
