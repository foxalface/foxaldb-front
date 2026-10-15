import type { EdgeTypes, NodeTypes } from '@xyflow/react';
import type { Diagram } from '@/lib/domain/diagram';
import type { DatabaseType } from '@/lib/domain/database-type';
import type { DiagramFilter } from '@/lib/domain/diagram-filter/diagram-filter';
import { filterTable } from '@/lib/domain/diagram-filter/filter';
import type { DBRelationship } from '@/lib/domain/db-relationship';
import type { DBDependency } from '@/lib/domain/db-dependency';
import type { DBTable } from '@/lib/domain/db-table';
import { MIN_TABLE_SIZE } from '@/lib/domain/db-table';
import { defaultSchemas } from '@/lib/data/default-schemas';
import type { Area } from '@/lib/domain/area';
import type { Note } from '@/lib/domain/note';
import type { MergeChangeVisual } from '@/lib/schema-merge/preview/preview-types';
import { AreaNode } from './area-node/area-node';
import type { AreaNodeType } from './area-node/area-node';
import { DependencyEdge } from './dependency-edge/dependency-edge';
import type { DependencyEdgeType } from './dependency-edge/dependency-edge';
import { NoteNode } from './note-node/note-node';
import type { NoteNodeType } from './note-node/note-node';
import { RelationshipEdge } from './relationship-edge/relationship-edge';
import type { RelationshipEdgeType } from './relationship-edge/relationship-edge';
import { TableNode } from './table-node/table-node';
import type { TableNodeType } from './table-node/table-node';
import {
    LEFT_HANDLE_ID_PREFIX,
    TARGET_ID_PREFIX,
} from './table-node/table-node-field';
import {
    TARGET_DEP_PREFIX,
    TOP_SOURCE_HANDLE_ID_PREFIX,
} from './table-node/table-node-dependency-indicator';

export type DiagramFlowNodeType = TableNodeType | AreaNodeType | NoteNodeType;

export type DiagramFlowEdgeType = RelationshipEdgeType | DependencyEdgeType;

export interface MergePreviewNodeDecoration {
    readonly entityKind: 'table' | 'field';
    readonly entityId: string;
    readonly change: MergeChangeVisual;
}

export interface MergePreviewEdgeDecoration {
    readonly change: MergeChangeVisual;
}

export interface TableToTableNodeOptions {
    filter?: DiagramFilter;
    databaseType: DatabaseType;
    filterLoading: boolean;
    showDBViews?: boolean;
    forceShow?: boolean;
    isRelationshipCreatingTarget?: boolean;
    targetEdgeCounts?: Record<string, number>;
    mergePreview?: MergePreviewNodeDecoration[];
}

export const tableToTableNode = (
    table: DBTable,
    options: TableToTableNodeOptions
): TableNodeType => {
    const {
        filter,
        databaseType,
        filterLoading,
        showDBViews,
        forceShow,
        isRelationshipCreatingTarget = false,
        targetEdgeCounts,
        mergePreview,
    } = options;

    const position = { x: table.x, y: table.y };

    let hidden = false;

    if (forceShow) {
        hidden = false;
    } else {
        hidden =
            !filterTable({
                table: { id: table.id, schema: table.schema },
                filter,
                options: { defaultSchema: defaultSchemas[databaseType] },
            }) ||
            filterLoading ||
            (!showDBViews && table.isView);
    }

    return {
        id: table.id,
        type: 'table',
        position,
        data: {
            table,
            isOverlapping: false,
            isRelationshipCreatingTarget,
            targetEdgeCounts,
            ...(mergePreview ? { mergePreview } : {}),
        },
        width: table.width ?? MIN_TABLE_SIZE,
        hidden,
    };
};

export const areaToAreaNode = (
    area: Area,
    {
        tables,
        filter,
        databaseType,
        filterLoading,
    }: {
        tables: DBTable[];
        filter?: DiagramFilter;
        databaseType: DatabaseType;
        filterLoading: boolean;
    }
): AreaNodeType => {
    const tablesInArea = tables.filter((t) => t.parentAreaId === area.id);

    const hasVisibleTable =
        tablesInArea.length === 0 ||
        tablesInArea.some((table) =>
            filterTable({
                table: { id: table.id, schema: table.schema },
                filter,
                options: {
                    defaultSchema: defaultSchemas[databaseType],
                },
            })
        );

    return {
        id: area.id,
        type: 'area',
        position: { x: area.x, y: area.y },
        data: { area },
        width: area.width,
        height: area.height,
        zIndex: -10,
        style: {
            zIndex: -10,
        },
        hidden: !hasVisibleTable || filterLoading,
    };
};

export const noteToNoteNode = (note: Note): NoteNodeType => ({
    id: note.id,
    type: 'note',
    position: { x: note.x, y: note.y },
    data: { note },
    width: note.width,
    height: note.height,
    zIndex: 50,
    style: {
        zIndex: 50,
    },
});

export const targetEdgeCountsByFieldId = (
    relationships: readonly DBRelationship[]
): Record<string, number> => {
    const counts: Record<string, number> = {};

    relationships.forEach((relationship) => {
        const fieldId = relationship.targetFieldId;
        counts[fieldId] = (counts[fieldId] ?? 0) + 1;
    });

    return counts;
};

