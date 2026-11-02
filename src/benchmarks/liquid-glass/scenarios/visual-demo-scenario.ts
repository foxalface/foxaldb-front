import type { LiquidGlassRenderMode } from '../types';
import {
    buildBenchmarkFields,
    type BenchmarkRelationshipEdge,
    type BenchmarkTableNode,
} from './generate-benchmark-scenario';

/** Fixed layout for visual transparency evaluation — not used by benchmark runners. */
export function buildVisualDemoScenario(renderMode: LiquidGlassRenderMode): {
    nodes: BenchmarkTableNode[];
    edges: BenchmarkRelationshipEdge[];
} {
    const fieldCount = 6;
    const positions = [
        { x: 40, y: 40, z: 1 },
        { x: 200, y: 72, z: 2 },
        { x: 120, y: 160, z: 3 },
        { x: 280, y: 140, z: 4 },
    ];
    const colors = ['#0ea5e9', '#a855f7', '#22c55e', '#f97316'];

    const nodes: BenchmarkTableNode[] = positions.map((pos, index) => ({
        id: `visual-demo-table-${index}`,
        type: 'benchmark-table',
        position: { x: pos.x, y: pos.y },
        zIndex: pos.z,
        draggable: false,
        selectable: true,
        data: {
            tableName: `entity_${index + 1}`,
            schemaName: 'demo',
            fields: buildBenchmarkFields(index, fieldCount),
            renderMode,
            tableColor: colors[index] ?? '#0ea5e9',
            visualEvaluationMode: true,
        },
    }));

    const edges: BenchmarkRelationshipEdge[] = [
        {
            id: 'vd-e-0-1',
            type: 'benchmark-relationship',
            source: nodes[0]!.id,
            target: nodes[1]!.id,
            data: { visualDemo: true },
            zIndex: 0,
        },
        {
            id: 'vd-e-1-2',
            type: 'benchmark-relationship',
            source: nodes[1]!.id,
            target: nodes[2]!.id,
            data: { visualDemo: true },
            zIndex: 0,
        },
        {
            id: 'vd-e-2-3',
            type: 'benchmark-relationship',
            source: nodes[2]!.id,
            target: nodes[3]!.id,
            data: { visualDemo: true },
            zIndex: 0,
        },
        {
            id: 'vd-e-0-2',
            type: 'benchmark-relationship',
            source: nodes[0]!.id,
            target: nodes[2]!.id,
            data: { visualDemo: true },
            zIndex: 0,
        },
        {
            id: 'vd-e-1-3',
            type: 'benchmark-relationship',
            source: nodes[1]!.id,
            target: nodes[3]!.id,
            data: { visualDemo: true },
            zIndex: 0,
        },
    ];

    return { nodes, edges };
}
