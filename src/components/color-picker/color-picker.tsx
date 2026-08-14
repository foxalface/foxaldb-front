import React from 'react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/popover/popover';
import { colorOptions } from '@/lib/colors';
import { cn } from '@/lib/utils';

export type ColorPickerAppearance = 'default' | 'list-item-header';

export interface ColorPickerProps {
    color: string;
    onChange: (color: string) => void;
    disabled?: boolean;
    appearance?: ColorPickerAppearance;
    triggerClassName?: string;
    popoverOnMouseDown?: (e: React.MouseEvent) => void;
    popoverOnClick?: (e: React.MouseEvent) => void;
}

export const ColorPicker = React.forwardRef<
    React.ElementRef<typeof PopoverTrigger>,
    ColorPickerProps
>(
    (
        {
            color,
            onChange,
            disabled,
            appearance = 'default',
            triggerClassName,
            popoverOnMouseDown,
            popoverOnClick,
        },
        ref
    ) => {
        const isListItemHeader = appearance === 'list-item-header';

        return (
            <Popover>
                <PopoverTrigger
                    asChild
                    ref={ref}
                    disabled={disabled}
                    {...(disabled
                        ? { onClick: (e) => e.preventDefault() }
                        : {})}
                >
                    <div
                        className={cn(
                            isListItemHeader
                                ? 'inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md p-2 text-slate-500 hover:bg-primary-foreground hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                                : 'box-border h-6 w-8 cursor-pointer rounded-md border-2 border-muted transition-shadow hover:shadow-md',
                            {
                                'cursor-default hover:shadow-none': disabled,
                            },
                            triggerClassName
                        )}
                        style={
                            isListItemHeader
                                ? undefined
                                : { backgroundColor: color }
                        }
                        onClick={(e) => e.stopPropagation()}
                    >
                        {isListItemHeader ? (
                            <div
                                className="size-4 rounded-sm border border-muted"
                                style={{ backgroundColor: color }}
                            />
                        ) : null}
                    </div>
                </PopoverTrigger>
                <PopoverContent
                    className="w-fit"
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        popoverOnMouseDown?.(e);
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        popoverOnClick?.(e);
                    }}
                >
                    <div className="grid grid-cols-4 gap-2">
                        {colorOptions.map((option) => (
                            <div
                                key={option}
                                className="size-8 cursor-pointer rounded-md border-2 border-muted transition-shadow hover:shadow-md"
                                style={{
                                    backgroundColor: option,
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChange(option);
                                }}
                            />
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
        );
    }
);

ColorPicker.displayName = 'ColorPicker';
