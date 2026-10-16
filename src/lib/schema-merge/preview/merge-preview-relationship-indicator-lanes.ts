import type { Diagram } from '@/lib/domain/diagram';
import type { DBRelationship } from '@/lib/domain/db-relationship';
import type { DBTable } from '@/lib/domain/db-table';

const ANCHOR_BUCKET_SIZE = 48;

export const relationshipDiagramAnchor = (
    relationship: DBRelationship,
    tables: readonly DBTable[]
): { x: number; y: number } => {
    const source = tables.find(
        (table) => table.id === relationship.sourceTableId
    );
    const target = tables.find(
        (table) => table.id === relationship.targetTableId
    );

    if (!source || !target) {
        return { x: 0, y: 0 };
    }

    return {
        x: (source.x + target.x) / 2,
        y: (source.y + target.y) / 2,
    };
};

/**
 * Assigns deterministic perpendicular lanes for Merge relationship indicators
 * that share similar diagram-space anchors.
 */
export const assignRelationshipIndicatorLanes = (
    diagram: Diagram,
    relationshipIds: readonly string[]
): Map<string, number> => {
    const tables = diagram.tables ?? [];
    const relationships = diagram.relationships ?? [];
    const lanes = new Map<string, number>();

    const entries = relationshipIds
        .map((relationshipId) => {
            const relationship = relationships.find(
                (item) => item.id === relationshipId
            );

            if (!relationship) {
                return null;
            }

            const anchor = relationshipDiagramAnchor(relationship, tables);
            const bucketKey = `${Math.round(anchor.x / ANCHOR_BUCKET_SIZE)}:${Math.round(anchor.y / ANCHOR_BUCKET_SIZE)}`;

            return { relationshipId, bucketKey };
        })
        .filter(
            (entry): entry is { relationshipId: string; bucketKey: string } =>
                entry !== null
        )
        .sort((left, right) =>
            left.relationshipId.localeCompare(right.relationshipId)
        );

    const buckets = new Map<string, string[]>();

    for (const entry of entries) {
        const bucket = buckets.get(entry.bucketKey) ?? [];
        bucket.push(entry.relationshipId);
        buckets.set(entry.bucketKey, bucket);
    }

    for (const bucket of buckets.values()) {
        const sorted = [...bucket].sort((a, b) => a.localeCompare(b));
        const total = sorted.length;

        sorted.forEach((relationshipId, index) => {
            lanes.set(relationshipId, index - (total - 1) / 2);
        });
    }

    return lanes;
};

export const MERGE_PREVIEW_INDICATOR_SIZE = 20;
export const MERGE_PREVIEW_INDICATOR_LANE_SPACING = 14;
/** Minimum center-to-center distance between Merge indicator and cardinality anchors. */
export const MERGE_PREVIEW_CARDINALITY_CLEARANCE = 30;

export interface MergePreviewIndicatorPositionInput {
    readonly edgeMidpoint: { readonly x: number; readonly y: number };
    readonly sourceAnchor: { readonly x: number; readonly y: number };
    readonly targetAnchor: { readonly x: number; readonly y: number };
    readonly sourceX: number;
    readonly sourceY: number;
    readonly targetX: number;
    readonly targetY: number;
    readonly indicatorLane: number;
    readonly indicatorSize?: number;
    readonly laneSpacing?: number;
    readonly minCardinalityClearance?: number;
}

const indicatorCenterClearance = (
    centerX: number,
    centerY: number,
    sourceAnchor: { x: number; y: number },
    targetAnchor: { x: number; y: number },
    minClearance: number
): boolean => {
    const distSource = Math.hypot(
        centerX - sourceAnchor.x,
        centerY - sourceAnchor.y
    );
    const distTarget = Math.hypot(
        centerX - targetAnchor.x,
        centerY - targetAnchor.y
    );

    return distSource >= minClearance && distTarget >= minClearance;
};

/**
 * Places the Merge relationship indicator along the edge normal with lane offset,
 * pushing farther along the normal when the indicator would sit on a cardinality badge.
 */
export const computeMergePreviewIndicatorPosition = (
    input: MergePreviewIndicatorPositionInput
): { x: number; y: number } => {
    const indicatorSize = input.indicatorSize ?? MERGE_PREVIEW_INDICATOR_SIZE;
    const laneSpacing =
        input.laneSpacing ?? MERGE_PREVIEW_INDICATOR_LANE_SPACING;
    const minClearance =
        input.minCardinalityClearance ?? MERGE_PREVIEW_CARDINALITY_CLEARANCE;

    const dx = input.targetX - input.sourceX;
    const dy = input.targetY - input.sourceY;
    const length = Math.hypot(dx, dy) || 1;
    const normalX = -dy / length;
    const normalY = dx / length;

    let laneOffset = input.indicatorLane * laneSpacing;
    const step =
        laneOffset === 0
            ? laneSpacing
            : laneOffset > 0
              ? laneSpacing
              : -laneSpacing;

    let centerX = input.edgeMidpoint.x + normalX * laneOffset;
    let centerY = input.edgeMidpoint.y + normalY * laneOffset;

    for (let attempt = 0; attempt < 12; attempt++) {
        if (
            indicatorCenterClearance(
                centerX,
                centerY,
                input.sourceAnchor,
                input.targetAnchor,
                minClearance
            )
        ) {
            break;
        }

        laneOffset += step;
        centerX = input.edgeMidpoint.x + normalX * laneOffset;
        centerY = input.edgeMidpoint.y + normalY * laneOffset;
    }

    return {
        x: centerX - indicatorSize / 2,
        y: centerY - indicatorSize / 2,
    };
};
