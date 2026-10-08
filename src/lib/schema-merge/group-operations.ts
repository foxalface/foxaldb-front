import type { DiffOperation, EntityCategory } from './diff-types';

export const MERGE_RESULT_SECTION_ORDER = [
    'table',
    'field',
    'relationship',
    'view',
] as const satisfies readonly EntityCategory[];

export interface GroupedMergeOperations {
    readonly table: readonly DiffOperation[];
    readonly field: readonly DiffOperation[];
    readonly relationship: readonly DiffOperation[];
    readonly view: readonly DiffOperation[];
}

/**
 * Groups Compare operations into the four result sections.
 * Order inside each section is the backend order.
 */
export const groupMergeOperations = (
    operations: readonly DiffOperation[]
): GroupedMergeOperations => {
    const grouped: {
        table: DiffOperation[];
        field: DiffOperation[];
        relationship: DiffOperation[];
        view: DiffOperation[];
    } = {
        table: [],
        field: [],
        relationship: [],
        view: [],
    };

    for (const operation of operations) {
        grouped[operation.category].push(operation);
    }

    return grouped;
};
