import type { MovementTablePosition } from './movement-types';

export interface FlowNodeSnapshot {
    id: string;
    type?: string;
    dragging?: boolean;
    position?: {
        x: number;
        y: number;
    };
}

const isFinitePosition = (position: { x: number; y: number }): boolean =>
    Number.isFinite(position.x) && Number.isFinite(position.y);

export const buildDraggingTableSnapshot = (
    nodes: ReadonlyArray<FlowNodeSnapshot>
): MovementTablePosition[] => {
    const tables: MovementTablePosition[] = [];

    for (const node of nodes) {
        if (
            node.type !== 'table' ||
            node.dragging !== true ||
            node.position === undefined ||
            !isFinitePosition(node.position)
        ) {
            continue;
        }

        tables.push({
            id: node.id,
            x: node.position.x,
            y: node.position.y,
        });
    }

    tables.sort((left, right) => left.id.localeCompare(right.id));

    return tables;
};

export const buildTablePositionsForIds = (
    nodes: ReadonlyArray<FlowNodeSnapshot>,
    ids: ReadonlySet<string>
): MovementTablePosition[] => {
    const tables: MovementTablePosition[] = [];

    for (const node of nodes) {
        if (
            node.type !== 'table' ||
            !ids.has(node.id) ||
            node.position === undefined ||
            !isFinitePosition(node.position)
        ) {
            continue;
        }

        tables.push({
            id: node.id,
            x: node.position.x,
            y: node.position.y,
        });
    }

    tables.sort((left, right) => left.id.localeCompare(right.id));

    return tables;
};
