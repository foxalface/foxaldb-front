import { useCallback, useMemo, useState } from 'react';
import type { DiffOperation } from '@/lib/schema-merge/diff-types';
import {
    buildOperationSelectionGraph,
    deselectWithDependents,
    initialOperationSelection,
    sectionCheckboxState,
    selectWithDependencies,
    toggleSectionSelection,
} from '@/lib/schema-merge/operation-selection';

export interface MergeOperationSelectionController {
    readonly hasAnalysisError: boolean;
    readonly selected: ReadonlySet<string>;
    readonly selectedCount: number;
    readonly sectionState: (
        operationIds: readonly string[]
    ) => boolean | 'indeterminate';
    readonly select: (operationId: string) => void;
    readonly deselect: (operationId: string) => void;
    readonly toggleSection: (operationIds: readonly string[]) => void;
}

const operationSignature = (operations: readonly DiffOperation[]): string =>
    operations.map((operation) => operation.id).join('\0');

const selectionFor = (
    operations: readonly DiffOperation[],
    hasAnalysisError: boolean
): Set<string> =>
    hasAnalysisError ? new Set() : initialOperationSelection(operations);

/**
 * Holds selected operation ids. A new operation list replaces the selection
 * with every id selected. The result step is also keyed by Compare generation
 * so a fresh result with the same ids still starts fully selected.
 */
export const useMergeOperationSelection = (
    operations: readonly DiffOperation[]
): MergeOperationSelectionController => {
    const graph = useMemo(
        () => buildOperationSelectionGraph(operations),
        [operations]
    );
    const signature = operationSignature(operations);
    const [signatureSeen, setSignatureSeen] = useState(signature);
    const [selected, setSelected] = useState<Set<string>>(() =>
        selectionFor(operations, graph.hasAnalysisError)
    );

    if (signatureSeen !== signature) {
        setSignatureSeen(signature);
        setSelected(selectionFor(operations, graph.hasAnalysisError));
    }

    const select = useCallback(
        (operationId: string) => {
            setSelected((current) => {
                const result = selectWithDependencies(
                    current,
                    operationId,
                    graph
                );

                return result.status === 'ok' ? result.selected : current;
            });
        },
        [graph]
    );

    const deselect = useCallback(
        (operationId: string) => {
            setSelected((current) => {
                const result = deselectWithDependents(
                    current,
                    operationId,
                    graph
                );

                return result.status === 'ok' ? result.selected : current;
            });
        },
        [graph]
    );

    const toggleSection = useCallback(
        (operationIds: readonly string[]) => {
            setSelected((current) => {
                const result = toggleSectionSelection(
                    current,
                    operationIds,
                    graph
                );

                return result.status === 'ok' ? result.selected : current;
            });
        },
        [graph]
    );

    const sectionState = useCallback(
        (operationIds: readonly string[]) =>
            sectionCheckboxState(selected, operationIds),
        [selected]
    );

    return {
        hasAnalysisError: graph.hasAnalysisError,
        selected,
        selectedCount: selected.size,
        sectionState,
        select,
        deselect,
        toggleSection,
    };
};
