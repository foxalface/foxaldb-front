import React from 'react';
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
    onSelect: () => void;
    onDeselect: () => void;
}> = ({ operation, selected, labelContext, text, onSelect, onDeselect }) => {
    const label = mergeOperationLabel(operation, labelContext, text);
    const detail = formatMergeOperationDetail(operation, text);

    return (
        <div className="flex items-start gap-2 py-1.5">
            <Checkbox
                className="mt-0.5"
                checked={selected}
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
