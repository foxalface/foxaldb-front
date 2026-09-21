import React, { useCallback, useRef, useState } from 'react';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/tooltip/tooltip';
import { cn } from '@/lib/utils';

interface HoverOnlyTooltipProps {
    content: string;
    children: React.ReactElement;
    side?: 'top' | 'right' | 'bottom' | 'left';
}

const HoverOnlyTooltip: React.FC<HoverOnlyTooltipProps> = ({
    content,
    children,
    side = 'top',
}) => {
    const [open, setOpen] = useState(false);
    const isPointerInsideRef = useRef(false);

    const handleOpenChange = useCallback((nextOpen: boolean) => {
        if (nextOpen && !isPointerInsideRef.current) {
            return;
        }

        setOpen(nextOpen);
    }, []);

    const handlePointerEnter = useCallback(() => {
        isPointerInsideRef.current = true;
        setOpen(true);
    }, []);

    const handlePointerLeave = useCallback(() => {
        isPointerInsideRef.current = false;
        setOpen(false);
    }, []);

    return (
        <Tooltip open={open} onOpenChange={handleOpenChange}>
            <TooltipTrigger asChild>
                {React.cloneElement(children, {
                    onPointerEnter: (event: React.PointerEvent) => {
                        handlePointerEnter();
                        children.props.onPointerEnter?.(event);
                    },
                    onPointerLeave: (event: React.PointerEvent) => {
                        handlePointerLeave();
                        children.props.onPointerLeave?.(event);
                    },
                    onFocus: (event: React.FocusEvent) => {
                        setOpen(false);
                        children.props.onFocus?.(event);
                    },
                })}
            </TooltipTrigger>
            <TooltipContent side={side}>{content}</TooltipContent>
        </Tooltip>
    );
};

interface ExportTargetTileProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick?: () => void;
    disabled?: boolean;
    disabledReason?: string;
}

export const ExportTargetTile: React.FC<ExportTargetTileProps> = ({
    icon,
    title,
    description,
    onClick,
    disabled = false,
    disabledReason,
}) => {
    const isUnavailable = disabled && Boolean(disabledReason);
    const tooltipContent = isUnavailable ? disabledReason! : title;

    return (
        <div className="relative w-full">
            <HoverOnlyTooltip content={tooltipContent}>
                <button
                    type="button"
                    aria-disabled={disabled}
                    aria-label={title}
                    data-testid={
                        isUnavailable ? 'export-target-unavailable' : undefined
                    }
                    className={cn(
                        'flex aspect-square w-full max-w-full shrink-0 flex-col items-center justify-center rounded-md border border-input bg-transparent p-1 text-center shadow-none',
                        'transition-colors hover:bg-accent hover:text-accent-foreground',
                        'outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0',
                        'focus-visible:border-input focus:border-input active:border-input',
                        disabled &&
                            'cursor-not-allowed opacity-50 hover:bg-transparent hover:text-current'
                    )}
                    onClick={(event) => {
                        if (disabled) {
                            return;
                        }

                        onClick?.();
                        event.currentTarget.blur();
                    }}
                >
                    <span className="text-muted-foreground" aria-hidden>
                        {icon}
                    </span>
                    <span className="sr-only">{description}</span>
                </button>
            </HoverOnlyTooltip>
        </div>
    );
};
