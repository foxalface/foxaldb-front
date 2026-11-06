import React from 'react';
import { cn } from '@/lib/utils';

export interface WizardChoiceCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
    selected?: boolean;
}

export const WizardChoiceCard: React.FC<WizardChoiceCardProps> = ({
    icon,
    title,
    description,
    onClick,
    selected = false,
}) => (
    <button
        type="button"
        onClick={onClick}
        className={cn(
            'flex min-w-0 flex-1 flex-col items-center gap-3 rounded-xl border bg-card p-4 text-center shadow',
            'transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            selected &&
                'border-primary ring-1 ring-primary/30 ring-offset-2 ring-offset-background'
        )}
    >
        <span className="text-muted-foreground" aria-hidden>
            {icon}
        </span>
        <span className="flex flex-col gap-1">
            <span className="text-sm font-semibold leading-tight tracking-tight">
                {title}
            </span>
            <span className="text-xs leading-snug text-muted-foreground">
                {description}
            </span>
        </span>
    </button>
);

export const WizardChoiceGrid: React.FC<React.PropsWithChildren> = ({
    children,
}) => <div className="mt-4 grid w-full grid-cols-2 gap-3">{children}</div>;

export const WizardChoiceList: React.FC<React.PropsWithChildren> = ({
    children,
}) => <div className="flex w-full flex-col gap-2">{children}</div>;
