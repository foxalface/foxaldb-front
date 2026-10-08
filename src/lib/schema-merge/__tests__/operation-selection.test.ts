import { describe, expect, it } from 'vitest';
import type { DiffOperation } from '../diff-types';
import { groupMergeOperations } from '../group-operations';
import {
    buildOperationSelectionGraph,
    deselectWithDependents,
    initialOperationSelection,
    isSelectionDependencyClosed,
    sectionCheckboxState,
    selectWithDependencies,
    selectionInOperationOrder,
    toggleSectionSelection,
} from '../operation-selection';

const table = (
    id: string,
    name: string,
    type: 'add' | 'modify' | 'delete' = 'modify',
    dependsOn: string[] = []
): DiffOperation =>
    ({
        id,
        category: 'table',
        type,
        entityId: type === 'add' ? null : `entity-${id}`,
        renameTo: null,
        identity: { kind: 'table', schema: 'public', name },
        before: null,
        after: null,
        changes: [],
        dependsOn,
    }) as DiffOperation;

const field = (id: string, dependsOn: string[] = []): DiffOperation =>
    ({
        id,
        category: 'field',
        type: 'delete',
        entityId: `entity-${id}`,
        renameTo: null,
        identity: {
            kind: 'field',
            schema: 'public',
            table: 'users',
            name: 'email',
        },
        before: null,
        after: null,
        changes: [],
        dependsOn,
    }) as DiffOperation;

const relationship = (id: string): DiffOperation =>
    ({
        id,
        category: 'relationship',
        type: 'delete',
        entityId: `entity-${id}`,
        renameTo: null,
        identity: {
            kind: 'relationship',
            source: { schema: 'public', table: 'users', field: 'id' },
            target: { schema: 'public', table: 'posts', field: 'user_id' },
        },
        before: null,
        after: null,
        changes: [],
        dependsOn: [],
    }) as DiffOperation;

const ids = (selected: ReadonlySet<string>): string[] => [...selected];

