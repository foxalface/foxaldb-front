import React from 'react';
import { Skeleton } from '@/components/skeleton/skeleton';
import { cn } from '@/lib/utils';

interface ExportInlineLoadingSkeletonProps {
    ariaLabel: string;
    testId?: string;
    className?: string;
}

export const ExportInlineLoadingSkeleton: React.FC<
    ExportInlineLoadingSkeletonProps
> = ({ ariaLabel, testId, className }) => (
    <div
        className={cn('flex flex-col gap-2 py-1', className)}
        data-testid={testId}
        aria-busy="true"
        aria-label={ariaLabel}
    >
        <Skeleton className="h-4 w-2/5" aria-hidden />
        <Skeleton className="h-3 w-3/5" aria-hidden />
    </div>
);
