/**
 * Schema Merge API contract (M1).
 *
 * Operation ids are opaque selection tokens produced by the backend.
 * This module does not compute them and does not diff diagrams.
 *
 * Backend reference: backend/docs/schema-merge.md
 * M3.2 adds `malformed_diagram` for a structurally invalid Compare body.
 */

export const CHANGE_TYPES = ['add', 'modify', 'rename', 'delete'] as const;

export type ChangeType = (typeof CHANGE_TYPES)[number];

export const ENTITY_CATEGORIES = [
    'table',
    'field',
    'relationship',
    'view',
] as const;

export type EntityCategory = (typeof ENTITY_CATEGORIES)[number];

/**
 * Stable merge error codes. Laravel/Sanctum 401 and 403 stay framework
 * responses, and an empty operation list is a successful comparison.
 */
export const SCHEMA_MERGE_ERROR_CODES = [
    'unable_to_detect_format',
    'ambiguous_source',
    'unsupported_source',
    'database_type_mismatch',
    'malformed_archive',
    'malformed_diagram',
    'payload_too_large',
    'stale_comparison',
    'incomplete_selection',
    'analysis_failed',
] as const;

export type SchemaMergeErrorCode = (typeof SCHEMA_MERGE_ERROR_CODES)[number];

export const isSchemaMergeErrorCode = (
    value: string
): value is SchemaMergeErrorCode =>
    (SCHEMA_MERGE_ERROR_CODES as readonly string[]).includes(value);

export const isChangeType = (value: string): value is ChangeType =>
    (CHANGE_TYPES as readonly string[]).includes(value);

export const isEntityCategory = (value: string): value is EntityCategory =>
    (ENTITY_CATEGORIES as readonly string[]).includes(value);

/**
 * JSON value carried by an attribute change.
 * Objects are string-keyed. Arrays are lists. Numbers must be finite.
 */
export type JsonValue =
    | string
    | number
    | boolean
    | null
    | JsonValue[]
    | { [key: string]: JsonValue };

export interface AttributeChange {
    attribute: string;
    before: JsonValue;
    after: JsonValue;
}

export interface TableIdentity {
    kind: 'table';
    schema: string | null;
    name: string;
}

export interface ViewIdentity {
    kind: 'view';
    schema: string | null;
    name: string;
}

export interface FieldIdentity {
    kind: 'field';
    schema: string | null;
    table: string;
    name: string;
}

export interface RelationshipEndpointIdentity {
    schema: string | null;
    table: string;
    field: string;
}

export interface RelationshipIdentity {
    kind: 'relationship';
    source: RelationshipEndpointIdentity;
    target: RelationshipEndpointIdentity;
}

export type SemanticIdentity =
    | TableIdentity
    | ViewIdentity
    | FieldIdentity
    | RelationshipIdentity;

export interface TableSummary {
    kind: 'table';
    schema: string | null;
    name: string;
}

export interface ViewSummary {
    kind: 'view';
    schema: string | null;
    name: string;
}

export interface FieldSummary {
    kind: 'field';
    schema: string | null;
    table: string;
    name: string;
}

export interface RelationshipSummary {
    kind: 'relationship';
    name: string | null;
}

export type DiffSummary =
    | TableSummary
    | ViewSummary
    | FieldSummary
    | RelationshipSummary;

interface DiffOperationBase<
    TCategory extends EntityCategory,
    TIdentity extends SemanticIdentity,
    TSummary extends DiffSummary,
> {
    id: string;
    category: TCategory;
    identity: TIdentity;
    before: TSummary | null;
    after: TSummary | null;
    changes: AttributeChange[];
    dependsOn: string[];
}

type AddOperation = {
    type: 'add';
    entityId: null;
    renameTo: null;
};

type UpdateOperation = {
    type: 'modify' | 'delete';
    entityId: string;
    renameTo: null;
};

type RenameOperation<TIdentity extends SemanticIdentity> = {
    type: 'rename';
    entityId: string;
    renameTo: TIdentity;
};

export type TableDiffOperation = DiffOperationBase<
    'table',
    TableIdentity,
    TableSummary
> &
    (AddOperation | UpdateOperation | RenameOperation<TableIdentity>);

export type ViewDiffOperation = DiffOperationBase<
    'view',
    ViewIdentity,
    ViewSummary
> &
    (AddOperation | UpdateOperation | RenameOperation<ViewIdentity>);

export type FieldDiffOperation = DiffOperationBase<
    'field',
    FieldIdentity,
    FieldSummary
> &
    (AddOperation | UpdateOperation | RenameOperation<FieldIdentity>);

export type RelationshipDiffOperation = DiffOperationBase<
    'relationship',
    RelationshipIdentity,
    RelationshipSummary
> &
    (AddOperation | UpdateOperation);

export type DiffOperation =
    | TableDiffOperation
    | FieldDiffOperation
    | RelationshipDiffOperation
    | ViewDiffOperation;

export const relationshipIdentity = (
    source: RelationshipEndpointIdentity,
    target: RelationshipEndpointIdentity
): RelationshipIdentity => ({
    kind: 'relationship',
    source,
    target,
});
