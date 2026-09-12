import type { DBField } from '@/lib/domain/db-field';
import type { DBIndex } from '@/lib/domain/db-index';
import type { DBRelationship } from '@/lib/domain/db-relationship';
import type { DBTable } from '@/lib/domain/db-table';
import {
    deriveForwardRelationFieldName,
    deriveInverseRelationFieldName,
    IdentifierAllocator,
    sanitizeRelationName,
} from './prisma-identifier';
import type { PrismaExportNote } from './prisma-export-types';
import { resolveRelationshipSides } from './resolve-relationship-sides';

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
    fkModel: string,
    referencedModel: string,
    fkFieldPrismaName: string,
    usedNames: Set<string>
): string => {
    const fromCanonical = sanitizeRelationName(
        relationship.name,
        `${fkModel}To${referencedModel}${fkFieldPrismaName}`
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
    const immediateRelationships: DBRelationship[] = [];

    sortedRelationships.forEach((relationship) => {
        const sourceContext = contextByTableId.get(relationship.sourceTableId);
        const targetContext = contextByTableId.get(relationship.targetTableId);
        const resolved = resolveRelationshipSides(
            relationship,
            sourceContext
                ? {
                      tableId: sourceContext.tableId,
                      fieldById: sourceContext.fieldById,
                  }
                : undefined,
            targetContext
                ? {
                      tableId: targetContext.tableId,
                      fieldById: targetContext.fieldById,
                  }
                : undefined
        );

        if (
            resolved === 'many_to_many' ||
            resolved === 'missing_table' ||
            resolved === 'missing_field'
        ) {
            immediateRelationships.push(relationship);
            return;
        }

        const key = `${resolved.fkTableId}\0${resolved.referencedTableId}`;
        const group = relationshipGroups.get(key) ?? [];
        group.push(relationship);
        relationshipGroups.set(key, group);
    });

    const isCompositeForeignKeyGroup = (group: DBRelationship[]): boolean => {
        if (group.length <= 1) {
            return false;
        }

        const fkFieldIds: string[] = [];
        const referencedFieldIds: string[] = [];
        let fkTableId: string | null = null;
        let referencedTableId: string | null = null;

        for (const relationship of group) {
            const sourceContext = contextByTableId.get(
                relationship.sourceTableId
            );
            const targetContext = contextByTableId.get(
                relationship.targetTableId
            );
            const resolved = resolveRelationshipSides(
                relationship,
                sourceContext
                    ? {
                          tableId: sourceContext.tableId,
                          fieldById: sourceContext.fieldById,
                      }
                    : undefined,
                targetContext
                    ? {
                          tableId: targetContext.tableId,
                          fieldById: targetContext.fieldById,
                      }
                    : undefined
            );

            if (typeof resolved !== 'object') {
                return false;
            }

            if (fkTableId === null) {
                fkTableId = resolved.fkTableId;
                referencedTableId = resolved.referencedTableId;
            } else if (
                fkTableId !== resolved.fkTableId ||
                referencedTableId !== resolved.referencedTableId
            ) {
                return false;
            }

            fkFieldIds.push(resolved.fkField.id);
            referencedFieldIds.push(resolved.referencedField.id);
        }

        if (
            new Set(fkFieldIds).size !== group.length ||
            new Set(referencedFieldIds).size !== group.length
        ) {
            return false;
        }

        const referencedContext = contextByTableId.get(referencedTableId!);

        if (!referencedContext) {
            return false;
        }

        const referencedPkFieldIds = new Set(
            referencedContext.indexes
                .filter((index) => index.isPrimaryKey)
                .flatMap((index) => index.fieldIds)
        );

        if (referencedPkFieldIds.size <= 1) {
            return false;
        }

        return referencedFieldIds.every((fieldId) =>
            referencedPkFieldIds.has(fieldId)
        );
    };

    immediateRelationships.forEach((relationship) => {
        processRelationship(relationship);
    });

    relationshipGroups.forEach((group) => {
        if (isCompositeForeignKeyGroup(group)) {
            const first = group[0];
            const sourceContext = contextByTableId.get(first.sourceTableId);
            const targetContext = contextByTableId.get(first.targetTableId);
            const resolved = resolveRelationshipSides(
                first,
                sourceContext
                    ? {
                          tableId: sourceContext.tableId,
                          fieldById: sourceContext.fieldById,
                      }
                    : undefined,
                targetContext
                    ? {
                          tableId: targetContext.tableId,
                          fieldById: targetContext.fieldById,
                      }
                    : undefined
            );
            const path =
                typeof resolved === 'object'
                    ? `${resolved.fkTableId}->${resolved.referencedTableId}`
                    : `${first.sourceTableId}->${first.targetTableId}`;

            notes.push({
                code: 'composite_fk_unsupported',
                message:
                    'Composite foreign key relations cannot be represented as a single Prisma relation.',
                path,
            });
            return;
        }

        group.forEach((relationship) => {
            processRelationship(relationship);
        });
    });

    function processRelationship(relationship: DBRelationship): void {
        const sourceContext = contextByTableId.get(relationship.sourceTableId);
        const targetContext = contextByTableId.get(relationship.targetTableId);
        const resolved = resolveRelationshipSides(
            relationship,
            sourceContext
                ? {
                      tableId: sourceContext.tableId,
                      fieldById: sourceContext.fieldById,
                  }
                : undefined,
            targetContext
                ? {
                      tableId: targetContext.tableId,
                      fieldById: targetContext.fieldById,
                  }
                : undefined
        );

        if (resolved === 'many_to_many') {
            notes.push({
                code: 'many_to_many_label_only',
                message:
                    'Many-to-many cardinality without a junction table cannot be exported as a Prisma relation.',
                path: relationship.id,
            });
            return;
        }

        if (resolved === 'missing_table') {
            notes.push({
                code: 'relation_skipped',
                message: 'Relationship references a missing table.',
                path: relationship.id,
            });
            return;
        }

        if (resolved === 'missing_field') {
            notes.push({
                code: 'relation_skipped',
                message: 'Relationship references missing fields.',
                path: relationship.id,
            });
            return;
        }

        const fkContext = contextByTableId.get(resolved.fkTableId);
        const referencedContext = contextByTableId.get(
            resolved.referencedTableId
        );

        if (!fkContext || !referencedContext) {
            notes.push({
                code: 'relation_skipped',
                message: 'Relationship references a missing table.',
                path: relationship.id,
            });
            return;
        }

        const fkField = resolved.fkField;
        const referencedField = resolved.referencedField;

        if (!fieldIsUniqueTarget(referencedField, referencedContext.indexes)) {
            notes.push({
                code: 'relation_skipped',
                message:
                    'Referenced field is not a primary key or unique constraint.',
                path: `${fkContext.modelIdentifier}.${fkField.name} -> ${referencedContext.modelIdentifier}.${referencedField.name}`,
            });
            return;
        }

        const fkPrismaName =
            fkContext.fieldPrismaNames.get(fkField.id) ?? fkField.name;
        const referencedPrismaName =
            referencedContext.fieldPrismaNames.get(referencedField.id) ??
            referencedField.name;

        const relationName = buildRelationName(
            relationship,
            fkContext.modelIdentifier,
            referencedContext.modelIdentifier,
            fkPrismaName,
            usedRelationNames
        );

        const forwardAllocator = new IdentifierAllocator();
        fkContext.fieldPrismaNames.forEach((name) => {
            forwardAllocator.reserve(name);
        });
        plans.get(fkContext.tableId)?.relationFields.forEach((field) => {
            forwardAllocator.reserve(field.prismaName);
        });

        const forwardFieldName = deriveForwardRelationFieldName(
            fkField.name,
            forwardAllocator
        );

        const relationAttributes: string[] = [
            `@relation("${relationName}", fields: [${fkPrismaName}], references: [${referencedPrismaName}]`,
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
                path: `${fkContext.modelIdentifier}.${fkField.name}`,
            });
        } else if (onDelete) {
            relationAttributes[0] += `, ${onDelete}`;
        }

        if (onUpdate) {
            relationAttributes[0] += `, ${onUpdate}`;
        }

        relationAttributes[0] += ')';

        const isOneToOne =
            resolved.relationshipType === 'one_to_one' && fkField.unique;

        if (resolved.relationshipType === 'one_to_one' && !fkField.unique) {
            notes.push({
                code: 'relation_degraded',
                message:
                    'One-to-one relation exported as many-to-one because foreign key is not unique.',
                path: `${fkContext.modelIdentifier}.${fkField.name}`,
            });
        }

        const forwardNullable = fkField.nullable ? '?' : '';

        ensurePlan(fkContext.tableId).relationFields.push({
            prismaName: forwardFieldName,
            typeExpression: `${referencedContext.modelIdentifier}${forwardNullable}`,
            attributes: relationAttributes,
            isList: false,
        });

        const inverseAllocator = new IdentifierAllocator();
        referencedContext.fieldPrismaNames.forEach((name) => {
            inverseAllocator.reserve(name);
        });
        plans
            .get(referencedContext.tableId)
            ?.relationFields.forEach((field) => {
                inverseAllocator.reserve(field.prismaName);
            });

        let inverseFieldName = deriveInverseRelationFieldName(
            fkContext.modelIdentifier
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
            ensurePlan(referencedContext.tableId).relationFields.push({
                prismaName: inverseFieldName,
                typeExpression: `${fkContext.modelIdentifier}?`,
                attributes: [`@relation("${relationName}")`],
                isList: false,
            });
        } else {
            ensurePlan(referencedContext.tableId).relationFields.push({
                prismaName: inverseFieldName,
                typeExpression: `${fkContext.modelIdentifier}[]`,
                attributes: [`@relation("${relationName}")`],
                isList: true,
            });
        }
    }

    return plans;
};
