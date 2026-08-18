import React from 'react';
import { Checkbox } from '@/components/checkbox/checkbox';

export interface SidePanelTypeFilterHeaderProps {
    label: string;
    checkedState: boolean | 'indeterminate';
    onCheckedChange: () => void;
    checkboxAriaLabel: string;
}

export const SidePanelTypeFilterHeader: React.FC<
    SidePanelTypeFilterHeaderProps
> = ({ label, checkedState, onCheckedChange, checkboxAriaLabel }) => (
    <label className="flex cursor-pointer items-center justify-between gap-2 rounded-md px-1 py-0.5">
        <span className="text-sm font-semibold">{label}</span>
        <Checkbox
            checked={checkedState}
            onCheckedChange={() => {
                onCheckedChange();
            }}
            aria-label={checkboxAriaLabel}
        />
    </label>
);
