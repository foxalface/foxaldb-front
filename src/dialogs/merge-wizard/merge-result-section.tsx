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
    disabled?: boolean;
    highlightedOperationId?: string | null;
    onHighlightOperation?: (operationId: string) => void;
    onClearHighlight?: () => void;
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
    disabled = false,
    highlightedOperationId = null,
    onHighlightOperation,
    onClearHighlight,
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
            className="border-none"
            data-testid={`merge-result-section-${category}`}
        >
            <div className="w-full rounded-md border border-border">
                <div className="relative w-full hover:bg-accent">
                    <div className="w-full min-w-0 [&>h3]:w-full [&>h3]:min-w-0">
                        <AccordionTrigger className="w-full justify-start gap-3 py-2 pl-10 pr-2 hover:bg-transparent hover:no-underline data-[state=open]:rounded-b-none">
                            <div className="flex min-w-0 flex-1 items-center gap-2">
                                <span className="min-w-0 flex-1 text-left text-sm font-medium">
                                    {title}
                                </span>
                                <span className="shrink-0 tabular-nums text-muted-foreground">
                                    {text('merge_wizard.result.counter', {
                                        selected: operations.filter(
                                            (operation) =>
                                                selected.has(operation.id)
                                        ).length,
                                        total: operations.length,
                                    })}
                                </span>
                            </div>
                        </AccordionTrigger>
                    </div>
                    <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-2">
                        {selectable ? (
                            <Checkbox
                                className="pointer-events-auto shrink-0"
                                checked={sectionState}
                                disabled={disabled}
                                aria-label={text(
                                    'merge_wizard.result.select_all_section',
                                    { section: title }
                                )}
                                onPointerDown={(event) => {
                                    event.stopPropagation();
                                }}
                                onClick={(event) => {
                                    event.stopPropagation();
                                }}
                                onKeyDown={(event) => {
                                    event.stopPropagation();
                                }}
                                onCheckedChange={() => {
                                    onToggleSection();
                                }}
                            />
                        ) : (
                            <span className="size-4 shrink-0" />
                        )}
                    </div>
                </div>
                <AccordionContent className="px-2 pb-2 pt-0">
                    {operations.length > 0 ? (
                        <ul className="flex flex-col pl-6">
                            {operations.map((operation) => (
                                <li key={operation.id}>
                                    <MergeResultRow
                                        operation={operation}
                                        selected={selected.has(operation.id)}
                                        highlighted={
                                            highlightedOperationId ===
                                            operation.id
                                        }
                                        labelContext={labelContext}
                                        text={text}
                                        disabled={disabled}
                                        onHighlight={() =>
                                            onHighlightOperation?.(operation.id)
                                        }
                                        onClearHighlight={() =>
                                            onClearHighlight?.()
                                        }
                                        onSelect={() =>
                                            onToggleOperation(
                                                operation.id,
                                                true
                                            )
                                        }
                                        onDeselect={() =>
                                            onToggleOperation(
                                                operation.id,
                                                false
                                            )
                                        }
                                    />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="py-1 pl-6 text-sm text-muted-foreground">
                            {text(
                                viewsNotCompared
                                    ? 'merge_wizard.result.views_not_compared'
                                    : 'merge_wizard.result.empty_section'
                            )}
                        </p>
                    )}
                </AccordionContent>
            </div>
        </AccordionItem>
    );
};
