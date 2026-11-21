import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/button/button';
import { Checkbox } from '@/components/checkbox/checkbox';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/popover/popover';

export interface FilterQueryValueOption {
    readonly id: string;
    readonly name: string;
    readonly color?: string;
}

export const FilterQueryMultiValue: React.FC<{
    conditionId: string;
    label: string;
    emptyLabel: string;
    selectedLabel: (count: number) => string;
    options: readonly FilterQueryValueOption[];
    selectedIds: readonly string[];
    readOnly?: boolean;
    onChange: (value: readonly string[]) => void;
}> = ({
    conditionId,
    label,
    emptyLabel,
    selectedLabel,
    options,
    selectedIds,
    readOnly = false,
    onChange,
}) => {
    const { t } = useTranslation();
    const selected = useMemo(() => new Set(selectedIds), [selectedIds]);
    const summary =
        selectedIds.length === 0
            ? emptyLabel
            : selectedLabel(selectedIds.length);

    const toggle = (id: string, checked: boolean) => {
        onChange(
            checked
                ? [...selectedIds, id]
                : selectedIds.filter((selectedId) => selectedId !== id)
        );
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 justify-start px-2 text-xs font-normal"
                    disabled={readOnly}
                    aria-label={label}
                    data-testid={`filter-query-value-${conditionId}`}
                >
                    <span className="truncate">{summary}</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                className="w-56 p-2"
                data-testid={`filter-query-value-popover-${conditionId}`}
            >
                {options.length === 0 ? (
                    <p className="p-1 text-xs text-muted-foreground">
                        {t(
                            'side_panel.filters_section.query.value.empty_options'
                        )}
                    </p>
                ) : (
                    <ul className="flex max-h-48 flex-col gap-1 overflow-y-auto">
                        {options.map((option) => (
                            <li key={option.id}>
                                <label className="flex items-center gap-2 rounded-md p-1 text-sm hover:bg-accent">
                                    <Checkbox
                                        checked={selected.has(option.id)}
                                        aria-label={option.name}
                                        onCheckedChange={(value) =>
                                            toggle(option.id, value === true)
                                        }
                                    />
                                    {option.color ? (
                                        <span
                                            className="size-2.5 shrink-0 rounded-full"
                                            style={{
                                                backgroundColor: option.color,
                                            }}
                                            aria-hidden
                                        />
                                    ) : null}
                                    <span className="truncate">
                                        {option.name}
                                    </span>
                                </label>
                            </li>
                        ))}
                    </ul>
                )}
            </PopoverContent>
        </Popover>
    );
};
