import { describe, expect, it } from 'vitest';
import { defaultSchemas } from '@/lib/data/default-schemas';
import { DatabaseType } from '@/lib/domain/database-type';
import {
    tablePassesAreaConstraint,
    tablePassesSchemaConstraint,
} from '@/lib/domain/editor-filter-eligibility';
import type {
    DiagramTagAssignment,
    TagMatchMode,
} from '@/lib/domain/diagram-tag';
import {
    areaHiddenByTagVisibility,
    deriveTagCanvasVisibility,
    fieldHiddenByTagVisibility,
    relationshipHiddenByTagVisibility,
    tableHiddenByTagVisibility,
} from '@/pages/editor-page/canvas/tag-canvas-visibility';
import type { TagCanvasVisibility } from '@/pages/editor-page/canvas/tag-canvas-visibility';
import { isVisualExportDiagramNode } from '../visual-export-capture-layout';

interface TableFixture {
    id: string;
    isView?: boolean;
    parentAreaId?: string | null;
    schema?: string | null;
    fields: { id: string }[];
}

interface RelationshipFixture {
    id: string;
    sourceTableId: string;
    targetTableId: string;
}

interface FilterFixture {
    selectedTagIds?: string[];
    tagMatchMode?: TagMatchMode;
    selectedAreaIds?: string[];
    selectedSchemaIds?: string[];
    showViews?: boolean;
}

const exportedNodeIds = (
    tables: TableFixture[],
    relationships: RelationshipFixture[],
    assignments: DiagramTagAssignment[],
    filter: FilterFixture = {}
): {
    tables: string[];
    relationships: string[];
    areas: string[];
    fields: string[];
} => {
    const selectedTagIds = filter.selectedTagIds ?? [];
    const selectedAreaIds = filter.selectedAreaIds ?? [];
    const selectedSchemaIds = filter.selectedSchemaIds ?? [];
    const showViews = filter.showViews ?? false;
    const defaultSchema = defaultSchemas[DatabaseType.POSTGRESQL];
    const eligible = new Set<string>();

    for (const table of tables) {
        if (!showViews && table.isView) {
            continue;
        }

        if (!tablePassesAreaConstraint(table.parentAreaId, selectedAreaIds)) {
            continue;
        }

        if (
            !tablePassesSchemaConstraint(
                table,
                selectedSchemaIds,
                defaultSchema
            )
        ) {
            continue;
        }

        eligible.add(table.id);
    }

    const hasConstraint =
        selectedTagIds.length > 0 ||
        selectedAreaIds.length > 0 ||
        selectedSchemaIds.length > 0;
    const everyEligible = tables.every((table) => eligible.has(table.id));
    const visibility: TagCanvasVisibility | null =
        everyEligible && !hasConstraint
            ? null
            : deriveTagCanvasVisibility({
                  tables,
                  relationships,
                  tagAssignments: assignments,
                  selectedTagIds,
                  matchMode: filter.tagMatchMode ?? 'any',
                  eligibleTableIds: eligible,
              });

    const nodes = tables.map((table) => ({
        id: table.id,
        type: 'table' as const,
        hidden: tableHiddenByTagVisibility(
            !eligible.has(table.id),
            table.id,
            visibility
        ),
    }));

    return {
        tables: nodes
            .filter((node) => isVisualExportDiagramNode(node))
            .map((node) => node.id),
        fields: tables.flatMap((table) =>
            table.fields
                .filter(
                    (field) => !fieldHiddenByTagVisibility(field.id, visibility)
                )
                .map((field) => field.id)
        ),
        relationships: relationships
            .filter(
                (relationship) =>
                    !relationshipHiddenByTagVisibility(
                        relationship.id,
                        visibility
                    )
            )
            .map((relationship) => relationship.id),
        areas: ['area-core'].filter(
            () =>
                !areaHiddenByTagVisibility({
                    areaAlreadyHidden: false,
                    tableIdsInArea: tables
                        .filter((table) => table.parentAreaId === 'area-core')
                        .map((table) => table.id),
                    visibility,
                })
        ),
    };
};

const users: TableFixture = {
    id: 'users',
    parentAreaId: 'area-core',
    schema: 'public',
    fields: [{ id: 'id' }, { id: 'name' }, { id: 'email' }],
};
const orders: TableFixture = {
    id: 'orders',
    parentAreaId: 'area-sales',
    schema: 'billing',
    fields: [{ id: 'orders-id' }, { id: 'orders-email' }],
};
const userOrders: RelationshipFixture = {
    id: 'user-orders',
    sourceTableId: 'users',
    targetTableId: 'orders',
};

