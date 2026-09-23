import React from 'react';
import { Checkbox } from '@/components/checkbox/checkbox';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/tooltip/tooltip';

interface VisualExportCheckboxOptionProps {
    id: string;
    label: string;
    description: string;
    checked: boolean;
    disabled?: boolean;
    onCheckedChange: (checked: boolean) => void;
}

export const VisualExportCheckboxOption: React.FC<
    VisualExportCheckboxOptionProps
> = ({
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
                <label htmlFor={id} className="cursor-pointer font-medium">
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
