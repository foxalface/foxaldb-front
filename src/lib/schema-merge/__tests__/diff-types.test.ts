import { describe, expect, it } from 'vitest';
import {
    CHANGE_TYPES,
    ENTITY_CATEGORIES,
    SCHEMA_MERGE_ERROR_CODES,
    isChangeType,
    isEntityCategory,
    relationshipIdentity,
} from '../diff-types';
import type {
    DiffOperation,
    FieldDiffOperation,
    FieldIdentity,
    RelationshipDiffOperation,
    RelationshipIdentity,
    TableDiffOperation,
    ViewDiffOperation,
} from '../diff-types';

const endpointFields = (identity: RelationshipIdentity): [string, string] => [
    identity.source.field,
    identity.target.field,
];

type Expect<T extends true> = T;

type RelationshipRenameIsImpossible = Expect<
    Extract<
        DiffOperation,
        { category: 'relationship'; type: 'rename' }
    > extends never
        ? true
        : false
>;

type FieldIsNotRelationshipIdentity = Expect<
    FieldIdentity extends RelationshipIdentity ? false : true
>;

const relationshipRenameIsImpossible: RelationshipRenameIsImpossible = true;
const fieldIsNotRelationshipIdentity: FieldIsNotRelationshipIdentity = true;

describe('schema merge diff contract', () => {
    it('locks the four change types and rejects extra variants', () => {
        expect(CHANGE_TYPES).toEqual(['add', 'modify', 'rename', 'delete']);
        expect(isChangeType('add')).toBe(true);
        expect(isChangeType('modify')).toBe(true);
        expect(isChangeType('rename')).toBe(true);
        expect(isChangeType('delete')).toBe(true);
        expect(isChangeType('move')).toBe(false);
        expect(isChangeType('replace')).toBe(false);
        expect(isChangeType('unchanged')).toBe(false);
        expect(isChangeType('conflict')).toBe(false);
    });

    it('locks the four entity categories', () => {
        expect(ENTITY_CATEGORIES).toEqual([
            'table',
            'field',
            'relationship',
            'view',
        ]);
        expect(isEntityCategory('table')).toBe(true);
        expect(isEntityCategory('field')).toBe(true);
        expect(isEntityCategory('relationship')).toBe(true);
        expect(isEntityCategory('view')).toBe(true);
        expect(isEntityCategory('index')).toBe(false);
        expect(isEntityCategory('custom_type')).toBe(false);
        expect(isEntityCategory('area')).toBe(false);
        expect(isEntityCategory('note')).toBe(false);
    });

    it('locks stable error codes without auth or empty-diff codes', () => {
        expect(SCHEMA_MERGE_ERROR_CODES).toEqual([
            'unable_to_detect_format',
            'ambiguous_source',
            'unsupported_source',
            'database_type_mismatch',
            'malformed_archive',
            'payload_too_large',
            'stale_comparison',
            'incomplete_selection',
            'analysis_failed',
        ]);
        expect(SCHEMA_MERGE_ERROR_CODES).not.toContain('unauthenticated');
        expect(SCHEMA_MERGE_ERROR_CODES).not.toContain('forbidden');
        expect(SCHEMA_MERGE_ERROR_CODES).not.toContain('no_differences');
    });

    it('represents a table operation from structured fields', () => {
        const operation = {
            id: 'table_add_opaque',
            category: 'table',
            type: 'add',
            entityId: null,
            identity: { kind: 'table', schema: 'public', name: 'users' },
            renameTo: null,
            before: null,
            after: { kind: 'table', schema: 'public', name: 'users' },
            changes: [],
            dependsOn: [],
        } satisfies TableDiffOperation;

        expect(operation.identity).toEqual({
            kind: 'table',
            schema: 'public',
            name: 'users',
        });
        expect(operation.entityId).toBeNull();
    });

    it('represents a field modify with structured attribute changes', () => {
        const operation = {
            id: 'field_modify_opaque',
            category: 'field',
            type: 'modify',
            entityId: 'field-email',
            identity: {
                kind: 'field',
                schema: 'public',
                table: 'users',
                name: 'email',
            },
            renameTo: null,
            before: {
                kind: 'field',
                schema: 'public',
                table: 'users',
                name: 'email',
            },
            after: {
                kind: 'field',
                schema: 'public',
                table: 'users',
                name: 'email',
            },
            changes: [
                {
                    attribute: 'type',
                    before: { name: 'varchar', length: 100, nullable: false },
                    after: { name: 'varchar', length: 255, nullable: true },
                },
            ],
            dependsOn: ['table_modify_opaque'],
        } satisfies FieldDiffOperation;

        expect(operation.changes[0]?.attribute).toBe('type');
        expect(operation.dependsOn).toEqual(['table_modify_opaque']);
        expect(operation.id).toBe('field_modify_opaque');
    });

    it('represents a field rename with before and after labels and attribute changes', () => {
        const operation = {
            id: 'field_rename_opaque',
            category: 'field',
            type: 'rename',
            entityId: 'field-name',
            identity: {
                kind: 'field',
                schema: 'public',
                table: 'users',
                name: 'name',
            },
            renameTo: {
                kind: 'field',
                schema: 'public',
                table: 'users',
                name: 'full_name',
            },
            before: {
                kind: 'field',
                schema: 'public',
                table: 'users',
                name: 'name',
            },
            after: {
                kind: 'field',
                schema: 'public',
                table: 'users',
                name: 'full_name',
            },
            changes: [
                {
                    attribute: 'type',
                    before: { name: 'varchar', length: 100 },
                    after: { name: 'varchar', length: 255 },
                },
            ],
            dependsOn: [],
        } satisfies FieldDiffOperation;

        expect(operation.before?.name).toBe('name');
        expect(operation.after?.name).toBe('full_name');
        expect(operation.renameTo.name).toBe('full_name');
        expect(operation.changes).toHaveLength(1);
    });

    it('represents a relationship by both endpoints and not by name', () => {
        const identity = relationshipIdentity(
            { schema: 'public', table: 'posts', field: 'user_id' },
            { schema: 'public', table: 'users', field: 'id' }
        );
        const operation = {
            id: 'relationship_modify_opaque',
            category: 'relationship',
            type: 'modify',
            entityId: 'rel-posts-user',
            identity,
            renameTo: null,
            before: { kind: 'relationship', name: 'posts_user_fk' },
            after: { kind: 'relationship', name: 'posts_user_fkey' },
            changes: [
                {
                    attribute: 'name',
                    before: 'posts_user_fk',
                    after: 'posts_user_fkey',
                },
            ],
            dependsOn: ['field_modify_opaque'],
        } satisfies RelationshipDiffOperation;

        expect(endpointFields(operation.identity)).toEqual(['user_id', 'id']);
        expect(operation.identity).not.toHaveProperty('name');
        expect(operation.renameTo).toBeNull();
        expect(operation.dependsOn).toEqual(['field_modify_opaque']);
        expect(relationshipRenameIsImpossible).toBe(true);
        expect(fieldIsNotRelationshipIdentity).toBe(true);
    });

    it('represents a view rename separately from a table of the same name', () => {
        const operation = {
            id: 'view_rename_opaque',
            category: 'view',
            type: 'rename',
            entityId: 'view-active-users',
            identity: {
                kind: 'view',
                schema: 'public',
                name: 'active_users',
            },
            renameTo: {
                kind: 'view',
                schema: 'public',
                name: 'current_users',
            },
            before: {
                kind: 'view',
                schema: 'public',
                name: 'active_users',
            },
            after: {
                kind: 'view',
                schema: 'public',
                name: 'current_users',
            },
            changes: [],
            dependsOn: [],
        } satisfies ViewDiffOperation;

        expect(operation.identity.kind).toBe('view');
        expect(operation.renameTo.name).toBe('current_users');
        expect(operation.before?.kind).toBe('view');
    });
});