export const relationshipEdgesFromDiagram = (
    relationships: readonly DBRelationship[],
    options?: {
        mergePreviewByRelationshipId?: ReadonlyMap<
            string,
            MergePreviewEdgeDecoration
        >;
    }
): RelationshipEdgeType[] => {
    const targetIndexes: Record<string, number> = relationships.reduce(
        (acc, relationship) => {
            acc[`${relationship.targetTableId}${relationship.targetFieldId}`] =
                0;
            return acc;
        },
        {} as Record<string, number>
    );

    return relationships.map((relationship): RelationshipEdgeType => {
        const mergePreview = options?.mergePreviewByRelationshipId?.get(
            relationship.id
        );

        return {
            id: relationship.id,
            source: relationship.sourceTableId,
            target: relationship.targetTableId,
            sourceHandle: `${LEFT_HANDLE_ID_PREFIX}${relationship.sourceFieldId}`,
            targetHandle: `${TARGET_ID_PREFIX}${targetIndexes[`${relationship.targetTableId}${relationship.targetFieldId}`]++}_${relationship.targetFieldId}`,
            type: 'relationship-edge',
            data: {
                relationship,
                ...(mergePreview ? { mergePreview } : {}),
            },
            selected: false,
            animated: false,
        };
    });
};

export const dependencyEdgesFromDiagram = (
    dependencies: readonly DBDependency[],
    showDBViews: boolean
): DependencyEdgeType[] => {
    const targetDepIndexes: Record<string, number> = dependencies.reduce(
        (acc, dep) => {
            acc[dep.tableId] = 0;
            return acc;
        },
        {} as Record<string, number>
    );

    return dependencies.map(
        (dep): DependencyEdgeType => ({
            id: dep.id,
            source: dep.dependentTableId,
            target: dep.tableId,
            sourceHandle: `${TOP_SOURCE_HANDLE_ID_PREFIX}${dep.dependentTableId}`,
            targetHandle: `${TARGET_DEP_PREFIX}${targetDepIndexes[dep.tableId]++}_${dep.tableId}`,
            type: 'dependency-edge',
            data: { dependency: dep },
            hidden: !showDBViews,
            selected: false,
            animated: false,
        })
    );
};

export interface DiagramToFlowElementsOptions {
    databaseType: DatabaseType;
    filter?: DiagramFilter;
    filterLoading?: boolean;
    showDBViews?: boolean;
    forceShowTables?: boolean;
    includeAreas?: boolean;
    includeNotes?: boolean;
    includeDependencies?: boolean;
    mergePreviewByTableId?: ReadonlyMap<string, MergePreviewNodeDecoration[]>;
    mergePreviewByRelationshipId?: ReadonlyMap<
        string,
        MergePreviewEdgeDecoration
    >;
}

export const diagramToFlowElements = (
    diagram: Diagram,
    options: DiagramToFlowElementsOptions
): { nodes: DiagramFlowNodeType[]; edges: DiagramFlowEdgeType[] } => {
    const tables = diagram.tables ?? [];
    const relationships = diagram.relationships ?? [];
    const dependencies = diagram.dependencies ?? [];
    const areas = diagram.areas ?? [];
    const notes = diagram.notes ?? [];
    const filterLoading = options.filterLoading ?? false;
    const showDBViews = options.showDBViews ?? true;
    const targetEdgeCounts = targetEdgeCountsByFieldId(relationships);

    const tableNodes = tables.map((table) =>
        tableToTableNode(table, {
            filter: options.filter,
            databaseType: options.databaseType,
            filterLoading,
            showDBViews,
            forceShow: options.forceShowTables,
            targetEdgeCounts: targetEdgeCounts,
            mergePreview: options.mergePreviewByTableId?.get(table.id),
        })
    );

    const areaNodes =
        options.includeAreas === false
            ? []
            : areas.map((area) =>
                  areaToAreaNode(area, {
                      tables,
                      filter: options.filter,
                      databaseType: options.databaseType,
                      filterLoading,
                  })
              );

    const noteNodes =
        options.includeNotes === false
            ? []
            : notes.map((note) => noteToNoteNode(note));

    const relationshipEdges = relationshipEdgesFromDiagram(relationships, {
        mergePreviewByRelationshipId: options.mergePreviewByRelationshipId,
    });

    const dependencyEdges =
        options.includeDependencies === false
            ? []
            : dependencyEdgesFromDiagram(dependencies, showDBViews);

    return {
        nodes: [...tableNodes, ...areaNodes, ...noteNodes],
        edges: [...relationshipEdges, ...dependencyEdges],
    };
};

/** Node and edge types shared by editor canvas and merge preview (no temp/cursor nodes). */
export const diagramFlowNodeTypes: NodeTypes = {
    table: TableNode,
    area: AreaNode,
    note: NoteNode,
};

export const diagramFlowEdgeTypes: EdgeTypes = {
    'relationship-edge': RelationshipEdge,
    'dependency-edge': DependencyEdge,
};
