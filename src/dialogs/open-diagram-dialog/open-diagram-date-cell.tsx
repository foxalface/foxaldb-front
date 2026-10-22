import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

const formatDateParts = (
    value: Date,
    locale: string
): { dateLine: string; timeLine: string } => ({
    dateLine: value.toLocaleDateString(locale),
    timeLine: value.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
    }),
});

export interface OpenDiagramDateCellProps {
    value: Date;
    locale: string;
    className?: string;
}

export const OpenDiagramDateCell: React.FC<OpenDiagramDateCellProps> = ({
    value,
    locale,
    className,
}) => {
    const { dateLine, timeLine } = useMemo(
        () => formatDateParts(value, locale),
        [value, locale]
    );

    return (
        <div
            className={cn(
                'flex flex-col justify-center leading-tight tabular-nums',
                className
            )}
        >
            <span className="whitespace-nowrap text-sm">{dateLine}</span>
            <span className="whitespace-nowrap text-xs text-muted-foreground">
                {timeLine}
            </span>
        </div>
    );
};
