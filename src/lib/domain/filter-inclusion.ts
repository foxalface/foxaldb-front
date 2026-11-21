import type { DBField } from './db-field';
import type { DBIndex } from './db-index';
import type { DBRelationship } from './db-relationship';
import type { DBTable } from './db-table';
import type { Diagram } from './diagram';
import type { DirectMatch } from './filter-evaluation';

export type FieldInclusionRole =
    | 'direct'
    | 'identity'
    | 'relationship_endpoint';

export type RelationshipInclusionRole = 'direct' | 'context';

export interface IncludedTable {
    readonly tableId: string;
    readonly completeness: 'complete' | 'minimal';
    readonly fieldIds: ReadonlySet<string>;
    readonly fieldRoles: ReadonlyMap<string, FieldInclusionRole>;
}

export interface FilterInclusion {
    readonly direct: DirectMatch;
    readonly tables: readonly IncludedTable[];
    readonly relationships: ReadonlyMap<string, RelationshipInclusionRole>;
}

interface MutableTable {
    completeness: 'complete' | 'minimal';
    fieldIds: Set<string>;
    fieldRoles: Map<string, FieldInclusionRole>;
}

const roleRank: Record<FieldInclusionRole, number> = {
    identity: 0,
    relationship_endpoint: 1,
    direct: 2,
};

export const identityFieldIds = (table: DBTable): ReadonlySet<string> => {
    const ids = new Set<string>();

    for (const field of table.fields) {
        if (field.primaryKey) {
            ids.add(field.id);
        }
    }

    for (const index of table.indexes) {
        if (!index.isPrimaryKey) {
            continue;
        }

        for (const fieldId of index.fieldIds) {
            ids.add(fieldId);
        }
    }

    return ids;
};

const fieldById = (table: DBTable): ReadonlyMap<string, DBField> =>
    new Map(table.fields.map((field) => [field.id, field]));

/**
 * Export inclusion. A direct table is complete. A table kept only for a
 * field, a relationship endpoint, or a referenced key stays minimal.
 * Complete wins when the same table is reached both ways.
 */
export const buildExportInclusion = (
    diagram: Diagram,
    direct: DirectMatch
): FilterInclusion => {
    const tables = new Map(
        (diagram.tables ?? []).map((table) => [table.id, table])
    );
    const included = new Map<string, MutableTable>();
    const relationships = new Map<string, RelationshipInclusionRole>();
    const relationshipsByFieldId = new Map<string, DBRelationship[]>();

    for (const relationship of diagram.relationships ?? []) {
        for (const fieldId of [
            relationship.sourceFieldId,
            relationship.targetFieldId,
        ]) {
            const current = relationshipsByFieldId.get(fieldId);

            if (current) {
                current.push(relationship);
            } else {
                relationshipsByFieldId.set(fieldId, [relationship]);
            }
        }
    }

    const ensure = (
        tableId: string,
        completeness: 'complete' | 'minimal'
    ): MutableTable | undefined => {
        if (!tables.has(tableId)) {
            return undefined;
        }

        const current = included.get(tableId);

        if (!current) {
            const created: MutableTable = {
                completeness,
                fieldIds: new Set(),
                fieldRoles: new Map(),
            };
            included.set(tableId, created);
            return created;
        }

        if (completeness === 'complete') {
            current.completeness = 'complete';
        }

        return current;
    };

    const addField = (
        tableId: string,
        fieldId: string,
        role: FieldInclusionRole
    ): void => {
        const table = tables.get(tableId);
        const current = included.get(tableId);

        if (!table || !current || current.completeness === 'complete') {
            return;
        }

        if (!fieldById(table).has(fieldId)) {
            return;
        }

        current.fieldIds.add(fieldId);
        const existing = current.fieldRoles.get(fieldId);

        if (!existing || roleRank[role] >= roleRank[existing]) {
            current.fieldRoles.set(fieldId, role);
        }
    };

    const addIdentity = (tableId: string): void => {
        const table = tables.get(tableId);

        if (!table) {
            return;
        }

        for (const fieldId of identityFieldIds(table)) {
            addField(tableId, fieldId, 'identity');
        }
    };

    for (const tableId of direct.tables) {
        ensure(tableId, 'complete');
    }

    for (const fieldId of direct.fields) {
        const owner = [...tables.values()].find((table) =>
            table.fields.some((field) => field.id === fieldId)
        );

        if (!owner) {
            continue;
        }

        ensure(owner.id, 'minimal');
        addField(owner.id, fieldId, 'direct');
        addIdentity(owner.id);

        for (const relationship of relationshipsByFieldId.get(fieldId) ?? []) {
            const currentRole = relationships.get(relationship.id);

            if (currentRole !== 'direct') {
                relationships.set(relationship.id, 'context');
            }

            const otherTableId =
                relationship.sourceFieldId === fieldId
                    ? relationship.targetTableId
                    : relationship.sourceTableId;
            const otherFieldId =
                relationship.sourceFieldId === fieldId
                    ? relationship.targetFieldId
                    : relationship.sourceFieldId;

            ensure(otherTableId, 'minimal');
            addField(otherTableId, otherFieldId, 'relationship_endpoint');
            addIdentity(otherTableId);
            addIdentity(owner.id);
        }
    }

    for (const relationshipId of direct.relationships) {
        const relationship = (diagram.relationships ?? []).find(
            (entry) => entry.id === relationshipId
        );

        if (!relationship) {
            continue;
        }

        relationships.set(relationship.id, 'direct');

        for (const [tableId, fieldId] of [
            [relationship.sourceTableId, relationship.sourceFieldId],
            [relationship.targetTableId, relationship.targetFieldId],
        ] as const) {
            ensure(tableId, 'minimal');
            addField(tableId, fieldId, 'relationship_endpoint');
            addIdentity(tableId);
        }
    }

    for (const relationship of diagram.relationships ?? []) {
        const source = included.get(relationship.sourceTableId);
        const target = included.get(relationship.targetTableId);

        if (
            source?.completeness === 'complete' &&
            target?.completeness === 'complete' &&
            !relationships.has(relationship.id)
        ) {
            relationships.set(relationship.id, 'context');
        }
    }

    const projectedTables: IncludedTable[] = [];

    for (const [tableId, state] of included) {
        const table = tables.get(tableId);

        if (!table) {
            continue;
        }

        if (state.completeness === 'complete') {
            projectedTables.push({
                tableId,
                completeness: 'complete',
                fieldIds: new Set(table.fields.map((field) => field.id)),
                fieldRoles: new Map(
                    table.fields.map((field) => [field.id, 'direct' as const])
                ),
            });
            continue;
        }

        projectedTables.push({
            tableId,
            completeness: 'minimal',
            fieldIds: state.fieldIds,
            fieldRoles: state.fieldRoles,
        });
    }

    return {
        direct,
        tables: projectedTables,
        relationships,
    };
};

export const indexesForIncludedFields = (
    indexes: readonly DBIndex[],
    fieldIds: ReadonlySet<string>
): DBIndex[] =>
    indexes.filter(
        (index) =>
            index.fieldIds.length > 0 &&
            index.fieldIds.every((fieldId) => fieldIds.has(fieldId))
    );
