import {
    isChangeType,
    isEntityCategory,
    type AttributeChange,
    type DiffOperation,
    type DiffSummary,
    type EntityCategory,
    type FieldIdentity,
    type JsonValue,
    type RelationshipEndpointIdentity,
    type RelationshipIdentity,
    type SemanticIdentity,
    type TableIdentity,
    type ViewIdentity,
} from './diff-types';

/**
 * M3.2 Compare success body.
 *
 * An empty `operations` list is a successful comparison.
 */
export interface SchemaMergeCompareResponse {
    baseContentHash: string;
    baseUpdatedAt: string | null;
    viewsCompared: boolean;
    operations: DiffOperation[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const isNullableString = (value: unknown): value is string | null =>
    value === null || typeof value === 'string';

const isJsonValue = (value: unknown): value is JsonValue => {
    if (
        value === null ||
        typeof value === 'string' ||
        typeof value === 'boolean'
    ) {
        return true;
    }

    if (typeof value === 'number') {
        return Number.isFinite(value);
    }

    if (Array.isArray(value)) {
        return value.every(isJsonValue);
    }

    if (isRecord(value)) {
        return Object.values(value).every(isJsonValue);
    }

    return false;
};

const isStringList = (value: unknown): value is string[] =>
    Array.isArray(value) && value.every((item) => typeof item === 'string');

const decodeEndpoint = (
    value: unknown
): RelationshipEndpointIdentity | null => {
    if (!isRecord(value) || typeof value.table !== 'string') {
        return null;
    }

    if (typeof value.field !== 'string' || !isNullableString(value.schema)) {
        return null;
    }

    return {
        schema: value.schema,
        table: value.table,
        field: value.field,
    };
};

const decodeTableIdentity = (
    value: Record<string, unknown>
): TableIdentity | null => {
    if (
        value.kind !== 'table' ||
        typeof value.name !== 'string' ||
        !isNullableString(value.schema)
    ) {
        return null;
    }

    return {
        kind: 'table',
        schema: value.schema,
        name: value.name,
    };
};

const decodeViewIdentity = (
    value: Record<string, unknown>
): ViewIdentity | null => {
    if (
        value.kind !== 'view' ||
        typeof value.name !== 'string' ||
        !isNullableString(value.schema)
    ) {
        return null;
    }

    return {
        kind: 'view',
        schema: value.schema,
        name: value.name,
    };
};

const decodeFieldIdentity = (
    value: Record<string, unknown>
): FieldIdentity | null => {
    if (
        value.kind !== 'field' ||
        typeof value.table !== 'string' ||
        typeof value.name !== 'string' ||
        !isNullableString(value.schema)
    ) {
        return null;
    }

    return {
        kind: 'field',
        schema: value.schema,
        table: value.table,
        name: value.name,
    };
};

const decodeRelationshipIdentity = (
    value: Record<string, unknown>
): RelationshipIdentity | null => {
    if (value.kind !== 'relationship') {
        return null;
    }

    const source = decodeEndpoint(value.source);
    const target = decodeEndpoint(value.target);

    if (!source || !target) {
        return null;
    }

    return {
        kind: 'relationship',
        source,
        target,
    };
};

const decodeIdentity = (
    value: unknown,
    category: EntityCategory
): SemanticIdentity | null => {
    if (!isRecord(value) || value.kind !== category) {
        return null;
    }

    switch (category) {
        case 'table':
            return decodeTableIdentity(value);
        case 'view':
            return decodeViewIdentity(value);
        case 'field':
            return decodeFieldIdentity(value);
        case 'relationship':
            return decodeRelationshipIdentity(value);
        default: {
            const unreachable: never = category;
            return unreachable;
        }
    }
};

const decodeSummary = (
    value: unknown,
    category: EntityCategory
): DiffSummary | null => {
    if (!isRecord(value) || value.kind !== category) {
        return null;
    }

    if (category === 'relationship') {
        if (!isNullableString(value.name)) {
            return null;
        }

        return {
            kind: 'relationship',
            name: value.name,
        };
    }

    const identity = decodeIdentity(value, category);

    if (!identity || identity.kind === 'relationship') {
        return null;
    }

    if (identity.kind === 'field') {
        return {
            kind: 'field',
            schema: identity.schema,
            table: identity.table,
            name: identity.name,
        };
    }

    return {
        kind: identity.kind,
        schema: identity.schema,
        name: identity.name,
    };
};

const decodeNullableSummary = (
    value: unknown,
    category: EntityCategory
): DiffSummary | null | undefined => {
    if (value === null) {
        return null;
    }

    return decodeSummary(value, category) ?? undefined;
};

const decodeChanges = (value: unknown): AttributeChange[] | null => {
    if (!Array.isArray(value)) {
        return null;
    }

    const changes: AttributeChange[] = [];

    for (const entry of value) {
        if (
            !isRecord(entry) ||
            typeof entry.attribute !== 'string' ||
            !isJsonValue(entry.before) ||
            !isJsonValue(entry.after)
        ) {
            return null;
        }

        changes.push({
            attribute: entry.attribute,
            before: entry.before,
            after: entry.after,
        });
    }

    return changes;
};

const decodeOperation = (value: unknown): DiffOperation | null => {
    if (
        !isRecord(value) ||
        typeof value.id !== 'string' ||
        value.id.length === 0
    ) {
        return null;
    }

    if (
        typeof value.category !== 'string' ||
        !isEntityCategory(value.category) ||
        typeof value.type !== 'string' ||
        !isChangeType(value.type)
    ) {
        return null;
    }

    const category = value.category;
    const type = value.type;
    const identity = decodeIdentity(value.identity, category);
    const changes = decodeChanges(value.changes);

    if (!identity || !changes || !isStringList(value.dependsOn)) {
        return null;
    }

    if (!isNullableString(value.entityId)) {
        return null;
    }

    const before = decodeNullableSummary(value.before, category);
    const after = decodeNullableSummary(value.after, category);

    if (before === undefined || after === undefined) {
        return null;
    }

    if (type === 'add') {
        if (value.entityId !== null || value.renameTo !== null) {
            return null;
        }

        return {
            id: value.id,
            category,
            type,
            entityId: null,
            renameTo: null,
            identity,
            before,
            after,
            changes,
            dependsOn: value.dependsOn,
        } as DiffOperation;
    }

    if (typeof value.entityId !== 'string' || value.entityId.length === 0) {
        return null;
    }

    if (type === 'rename') {
        if (category === 'relationship') {
            return null;
        }

        const renameTo = decodeIdentity(value.renameTo, category);

        if (!renameTo || renameTo.kind === 'relationship') {
            return null;
        }

        return {
            id: value.id,
            category,
            type,
            entityId: value.entityId,
            renameTo,
            identity,
            before,
            after,
            changes,
            dependsOn: value.dependsOn,
        } as DiffOperation;
    }

    if (value.renameTo !== null) {
        return null;
    }

    return {
        id: value.id,
        category,
        type,
        entityId: value.entityId,
        renameTo: null,
        identity,
        before,
        after,
        changes,
        dependsOn: value.dependsOn,
    } as DiffOperation;
};

const BASE_CONTENT_HASH = /^[a-f0-9]{64}$/;

export const decodeSchemaMergeCompareResponse = (
    value: unknown
): SchemaMergeCompareResponse | null => {
    if (!isRecord(value) || typeof value.baseContentHash !== 'string') {
        return null;
    }

    if (!BASE_CONTENT_HASH.test(value.baseContentHash)) {
        return null;
    }

    if (!isNullableString(value.baseUpdatedAt)) {
        return null;
    }

    if (
        typeof value.viewsCompared !== 'boolean' ||
        !Array.isArray(value.operations)
    ) {
        return null;
    }

    const operations: DiffOperation[] = [];

    for (const operation of value.operations) {
        const decoded = decodeOperation(operation);

        if (!decoded) {
            return null;
        }

        operations.push(decoded);
    }

    return {
        baseContentHash: value.baseContentHash,
        baseUpdatedAt: value.baseUpdatedAt,
        viewsCompared: value.viewsCompared,
        operations,
    };
};
