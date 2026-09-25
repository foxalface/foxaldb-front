import React from 'react';
import { Skeleton } from '@/components/skeleton/skeleton';
import { cn } from '@/lib/utils';

const FILE_LINE_WIDTHS = [
    'w-4/5',
    'w-3/5',
    'w-full',
    'w-2/3',
    'w-1/2',
] as const;

interface ExportFileListSkeletonProps {
    ariaLabel: string;
    testId?: string;
    className?: string;
}

export const ExportFileListSkeleton: React.FC<ExportFileListSkeletonProps> = ({
    ariaLabel,
    testId,
    className,
}) => (
    <div
        className={cn('flex flex-col gap-3', className)}
        data-testid={testId}
        aria-busy="true"
        aria-label={ariaLabel}
    >
        <Skeleton className="h-4 w-32" aria-hidden />
        <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-48" aria-hidden />
            <div className="flex flex-col gap-1.5 pl-5">
                {FILE_LINE_WIDTHS.map((width, index) => (
                    <Skeleton
                        key={index}
                        className={cn('h-3.5 shrink-0', width)}
                        aria-hidden
                    />
                ))}
            </div>
        </div>
    </div>
);
