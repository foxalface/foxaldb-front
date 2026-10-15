import React from 'react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/checkbox/checkbox';
import type { DiffOperation } from '@/lib/schema-merge/diff-types';
import { formatMergeOperationDetail } from './format-merge-change';
import type { MergeText } from './format-merge-change';
import { MergeChangeBadge } from './merge-change-badge';
import {
    mergeOperationLabel,
    mergeOperationSelectLabel,
    type MergeLabelContext,
} from './merge-operation-label';

export const MergeResultRow: React.FC<{
    operation: DiffOperation;
    selected: boolean;
    labelContext: MergeLabelContext;
    text: MergeText;
    disabled?: boolean;
    highlighted?: boolean;
    onHighlight?: () => void;
    onClearHighlight?: () => void;
    onSelect: () => void;
    onDeselect: () => void;
}> = ({
    operation,
    selected,
    labelContext,
    text,
    disabled = false,
    highlighted = false,
    onHighlight,
    onClearHighlight,
    onSelect,
    onDeselect,
}) => {
    const label = mergeOperationLabel(operation, labelContext, text);
    const detail = formatMergeOperationDetail(operation, text);

    return (
        <div
            className={cn(
                'flex items-start gap-2 rounded-sm py-1.5 pr-1 -mr-1 outline-none transition-colors',
                highlighted && !selected
                    ? 'bg-muted/70'
                    : 'hover:bg-muted/50 focus-within:bg-muted/50'
            )}
            data-testid={`merge-result-row-${operation.id}`}
            data-highlighted={highlighted ? 'true' : 'false'}
            onMouseEnter={() => onHighlight?.()}
            onMouseLeave={() => onClearHighlight?.()}
            onFocusCapture={() => onHighlight?.()}
            onBlurCapture={(event) => {
                if (
                    !event.currentTarget.contains(event.relatedTarget as Node)
                ) {
                    onClearHighlight?.();
                }
            }}
        >
            <Checkbox
                className="mt-0.5"
                checked={selected}
                disabled={disabled}
                aria-label={mergeOperationSelectLabel(
                    operation,
                    labelContext,
                    text
                )}
                onCheckedChange={(checked) => {
                    if (checked === true) {
                        onSelect();
                        return;
                    }

                    onDeselect();
                }}
            />
            <MergeChangeBadge type={operation.type} text={text} />
            <div className="min-w-0 flex-1">
                <p className="break-words text-sm leading-5" title={label}>
                    {label}
                </p>
                {detail ? (
                    <p className="break-words text-xs leading-4 text-muted-foreground">
                        {detail}
                    </p>
                ) : null}
            </div>
        </div>
    );
};
