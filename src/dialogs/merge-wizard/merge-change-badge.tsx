import React from 'react';
import type { ChangeType } from '@/lib/schema-merge/diff-types';
import { MERGE_CHANGE_VISUAL } from '@/lib/schema-merge/preview/merge-preview-visual';
import { cn } from '@/lib/utils';
import type { MergeText } from './format-merge-change';

export const MergeChangeBadge: React.FC<{
    type: ChangeType;
    text: MergeText;
    /** When true, the visible label is provided beside the badge (legend rows). */
    decorative?: boolean;
}> = ({ type, text, decorative = false }) => {
    const visual = MERGE_CHANGE_VISUAL[type];
    const Icon = visual.icon;

    return (
        <span
            className={cn(
                'inline-flex size-5 shrink-0 items-center justify-center',
                visual.textClassName
            )}
            aria-hidden={decorative ? true : undefined}
            aria-label={
                decorative
                    ? undefined
                    : text(`merge_wizard.result.change.${type}`)
            }
            data-testid={`merge-change-badge-${type}`}
        >
            <Icon className="size-3.5" aria-hidden />
        </span>
    );
};