describe('schema merge operation selection', () => {
    it('selects every operation in backend order by default', () => {
        const operations = [
            field('field-delete', ['table-modify']),
            table('table-modify', 'users'),
            relationship('relationship-delete'),
        ];

        expect(ids(initialOperationSelection(operations))).toEqual([
            'field-delete',
            'table-modify',
            'relationship-delete',
        ]);
    });

    it('selects prerequisites recursively, including a field delete that needs a table modify', () => {
        const tableModify = table('table-modify', 'users');
        const fieldDelete = field('field-delete', ['table-modify']);
        const operations = [fieldDelete, tableModify];
        const graph = buildOperationSelectionGraph(operations);

        const selected = selectWithDependencies(
            new Set(),
            'field-delete',
            graph
        );

        expect(selected.status).toBe('ok');
        if (selected.status !== 'ok') {
            return;
        }

        expect(ids(selected.selected)).toEqual([
            'field-delete',
            'table-modify',
        ]);
        expect(isSelectionDependencyClosed(selected.selected, operations)).toBe(
            true
        );
    });

    it('removes dependents when a prerequisite is cleared', () => {
        const relationshipDelete = relationship('relationship-delete');
        const tableDelete = table('table-delete', 'legacy_users', 'delete', [
            'relationship-delete',
        ]);
        const operations = [relationshipDelete, tableDelete];
        const graph = buildOperationSelectionGraph(operations);
        const selected = deselectWithDependents(
            initialOperationSelection(operations),
            'relationship-delete',
            graph
        );

        expect(selected.status).toBe('ok');
        if (selected.status !== 'ok') {
            return;
        }

        expect(ids(selected.selected)).toEqual([]);
        expect(isSelectionDependencyClosed(selected.selected, operations)).toBe(
            true
        );
    });

    it('follows a transitive dependency chain in both directions', () => {
        const operations: DiffOperation[] = [
            table('orders-modify', 'orders'),
            table('table-delete', 'legacy_users', 'delete', ['orders-modify']),
            field('field-delete', ['table-delete']),
        ];
        const graph = buildOperationSelectionGraph(operations);
        const selected = selectWithDependencies(
            new Set(),
            'field-delete',
            graph
        );

        expect(selected.status).toBe('ok');
        if (selected.status !== 'ok') {
            return;
        }

        expect(ids(selected.selected)).toEqual([
            'orders-modify',
            'table-delete',
            'field-delete',
        ]);

        const cleared = deselectWithDependents(
            selected.selected,
            'orders-modify',
            graph
        );

        expect(cleared.status).toBe('ok');
        if (cleared.status !== 'ok') {
            return;
        }

        expect(ids(cleared.selected)).toEqual([]);
    });

    it('keeps a table delete closed across a relationship delete and a surviving-table modify', () => {
        const operations = [
            relationship('relationship-delete'),
            table('orders-modify', 'orders'),
            table('table-delete', 'legacy_users', 'delete', [
                'relationship-delete',
                'orders-modify',
            ]),
        ];
        const graph = buildOperationSelectionGraph(operations);
        const selected = selectWithDependencies(
            new Set(),
            'table-delete',
            graph
        );

        expect(selected.status).toBe('ok');
        if (selected.status !== 'ok') {
            return;
        }

        expect(ids(selected.selected)).toEqual([
            'relationship-delete',
            'orders-modify',
            'table-delete',
        ]);

        const withoutRelationship = deselectWithDependents(
            selected.selected,
            'relationship-delete',
            graph
        );

        expect(withoutRelationship.status).toBe('ok');
        if (withoutRelationship.status !== 'ok') {
            return;
        }

        expect(ids(withoutRelationship.selected)).toEqual(['orders-modify']);
    });

    it('selects and clears a section without leaving dependents selected', () => {
        const operations = [
            relationship('relationship-delete'),
            table('table-delete', 'legacy_users', 'delete', [
                'relationship-delete',
            ]),
            table('users-modify', 'users'),
            field('field-delete', ['users-modify']),
        ];
        const graph = buildOperationSelectionGraph(operations);
        const tableIds = ['table-delete', 'users-modify'];
        const cleared = toggleSectionSelection(
            initialOperationSelection(operations),
            tableIds,
            graph
        );

        expect(cleared.status).toBe('ok');
        if (cleared.status !== 'ok') {
            return;
        }

        expect(ids(cleared.selected)).toEqual(['relationship-delete']);
        expect(sectionCheckboxState(cleared.selected, tableIds)).toBe(false);

        const restored = toggleSectionSelection(
            cleared.selected,
            tableIds,
            graph
        );

        expect(restored.status).toBe('ok');
        if (restored.status !== 'ok') {
            return;
        }

        expect(ids(restored.selected)).toEqual([
            'relationship-delete',
            'table-delete',
            'users-modify',
        ]);
        expect(sectionCheckboxState(restored.selected, tableIds)).toBe(true);
        expect(sectionCheckboxState(restored.selected, ['field-delete'])).toBe(
            false
        );
    });

    it('reports indeterminate section state and orders ids independently of click order', () => {
        const operations = [
            table('a', 'accounts'),
            table('b', 'billing'),
            field('c'),
        ];
        const graph = buildOperationSelectionGraph(operations);
        const forward = selectWithDependencies(
            selectWithDependencies(new Set(), 'b', graph).status === 'ok'
                ? (
                      selectWithDependencies(new Set(), 'b', graph) as {
                          selected: Set<string>;
                      }
                  ).selected
                : new Set(),
            'a',
            graph
        );
        const backward = selectWithDependencies(new Set(['a']), 'b', graph);

        expect(forward.status).toBe('ok');
        expect(backward.status).toBe('ok');
        if (forward.status !== 'ok' || backward.status !== 'ok') {
            return;
        }

        expect(ids(forward.selected)).toEqual(ids(backward.selected));
        expect(ids(forward.selected)).toEqual(['a', 'b']);
        expect(sectionCheckboxState(forward.selected, ['a', 'b'])).toBe(true);
        expect(sectionCheckboxState(new Set(['a']), ['a', 'b'])).toBe(
            'indeterminate'
        );
        expect(sectionCheckboxState(new Set(), ['a', 'b'])).toBe(false);
        expect(
            ids(
                selectionInOperationOrder(
                    new Set(['b', 'a', 'missing']),
                    operations
                )
            )
        ).toEqual(['a', 'b']);
    });

    it('refuses a cyclic client graph instead of walking it forever', () => {
        const operations = [
            table('left', 'left', 'modify', ['right']),
            table('right', 'right', 'modify', ['left']),
        ];
        const graph = buildOperationSelectionGraph(operations);

        expect(graph.hasAnalysisError).toBe(true);
        expect(selectWithDependencies(new Set(), 'left', graph).status).toBe(
            'cycle'
        );
        expect(
            deselectWithDependents(new Set(['left']), 'right', graph).status
        ).toBe('cycle');
        expect(toggleSectionSelection(new Set(), ['left'], graph).status).toBe(
            'cycle'
        );
    });

    it('refuses a self-dependency and a missing prerequisite', () => {
        const self = table('self', 'self', 'modify', ['self']);
        const missing = table('child', 'child', 'modify', ['absent']);

        expect(buildOperationSelectionGraph([self]).hasAnalysisError).toBe(
            true
        );
        expect(buildOperationSelectionGraph([missing]).hasAnalysisError).toBe(
            true
        );
    });

    it('groups operations into four sections without resorting them', () => {
        const operations = [
            field('field-b'),
            table('table-a', 'alpha'),
            field('field-a'),
            relationship('relationship-a'),
            {
                ...table('view-a', 'search'),
                category: 'view',
                identity: { kind: 'view', schema: 'public', name: 'search' },
            } as DiffOperation,
        ];
        const grouped = groupMergeOperations(operations);

        expect(grouped.field.map((operation) => operation.id)).toEqual([
            'field-b',
            'field-a',
        ]);
        expect(grouped.table.map((operation) => operation.id)).toEqual([
            'table-a',
        ]);
        expect(grouped.relationship.map((operation) => operation.id)).toEqual([
            'relationship-a',
        ]);
        expect(grouped.view.map((operation) => operation.id)).toEqual([
            'view-a',
        ]);
    });
});
