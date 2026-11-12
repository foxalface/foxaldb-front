import React from 'react';
import { DialogFooter } from '@/components/dialog/dialog';
import { cn } from '@/lib/utils';

export interface AuthStepFooterProps {
    children: React.ReactNode;
    /** `between` when a primary action sits on the right. `start` when Back is the only action. */
    layout: 'between' | 'start';
}

/**
 * Same footer as the Create and Export wizards:
 * DialogFooter, secondary Back on the left, primary action on the right.
 */
export const AuthStepFooter: React.FC<AuthStepFooterProps> = ({
    children,
    layout,
}) => (
    <DialogFooter
        className={cn(
            'mt-4 flex shrink-0 gap-2',
            layout === 'between' ? '!justify-between' : '!justify-start'
        )}
    >
        {children}
    </DialogFooter>
);
