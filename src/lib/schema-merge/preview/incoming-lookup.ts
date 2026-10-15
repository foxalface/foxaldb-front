import type { Diagram } from '@/lib/domain/diagram';
import type { DBField } from '@/lib/domain/db-field';
import type { DBRelationship } from '@/lib/domain/db-relationship';
import type { DBTable } from '@/lib/domain/db-table';
import type {
    FieldIdentity,
    RelationshipIdentity,
    TableIdentity,
    ViewIdentity,
} from '../diff-types';
import {
    fieldIdentityFromParts,
    fieldIdentityKey,
    semanticIdentityKey,
    tableIdentityKey,
    viewIdentityKey,
} from './identity-key';

export const findIncomingTable = (
    diagram: Diagram,
    identity: TableIdentity
): DBTable | null => {
    const key = tableIdentityKey(identity);

    for (const table of diagram.tables ?? []) {
        if (table.isView) {
            continue;
        }

        if (
            tableIdentityKey({
                kind: 'table',
                schema: table.schema ?? null,
                name: table.name,
            }) === key
        ) {
            return table;
        }
    }

    return null;
};

export const findIncomingView = (
    diagram: Diagram,
    identity: ViewIdentity
): DBTable | null => {
    const key = viewIdentityKey(identity);

    for (const table of diagram.tables ?? []) {
        if (!table.isView) {
            continue;
        }

        if (
            viewIdentityKey({
                kind: 'view',
                schema: table.schema ?? null,
                name: table.name,
            }) === key
        ) {
            return table;
        }
    }

    return null;
};

export const findIncomingField = (
    diagram: Diagram,
    identity: FieldIdentity
): { table: DBTable; field: DBField } | null => {
    const key = fieldIdentityKey(identity);

    for (const table of diagram.tables ?? []) {
        for (const field of table.fields) {
            const candidate = fieldIdentityFromParts(
                table.schema ?? null,
                table.name,
                field.name
            );

            if (fieldIdentityKey(candidate) === key) {
                return { table, field };
            }
        }
    }

    return null;
};

export const findIncomingRelationship = (
    diagram: Diagram,
    identity: RelationshipIdentity
): DBRelationship | null => {
    const key = semanticIdentityKey(identity);

    for (const relationship of diagram.relationships ?? []) {
        const sourceTable = (diagram.tables ?? []).find(
            (table) => table.id === relationship.sourceTableId
        );
        const targetTable = (diagram.tables ?? []).find(
            (table) => table.id === relationship.targetTableId
        );
        const sourceField = sourceTable?.fields.find(
            (field) => field.id === relationship.sourceFieldId
        );
        const targetField = targetTable?.fields.find(
            (field) => field.id === relationship.targetFieldId
        );

        if (!sourceTable || !targetTable || !sourceField || !targetField) {
            continue;
        }

        const candidate: RelationshipIdentity = {
            kind: 'relationship',
            source: {
                schema: relationship.sourceSchema ?? sourceTable.schema ?? null,
                table: sourceTable.name,
                field: sourceField.name,
            },
            target: {
                schema: relationship.targetSchema ?? targetTable.schema ?? null,
                table: targetTable.name,
                field: targetField.name,
            },
        };

        if (semanticIdentityKey(candidate) === key) {
            return relationship;
        }
    }

    return null;
};

export const fieldExistsOnTable = (
    table: DBTable,
    identity: FieldIdentity
): boolean =>
    table.fields.some(
        (field) =>
            fieldIdentityKey(
                fieldIdentityFromParts(
                    table.schema ?? null,
                    table.name,
                    field.name
                )
            ) === fieldIdentityKey(identity)
    );
