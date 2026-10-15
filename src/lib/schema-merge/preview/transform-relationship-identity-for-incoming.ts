import type {
    DiffOperation,
    FieldIdentity,
    RelationshipEndpointIdentity,
    RelationshipIdentity,
    TableIdentity,
} from '../diff-types';

const endpointMatchesFieldIdentity = (
    endpoint: RelationshipEndpointIdentity,
    identity: FieldIdentity
): boolean =>
    (endpoint.schema ?? null) === (identity.schema ?? null) &&
    endpoint.table === identity.table &&
    endpoint.field === identity.name;

const transformEndpointForIncoming = (
    endpoint: RelationshipEndpointIdentity,
    fieldRenames: readonly DiffOperation[],
    tableRenames: readonly DiffOperation[]
): RelationshipEndpointIdentity => {
    let next = { ...endpoint };

    for (const operation of fieldRenames) {
        const oldIdentity = operation.identity as FieldIdentity;
        const renameTo = operation.renameTo as FieldIdentity | null;

        if (!renameTo || !endpointMatchesFieldIdentity(next, oldIdentity)) {
            continue;
        }

        next = {
            schema: renameTo.schema,
            table: renameTo.table,
            field: renameTo.name,
        };
        break;
    }

    for (const operation of tableRenames) {
        const oldIdentity = operation.identity as TableIdentity;
        const renameTo = operation.renameTo as TableIdentity | null;

        if (
            !renameTo ||
            (next.schema ?? null) !== (oldIdentity.schema ?? null) ||
            next.table !== oldIdentity.name
        ) {
            continue;
        }

        next = {
            ...next,
            schema: renameTo.schema,
            table: renameTo.name,
        };
        break;
    }

    return next;
};

/**
 * Maps Compare relationship endpoint identities (often pre-rename) to incoming
 * diagram names using selected rename operations only (no fuzzy matching).
 */
export const transformRelationshipIdentityForIncoming = (
    identity: RelationshipIdentity,
    fieldRenames: readonly DiffOperation[],
    tableRenames: readonly DiffOperation[]
): RelationshipIdentity => ({
    kind: 'relationship',
    source: transformEndpointForIncoming(
        identity.source,
        fieldRenames,
        tableRenames
    ),
    target: transformEndpointForIncoming(
        identity.target,
        fieldRenames,
        tableRenames
    ),
});
