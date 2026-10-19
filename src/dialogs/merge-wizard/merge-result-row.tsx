import React from 'react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/checkbox/checkbox';
import type { DiffOperation } from '@/lib/schema-merge/diff-types';
import { formatMergeOperationDetail } from './format-merge-change';
import type { MergeText } from './format-merge-change';
import { MergeChangeBadge } from './merge-change-badge';
import { MergeOperationDetailInfo } from './merge-operation-detail-info';
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
                'flex items-center gap-2 rounded-sm py-1.5 pr-1 -mr-1 outline-none transition-colors hover:bg-muted/50 focus-within:bg-muted/50',
                highlighted && 'bg-muted/50'
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
            <div className="flex min-w-0 flex-1 items-center gap-1">
                <p
                    className="min-w-0 flex-1 break-words text-sm leading-5"
                    title={label}
                >
                    {label}
                </p>
                {operation.type === 'modify' && detail ? (
                    <MergeOperationDetailInfo detail={detail} text={text} />
                ) : null}
            </div>
        </div>
    );
};