describe('visual export follows canvas visibility', () => {
    it('keeps a tag match and drops a table the tag filter hides', () => {
        const exported = exportedNodeIds(
            [users, orders],
            [userOrders],
            [
                {
                    id: 'a1',
                    tagId: 'red',
                    targetType: 'table',
                    targetId: 'users',
                },
            ],
            { selectedTagIds: ['red'], showViews: true }
        );

        expect(exported.tables).toEqual(['users']);
        expect(exported.relationships).toEqual([]);
    });

    it('exports a field-promoted table as one complete node', () => {
        const exported = exportedNodeIds(
            [users, orders],
            [],
            [
                {
                    id: 'a1',
                    tagId: 'red',
                    targetType: 'field',
                    targetId: 'orders-email',
                },
            ],
            { selectedTagIds: ['red'], showViews: true }
        );

        expect(exported.tables).toEqual(['orders']);
    });

    it('keeps an untagged relationship between visible tables and hides a non-matching tagged one', () => {
        const visible = exportedNodeIds([users, orders], [userOrders], [], {
            showViews: true,
        });
        const hidden = exportedNodeIds(
            [users, orders],
            [userOrders],
            [
                {
                    id: 'a1',
                    tagId: 'blue',
                    targetType: 'table',
                    targetId: 'users',
                },
                {
                    id: 'a2',
                    tagId: 'blue',
                    targetType: 'table',
                    targetId: 'orders',
                },
                {
                    id: 'a3',
                    tagId: 'red',
                    targetType: 'relationship',
                    targetId: 'user-orders',
                },
            ],
            { selectedTagIds: ['blue'], tagMatchMode: 'any', showViews: true }
        );

        expect(visible.relationships).toEqual(['user-orders']);
        expect(hidden.tables).toEqual(['users', 'orders']);
        expect(hidden.relationships).toEqual([]);
    });

    it('omits a table outside the selected area', () => {
        const exported = exportedNodeIds([users, orders], [userOrders], [], {
            selectedAreaIds: ['area-core'],
            showViews: true,
        });

        expect(exported.tables).toEqual(['users']);
        expect(exported.relationships).toEqual([]);
    });

    it('omits a table outside the selected schema', () => {
        const exported = exportedNodeIds([users, orders], [userOrders], [], {
            selectedSchemaIds: ['public'],
            showViews: true,
        });

        expect(exported.tables).toEqual(['users']);
    });

    it('omits views unless Show views is on', () => {
        const view: TableFixture = {
            id: 'active-users',
            isView: true,
            schema: 'public',
            fields: [{ id: 'view-id' }],
        };

        expect(
            exportedNodeIds([users, view], [], [], { showViews: false }).tables
        ).toEqual(['users']);
        expect(
            exportedNodeIds([users, view], [], [], { showViews: true }).tables
        ).toEqual(['users', 'active-users']);
    });

    it('does not let a tag resurrect an area, schema, or view exclusion', () => {
        const view: TableFixture = {
            id: 'active-users',
            isView: true,
            parentAreaId: 'area-core',
            schema: 'public',
            fields: [{ id: 'view-id' }],
        };
        const assignments: DiagramTagAssignment[] = [
            {
                id: 'a1',
                tagId: 'red',
                targetType: 'table',
                targetId: 'orders',
            },
            {
                id: 'a2',
                tagId: 'red',
                targetType: 'table',
                targetId: 'active-users',
            },
        ];

        expect(
            exportedNodeIds([users, orders], [], assignments, {
                selectedTagIds: ['red'],
                selectedAreaIds: ['area-core'],
                showViews: true,
            }).tables
        ).toEqual([]);
        expect(
            exportedNodeIds([users, orders], [], assignments, {
                selectedTagIds: ['red'],
                selectedSchemaIds: ['public'],
                showViews: true,
            }).tables
        ).toEqual([]);
        expect(
            exportedNodeIds([users, view], [], assignments, {
                selectedTagIds: ['red'],
                showViews: false,
            }).tables
        ).toEqual([]);
    });

    it('exports the normal graph when no personal constraint is active', () => {
        const exported = exportedNodeIds([users, orders], [userOrders], [], {
            showViews: false,
        });

        expect(exported.tables).toEqual(['users', 'orders']);
        expect(exported.relationships).toEqual(['user-orders']);
        expect(exported.areas).toEqual(['area-core']);
        expect(exported.fields).toEqual([
            'id',
            'name',
            'email',
            'orders-id',
            'orders-email',
        ]);
    });

    it('omits fields hidden by NONE on a visible table from the live canvas', () => {
        const exported = exportedNodeIds(
            [users],
            [],
            [
                {
                    id: 'a1',
                    tagId: 'test',
                    targetType: 'field',
                    targetId: 'name',
                },
            ],
            { selectedTagIds: ['test'], tagMatchMode: 'none', showViews: true }
        );

        expect(exported.tables).toEqual(['users']);
        expect(exported.fields).toEqual(['id', 'email']);
    });
});
