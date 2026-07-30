import type { RemoveTableEvent } from '@/context/chartdb-context/chartdb-context';
import type { DBRelationship } from '@/lib/domain/db-relationship';
import type { DBTable } from '@/lib/domain/db-table';

/**
 * Build the authoritative remove_tables operation payload for backend sync.
 *
 * Field and relationship identifiers are collected from the tables and
 * relationships being removed so cleanup does not depend on stored diagram
 * content or request ordering relative to autosave.
 */
export function buildRemoveTablesOperationData(
    tableIds: string[],
    tablesBeingRemoved: DBTable[],
    relationshipsBeingRemoved: DBRelationship[]
): RemoveTableEvent['data'] {
    const tableIdSet = new Set(tableIds);
    const dedupedTableIds = [...tableIdSet];

    const fieldIds = [
        ...new Set(
            tablesBeingRemoved
                .filter((table) => tableIdSet.has(table.id))
                .flatMap((table) => table.fields.map((field) => field.id))
        ),
    ];

    const relationshipIds = [
        ...new Set(
            relationshipsBeingRemoved.map((relationship) => relationship.id)
        ),
    ];

    return {
        tableIds: dedupedTableIds,
        fieldIds,
        relationshipIds,
    };
}

/**
 * Collect relationship IDs connected to any table in the removed set.
 */
export function collectRelationshipIdsForRemovedTables(
    tableIds: string[],
    relationships: DBRelationship[]
): string[] {
    const tableIdSet = new Set(tableIds);

    return [
        ...new Set(
            relationships
                .filter(
                    (relationship) =>
                        tableIdSet.has(relationship.sourceTableId) ||
                        tableIdSet.has(relationship.targetTableId)
                )
                .map((relationship) => relationship.id)
        ),
    ];
}
