import React from 'react';
import { cn } from '@/lib/utils';
import type { RemoteSelectionViewModel } from '@/lib/realtime/selection-utils';

/**
 * Plain presentational markup only (div/span + title).
 * No Popover, Tooltip, Avatar, Radix Slot, portals, or callback refs.
 */
export interface EntityCollaboratorsBadgeProps {
    collaborators: RemoteSelectionViewModel[];
    className?: string;
    maxVisible?: number;
}

const areCollaboratorsEqual = (
    left: readonly RemoteSelectionViewModel[],
    right: readonly RemoteSelectionViewModel[]
): boolean => {
    if (left.length !== right.length) {
        return false;
    }

    return left.every(
        (collaborator, index) => collaborator.userId === right[index]?.userId
    );
};

const EntityCollaboratorsBadgeComponent: React.FC<
    EntityCollaboratorsBadgeProps
> = ({ collaborators, className, maxVisible = 3 }) => {
    if (collaborators.length === 0) {
        return null;
    }

    const visibleCollaborators = collaborators.slice(0, maxVisible);
    const overflowCount = collaborators.length - visibleCollaborators.length;

    return (
        <div
            className={cn(
                'pointer-events-none flex items-center -space-x-1.5',
                className
            )}
        >
            {visibleCollaborators.map((collaborator, index) => (
                <span
                    key={collaborator.userId}
                    className={cn(
                        'flex size-5 items-center justify-center rounded-full border-2 border-background text-[9px] font-semibold text-white shadow-sm',
                        collaborator.colorClass
                    )}
                    style={{ zIndex: visibleCollaborators.length - index }}
                    title={collaborator.name}
                >
                    {collaborator.initials}
                </span>
            ))}
            {overflowCount > 0 ? (
                <span
                    className="relative z-0 flex size-5 items-center justify-center rounded-full border-2 border-background bg-muted text-[9px] font-semibold text-muted-foreground shadow-sm"
                    aria-hidden
                >
                    +{overflowCount}
                </span>
            ) : null}
        </div>
    );
};

export const EntityCollaboratorsBadge = React.memo(
    EntityCollaboratorsBadgeComponent,
    (previous, next) =>
        areCollaboratorsEqual(previous.collaborators, next.collaborators) &&
        previous.className === next.className &&
        previous.maxVisible === next.maxVisible
);

EntityCollaboratorsBadge.displayName = 'EntityCollaboratorsBadge';
