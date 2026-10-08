import React, { useCallback } from 'react';
import { Button } from '@/components/button/button';
import { Accordion } from '@/components/accordion/accordion';
import {
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/dialog/dialog';
import {
    groupMergeOperations,
    MERGE_RESULT_SECTION_ORDER,
} from '@/lib/schema-merge/group-operations';
import { useTranslation } from 'react-i18next';
import type { MergeText } from './format-merge-change';
import { buildMergeLabelContext } from './merge-operation-label';
import { MergeResultSection } from './merge-result-section';
import type { MergeWizardApplyContext } from './merge-wizard-apply-context';
import { useMergeOperationSelection } from './use-merge-operation-selection';

export const MergeResultStep: React.FC<{
    applyContext: MergeWizardApplyContext;
    defaultSchema: string | null;
    onBack: () => void;
}> = ({ applyContext, defaultSchema, onBack }) => {
    const { t } = useTranslation();
    const text = useCallback<MergeText>(
        (key, options) => (options ? String(t(key, options)) : String(t(key))),
        [t]
    );
    const operations = applyContext.response.operations;
    const grouped = groupMergeOperations(operations);
    const labelContext = buildMergeLabelContext(operations, defaultSchema);
    const selection = useMergeOperationSelection(operations);
    const noDifferences = operations.length === 0;
    // M8 enables this after Apply, autosave flush, and history are wired.
    // A clickable Merge control before that would be a dead-end.
    const mergeEnabled = false;
    const canMerge =
        mergeEnabled &&
        selection.selectedCount > 0 &&
        !selection.hasAnalysisError;

    return (
        <>
            <DialogHeader className="shrink-0">
                <DialogTitle>{text('merge_wizard.title')}</DialogTitle>
                <DialogDescription>
                    {text(
                        noDifferences
                            ? 'merge_wizard.result.no_differences'
                            : 'merge_wizard.result.summary'
                    )}
                </DialogDescription>
            </DialogHeader>

            <div
                className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden"
                data-testid="merge-wizard-result-step"
                data-operation-count={operations.length}
                data-base-hash={applyContext.response.baseContentHash}
                data-include-deletions={
                    applyContext.includeDeletions ? 'true' : 'false'
                }
                data-source-kind={applyContext.source.kind}
                data-views-compared={
                    applyContext.response.viewsCompared ? 'true' : 'false'
                }
                data-selected-count={selection.selectedCount}
            >
                {selection.hasAnalysisError ? (
                    <p role="alert" className="text-sm text-destructive">
                        {text('merge_wizard.result.analysis_error')}
                    </p>
                ) : noDifferences ? (
                    applyContext.response.viewsCompared ? null : (
                        <p className="text-sm text-muted-foreground">
                            {text('merge_wizard.result.views_not_compared')}
                        </p>
                    )
                ) : (
                    <Accordion
                        type="multiple"
                        defaultValue={[...MERGE_RESULT_SECTION_ORDER]}
                        className="w-full"
                    >
                        {MERGE_RESULT_SECTION_ORDER.map((category) => (
                            <MergeResultSection
                                key={category}
                                category={category}
                                operations={grouped[category]}
                                viewsCompared={
                                    applyContext.response.viewsCompared
                                }
                                selected={selection.selected}
                                sectionState={selection.sectionState(
                                    grouped[category].map(
                                        (operation) => operation.id
                                    )
                                )}
                                labelContext={labelContext}
                                text={text}
                                onToggleOperation={(operationId, next) => {
                                    if (next) {
                                        selection.select(operationId);
                                        return;
                                    }

                                    selection.deselect(operationId);
                                }}
                                onToggleSection={() =>
                                    selection.toggleSection(
                                        grouped[category].map(
                                            (operation) => operation.id
                                        )
                                    )
                                }
                            />
                        ))}
                    </Accordion>
                )}
            </div>

            <DialogFooter className="mt-4 flex shrink-0 !justify-between gap-2">
                <Button type="button" variant="secondary" onClick={onBack}>
                    {text('new_diagram_dialog.back')}
                </Button>
                <Button type="button" disabled={!canMerge}>
                    {text('merge_wizard.result.merge', {
                        count: selection.selectedCount,
                    })}
                </Button>
            </DialogFooter>
        </>
    );
};
