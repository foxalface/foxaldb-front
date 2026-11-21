import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import React from 'react';
import { EditorFiltersProvider } from '@/context/editor-filters-context/editor-filters-provider';
import { useEditorFilters } from '@/context/editor-filters-context/use-editor-filters';
import { DatabaseType } from '@/lib/domain/database-type';
import type { DBField } from '@/lib/domain/db-field';
import type { DBTable } from '@/lib/domain/db-table';
import type { DiagramTagAssignment } from '@/lib/domain/diagram-tag';
import {
    createFilterGroup,
    type FilterCondition,
} from '@/lib/domain/filter-expression';
import { useCanvasFilterVisibility } from '../use-canvas-filter-visibility';

const harness = vi.hoisted(() => ({
    tables: [] as DBTable[],
    tagAssignments: [] as DiagramTagAssignment[],
    forceShowIds: new Set<string>(),
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        diagramId: 'diagram-1',
        databaseType: DatabaseType.POSTGRESQL,
        tables: harness.tables,
        relationships: [],
        dependencies: [],
        tagAssignments: harness.tagAssignments,
        currentDiagram: {
            id: 'diagram-1',
            name: 'diagram',
            databaseType: DatabaseType.POSTGRESQL,
            tables: harness.tables,
            relationships: [],
            tagAssignments: harness.tagAssignments,
            tags: [{ id: 'backend', name: 'Backend', color: '#f00' }],
            areas: [],
            createdAt: new Date(0),
            updatedAt: new Date(0),
        },
    }),
}));

vi.mock('@/context/diff-context/use-diff', () => ({
    useDiff: () => ({
        checkIfNewTable: ({ tableId }: { tableId: string }) =>
            harness.forceShowIds.has(tableId),
    }),
}));

const field = (id: string, primaryKey = false): DBField => ({
    id,
    name: id,
    type: { id: 'text', name: 'text' },
    primaryKey,
    unique: primaryKey,
    nullable: !primaryKey,
    createdAt: 0,
});

const dbTable = (id: string, isView = false): DBTable => ({
    id,
    name: id,
    schema: 'public',
    x: 0,
    y: 0,
    fields: [field(`${id}-id`, true), field(`${id}-name`)],
    indexes: [],
    color: '#fff',
    isView,
    createdAt: 0,
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <EditorFiltersProvider>{children}</EditorFiltersProvider>
);

const useProbe = () => {
    const filter = useEditorFilters();
    const visibility = useCanvasFilterVisibility();
    return { filter, visibility };
};

const tableTag = (tagId: string): FilterCondition => ({
    kind: 'condition',
    id: 'tag',
    target: 'table',
    property: 'tag',
    operator: 'is_any_of',
    value: [tagId],
});

describe('useCanvasFilterVisibility', () => {
    it('hides nothing until a query is set and keeps show views when the query is cleared', () => {
        harness.tables = [dbTable('users'), dbTable('orders')];
        harness.tagAssignments = [
            {
                id: 'assign-users',
                tagId: 'backend',
                targetType: 'table',
                targetId: 'users',
            },
        ];
        harness.forceShowIds = new Set();
        const { result } = renderHook(() => useProbe(), { wrapper });

        expect(result.current.visibility).toBeNull();

        act(() => {
            result.current.filter.setShowViews(true);
            result.current.filter.setExpression(
                createFilterGroup('and', [tableTag('backend')], 'root')
            );
        });

        expect(result.current.filter.showViews).toBe(true);
        expect(result.current.visibility?.visibleTableIds.has('users')).toBe(
            true
        );
        expect(result.current.visibility?.visibleTableIds.has('orders')).toBe(
            false
        );
        expect(
            [...(result.current.visibility?.visibleFieldIds ?? [])].sort()
        ).toEqual(['users-id', 'users-name']);

        act(() => {
            result.current.filter.clearFilters();
        });

        expect(result.current.filter.showViews).toBe(true);
        expect(result.current.filter.hasQuery).toBe(false);
        expect(result.current.visibility).toBeNull();
    });
});
