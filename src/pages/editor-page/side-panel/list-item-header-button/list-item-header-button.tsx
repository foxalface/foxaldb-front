import React from 'react';
import type { ButtonProps } from '@/components/button/button';
import { Button } from '@/components/button/button';
import { cn } from '@/lib/utils';

export const LIST_ITEM_HEADER_BUTTON_CLASS =
    'size-8 p-2 text-slate-500 hover:cursor-pointer hover:bg-primary-foreground hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200';

export const ListItemHeaderButton: React.FC<ButtonProps> = React.forwardRef<
    HTMLButtonElement,
    ButtonProps
>(({ className, ...props }, ref) => {
    return (
        <Button
            ref={ref}
            variant="ghost"
            className={cn(LIST_ITEM_HEADER_BUTTON_CLASS, className)}
            asChild
            {...props}
        />
    );
});

ListItemHeaderButton.displayName = 'ListItemHeaderButton';
