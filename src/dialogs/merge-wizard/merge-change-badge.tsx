import React from 'react';
import type { ChangeType } from '@/lib/schema-merge/diff-types';
import { MERGE_CHANGE_VISUAL } from '@/lib/schema-merge/preview/merge-preview-visual';
import { cn } from '@/lib/utils';
import type { MergeText } from './format-merge-change';

export const MergeChangeBadge: React.FC<{
    type: ChangeType;
    text: MergeText;
}> = ({ type, text }) => {
    const visual = MERGE_CHANGE_VISUAL[type];
    const Icon = visual.icon;

    return (
        <span
            className={cn(
                'inline-flex shrink-0 items-center gap-1 text-xs font-medium',
                visual.textClassName
            )}
        >
            <Icon className="size-3.5" aria-hidden />
            {text(`merge_wizard.result.change.${type}`)}
        </span>
    );
};
