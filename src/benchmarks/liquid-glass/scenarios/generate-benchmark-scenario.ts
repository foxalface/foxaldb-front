import type { Edge, Node } from '@xyflow/react';
import { MIN_TABLE_SIZE } from '@/lib/domain/db-table';
import type {
    BenchmarkFieldDensity,
    BenchmarkRelationshipDensity,
    BenchmarkScenarioProfile,
    LiquidGlassRenderMode,
    VisualComparePanelId,
} from '../types';

export interface BenchmarkTableField {
    id: string;
    name: string;
    typeLabel: string;
    primaryKey: boolean;
    nullable: boolean;
    unique: boolean;
}

export interface BenchmarkTableNodeData extends Record<string, unknown> {
    tableName: string;
    schemaName: string;
    fields: BenchmarkTableField[];
    renderMode: LiquidGlassRenderMode;
    tableColor: string;
    /** Stronger transparency cues for the visual demo canvas (not used in benchmark metrics). */
    visualEvaluationMode?: boolean;
    /** M-LG.2.1 visual compare panel (benchmark dev only). */
    comparePanel?: VisualComparePanelId;
    /** Hero table for clone-sync panel. */
    compareCloneSyncHero?: boolean;
}

export type BenchmarkTableNodeType = Node<
    BenchmarkTableNodeData,
    'benchmark-table'
>;

export type BenchmarkTableNode = BenchmarkTableNodeType;

export type BenchmarkRelationshipEdge = Edge<
    Record<string, unknown>,
    'benchmark-relationship'
>;

const FIELD_NAMES = [
    'id',
    'user_id',
    'email',
    'status',
    'created_at',
    'updated_at',
    'metadata',
    'token',
    'slug',
    'payload',
    'checksum',
    'revision',
] as const;

const TYPE_LABELS = [
    'uuid',
    'bigint',
    'varchar',
    'boolean',
    'timestamptz',
    'jsonb',
    'text',
] as const;

export const BENCHMARK_TABLE_COUNTS = [20, 100, 200, 300] as const;

export type BenchmarkTableCount = (typeof BENCHMARK_TABLE_COUNTS)[number];

const FIELD_COUNT_BY_DENSITY: Record<BenchmarkFieldDensity, number> = {
    light: 6,
    medium: 10,
    heavy: 14,
};

const TABLE_COLORS = [
    '#0ea5e9',
    '#8b5cf6',
    '#22c55e',
    '#f97316',
    '#ec4899',
] as const;

export function fieldCountForDensity(density: BenchmarkFieldDensity): number {
    return FIELD_COUNT_BY_DENSITY[density];
}

export function buildBenchmarkFields(
    tableIndex: number,
    fieldCount: number
): BenchmarkTableField[] {
    return Array.from({ length: fieldCount }, (_, fieldIndex) => {
        const name =
            FIELD_NAMES[(tableIndex + fieldIndex) % FIELD_NAMES.length] ??
            `field_${fieldIndex}`;
        return {
            id: `f-${tableIndex}-${fieldIndex}`,
            name,
            typeLabel:
                TYPE_LABELS[(tableIndex + fieldIndex) % TYPE_LABELS.length] ??
                'text',
            primaryKey: fieldIndex === 0,
            nullable: fieldIndex % 3 === 0,
            unique: fieldIndex === 1,
        };
    });
}

export function gridPositionForTableIndex(
    index: number,
    columns: number,
    cellWidth: number,
    cellHeight: number
): { x: number; y: number } {
    const col = index % columns;
    const row = Math.floor(index / columns);
    return {
        x: col * cellWidth,
        y: row * cellHeight,
    };
}

export function columnsForTableCount(count: number): number {
    if (count <= 20) {
        return 5;
    }
    if (count <= 100) {
        return 10;
    }
    if (count <= 200) {
        return 14;
    }
    return 18;
}

export function generateBenchmarkTableNodes(options: {
    profile: BenchmarkScenarioProfile;
    renderMode: LiquidGlassRenderMode;
}): BenchmarkTableNode[] {
    const { profile, renderMode } = options;
    const { count, fieldDensity, overlapCluster } = {
        count: profile.tableCount,
        fieldDensity: profile.fieldDensity,
        overlapCluster: profile.overlapCluster,
    };
    const columns = columnsForTableCount(count);
    const fieldCount = fieldCountForDensity(fieldDensity);
    const cellWidth = MIN_TABLE_SIZE + 48;
    const cellHeight = 120 + fieldCount * 28;

    return Array.from({ length: count }, (_, index) => {
        let { x, y } = gridPositionForTableIndex(
            index,
            columns,
            cellWidth,
            cellHeight
        );
        if (overlapCluster && index < 8) {
            x += (index % 4) * 28;
            y += Math.floor(index / 4) * 24;
        }
        return {
            id: `benchmark-table-${index}`,
            type: 'benchmark-table',
            position: { x, y },
            zIndex: overlapCluster && index < 8 ? index + 1 : undefined,
            data: {
                tableName: `table_${index + 1}`,
                schemaName: 'public',
                fields: buildBenchmarkFields(index, fieldCount),
                renderMode,
                tableColor:
                    TABLE_COLORS[index % TABLE_COLORS.length] ?? '#0ea5e9',
            },
            draggable: true,
            selectable: true,
        };
    });
}

export function generateBenchmarkRelationshipEdges(options: {
    nodes: BenchmarkTableNode[];
    density: BenchmarkRelationshipDensity;
}): BenchmarkRelationshipEdge[] {
    const { nodes, density } = options;
    if (density === 'none' || nodes.length < 2) {
        return [];
    }

    const edges: BenchmarkRelationshipEdge[] = [];
    const pushEdge = (
        sourceIndex: number,
        targetIndex: number,
        lane: number
    ) => {
        const source = nodes[sourceIndex];
        const target = nodes[targetIndex];
        if (!source || !target) {
            return;
        }
        edges.push({
            id: `rel-${source.id}-${target.id}-${lane}`,
            type: 'benchmark-relationship',
            source: source.id,
            target: target.id,
            data: {},
            zIndex: 0,
        });
    };

    for (let i = 0; i < nodes.length - 1; i += 1) {
        pushEdge(i, i + 1, 0);
    }

    if (density === 'sparse') {
        for (let i = 0; i < nodes.length - 3; i += 4) {
            pushEdge(i, i + 3, 1);
        }
        return edges;
    }

    for (let i = 0; i < nodes.length - 1; i += 2) {
        pushEdge(i, Math.min(nodes.length - 1, i + 5), 2);
    }
    for (let i = 0; i < Math.min(40, nodes.length - 1); i += 1) {
        pushEdge(i, (i + 7) % nodes.length, 3 + (i % 2));
    }
    return edges;
}

export function generateBenchmarkScenario(options: {
    profile: BenchmarkScenarioProfile;
    renderMode: LiquidGlassRenderMode;
}): {
    nodes: BenchmarkTableNode[];
    edges: BenchmarkRelationshipEdge[];
} {
    const nodes = generateBenchmarkTableNodes(options);
    const edges = generateBenchmarkRelationshipEdges({
        nodes,
        density: options.profile.relationshipDensity,
    });
    return { nodes, edges };
}
