import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { EditorFiltersProvider } from '@/context/editor-filters-context/editor-filters-provider';
import { useEditorFilters } from '@/context/editor-filters-context/use-editor-filters';
import { DatabaseType } from '@/lib/domain/database-type';
import type { DBField } from '@/lib/domain/db-field';
import type { DBRelationship } from '@/lib/domain/db-relationship';
import type { DBTable } from '@/lib/domain/db-table';
import type { DiagramTagAssignment } from '@/lib/domain/diagram-tag';
import type { DiagramFilter } from '@/lib/domain/diagram-filter/diagram-filter';
import { tableToTableNode } from '../diagram-flow-elements';
import { tableHiddenByTagVisibility } from '../tag-canvas-visibility';
import { useCanvasFilterVisibility } from '../use-canvas-filter-visibility';

const mutations = vi.hoisted(() => ({
    addTags: vi.fn(),
    updateTag: vi.fn(),
    removeTags: vi.fn(),
    addTagAssignments: vi.fn(),
    removeTagAssignments: vi.fn(),
    updateTablesState: vi.fn(),
    createRelationship: vi.fn(),
    removeRelationships: vi.fn(),
}));

const harness = vi.hoisted(() => ({
    tables: [] as DBTable[],
    relationships: [] as DBRelationship[],
    tagAssignments: [] as DiagramTagAssignment[],
    filter: undefined as DiagramFilter | undefined,
    filterLoading: false,
    showDBViews: true,
    forceShowIds: new Set<string>(),
    areas: [] as {
        id: string;
        name: string;
        x: number;
        y: number;
        width: number;
        height: number;
        color: string;
    }[],
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        diagramId: 'diagram-1',
        databaseType: DatabaseType.POSTGRESQL,
        tables: harness.tables,
        relationships: harness.relationships,
        tagAssignments: harness.tagAssignments,
        currentDiagram: {
            id: 'diagram-1',
            name: 'diagram',
            databaseType: DatabaseType.POSTGRESQL,
            tables: harness.tables,
            relationships: harness.relationships,
            tagAssignments: harness.tagAssignments,
            areas: harness.areas,
            tags: [
                { id: 'red', name: 'Red', color: '#ff0000' },
                { id: 'blue', name: 'Blue', color: '#0000ff' },
            ],
            createdAt: new Date(0),
            updatedAt: new Date(0),
        },
        ...mutations,
    }),
}));

vi.mock('@/context/diagram-filter-context/use-diagram-filter', () => ({
    useDiagramFilter: () => ({
        filter: harness.filter,
        loading: harness.filterLoading,
    }),
}));

vi.mock('@/hooks/use-local-config', () => ({
    useLocalConfig: () => ({
        showDBViews: harness.showDBViews,
    }),
}));

vi.mock('@/context/diff-context/use-diff', () => {
    const checkIfNewTable = ({ tableId }: { tableId: string }) =>
        harness.forceShowIds.has(tableId);

    return {
        useDiff: () => ({
            checkIfNewTable,
        }),
    };
});

const field = (id: string): DBField => ({
    id,
    name: id,
    type: { id: 'text', name: 'text' },
    primaryKey: false,
    unique: false,
    nullable: true,
    createdAt: 0,
});

const dbTable = (
    id: string,
    options: {
        schema?: string;
        isView?: boolean;
        fields?: DBField[];
        parentAreaId?: string | null;
    } = {}
): DBTable => ({
    id,
    name: id,
    schema: options.schema ?? 'public',
    parentAreaId: options.parentAreaId,
    x: 0,
    y: 0,
    fields: options.fields ?? [],
    indexes: [],
    color: '#8eb7ff',
    isView: options.isView ?? false,
    createdAt: 0,
});

const dbRelationship = (
    id: string,
    sourceTableId: string,
    targetTableId: string
): DBRelationship => ({
    id,
    name: id,
    sourceTableId,
    targetTableId,
    sourceFieldId: `${sourceTableId}.id`,
    targetFieldId: `${targetTableId}.id`,
    sourceCardinality: 'one',
    targetCardinality: 'many',
    createdAt: 0,
});

