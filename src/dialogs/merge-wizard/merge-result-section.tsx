import React from 'react';
import { Checkbox } from '@/components/checkbox/checkbox';
import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/accordion/accordion';
import type {
    DiffOperation,
    EntityCategory,
} from '@/lib/schema-merge/diff-types';
import type { MergeText } from './format-merge-change';
import type { MergeLabelContext } from './merge-operation-label';
import { MergeResultRow } from './merge-result-row';

const SECTION_TITLE_KEY: Record<EntityCategory, string> = {
    table: 'merge_wizard.result.sections.table',
    field: 'merge_wizard.result.sections.field',
    relationship: 'merge_wizard.result.sections.relationship',
    view: 'merge_wizard.result.sections.view',
};

export const MergeResultSection: React.FC<{
    category: EntityCategory;
    operations: readonly DiffOperation[];
    viewsCompared: boolean;
    selected: ReadonlySet<string>;
    sectionState: boolean | 'indeterminate';
    labelContext: MergeLabelContext;
    text: MergeText;
    onToggleOperation: (operationId: string, selected: boolean) => void;
    onToggleSection: () => void;
}> = ({
    category,
    operations,
    viewsCompared,
    selected,
    sectionState,
    labelContext,
    text,
    onToggleOperation,
    onToggleSection,
}) => {
    const title = text(SECTION_TITLE_KEY[category]);
    const selectable = operations.length > 0;
    const viewsNotCompared =
        category === 'view' && !viewsCompared && operations.length === 0;

    return (
        <AccordionItem
            value={category}
            data-testid={`merge-result-section-${category}`}
        >
            <div className="flex items-center gap-2">
                {selectable ? (
                    <Checkbox
                        checked={sectionState}
                        aria-label={text(
                            'merge_wizard.result.select_all_section',
                            { section: title }
                        )}
                        onCheckedChange={() => {
                            onToggleSection();
                        }}
                    />
                ) : (
                    <span className="size-4 shrink-0" aria-hidden />
                )}
                <AccordionTrigger className="py-2 hover:no-underline">
                    <span className="flex min-w-0 flex-1 items-center justify-between gap-3">
                        <span>{title}</span>
                        <span className="shrink-0 tabular-nums text-muted-foreground">
                            {text('merge_wizard.result.counter', {
                                selected: operations.filter((operation) =>
                                    selected.has(operation.id)
                                ).length,
                                total: operations.length,
                            })}
                        </span>
                    </span>
                </AccordionTrigger>
            </div>
            <AccordionContent className="pb-2 pl-6">
                {operations.length > 0 ? (
                    <ul className="flex flex-col">
                        {operations.map((operation) => (
                            <li key={operation.id}>
                                <MergeResultRow
                                    operation={operation}
                                    selected={selected.has(operation.id)}
                                    labelContext={labelContext}
                                    text={text}
                                    onSelect={() =>
                                        onToggleOperation(operation.id, true)
                                    }
                                    onDeselect={() =>
                                        onToggleOperation(operation.id, false)
                                    }
                                />
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="py-1 text-sm text-muted-foreground">
                        {text(
                            viewsNotCompared
                                ? 'merge_wizard.result.views_not_compared'
                                : 'merge_wizard.result.empty_section'
                        )}
                    </p>
                )}
            </AccordionContent>
        </AccordionItem>
    );
};
