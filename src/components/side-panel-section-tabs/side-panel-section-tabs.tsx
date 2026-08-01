import React from 'react';
import { Separator } from '@/components/separator/separator';
import { TabsList, TabsTrigger } from '@/components/tabs/tabs';
import { cn } from '@/lib/utils';

export const sidePanelSectionTabListClassName =
    'grid h-auto w-full grid-cols-2 gap-1 rounded-xl border bg-background p-1';

export const sidePanelSectionTabTriggerClassName =
    'gap-1.5 rounded-lg px-3 py-1 text-sm font-medium transition-all data-[state=active]:bg-sky-600 data-[state=active]:text-white data-[state=inactive]:text-muted-foreground data-[state=active]:shadow-sm data-[state=inactive]:hover:bg-muted/50 data-[state=inactive]:hover:text-foreground dark:data-[state=active]:bg-sky-500';

export interface SidePanelSectionTabsToolbarProps {
    children: React.ReactNode;
}

export const SidePanelSectionTabsToolbar: React.FC<
    SidePanelSectionTabsToolbarProps
> = ({ children }) => (
    <div className="px-2 pt-2">
        {children}
        <Separator orientation="horizontal" className="my-2" />
    </div>
);

export const SidePanelSectionTabsList = React.forwardRef<
    React.ElementRef<typeof TabsList>,
    React.ComponentPropsWithoutRef<typeof TabsList>
>(({ className, ...props }, ref) => (
    <TabsList
        ref={ref}
        className={cn(sidePanelSectionTabListClassName, className)}
        {...props}
    />
));
SidePanelSectionTabsList.displayName = 'SidePanelSectionTabsList';

export const SidePanelSectionTabsTrigger = React.forwardRef<
    React.ElementRef<typeof TabsTrigger>,
    React.ComponentPropsWithoutRef<typeof TabsTrigger>
>(({ className, ...props }, ref) => (
    <TabsTrigger
        ref={ref}
        className={cn(sidePanelSectionTabTriggerClassName, className)}
        {...props}
    />
));
SidePanelSectionTabsTrigger.displayName = 'SidePanelSectionTabsTrigger';
