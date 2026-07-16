import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RemoteEditingViewModel } from '@/lib/realtime/editing-utils';

/**
 * Plain presentational markup only (div/span + lucide icon).
 * No Popover, Tooltip, Avatar, Radix, portals, or callback refs — this
 * renders inside field edit rows and must never interfere with local
 * inputs (pointer-events are disabled; no focusable descendants).
 */
export interface EntityConflictHintProps {
    message: string;
    editors: readonly RemoteEditingViewModel[];
    className?: string;
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

const EntityConflictHintComponent: React.FC<EntityConflictHintProps> = ({
    message,
    editors,
    className,
}) => {
    if (message.length === 0 || editors.length === 0) {
        return null;
    }

    return (
        <div
            className={cn(
                'pointer-events-none flex items-center gap-1 px-1 pb-1 text-[11px] leading-tight text-amber-700 dark:text-amber-400',
                className
            )}
        >
            <AlertTriangle
                className="size-3 shrink-0 text-amber-600 dark:text-amber-400"
                aria-hidden
            />
            <span className="min-w-0 truncate">{message}</span>
        </div>
    );
};

export const EntityConflictHint = React.memo(
    EntityConflictHintComponent,
    (previous, next) =>
        previous.message === next.message &&
        areEditorsEqual(previous.editors, next.editors) &&
        previous.className === next.className
);

EntityConflictHint.displayName = 'EntityConflictHint';
