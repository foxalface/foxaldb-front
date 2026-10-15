import React, { useCallback, useMemo, useState } from 'react';
import { Alert, AlertDescription } from '@/components/alert/alert';
import { Button } from '@/components/button/button';
import { Accordion } from '@/components/accordion/accordion';
import { Spinner } from '@/components/spinner/spinner';
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
import { buildSchemaMergePreview } from '@/lib/schema-merge/preview/build-schema-merge-preview';
import { resolvePreviewHighlightTarget } from '@/lib/schema-merge/preview/resolve-preview-highlight-target';
import { useTranslation } from 'react-i18next';
import type { MergeText } from './format-merge-change';
import { buildMergeLabelContext } from './merge-operation-label';
import { MergePreviewCanvas } from './merge-preview-canvas';
import { MergeResultSection } from './merge-result-section';
import type { SchemaMergeApplyFailure } from '@/lib/api/schema-merge-apply';
import { selectedOperationIdsInCompareOrder } from '@/lib/schema-merge/operation-selection';
import { mergeApplyBlocksRetry, mergeApplyErrorKey } from './merge-apply-error';
import type { MergeWizardApplyContext } from './merge-wizard-apply-context';
import { useMergeOperationSelection } from './use-merge-operation-selection';

export const MergeResultStep: React.FC<{
    applyContext: MergeWizardApplyContext;
    defaultSchema: string | null;
    onBack: () => void;
    onMerge: (selectedOperationIds: readonly string[]) => void;
    isApplying: boolean;
    applyError: SchemaMergeApplyFailure | null;
    canApply: boolean;
}> = ({
    applyContext,
    defaultSchema,
    onBack,
    onMerge,
    isApplying,
    applyError,
    canApply,
}) => {
    const { t } = useTranslation();
    const text = useCallback<MergeText>(
        (key, options) => (options ? String(t(key, options)) : String(t(key))),
        [t]
    );
    const operations = applyContext.response.operations;
    const grouped = groupMergeOperations(operations);
    const labelContext = buildMergeLabelContext(operations, defaultSchema);
    const selection = useMergeOperationSelection(operations);
    const [highlightedOperationId, setHighlightedOperationId] = useState<
        string | null
    >(null);
    const noDifferences = operations.length === 0;
    const retryBlocked =
        applyError !== null && mergeApplyBlocksRetry(applyError);
    const showPreviewWorkspace = !noDifferences && !selection.hasAnalysisError;
    const canMerge =
        canApply &&
        !isApplying &&
        !retryBlocked &&
        operations.length > 0 &&
        selection.selectedCount > 0 &&
        !selection.hasAnalysisError;

    const previewProjection = useMemo(() => {
        if (!showPreviewWorkspace) {
            return null;
        }

        return buildSchemaMergePreview({
            baseDiagram: applyContext.baseDiagram,
            incomingDiagram: applyContext.incomingDiagram,
            operations: applyContext.response.operations,
            selectedOperationIds: selection.selected,
            viewsCompared: applyContext.response.viewsCompared,
            defaultSchema,
        });
    }, [
        applyContext.baseDiagram,
        applyContext.incomingDiagram,
        applyContext.response.operations,
        applyContext.response.viewsCompared,
        defaultSchema,
        selection.selected,
        showPreviewWorkspace,
    ]);

    const highlightTarget = useMemo(() => {
        if (!highlightedOperationId || !previewProjection) {
            return null;
        }

        const operation = operations.find(
            (item) => item.id === highlightedOperationId
        );

        if (!operation) {
            return null;
        }

        return resolvePreviewHighlightTarget(
            operation,
            previewProjection.diagram
        );
    }, [highlightedOperationId, operations, previewProjection]);

    const changesList = (
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
                    viewsCompared={applyContext.response.viewsCompared}
                    selected={selection.selected}
                    sectionState={selection.sectionState(
                        grouped[category].map((operation) => operation.id)
                    )}
                    labelContext={labelContext}
                    text={text}
                    disabled={isApplying}
                    highlightedOperationId={highlightedOperationId}
                    onHighlightOperation={setHighlightedOperationId}
                    onClearHighlight={() => setHighlightedOperationId(null)}
                    onToggleOperation={(operationId, next) => {
                        if (next) {
                            selection.select(operationId);
                            return;
                        }

                        selection.deselect(operationId);
                    }}
                    onToggleSection={() =>
                        selection.toggleSection(
                            grouped[category].map((operation) => operation.id)
                        )
                    }
                />
            ))}
        </Accordion>
    );

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
                className="flex min-h-0 flex-1 flex-col"
                data-testid="merge-wizard-result-step"
                data-operation-count={operations.length}
                data-preview-workspace={showPreviewWorkspace ? 'true' : 'false'}
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
                    <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
                        {applyContext.response.viewsCompared ? null : (
                            <p className="text-sm text-muted-foreground">
                                {text('merge_wizard.result.views_not_compared')}
                            </p>
                        )}
                    </div>
                ) : showPreviewWorkspace && previewProjection ? (
                    <div
                        className="grid min-h-0 flex-1 gap-4 max-lg:grid-cols-1 lg:grid-cols-[minmax(280px,36%)_minmax(0,1fr)]"
                        data-testid="merge-result-workspace"
                    >
                        <section
                            aria-labelledby="merge-result-changes-heading"
                            className="flex min-h-0 min-w-0 flex-col gap-2"
                            data-testid="merge-result-changes-panel"
                        >
                            <h3
                                id="merge-result-changes-heading"
                                className="shrink-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                            >
                                {text('merge_wizard.result.changes')}
                            </h3>
                            <div
                                className="max-h-[min(40vh,20rem)] min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1 max-lg:max-h-[min(40vh,20rem)] lg:max-h-none"
                                data-testid="merge-result-changes-scroll"
                            >
                                {changesList}
                            </div>
                        </section>
                        <section
                            aria-labelledby="merge-result-preview-heading"
                            className="flex min-h-0 min-w-0 flex-col gap-2"
                            data-testid="merge-result-preview-panel"
                        >
                            <h3
                                id="merge-result-preview-heading"
                                className="shrink-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                            >
                                {text('merge_wizard.result.preview')}
                            </h3>
                            <div
                                className="relative min-h-[min(50vh,28rem)] flex-1 overflow-hidden rounded-md border border-border bg-background lg:min-h-0"
                                data-testid="merge-result-preview-surface"
                            >
                                <MergePreviewCanvas
                                    diagram={previewProjection.diagram}
                                    decorations={previewProjection.decorations}
                                    layoutGeneration={applyContext.generation}
                                    highlightTarget={highlightTarget}
                                    className="absolute inset-0"
                                />
                            </div>
                        </section>
                    </div>
                ) : (
                    <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
                        {changesList}
                    </div>
                )}
                {applyError ? (
                    <Alert variant="destructive" className="mt-3 shrink-0">
                        <AlertDescription>
                            {text(mergeApplyErrorKey(applyError))}
                        </AlertDescription>
                    </Alert>
                ) : null}
            </div>

            <DialogFooter className="mt-4 flex shrink-0 !justify-between gap-2">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onBack}
                    disabled={isApplying}
                >
                    {text('new_diagram_dialog.back')}
                </Button>
                <Button
                    type="button"
                    disabled={!canMerge}
                    aria-busy={isApplying}
                    onClick={() => {
                        onMerge(
                            selectedOperationIdsInCompareOrder(
                                selection.selected,
                                operations
                            )
                        );
                    }}
                >
                    {isApplying ? (
                        <Spinner className="mr-1 size-5 text-primary-foreground" />
                    ) : null}
                    {isApplying
                        ? text('merge_wizard.applying')
                        : text('merge_wizard.result.merge', {
                              count: selection.selectedCount,
                          })}
                </Button>
            </DialogFooter>
        </>
    );
};
