import type { DBCustomType } from './db-custom-type';
import type { DBField } from './db-field';
import type { DBTable } from './db-table';
import type { Diagram } from './diagram';
import { canonicalizeTagAssignments } from './diagram-tag';
import { evaluateFilterExpression } from './filter-evaluation';
import type { FilterGroup } from './filter-expression';
import { hasActiveFilter } from './filter-expression';
import {
    buildExportInclusion,
    indexesForIncludedFields,
} from './filter-inclusion';

const customTypeReferencedByField = (
    customType: DBCustomType,
    field: DBField,
    tableSchema: string | null | undefined
): boolean => {
    if (customType.id === field.type.id) {
        return true;
    }

    if (customType.name !== field.type.name) {
        return false;
    }

    if (customType.schema) {
        return customType.schema === tableSchema;
    }

    return true;
};

const customTypeReferencedByName = (
    customType: DBCustomType,
    typeName: string,
    ownerSchema: string | null | undefined
): boolean => {
    if (customType.name !== typeName && customType.id !== typeName) {
        return false;
    }

    if (customType.schema) {
        return customType.schema === ownerSchema;
    }

    return true;
};

/**
 * Keeps a custom type when an included field uses it by id or by the same
 * name/schema match SQL and DBML use. Composite fields pull in the types
 * they name. Unreferenced types are dropped so they are not serialized.
 */
export const requiredCustomTypes = (
    customTypes: readonly DBCustomType[],
    tables: readonly DBTable[]
): DBCustomType[] => {
    const kept = new Set<string>();
    const queue: DBCustomType[] = [];

    const keep = (customType: DBCustomType): void => {
        if (kept.has(customType.id)) {
            return;
        }

        kept.add(customType.id);
        queue.push(customType);
    };

    for (const table of tables) {
        for (const field of table.fields) {
            for (const customType of customTypes) {
                if (
                    customTypeReferencedByField(customType, field, table.schema)
                ) {
                    keep(customType);
                }
            }
        }
    }

    while (queue.length > 0) {
        const current = queue.shift();

        if (!current || current.kind !== 'composite') {
            continue;
        }

        for (const compositeField of current.fields ?? []) {
            for (const customType of customTypes) {
                if (
                    customTypeReferencedByName(
                        customType,
                        compositeField.type,
                        current.schema
                    )
                ) {
                    keep(customType);
                }
            }
        }
    }

    return customTypes.filter((customType) => kept.has(customType.id));
};

const projectTable = (
    table: DBTable,
    fieldIds: ReadonlySet<string>,
    completeness: 'complete' | 'minimal'
): DBTable => {
    const fields = table.fields.filter((field) => fieldIds.has(field.id));

    return {
        ...table,
        fields,
        indexes: indexesForIncludedFields(table.indexes, fieldIds),
        checkConstraints:
            completeness === 'complete' ? table.checkConstraints : undefined,
    };
};

export type StructuralExportProjection =
    | { readonly status: 'ready'; readonly diagram: Diagram }
    | { readonly status: 'too_complex' };

/**
 * Projects a diagram for structural exporters.
 * A null or inactive expression returns the same diagram.
 * A too-complex expression is not projected and is not replaced by the source.
 * The source diagram is not mutated.
 */
export const projectStructuralExport = (
    diagram: Diagram,
    expression: FilterGroup | null
): StructuralExportProjection => {
    if (!expression || !hasActiveFilter(expression)) {
        return { status: 'ready', diagram };
    }

    const result = evaluateFilterExpression(diagram, expression);

    if (result.status === 'too_complex') {
        return { status: 'too_complex' };
    }

    const evaluation = result.evaluation;

    if (!evaluation.constrained) {
        return { status: 'ready', diagram };
    }

    const inclusion = buildExportInclusion(diagram, evaluation.direct);
    const includedTables = new Map(
        inclusion.tables.map((table) => [table.tableId, table])
    );
    const tables = (diagram.tables ?? [])
        .filter((table) => includedTables.has(table.id))
        .map((table) => {
            const included = includedTables.get(table.id);

            if (!included) {
                return table;
            }

            return projectTable(
                table,
                included.fieldIds,
                included.completeness
            );
        });
    const includedTableIds = new Set(tables.map((table) => table.id));
    const relationships = (diagram.relationships ?? []).filter(
        (relationship) => {
            if (!inclusion.relationships.has(relationship.id)) {
                return false;
            }

            const source = tables.find(
                (table) => table.id === relationship.sourceTableId
            );
            const target = tables.find(
                (table) => table.id === relationship.targetTableId
            );

            return (
                !!source &&
                !!target &&
                source.fields.some(
                    (field) => field.id === relationship.sourceFieldId
                ) &&
                target.fields.some(
                    (field) => field.id === relationship.targetFieldId
                )
            );
        }
    );
    const dependencies = diagram.dependencies?.filter(
        (dependency) =>
            includedTableIds.has(dependency.tableId) &&
            includedTableIds.has(dependency.dependentTableId)
    );
    const customTypes = diagram.customTypes
        ? requiredCustomTypes(diagram.customTypes, tables)
        : undefined;

    return {
        status: 'ready',
        diagram: canonicalizeTagAssignments({
            ...diagram,
            tables: diagram.tables ? tables : undefined,
            relationships: diagram.relationships ? relationships : undefined,
            dependencies,
            customTypes,
        }),
    };
};
