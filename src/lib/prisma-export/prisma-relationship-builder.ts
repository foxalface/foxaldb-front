import type { DBField } from '@/lib/domain/db-field';
import type { DBIndex } from '@/lib/domain/db-index';
import type { DBRelationship } from '@/lib/domain/db-relationship';
import type { DBTable } from '@/lib/domain/db-table';
import { determineRelationshipType } from '@/lib/domain/db-relationship';
import {
    deriveForwardRelationFieldName,
    deriveInverseRelationFieldName,
    IdentifierAllocator,
    sanitizeRelationName,
} from './prisma-identifier';
import type { PrismaExportNote } from './prisma-export-types';

export interface PrismaRelationField {
    prismaName: string;
    typeExpression: string;
    attributes: string[];
    isList: boolean;
}

export interface PrismaModelRelationPlan {
    relationFields: PrismaRelationField[];
}

interface TableModelMap {
    tableId: string;
    modelIdentifier: string;
    fieldById: Map<string, DBField>;
    fieldPrismaNames: Map<string, string>;
    indexes: DBIndex[];
}

const UNSUPPORTED_INDEX_TYPES = new Set([
    'fulltext',
    'spatial',
    'gist',
    'gin',
    'spgist',
    'brin',
    'xml',
]);

export const isUnsupportedIndexType = (type: DBIndex['type']): boolean =>
    type !== null && type !== undefined && UNSUPPORTED_INDEX_TYPES.has(type);

const fieldIsUniqueTarget = (field: DBField, indexes: DBIndex[]): boolean => {
    if (field.primaryKey || field.unique) {
        return true;
    }

    return indexes.some(
        (index) =>
            index.unique &&
            !index.isPrimaryKey &&
            index.fieldIds.length === 1 &&
            index.fieldIds[0] === field.id
    );
};

const formatReferentialAction = (
    action: DBRelationship['onDelete'] | DBRelationship['onUpdate'],
    kind: 'onDelete' | 'onUpdate'
): string | null => {
    if (!action) {
        return null;
    }

    switch (action) {
        case 'cascade':
            return `${kind}: Cascade`;
        case 'restrict':
            return `${kind}: Restrict`;
        case 'set_null':
            return `${kind}: SetNull`;
        default:
            return null;
    }
};

const buildRelationName = (
    relationship: DBRelationship,
    sourceModel: string,
    targetModel: string,
    fkFieldPrismaName: string,
    usedNames: Set<string>
): string => {
    const fromCanonical = sanitizeRelationName(
        relationship.name,
        `${sourceModel}To${targetModel}${fkFieldPrismaName}`
    );

    if (!usedNames.has(fromCanonical)) {
        usedNames.add(fromCanonical);
        return fromCanonical;
    }

    let suffix = 2;
    let candidate = `${fromCanonical}${suffix}`;

    while (usedNames.has(candidate)) {
        suffix += 1;
        candidate = `${fromCanonical}${suffix}`;
    }

    usedNames.add(candidate);
    return candidate;
};