const assign = (
    tagId: string,
    targetType: DiagramTagAssignment['targetType'],
    targetId: string
): DiagramTagAssignment => ({
    id: `${targetType}-${targetId}-${tagId}`,
    tagId,
    targetType,
    targetId,
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <EditorFiltersProvider>{children}</EditorFiltersProvider>
);

const useProbe = () => {
    const filter = useEditorFilters();
    const visibility = useCanvasFilterVisibility();
    return { filter, visibility };
};

const renderedHidden = (
    table: DBTable,
    visibility: ReturnType<typeof useCanvasFilterVisibility>
) => {
    const node = tableToTableNode(table, {
        filter: harness.filter,
        databaseType: DatabaseType.POSTGRESQL,
        filterLoading: harness.filterLoading,
        showDBViews: harness.showDBViews,
        forceShow: harness.forceShowIds.has(table.id),
    });

    return tableHiddenByTagVisibility(
        Boolean(node.hidden),
        table.id,
        visibility
    );
};

describe('useCanvasFilterVisibility', () => {
    beforeEach(() => {
        harness.tables = [];
        harness.relationships = [];
        harness.tagAssignments = [];
        harness.filter = undefined;
        harness.filterLoading = false;
        harness.showDBViews = true;
        harness.forceShowIds = new Set();
        harness.areas = [];
        vi.clearAllMocks();
    });

    it('adds no extra hiding until a tag is selected, then restores it on clear', () => {
        const users = dbTable('users');
        const orders = dbTable('orders');
        harness.tables = [users, orders];
        harness.tagAssignments = [assign('red', 'table', 'users')];
        const { result } = renderHook(() => useProbe(), { wrapper });

        expect(result.current.visibility).toBeNull();
        expect(renderedHidden(users, result.current.visibility)).toBe(false);
        expect(renderedHidden(orders, result.current.visibility)).toBe(false);

        act(() => {
            result.current.filter.toggleTag('red');
        });

        expect(result.current.visibility?.visibleTableIds).toEqual(
            new Set(['users'])
        );
        expect(renderedHidden(users, result.current.visibility)).toBe(false);
        expect(renderedHidden(orders, result.current.visibility)).toBe(true);

        act(() => {
            result.current.filter.clearTagFilter();
        });

        expect(result.current.visibility).toBeNull();
        expect(renderedHidden(orders, result.current.visibility)).toBe(false);
        expect(mutations.updateTablesState).not.toHaveBeenCalled();
        expect(mutations.addTags).not.toHaveBeenCalled();
        expect(mutations.removeTags).not.toHaveBeenCalled();
        expect(mutations.addTagAssignments).not.toHaveBeenCalled();
        expect(mutations.removeTagAssignments).not.toHaveBeenCalled();
        expect(mutations.createRelationship).not.toHaveBeenCalled();
        expect(mutations.removeRelationships).not.toHaveBeenCalled();
    });

    it('changes visible tables when the match mode changes', () => {
        harness.tables = [dbTable('users'), dbTable('orders')];
        harness.tagAssignments = [
            assign('red', 'table', 'users'),
            assign('blue', 'table', 'users'),
            assign('red', 'table', 'orders'),
        ];
        const { result } = renderHook(() => useProbe(), { wrapper });

        act(() => {
            result.current.filter.toggleTag('red');
            result.current.filter.toggleTag('blue');
        });

        expect(result.current.visibility?.visibleTableIds).toEqual(
            new Set(['users', 'orders'])
        );

        act(() => {
            result.current.filter.setTagMatchMode('all');
        });

        expect(result.current.visibility?.visibleTableIds).toEqual(
            new Set(['users'])
        );

        act(() => {
            result.current.filter.setTagMatchMode('none');
        });

        expect(result.current.visibility?.visibleTableIds.size).toBe(0);
    });

    it('reveals a whole parent table from a matching field without hiding sibling fields', () => {
        const users = dbTable('users', {
            fields: [field('email'), field('name')],
        });
        harness.tables = [users];
        harness.tagAssignments = [assign('red', 'field', 'email')];
        const { result } = renderHook(() => useProbe(), { wrapper });

        act(() => {
            result.current.filter.toggleTag('red');
        });

        expect(result.current.visibility?.visibleTableIds).toEqual(
            new Set(['users'])
        );
        expect(users.fields.map((item) => item.id)).toEqual(['email', 'name']);
        expect(renderedHidden(users, result.current.visibility)).toBe(false);
    });

    it('reveals eligible relationship endpoints and hides a tagged relationship that misses the filter', () => {
        harness.tables = [
            dbTable('users'),
            dbTable('orders'),
            dbTable('invoices'),
        ];
        harness.relationships = [
            dbRelationship('anchor', 'users', 'orders'),
            dbRelationship('plain', 'users', 'orders'),
            dbRelationship('other', 'orders', 'invoices'),
        ];
        harness.tagAssignments = [
            assign('red', 'relationship', 'anchor'),
            assign('blue', 'relationship', 'other'),
            assign('red', 'table', 'invoices'),
        ];
        const { result } = renderHook(() => useProbe(), { wrapper });

        act(() => {
            result.current.filter.toggleTag('red');
        });

        expect(result.current.visibility?.visibleTableIds).toEqual(
            new Set(['users', 'orders', 'invoices'])
        );
        expect(result.current.visibility?.visibleRelationshipIds).toEqual(
            new Set(['anchor', 'plain'])
        );
    });

    it('keeps a legacy table filter authoritative over a matching tag', () => {
        harness.tables = [dbTable('users'), dbTable('orders')];
        harness.filter = { tableIds: ['users'] };
        harness.tagAssignments = [
            assign('red', 'table', 'users'),
            assign('red', 'table', 'orders'),
            assign('red', 'field', 'orders.id'),
        ];
        harness.tables[1]?.fields.push(field('orders.id'));
        const { result } = renderHook(() => useProbe(), { wrapper });

        act(() => {
            result.current.filter.toggleTag('red');
        });

        expect(
            renderedHidden(harness.tables[0]!, result.current.visibility)
        ).toBe(false);
        expect(
            renderedHidden(harness.tables[1]!, result.current.visibility)
        ).toBe(true);
        expect(result.current.visibility?.visibleTableIds).toEqual(
            new Set(['users'])
        );
    });

    it('keeps schema and show-views gates authoritative over tag promotion', () => {
        const view = dbTable('active_users', {
            isView: true,
            fields: [field('active_users.id')],
        });
        const otherSchema = dbTable('billing', { schema: 'billing' });
        harness.tables = [view, otherSchema, dbTable('users')];
        harness.showDBViews = false;
        harness.filter = { schemaIds: ['public'] };
        harness.relationships = [
            dbRelationship('rel', 'users', 'active_users'),
        ];
        harness.tagAssignments = [
            assign('red', 'table', 'active_users'),
            assign('red', 'field', 'active_users.id'),
            assign('red', 'table', 'billing'),
            assign('red', 'relationship', 'rel'),
        ];
        const { result } = renderHook(() => useProbe(), { wrapper });

        act(() => {
            result.current.filter.toggleTag('red');
        });

        expect(renderedHidden(view, result.current.visibility)).toBe(true);
        expect(renderedHidden(otherSchema, result.current.visibility)).toBe(
            true
        );
        expect(result.current.visibility?.visibleTableIds).toEqual(
            new Set(['users'])
        );
        expect(result.current.visibility?.visibleRelationshipIds.size).toBe(0);
        expect(mutations.updateTablesState).not.toHaveBeenCalled();
    });

    it('hides tables outside the selected areas and does not let a tag resurrect them', () => {
        harness.areas = [
            {
                id: 'core',
                name: 'Core',
                x: 0,
                y: 0,
                width: 10,
                height: 10,
                color: '#fff',
            },
        ];
        const inside = dbTable('users', { parentAreaId: 'core' });
        const outside = dbTable('orders', {
            parentAreaId: 'other',
            fields: [field('orders.email')],
        });
        harness.tables = [inside, outside];
        harness.relationships = [dbRelationship('rel', 'orders', 'users')];
        harness.tagAssignments = [
            assign('red', 'table', 'orders'),
            assign('red', 'field', 'orders.email'),
            assign('red', 'relationship', 'rel'),
        ];
        const { result } = renderHook(() => useProbe(), { wrapper });

        act(() => {
            result.current.filter.toggleArea('core');
            result.current.filter.toggleTag('red');
        });

        expect(result.current.visibility?.visibleTableIds).toEqual(
            new Set(['users'])
        );
        expect(renderedHidden(outside, result.current.visibility)).toBe(true);
        expect(result.current.visibility?.visibleRelationshipIds.size).toBe(0);
    });

    it('composes selected schemas with areas by AND and restores them on clear', () => {
        const users = dbTable('users', {
            schema: 'public',
            parentAreaId: 'core',
        });
        const invoices = dbTable('invoices', {
            schema: 'billing',
            parentAreaId: 'core',
        });
        const audit = dbTable('audit', {
            schema: 'public',
            parentAreaId: 'archive',
        });
        harness.tables = [users, invoices, audit];
        const { result } = renderHook(() => useProbe(), { wrapper });

        act(() => {
            result.current.filter.toggleArea('core');
            result.current.filter.toggleSchema('public');
        });

        expect(result.current.visibility?.visibleTableIds).toEqual(
            new Set(['users'])
        );

        act(() => {
            result.current.filter.clearAllFilters();
        });

        expect(result.current.visibility).toBeNull();
        expect(renderedHidden(invoices, null)).toBe(false);
        expect(harness.filter).toBeUndefined();
    });

    it('does not let a new schema filter resurrect a view hidden by Show views', () => {
        const view = dbTable('active_users', {
            isView: true,
            schema: 'public',
        });
        harness.tables = [view, dbTable('users')];
        harness.showDBViews = false;
        harness.tagAssignments = [
            assign('red', 'table', 'active_users'),
            assign('red', 'table', 'users'),
        ];
        const { result } = renderHook(() => useProbe(), { wrapper });

        act(() => {
            result.current.filter.toggleSchema('public');
            result.current.filter.toggleTag('red');
        });

        expect(renderedHidden(view, result.current.visibility)).toBe(true);
        expect(result.current.visibility?.visibleTableIds).toEqual(
            new Set(['users'])
        );
    });
});
