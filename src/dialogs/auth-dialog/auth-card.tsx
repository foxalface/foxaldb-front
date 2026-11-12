import React from 'react';
import {
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/dialog/dialog';
import { cn } from '@/lib/utils';

export interface AuthCardProps {
    title: string;
    description?: string;
    descriptionClassName?: string;
    /** Dialog surfaces use DialogTitle. Public pages use a heading. */
    titleAs?: 'dialog' | 'heading';
    /** Reserved for LEGAL1. Rendered only when provided. */
    footer?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
}

export const AuthCard: React.FC<AuthCardProps> = ({
    title,
    description,
    descriptionClassName,
    titleAs = 'heading',
    footer,
    children,
    className,
}) => (
    <div className={cn('flex w-full max-w-md flex-col gap-4', className)}>
        {titleAs === 'dialog' ? (
            <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                {description ? (
                    <DialogDescription className={descriptionClassName}>
                        {description}
                    </DialogDescription>
                ) : null}
            </DialogHeader>
        ) : (
            <div className="flex flex-col gap-1.5">
                <h1 className="text-lg font-semibold leading-none tracking-tight">
                    {title}
                </h1>
                {description ? (
                    <p
                        className={cn(
                            'text-sm text-muted-foreground',
                            descriptionClassName
                        )}
                    >
                        {description}
                    </p>
                ) : null}
            </div>
        )}
        {children ? (
            <div className="flex flex-col gap-4">{children}</div>
        ) : null}
        {footer ? <div>{footer}</div> : null}
    </div>
);
