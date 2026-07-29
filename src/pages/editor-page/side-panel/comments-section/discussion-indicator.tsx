import React from 'react';
import { SlBubbles } from 'react-icons/sl';
import type { DiscussionIndicator as DiscussionIndicatorValue } from '@/lib/comments/discussion-indicators';
import { cn } from '@/lib/utils';

/**
 * Decorative discussion-presence mark for entity rows (tables, fields, relationships).
 * Presentational only: no hooks, navigation, or counts.
 */
export interface DiscussionIndicatorProps {
    indicator: DiscussionIndicatorValue;
    className?: string;
}

export const DiscussionIndicator: React.FC<DiscussionIndicatorProps> = ({
    indicator,
    className,
}) => {
    if (!indicator.hasDiscussion) {
        return null;
    }

    return (
        <span
            data-testid="discussion-indicator"
            aria-hidden="true"
            className={cn(
                'pointer-events-none flex shrink-0 items-center justify-center rounded-sm bg-muted/70 p-0.5 text-muted-foreground',
                className
            )}
        >
            <SlBubbles className="size-3.5" aria-hidden="true" />
        </span>
    );
};
