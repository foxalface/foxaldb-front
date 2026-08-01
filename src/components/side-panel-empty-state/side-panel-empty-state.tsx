import React, { forwardRef } from 'react';
import {
    EmptyState,
    type EmptyStateProps,
} from '@/components/empty-state/empty-state';
import { ScrollArea } from '@/components/scroll-area/scroll-area';
import { cn } from '@/lib/utils';

export const sidePanelEmptyStateClassName = 'mt-20';

export interface SidePanelEmptyStateViewportProps {
    children: React.ReactNode;
}

export const SidePanelEmptyStateViewport: React.FC<
    SidePanelEmptyStateViewportProps
> = ({ children }) => (
    <div className="flex flex-1 flex-col overflow-hidden">
        <ScrollArea className="h-full">{children}</ScrollArea>
    </div>
);

export type SidePanelEmptyStateProps = EmptyStateProps &
    React.HTMLAttributes<HTMLDivElement>;

export const SidePanelEmptyState = forwardRef<
    HTMLDivElement,
    SidePanelEmptyStateProps
>(({ className, ...props }, ref) => (
    <EmptyState
        ref={ref}
        className={cn(sidePanelEmptyStateClassName, className)}
        {...props}
    />
));

SidePanelEmptyState.displayName = 'SidePanelEmptyState';
