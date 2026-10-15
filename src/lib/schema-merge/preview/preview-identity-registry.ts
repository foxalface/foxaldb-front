import type { Diagram } from '@/lib/domain/diagram';
import type {
    FieldIdentity,
    RelationshipEndpointIdentity,
    TableIdentity,
    ViewIdentity,
} from '../diff-types';
import {
    fieldIdentityFromParts,
    fieldIdentityKey,
    tableIdentityKey,
    viewIdentityKey,
} from './identity-key';

/**
 * Maps semantic field/table identities to projected entity ids.
 * Supports multiple aliases (pre/post rename) for the same entity.
 */
export class PreviewIdentityRegistry {
    private readonly fieldIds = new Map<string, string>();

    private readonly tableIds = new Map<string, string>();

    registerFieldIdentity(identity: FieldIdentity, fieldId: string): void {
        this.fieldIds.set(fieldIdentityKey(identity), fieldId);
    }

    registerFieldAliases(
        fieldId: string,
        identities: readonly FieldIdentity[]
    ): void {
        for (const identity of identities) {
            this.registerFieldIdentity(identity, fieldId);
        }
    }

    registerTableIdentity(
        identity: TableIdentity | ViewIdentity,
        tableId: string
    ): void {
        const key =
            identity.kind === 'view'
                ? viewIdentityKey(identity)
                : tableIdentityKey(identity);
        this.tableIds.set(key, tableId);
    }

    registerTableAliases(
        tableId: string,
        identities: readonly (TableIdentity | ViewIdentity)[]
    ): void {
        for (const identity of identities) {
            this.registerTableIdentity(identity, tableId);
        }
    }

    resolveFieldId(identity: FieldIdentity): string | null {
        return this.fieldIds.get(fieldIdentityKey(identity)) ?? null;
    }

    resolveFieldEndpoint(
        endpoint: RelationshipEndpointIdentity
    ): string | null {
        return this.resolveFieldId(
            fieldIdentityFromParts(
                endpoint.schema,
                endpoint.table,
                endpoint.field
            )
        );
    }

    resolveTableId(identity: TableIdentity): string | null {
        return this.tableIds.get(tableIdentityKey(identity)) ?? null;
    }
}

export const createPreviewIdentityRegistry = (
    diagram: Diagram
): PreviewIdentityRegistry => {
    const registry = new PreviewIdentityRegistry();

    for (const table of diagram.tables ?? []) {
        const tableIdentity: TableIdentity | ViewIdentity = table.isView
            ? {
                  kind: 'view',
                  schema: table.schema ?? null,
                  name: table.name,
              }
            : {
                  kind: 'table',
                  schema: table.schema ?? null,
                  name: table.name,
              };

        registry.registerTableIdentity(tableIdentity, table.id);

        for (const field of table.fields) {
            registry.registerFieldIdentity(
                fieldIdentityFromParts(
                    table.schema ?? null,
                    table.name,
                    field.name
                ),
                field.id
            );
        }
    }

    return registry;
};

export const registerTableRenameAliases = (
    registry: PreviewIdentityRegistry,
    table: {
        id: string;
        schema?: string | null;
        fields: readonly { id: string; name: string }[];
    },
    oldTableName: string,
    newTableName: string,
    oldSchema: string | null,
    newSchema: string | null,
    tableKind: 'table' | 'view' = 'table'
): void => {
    registry.registerTableAliases(table.id, [
        { kind: tableKind, schema: oldSchema, name: oldTableName },
        { kind: tableKind, schema: newSchema, name: newTableName },
    ]);

    for (const field of table.fields) {
        registry.registerFieldAliases(field.id, [
            fieldIdentityFromParts(oldSchema, oldTableName, field.name),
            fieldIdentityFromParts(newSchema, newTableName, field.name),
        ]);
    }
};