export const buildModelRelations = (
    tables: DBTable[],
    relationships: DBRelationship[],
    modelIdentifiers: Map<string, string>,
    fieldPrismaNamesByTable: Map<string, Map<string, string>>,
    notes: PrismaExportNote[]
): Map<string, PrismaModelRelationPlan> => {
    const plans = new Map<string, PrismaModelRelationPlan>();
    const usedRelationNames = new Set<string>();

    const tableContexts: TableModelMap[] = tables.map((table) => ({
        tableId: table.id,
        modelIdentifier: modelIdentifiers.get(table.id) ?? table.name,
        fieldById: new Map(table.fields.map((field) => [field.id, field])),
        fieldPrismaNames:
            fieldPrismaNamesByTable.get(table.id) ?? new Map<string, string>(),
        indexes: table.indexes,
    }));

    const contextByTableId = new Map(
        tableContexts.map((context) => [context.tableId, context])
    );

    const ensurePlan = (tableId: string): PrismaModelRelationPlan => {
        const existing = plans.get(tableId);

        if (existing) {
            return existing;
        }

        const plan: PrismaModelRelationPlan = { relationFields: [] };
        plans.set(tableId, plan);
        return plan;
    };

    const sortedRelationships = [...relationships].sort((left, right) =>
        left.id.localeCompare(right.id)
    );

    const relationshipGroups = new Map<string, DBRelationship[]>();

    sortedRelationships.forEach((relationship) => {
        const key = [
            relationship.sourceTableId,
            relationship.targetTableId,
        ].join('\0');
        const group = relationshipGroups.get(key) ?? [];
        group.push(relationship);
        relationshipGroups.set(key, group);
    });

    const isCompositeForeignKeyGroup = (group: DBRelationship[]): boolean => {
        if (group.length <= 1) {
            return false;
        }

        const sourceFieldIds = group.map(
            (relationship) => relationship.sourceFieldId
        );
        const targetFieldIds = group.map(
            (relationship) => relationship.targetFieldId
        );
        const uniqueSourceFields = new Set(sourceFieldIds);
        const uniqueTargetFields = new Set(targetFieldIds);

        if (
            uniqueSourceFields.size !== group.length ||
            uniqueTargetFields.size !== group.length
        ) {
            return false;
        }

        const targetContext = contextByTableId.get(group[0].targetTableId);

        if (!targetContext) {
            return false;
        }

        const targetPkFieldIds = new Set(
            targetContext.indexes
                .filter((index) => index.isPrimaryKey)
                .flatMap((index) => index.fieldIds)
        );

        if (targetPkFieldIds.size <= 1) {
            return false;
        }

        return targetFieldIds.every((fieldId) => targetPkFieldIds.has(fieldId));
    };

    relationshipGroups.forEach((group) => {
        if (isCompositeForeignKeyGroup(group)) {
            const first = group[0];
            notes.push({
                code: 'composite_fk_unsupported',
                message:
                    'Composite foreign key relations cannot be represented as a single Prisma relation.',
                path: `${first.sourceTableId}->${first.targetTableId}`,
            });
            return;
        }

        group.forEach((relationship) => {
            processRelationship(relationship);
        });
    });

    function processRelationship(relationship: DBRelationship): void {
        const relationshipType = determineRelationshipType({
            sourceCardinality: relationship.sourceCardinality,
            targetCardinality: relationship.targetCardinality,
        });

        if (relationshipType === 'many_to_many') {
            notes.push({
                code: 'many_to_many_label_only',
                message:
                    'Many-to-many cardinality without a junction table cannot be exported as a Prisma relation.',
                path: relationship.id,
            });
            return;
        }

        const sourceContext = contextByTableId.get(relationship.sourceTableId);
        const targetContext = contextByTableId.get(relationship.targetTableId);

        if (!sourceContext || !targetContext) {
            notes.push({
                code: 'relation_skipped',
                message: 'Relationship references a missing table.',
                path: relationship.id,
            });
            return;
        }

        const fkField = sourceContext.fieldById.get(relationship.sourceFieldId);
        const targetField = targetContext.fieldById.get(
            relationship.targetFieldId
        );

        if (!fkField || !targetField) {
            notes.push({
                code: 'relation_skipped',
                message: 'Relationship references missing fields.',
                path: relationship.id,
            });
            return;
        }

        if (!fieldIsUniqueTarget(targetField, targetContext.indexes)) {
            notes.push({
                code: 'relation_skipped',
                message:
                    'Referenced field is not a primary key or unique constraint.',
                path: `${sourceContext.modelIdentifier}.${fkField.name}`,
            });
            return;
        }

        const fkPrismaName =
            sourceContext.fieldPrismaNames.get(fkField.id) ?? fkField.name;
        const targetPrismaName =
            targetContext.fieldPrismaNames.get(targetField.id) ??
            targetField.name;

        const relationName = buildRelationName(
            relationship,
            sourceContext.modelIdentifier,
            targetContext.modelIdentifier,
            fkPrismaName,
            usedRelationNames
        );

        const forwardAllocator = new IdentifierAllocator();
        sourceContext.fieldPrismaNames.forEach((name) => {
            forwardAllocator.reserve(name);
        });
        plans.get(sourceContext.tableId)?.relationFields.forEach((field) => {
            forwardAllocator.reserve(field.prismaName);
        });

        const forwardFieldName = deriveForwardRelationFieldName(
            fkField.name,
            forwardAllocator
        );

        const relationAttributes: string[] = [
            `@relation("${relationName}", fields: [${fkPrismaName}], references: [${targetPrismaName}]`,
        ];

        const onDelete = formatReferentialAction(
            relationship.onDelete,
            'onDelete'
        );
        const onUpdate = formatReferentialAction(
            relationship.onUpdate,
            'onUpdate'
        );

        if (relationship.onDelete === 'set_null' && !fkField.nullable) {
            notes.push({
                code: 'set_null_omitted',
                message:
                    'SetNull referential action omitted because foreign key is required.',
                path: `${sourceContext.modelIdentifier}.${fkField.name}`,
            });
        } else if (onDelete) {
            relationAttributes[0] += `, ${onDelete}`;
        }

        if (onUpdate) {
            relationAttributes[0] += `, ${onUpdate}`;
        }

        relationAttributes[0] += ')';

        const isOneToOne = relationshipType === 'one_to_one' && fkField.unique;

        if (relationshipType === 'one_to_one' && !fkField.unique) {
            notes.push({
                code: 'relation_degraded',
                message:
                    'One-to-one relation exported as many-to-one because foreign key is not unique.',
                path: `${sourceContext.modelIdentifier}.${fkField.name}`,
            });
        }

        const forwardType = isOneToOne
            ? targetContext.modelIdentifier
            : targetContext.modelIdentifier;
        const forwardNullable = isOneToOne && fkField.nullable ? '?' : '';

        ensurePlan(sourceContext.tableId).relationFields.push({
            prismaName: forwardFieldName,
            typeExpression: `${forwardType}${forwardNullable}`,
            attributes: relationAttributes,
            isList: false,
        });

        const inverseAllocator = new IdentifierAllocator();
        targetContext.fieldPrismaNames.forEach((name) => {
            inverseAllocator.reserve(name);
        });
        plans.get(targetContext.tableId)?.relationFields.forEach((field) => {
            inverseAllocator.reserve(field.prismaName);
        });

        let inverseFieldName = deriveInverseRelationFieldName(
            sourceContext.modelIdentifier
        );

        if (inverseAllocator.has(inverseFieldName)) {
            const inverseAllocated = inverseAllocator.allocate(
                `${inverseFieldName}Relation`,
                'camel',
                'related'
            );
            inverseFieldName = inverseAllocated.prismaName;
        } else {
            inverseAllocator.reserve(inverseFieldName);
        }

        if (isOneToOne) {
            ensurePlan(targetContext.tableId).relationFields.push({
                prismaName: inverseFieldName,
                typeExpression: `${sourceContext.modelIdentifier}?`,
                attributes: [`@relation("${relationName}")`],
                isList: false,
            });
        } else {
            ensurePlan(targetContext.tableId).relationFields.push({
                prismaName: inverseFieldName,
                typeExpression: `${sourceContext.modelIdentifier}[]`,
                attributes: [`@relation("${relationName}")`],
                isList: true,
            });
        }
    }

    return plans;
};
