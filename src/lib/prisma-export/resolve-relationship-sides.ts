import type { DBField } from '@/lib/domain/db-field';
import type { DBRelationship } from '@/lib/domain/db-relationship';
import {
    determineRelationshipType,
    type RelationshipType,
} from '@/lib/domain/db-relationship';

export type ResolvedRelationshipSides = {
    fkTableId: string;
    fkField: DBField;
    referencedTableId: string;
    referencedField: DBField;
    relationshipType: RelationshipType;
};

export type ResolveRelationshipSidesResult =
    | ResolvedRelationshipSides
    | 'many_to_many'
    | 'missing_table'
    | 'missing_field';

interface TableFieldLookup {
    tableId: string;
    fieldById: Map<string, DBField>;
}

/**
 * Resolves FK holder and referenced PK/unique sides from a DBRelationship,
 * matching export-sql-script.ts and table-node-field.tsx semantics.
 */
export const resolveRelationshipSides = (
    relationship: DBRelationship,
    sourceTable: TableFieldLookup | undefined,
    targetTable: TableFieldLookup | undefined
): ResolveRelationshipSidesResult => {
    if (!sourceTable || !targetTable) {
        return 'missing_table';
    }

    const sourceField = sourceTable.fieldById.get(relationship.sourceFieldId);
    const targetField = targetTable.fieldById.get(relationship.targetFieldId);

    if (!sourceField || !targetField) {
        return 'missing_field';
    }

    const relationshipType = determineRelationshipType({
        sourceCardinality: relationship.sourceCardinality,
        targetCardinality: relationship.targetCardinality,
    });

    if (relationshipType === 'many_to_many') {
        return 'many_to_many';
    }

    if (
        relationship.sourceCardinality === 'many' &&
        relationship.targetCardinality === 'one'
    ) {
        return {
            fkTableId: sourceTable.tableId,
            fkField: sourceField,
            referencedTableId: targetTable.tableId,
            referencedField: targetField,
            relationshipType,
        };
    }

    return {
        fkTableId: targetTable.tableId,
        fkField: targetField,
        referencedTableId: sourceTable.tableId,
        referencedField: sourceField,
        relationshipType,
    };
};
