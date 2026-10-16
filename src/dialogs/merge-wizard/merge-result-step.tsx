import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { Alert, AlertDescription } from '@/components/alert/alert';
import { Button } from '@/components/button/button';
import { EmptyState } from '@/components/empty-state/empty-state';
import { sidePanelEmptyStateIcon } from '@/components/side-panel-empty-state/side-panel-empty-state';
import { Accordion } from '@/components/accordion/accordion';
import { ScrollArea } from '@/components/scroll-area/scroll-area';
import { Spinner } from '@/components/spinner/spinner';
import {
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
import { MergeChangeLegend } from './merge-change-legend';
import { MergePreviewCanvas } from './merge-preview-canvas';
import { MergeResultSection } from './merge-result-section';
import type { SchemaMergeApplyFailure } from '@/lib/api/schema-merge-apply';
import { selectedOperationIdsInCompareOrder } from '@/lib/schema-merge/operation-selection';
import { mergeApplyBlocksRetry, mergeApplyErrorKey } from './merge-apply-error';
import type { MergeWizardApplyContext } from './merge-wizard-apply-context';
import { useMergeOperationSelection } from './use-merge-operation-selection';

const MERGE_PREVIEW_OPERATION_ATTR = 'data-merge-preview-operation-id';

const scrollHighlightedMergeRowIntoView = (operationId: string): void => {
    const row = document.querySelector(
        `[data-testid="merge-result-row-${CSS.escape(operationId)}"]`
    );
    const scrollRoot = row?.closest(
        '[data-testid="merge-result-changes-scroll"]'
    );
    const scroll =
        scrollRoot instanceof HTMLElement
            ? (scrollRoot.querySelector('[data-radix-scroll-area-viewport]') ??
              scrollRoot)
            : null;

    if (
        !(row instanceof HTMLElement) ||
        !(scroll instanceof HTMLElement) ||
        row.matches(':hover')
    ) {
        return;
    }

    const rowRect = row.getBoundingClientRect();
    const scrollRect = scroll.getBoundingClientRect();

    if (rowRect.height === 0 || scrollRect.height === 0) {
        return;
    }

    if (rowRect.top < scrollRect.top) {
        scroll.scrollTop -= scrollRect.top - rowRect.top;
    } else if (rowRect.bottom > scrollRect.bottom) {
        scroll.scrollTop += rowRect.bottom - scrollRect.bottom;
    }
};
const MERGE_PREVIEW_HIT_PATH_SELECTOR = `path.react-flow__edge-interaction[${MERGE_PREVIEW_OPERATION_ATTR}]`;

const operationIdAlongRelationshipStroke = (
    clientX: number,
    clientY: number,
    preferredOperationId: string | null
): string | null => {
    const paths = document.querySelectorAll<SVGGeometryElement>(
        MERGE_PREVIEW_HIT_PATH_SELECTOR
    );
    let fallback: string | null = null;

    for (const path of paths) {
        const matrix = path.getScreenCTM();
        if (!matrix) {
            continue;
        }

        const local = new DOMPoint(clientX, clientY).matrixTransform(
            matrix.inverse()
        );
        if (
            !Number.isFinite(local.x) ||
            !Number.isFinite(local.y) ||
            !path.isPointInStroke(local)
        ) {
            continue;
        }

        const operationId = path.getAttribute(MERGE_PREVIEW_OPERATION_ATTR);
        if (!operationId) {
            continue;
        }
        if (operationId === preferredOperationId) {
            return operationId;
        }
        fallback ??= operationId;
    }

    return fallback;
};

const operationIdUnderPointer = (
    clientX: number,
    clientY: number
): string | null => {
    const stack = document.elementsFromPoint(clientX, clientY);

    for (const element of stack) {
        const markedId = element
            .closest(`[${MERGE_PREVIEW_OPERATION_ATTR}]`)
            ?.getAttribute(MERGE_PREVIEW_OPERATION_ATTR);
        if (markedId) {
            return markedId;
        }

        const edge = element.closest('.react-flow__edge');
        if (edge) {
            return (
                edge
                    .querySelector(`[${MERGE_PREVIEW_OPERATION_ATTR}]`)
                    ?.getAttribute(MERGE_PREVIEW_OPERATION_ATTR) ?? null
            );
        }

        if (
            element.closest('.react-flow__node') ||
            element.classList.contains('react-flow__pane')
        ) {
            return null;
        }
    }

    return null;
};

export const MergeResultStep: React.FC<{
    applyContext: MergeWizardApplyContext;
    defaultSchema: string | null;
    onBack: () => void;
    onDone: () => void;
    onMerge: (selectedOperationIds: readonly string[]) => void;
    isApplying: boolean;
    applyError: SchemaMergeApplyFailure | null;
    canApply: boolean;
}> = ({
    applyContext,
    defaultSchema,
    onBack,
    onDone,
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
    const highlightedOperationIdRef = useRef<string | null>(null);
    highlightedOperationIdRef.current = highlightedOperationId;
    const clearPreviewHighlight = useCallback((operationId?: string) => {
        setHighlightedOperationId((highlighted) =>
            operationId == null || highlighted === operationId
                ? null
                : highlighted
        );
    }, []);
    const syncPreviewHighlightFromPointer = useCallback(
        (event: React.PointerEvent<HTMLDivElement>) => {
            const target =
                event.target instanceof Element ? event.target : null;
            const markedId =
                target
                    ?.closest(`[${MERGE_PREVIEW_OPERATION_ATTR}]`)
                    ?.getAttribute(MERGE_PREVIEW_OPERATION_ATTR) ?? null;
            const edge = target?.closest('.react-flow__edge');
            const edgeId =
                edge
                    ?.querySelector(`[${MERGE_PREVIEW_OPERATION_ATTR}]`)
                    ?.getAttribute(MERGE_PREVIEW_OPERATION_ATTR) ?? null;
            const pointerOnTable = Boolean(
                target?.closest('.react-flow__node')
            );
            let operationId = edge
                ? (markedId ?? edgeId)
                : (markedId ??
                  operationIdUnderPointer(event.clientX, event.clientY));
            if (!operationId && !pointerOnTable) {
                operationId = operationIdAlongRelationshipStroke(
                    event.clientX,
                    event.clientY,
                    highlightedOperationIdRef.current
                );
            }

            if (operationId === highlightedOperationIdRef.current) {
                return;
            }

            if (!operationId) {
                if (highlightedOperationIdRef.current) {
                    const relationshipPathsMounted =
                        document.querySelectorAll(
                            MERGE_PREVIEW_HIT_PATH_SELECTOR
                        ).length > 0;
                    if (!relationshipPathsMounted && !pointerOnTable) {
                        return;
                    }
                    clearPreviewHighlight();
                }
                return;
            }

            setHighlightedOperationId(operationId);
        },
        [clearPreviewHighlight]
    );
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

    useEffect(() => {
        if (!highlightedOperationId) {
            return;
        }

        scrollHighlightedMergeRowIntoView(highlightedOperationId);
    }, [highlightedOperationId]);

    const changesList = (
        <Accordion
            type="multiple"
            defaultValue={[...MERGE_RESULT_SECTION_ORDER]}
            className="flex w-full flex-col gap-1"
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
                    onClearHighlight={clearPreviewHighlight}
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
                    <div data-testid="merge-result-empty">
                        <EmptyState
                            className="py-6"
                            icon={sidePanelEmptyStateIcon}
                            title={text('merge_wizard.result.no_differences')}
                            description={
                                applyContext.response.viewsCompared
                                    ? undefined
                                    : text(
                                          'merge_wizard.result.views_not_compared'
                                      )
                            }
                        />
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
                            <div className="flex shrink-0 items-center gap-1">
                                <h3
                                    id="merge-result-changes-heading"
                                    className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                                >
                                    {text('merge_wizard.result.changes')}
                                </h3>
                                <MergeChangeLegend text={text} />
                            </div>
                            <div className="min-h-0 flex-1 overflow-hidden max-lg:max-h-[min(40vh,20rem)] lg:min-h-0">
                                <ScrollArea
                                    className="h-full max-h-[min(40vh,20rem)] lg:max-h-none"
                                    data-testid="merge-result-changes-scroll"
                                >
                                    {changesList}
                                </ScrollArea>
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
                                onPointerMove={syncPreviewHighlightFromPointer}
                            >
                                <MergePreviewCanvas
                                    diagram={previewProjection.diagram}
                                    decorations={previewProjection.decorations}
                                    layoutGeneration={applyContext.generation}
                                    highlightTarget={highlightTarget}
                                    onHighlightOperation={
                                        setHighlightedOperationId
                                    }
                                    onClearHighlight={clearPreviewHighlight}
                                    className="absolute inset-0"
                                />
                            </div>
                        </section>
                    </div>
                ) : (
                    <div className="min-h-0 flex-1 overflow-hidden">
                        <ScrollArea
                            className="h-full"
                            data-testid="merge-result-changes-scroll"
                        >
                            {changesList}
                        </ScrollArea>
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
                {noDifferences ? (
                    <Button type="button" onClick={onDone}>
                        {text('merge_wizard.result.done')}
                    </Button>
                ) : (
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
                )}
            </DialogFooter>
        </>
    );
};
