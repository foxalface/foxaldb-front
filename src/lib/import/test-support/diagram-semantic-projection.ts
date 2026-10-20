import type { Diagram } from '@/lib/domain/diagram';
import type { DBCustomType } from '@/lib/domain/db-custom-type';
import type { DBField } from '@/lib/domain/db-field';
import type { DBRelationship } from '@/lib/domain/db-relationship';
import type { DBTable } from '@/lib/domain/db-table';

export interface SemanticFieldType {
    id: string;
    name: string;
}

export interface SemanticField {
    name: string;
    type: SemanticFieldType;
    nullable: boolean;
    primaryKey: boolean;
    unique: boolean;
    increment?: boolean | null;
    default?: string | null;
    comments?: string | null;
}

export interface SemanticTable {
    schema?: string | null;
    name: string;
    isView?: boolean;
    fields: SemanticField[];
}

export interface SemanticRelationshipEndpoint {
    schema?: string | null;
    table: string;
    field: string;
}

/**
 * FK holder (child) → referenced PK/unique column.
 * Derived from ChartDB DBRelationship where source = referenced, target = FK holder.
 */
export interface SemanticRelationship {
    referencing: SemanticRelationshipEndpoint;
    referenced: SemanticRelationshipEndpoint;
    deleteAction?: DBRelationship['onDelete'];
    updateAction?: DBRelationship['onUpdate'];
}

export interface SemanticCustomType {
    schema?: string | null;
    name: string;
    kind: DBCustomType['kind'];
    values?: string[] | null;
    fields?: DBCustomType['fields'];
}

export interface SemanticDiagram {
    databaseType: Diagram['databaseType'];
    tables: SemanticTable[];
    relationships: SemanticRelationship[];
    customTypes: SemanticCustomType[];
}

interface ResolvedRelationshipSide {
    endpoint: SemanticRelationshipEndpoint;
    field: DBField;
}

const resolveRelationshipSide = (
    tableId: string,
    fieldId: string,
    tableById: Map<string, DBTable>
): ResolvedRelationshipSide | null => {
    const table = tableById.get(tableId);
    if (!table) {
        return null;
    }

    const field = table.fields.find((candidate) => candidate.id === fieldId);
    if (!field) {
        return null;
    }

    return {
        endpoint: {
            schema: table.schema,
            table: table.name,
            field: field.name,
        },
        field,
    };
};

const isLikelyReferencedKey = (field: DBField): boolean =>
    field.primaryKey || field.unique;

/**
 * SQL import stores source=referenced PK and target=FK holder; DBML keeps ref
 * endpoint order (source=FK). Resolve semantic FK direction from field shape.
 */
const resolveSemanticRelationshipEnds = (
    relationship: DBRelationship,
    tableById: Map<string, DBTable>
): SemanticRelationship | null => {
    const source = resolveRelationshipSide(
        relationship.sourceTableId,
        relationship.sourceFieldId,
        tableById
    );
    const target = resolveRelationshipSide(
        relationship.targetTableId,
        relationship.targetFieldId,
        tableById
    );

    if (!source || !target) {
        return null;
    }

    const sourceIsReferenced = isLikelyReferencedKey(source.field);
    const targetIsReferenced = isLikelyReferencedKey(target.field);

    let referencing: ResolvedRelationshipSide;
    let referenced: ResolvedRelationshipSide;

    if (sourceIsReferenced && !targetIsReferenced) {
        referenced = source;
        referencing = target;
    } else if (targetIsReferenced && !sourceIsReferenced) {
        referenced = target;
        referencing = source;
    } else {
        // ChartDB SQL import convention: source = referenced, target = FK holder
        referenced = source;
        referencing = target;
    }

    return {
        referencing: referencing.endpoint,
        referenced: referenced.endpoint,
        deleteAction: relationship.onDelete,
        updateAction: relationship.onUpdate,
    };
};

const projectField = (field: DBField): SemanticField => ({
    name: field.name,
    type: { id: field.type.id, name: field.type.name },
    nullable: field.nullable,
    primaryKey: field.primaryKey,
    unique: field.unique,
    increment: field.increment,
    default: field.default,
    comments: field.comments,
});

const compareNullableString = (
    left: string | null | undefined,
    right: string | null | undefined
): number => {
    const leftKey = left === undefined ? '\u0000undefined' : String(left);
    const rightKey = right === undefined ? '\u0000undefined' : String(right);

    return leftKey.localeCompare(rightKey);
};

const sortFields = (fields: SemanticField[]): SemanticField[] =>
    [...fields].sort((left, right) => left.name.localeCompare(right.name));

const projectTable = (table: DBTable): SemanticTable => ({
    schema: table.schema,
    name: table.name,
    isView: table.isView,
    fields: sortFields(table.fields.map(projectField)),
});

const sortTables = (tables: DBTable[]): SemanticTable[] => {
    const withIndex = tables.map((table, index) => ({ table, index }));

    withIndex.sort((left, right) => {
        const schemaCompare = compareNullableString(
            left.table.schema,
            right.table.schema
        );
        if (schemaCompare !== 0) {
            return schemaCompare;
        }

        const nameCompare = left.table.name.localeCompare(right.table.name);
        if (nameCompare !== 0) {
            return nameCompare;
        }

        const viewCompare =
            Number(left.table.isView) - Number(right.table.isView);
        if (viewCompare !== 0) {
            return viewCompare;
        }

        return left.index - right.index;
    });

    return withIndex.map(({ table }) => projectTable(table));
};

const sortRelationships = (
    relationships: SemanticRelationship[]
): SemanticRelationship[] =>
    [...relationships].sort((left, right) => {
        const keys = [
            compareNullableString(
                left.referencing.schema,
                right.referencing.schema
            ),
            left.referencing.table.localeCompare(right.referencing.table),
            left.referencing.field.localeCompare(right.referencing.field),
            compareNullableString(
                left.referenced.schema,
                right.referenced.schema
            ),
            left.referenced.table.localeCompare(right.referenced.table),
            left.referenced.field.localeCompare(right.referenced.field),
        ];

        for (const key of keys) {
            if (key !== 0) {
                return key;
            }
        }

        return 0;
    });

const sortCustomTypes = (
    customTypes: SemanticCustomType[]
): SemanticCustomType[] =>
    [...customTypes].sort((left, right) => {
        const schemaCompare = compareNullableString(left.schema, right.schema);
        if (schemaCompare !== 0) {
            return schemaCompare;
        }

        const nameCompare = left.name.localeCompare(right.name);
        if (nameCompare !== 0) {
            return nameCompare;
        }

        return String(left.kind).localeCompare(String(right.kind));
    });

const projectCustomType = (customType: DBCustomType): SemanticCustomType => ({
    schema: customType.schema,
    name: customType.name,
    kind: customType.kind,
    values: customType.values,
    fields: customType.fields,
});

/**
 * Test-only semantic projection for import QA goldens (M11.1C).
 * Ignores ids, layout, and presentation metadata.
 */
export const projectDiagramSemantics = (diagram: Diagram): SemanticDiagram => {
    const tables = diagram.tables ?? [];
    const tableById = new Map(tables.map((table) => [table.id, table]));

    const relationships = (diagram.relationships ?? [])
        .map((relationship) =>
            resolveSemanticRelationshipEnds(relationship, tableById)
        )
        .filter((value): value is SemanticRelationship => value !== null);

    return {
        databaseType: diagram.databaseType,
        tables: sortTables(tables),
        relationships: sortRelationships(relationships),
        customTypes: sortCustomTypes(
            (diagram.customTypes ?? []).map(projectCustomType)
        ),
    };
};
