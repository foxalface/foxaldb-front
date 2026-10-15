import type {
    FieldIdentity,
    RelationshipEndpointIdentity,
    RelationshipIdentity,
    SemanticIdentity,
    TableIdentity,
    ViewIdentity,
} from '../diff-types';

const identityPayload = (
    identity: SemanticIdentity
): Record<string, unknown> => {
    switch (identity.kind) {
        case 'table':
            return {
                kind: 'table',
                schema: identity.schema,
                name: identity.name,
            };
        case 'view':
            return {
                kind: 'view',
                schema: identity.schema,
                name: identity.name,
            };
        case 'field':
            return {
                kind: 'field',
                schema: identity.schema,
                table: identity.table,
                name: identity.name,
            };
        case 'relationship':
            return {
                kind: 'relationship',
                source: endpointPayload(identity.source),
                target: endpointPayload(identity.target),
            };
        default:
            return identity as Record<string, unknown>;
    }
};

const endpointPayload = (
    endpoint: RelationshipEndpointIdentity
): Record<string, unknown> => ({
    schema: endpoint.schema,
    table: endpoint.table,
    field: endpoint.field,
});

/**
 * Stable semantic map key aligned with backend IdentityKey::of (JSON of identity array).
 */
export const semanticIdentityKey = (identity: SemanticIdentity): string =>
    JSON.stringify(identityPayload(identity));

export const tableIdentityKey = (identity: TableIdentity): string =>
    semanticIdentityKey(identity);

export const viewIdentityKey = (identity: ViewIdentity): string =>
    semanticIdentityKey(identity);

export const fieldIdentityKey = (identity: FieldIdentity): string =>
    semanticIdentityKey(identity);

export const relationshipIdentityKey = (
    identity: RelationshipIdentity
): string => semanticIdentityKey(identity);

export const fieldIdentityFromParts = (
    schema: string | null,
    table: string,
    name: string
): FieldIdentity => ({
    kind: 'field',
    schema,
    table,
    name,
});
