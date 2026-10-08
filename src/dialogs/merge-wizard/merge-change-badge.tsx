import React from 'react';
import { ArrowRight, Minus, Pencil, Plus, type LucideIcon } from 'lucide-react';
import type { ChangeType } from '@/lib/schema-merge/diff-types';
import { cn } from '@/lib/utils';
import type { MergeText } from './format-merge-change';

const CHANGE_VISUAL: Record<
    ChangeType,
    { readonly icon: LucideIcon; readonly className: string }
> = {
    add: {
        icon: Plus,
        className: 'text-emerald-800 dark:text-emerald-300',
    },
    modify: {
        icon: Pencil,
        className: 'text-blue-800 dark:text-blue-300',
    },
    rename: {
        icon: ArrowRight,
        className: 'text-amber-800 dark:text-amber-300',
    },
    delete: {
        icon: Minus,
        className: 'text-red-800 dark:text-red-300',
    },
};

export const MergeChangeBadge: React.FC<{
    type: ChangeType;
    text: MergeText;
}> = ({ type, text }) => {
    const visual = CHANGE_VISUAL[type];
    const Icon = visual.icon;

    return (
        <span
            className={cn(
                'inline-flex shrink-0 items-center gap-1 text-xs font-medium',
                visual.className
            )}
        >
            <Icon className="size-3.5" aria-hidden />
            {text(`merge_wizard.result.change.${type}`)}
        </span>
    );
};
