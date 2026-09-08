import React from 'react';

interface ExportTargetButtonProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick?: () => void;
    disabled?: boolean;
}

export const ExportTargetButton: React.FC<ExportTargetButtonProps> = ({
    icon,
    title,
    description,
    onClick,
    disabled = false,
}) => (
    <button
        type="button"
        className="flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
        onClick={onClick}
        disabled={disabled}
    >
        <span className="mt-0.5 shrink-0 text-muted-foreground">{icon}</span>
        <span className="min-w-0">
            <span className="block font-medium leading-snug">{title}</span>
            <span className="block text-sm text-muted-foreground">
                {description}
            </span>
        </span>
    </button>
);
