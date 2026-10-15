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
