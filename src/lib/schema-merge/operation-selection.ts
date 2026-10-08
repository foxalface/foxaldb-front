import type { DiffOperation } from './diff-types';

/**
 * Dependency-closed selection over opaque Compare operation ids.
 * The backend graph is authoritative. This module only keeps the UI closed.
 */
export interface OperationSelectionGraph {
    readonly operations: readonly DiffOperation[];
    readonly byId: ReadonlyMap<string, DiffOperation>;
    readonly dependentsById: ReadonlyMap<string, readonly string[]>;
    readonly hasAnalysisError: boolean;
}

export type OperationSelectionResult =
    | { readonly status: 'ok'; readonly selected: Set<string> }
    | { readonly status: 'cycle' };

const analysisError = (): OperationSelectionResult => ({ status: 'cycle' });

export const buildOperationSelectionGraph = (
    operations: readonly DiffOperation[]
): OperationSelectionGraph => {
    const byId = new Map<string, DiffOperation>();
    const dependents = new Map<string, string[]>();
    let invalid = false;

    for (const operation of operations) {
        if (byId.has(operation.id)) {
            invalid = true;
        }

        byId.set(operation.id, operation);
    }

    for (const operation of operations) {
        for (const dependencyId of operation.dependsOn) {
            if (dependencyId === operation.id || !byId.has(dependencyId)) {
                invalid = true;
                continue;
            }

            const list = dependents.get(dependencyId) ?? [];
            list.push(operation.id);
            dependents.set(dependencyId, list);
        }
    }

    if (!invalid && hasCycle(operations, byId)) {
        invalid = true;
    }

    return {
        operations,
        byId,
        dependentsById: dependents,
        hasAnalysisError: invalid,
    };
};

export const initialOperationSelection = (
    operations: readonly DiffOperation[]
): Set<string> => new Set(operations.map((operation) => operation.id));

export const selectionInOperationOrder = (
    selected: ReadonlySet<string>,
    operations: readonly DiffOperation[]
): Set<string> => {
    const next = new Set<string>();

    for (const operation of operations) {
        if (selected.has(operation.id)) {
            next.add(operation.id);
        }
    }

    return next;
};

export const isSelectionDependencyClosed = (
    selected: ReadonlySet<string>,
    operations: readonly DiffOperation[]
): boolean => {
    for (const operation of operations) {
        if (!selected.has(operation.id)) {
            continue;
        }

        for (const dependencyId of operation.dependsOn) {
            if (!selected.has(dependencyId)) {
                return false;
            }
        }
    }

    return true;
};

export const sectionCheckboxState = (
    selected: ReadonlySet<string>,
    operationIds: readonly string[]
): boolean | 'indeterminate' => {
    if (operationIds.length === 0) {
        return false;
    }

    let count = 0;

    for (const operationId of operationIds) {
        if (selected.has(operationId)) {
            count += 1;
        }
    }

    if (count === 0) {
        return false;
    }

    if (count === operationIds.length) {
        return true;
    }

    return 'indeterminate';
};

export const selectWithDependencies = (
    selected: ReadonlySet<string>,
    operationId: string,
    graph: OperationSelectionGraph
): OperationSelectionResult => selectOperations(selected, [operationId], graph);

export const deselectWithDependents = (
    selected: ReadonlySet<string>,
    operationId: string,
    graph: OperationSelectionGraph
): OperationSelectionResult =>
    deselectOperations(selected, [operationId], graph);

export const selectOperations = (
    selected: ReadonlySet<string>,
    operationIds: readonly string[],
    graph: OperationSelectionGraph
): OperationSelectionResult => {
    if (graph.hasAnalysisError) {
        return analysisError();
    }

    const next = new Set(selected);

    for (const operationId of operationIds) {
        const reached = collectReachable(
            operationId,
            (id) => {
                return graph.byId.get(id)?.dependsOn ?? [];
            },
            graph.byId
        );

        if (!reached) {
            return analysisError();
        }

        for (const id of reached) {
            next.add(id);
        }
    }

    return {
        status: 'ok',
        selected: selectionInOperationOrder(next, graph.operations),
    };
};

export const deselectOperations = (
    selected: ReadonlySet<string>,
    operationIds: readonly string[],
    graph: OperationSelectionGraph
): OperationSelectionResult => {
    if (graph.hasAnalysisError) {
        return analysisError();
    }

    const remove = new Set<string>();

    for (const operationId of operationIds) {
        const reached = collectReachable(
            operationId,
            (id) => graph.dependentsById.get(id) ?? [],
            graph.byId
        );

        if (!reached) {
            return analysisError();
        }

        for (const id of reached) {
            remove.add(id);
        }
    }

    const next = new Set<string>();

    for (const operation of graph.operations) {
        if (selected.has(operation.id) && !remove.has(operation.id)) {
            next.add(operation.id);
        }
    }

    return { status: 'ok', selected: next };
};

export const toggleSectionSelection = (
    selected: ReadonlySet<string>,
    operationIds: readonly string[],
    graph: OperationSelectionGraph
): OperationSelectionResult => {
    if (sectionCheckboxState(selected, operationIds) === true) {
        return deselectOperations(selected, operationIds, graph);
    }

    return selectOperations(selected, operationIds, graph);
};

const hasCycle = (
    operations: readonly DiffOperation[],
    byId: ReadonlyMap<string, DiffOperation>
): boolean => {
    const color = new Map<string, 0 | 1 | 2>();

    const visit = (id: string): boolean => {
        const state = color.get(id) ?? 0;

        if (state === 1) {
            return true;
        }

        if (state === 2) {
            return false;
        }

        color.set(id, 1);
        const operation = byId.get(id);

        if (operation) {
            for (const dependencyId of operation.dependsOn) {
                if (visit(dependencyId)) {
                    return true;
                }
            }
        }

        color.set(id, 2);
        return false;
    };

    for (const operation of operations) {
        if (visit(operation.id)) {
            return true;
        }
    }

    return false;
};

/**
 * Walks a DAG. A repeated id on the active path is a cycle in client data.
 * Missing ids are ignored here; graph construction already rejects them.
 */
const collectReachable = (
    rootId: string,
    neighbors: (id: string) => readonly string[],
    byId: ReadonlyMap<string, DiffOperation>
): string[] | null => {
    if (!byId.has(rootId)) {
        return [];
    }

    const collected: string[] = [];
    const seen = new Set<string>();
    const stack: { id: string; nextIndex: number }[] = [
        { id: rootId, nextIndex: 0 },
    ];

    while (stack.length > 0) {
        const frame = stack[stack.length - 1];

        if (!frame) {
            break;
        }

        if (!seen.has(frame.id)) {
            seen.add(frame.id);
            collected.push(frame.id);
        }

        const nextIds = neighbors(frame.id);
        if (frame.nextIndex >= nextIds.length) {
            stack.pop();
            continue;
        }

        const nextId = nextIds[frame.nextIndex] ?? '';
        frame.nextIndex += 1;

        if (!byId.has(nextId)) {
            continue;
        }

        if (stack.some((entry) => entry.id === nextId)) {
            return null;
        }

        if (!seen.has(nextId)) {
            stack.push({ id: nextId, nextIndex: 0 });
        }
    }

    return collected;
};
