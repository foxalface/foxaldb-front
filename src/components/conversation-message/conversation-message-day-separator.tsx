import React from 'react';
import { cn } from '@/lib/utils';

export interface ConversationMessageDaySeparatorProps {
    label: string;
    className?: string;
}

export const ConversationMessageDaySeparator: React.FC<
    ConversationMessageDaySeparatorProps
> = ({ label, className }) => (
    <div
        role="separator"
        aria-label={label}
        className={cn('flex items-center gap-3 py-2', className)}
    >
        <div className="h-px flex-1 bg-border/60" />
        <span className="shrink-0 text-xs font-medium text-muted-foreground">
            {label}
        </span>
        <div className="h-px flex-1 bg-border/60" />
    </div>
);
