import type { VisualComparePanelId } from '../types';
import {
    buildBenchmarkFields,
    type BenchmarkRelationshipEdge,
    type BenchmarkTableNode,
} from './generate-benchmark-scenario';

/** Hero table — edge `vd-e-through-table` passes under this node body. */
export const REFRACTION_COMPARE_HERO_TABLE_ID = 'compare-hero-table';

export const REFRACTION_THROUGH_TABLE_EDGE_ID = 'vd-e-through-table';

const FIELD_COUNT = 6;

const TABLE_COLORS = ['#0ea5e9', '#a855f7', '#22c55e', '#f97316'] as const;

function renderModeForPanel(
    panelId: VisualComparePanelId
): 'glass-css' | 'liquid-svg' {
    if (panelId === 'liquid-svg') {
        return 'liquid-svg';
    }
    return 'glass-css';
}

export function buildRefractionVisualCompareScenario(
    panelId: VisualComparePanelId
): {
    nodes: BenchmarkTableNode[];
    edges: BenchmarkRelationshipEdge[];
} {
    const renderMode = renderModeForPanel(panelId);

    const positions = [
        { id: 'compare-t-left', x: 24, y: 148, z: 1 },
        { id: REFRACTION_COMPARE_HERO_TABLE_ID, x: 148, y: 88, z: 4 },
        { id: 'compare-t-top', x: 268, y: 36, z: 2 },
        { id: 'compare-t-right', x: 318, y: 152, z: 3 },
    ];

    const nodes: BenchmarkTableNode[] = positions.map((pos, index) => ({
        id: pos.id,
        type: 'benchmark-table',
        position: { x: pos.x, y: pos.y },
        zIndex: pos.z,
        draggable:
            panelId === 'clone-sync-one-table'
                ? pos.id === REFRACTION_COMPARE_HERO_TABLE_ID
                : false,
        selectable: true,
        data: {
            tableName:
                pos.id === REFRACTION_COMPARE_HERO_TABLE_ID
                    ? 'hero_lens'
                    : `entity_${index + 1}`,
            schemaName: 'compare',
            fields: buildBenchmarkFields(index, FIELD_COUNT),
            renderMode,
            tableColor: TABLE_COLORS[index] ?? '#0ea5e9',
            visualEvaluationMode: true,
            comparePanel: panelId,
            compareCloneSyncHero:
                panelId === 'clone-sync-one-table' &&
                pos.id === REFRACTION_COMPARE_HERO_TABLE_ID,
        },
    }));

    const edges: BenchmarkRelationshipEdge[] = [
        {
            id: REFRACTION_THROUGH_TABLE_EDGE_ID,
            type: 'benchmark-relationship',
            source: 'compare-t-left',
            target: 'compare-t-right',
            data: { visualDemo: true, throughHero: true },
            zIndex: 0,
        },
        {
            id: 'vd-e-hero-top',
            type: 'benchmark-relationship',
            source: REFRACTION_COMPARE_HERO_TABLE_ID,
            target: 'compare-t-top',
            data: { visualDemo: true },
            zIndex: 0,
        },
        {
            id: 'vd-e-left-hero',
            type: 'benchmark-relationship',
            source: 'compare-t-left',
            target: REFRACTION_COMPARE_HERO_TABLE_ID,
            data: { visualDemo: true },
            zIndex: 0,
        },
        {
            id: 'vd-e-right-hero',
            type: 'benchmark-relationship',
            source: REFRACTION_COMPARE_HERO_TABLE_ID,
            target: 'compare-t-right',
            data: { visualDemo: true },
            zIndex: 0,
        },
    ];

    return { nodes, edges };
}
