import React from 'react';
import { Skeleton } from '@/components/skeleton/skeleton';
import { cn } from '@/lib/utils';

const SKELETON_LINE_WIDTHS = [
    'w-3/5',
    'w-2/5',
    'w-full',
    'w-11/12',
    'w-4/5',
    'w-full',
    'w-1/2',
    'w-5/6',
    'w-3/4',
    'w-full',
    'w-2/3',
    'w-4/5',
    'w-full',
    'w-1/3',
    'w-5/6',
    'w-3/5',
    'w-full',
    'w-2/5',
] as const;

interface ExportCodePreviewSkeletonProps {
    ariaLabel: string;
    testId?: string;
    className?: string;
}

export const ExportCodePreviewSkeleton: React.FC<
    ExportCodePreviewSkeletonProps
> = ({ ariaLabel, testId, className }) => (
    <div
        className={cn(
            'relative flex size-full overflow-hidden rounded-md border bg-background',
            className
        )}
        data-testid={testId}
        aria-busy="true"
        aria-label={ariaLabel}
    >
        <div className="absolute right-1 top-1 z-10">
            <Skeleton className="size-7 rounded-md" aria-hidden />
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-1.5 p-4">
            {SKELETON_LINE_WIDTHS.map((width, index) => (
                <Skeleton
                    key={index}
                    className={cn('h-3.5 shrink-0', width)}
                    aria-hidden
                />
            ))}
        </div>
    </div>
);
