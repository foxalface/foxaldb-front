import React from 'react';
import { cn } from '@/lib/utils';

interface CodeBlockHoverActionsProps {
    children: React.ReactNode;
    className?: string;
    forceVisible?: boolean;
}

export const CodeBlockHoverActions: React.FC<CodeBlockHoverActionsProps> = ({
    children,
    className,
    forceVisible = false,
}) => (
    <div
        className={cn(
            'code-block-hover-actions absolute right-1 top-1 z-10 flex flex-col gap-1',
            forceVisible && 'code-block-hover-actions--visible',
            className
        )}
    >
        {children}
    </div>
);
