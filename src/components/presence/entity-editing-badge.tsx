import React from 'react';
import { Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RemoteEditingViewModel } from '@/lib/realtime/editing-utils';

/**
 * Plain presentational markup only (div/span + title + lucide icon).
 * No Popover, Tooltip, Avatar, Radix Slot, portals, or callback refs — this
 * renders inside table nodes / field rows and must never interfere with local
 * inputs (pointer-events are disabled).
 */
export interface EntityEditingBadgeProps {
    editors: RemoteEditingViewModel[];
    className?: string;
    maxVisible?: number;
    showLabel?: boolean;
}

const areEditorsEqual = (
    left: readonly RemoteEditingViewModel[],
    right: readonly RemoteEditingViewModel[]
): boolean => {
    if (left.length !== right.length) {
        return false;
    }

    return left.every(
        (editor, index) => editor.userId === right[index]?.userId
    );
};

const EntityEditingBadgeComponent: React.FC<EntityEditingBadgeProps> = ({
    editors,
    className,
    maxVisible = 3,
    showLabel = false,
}) => {
    if (editors.length === 0) {
        return null;
    }

    const visibleEditors = editors.slice(0, maxVisible);
    const overflowCount = editors.length - visibleEditors.length;

    return (
        <div
            className={cn(
                'pointer-events-none flex items-center gap-1 rounded-full border border-border bg-background/90 px-1 py-0.5 shadow-sm',
                className
            )}
        >
            <Pencil className="size-3 shrink-0 text-muted-foreground" />
            <div className="flex items-center -space-x-1.5">
                {visibleEditors.map((editor, index) => (
                    <span
                        key={editor.userId}
                        className={cn(
                            'flex size-4 items-center justify-center rounded-full border-2 border-background text-[8px] font-semibold text-white',
                            editor.colorClass
                        )}
                        style={{ zIndex: visibleEditors.length - index }}
                        title={`${editor.name} is editing`}
                    >
                        {editor.initials}
                    </span>
                ))}
                {overflowCount > 0 ? (
                    <span
                        className="relative z-0 flex size-4 items-center justify-center rounded-full border-2 border-background bg-muted text-[8px] font-semibold text-muted-foreground"
                        aria-hidden
                    >
                        +{overflowCount}
                    </span>
                ) : null}
            </div>
            {showLabel ? (
                <span className="pr-0.5 text-[10px] font-medium leading-none text-muted-foreground">
                    editing
                </span>
            ) : null}
        </div>
    );
};

export const EntityEditingBadge = React.memo(
    EntityEditingBadgeComponent,
    (previous, next) =>
        areEditorsEqual(previous.editors, next.editors) &&
        previous.className === next.className &&
        previous.maxVisible === next.maxVisible &&
        previous.showLabel === next.showLabel
);

EntityEditingBadge.displayName = 'EntityEditingBadge';
