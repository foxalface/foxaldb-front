import { describe, expect, it } from 'vitest';
import {
    fieldIdentityKey,
    relationshipIdentityKey,
    tableIdentityKey,
    viewIdentityKey,
} from '../identity-key';

describe('semanticIdentityKey', () => {
    it('matches backend JSON ordering for table and view', () => {
        expect(
            tableIdentityKey({ kind: 'table', schema: 'public', name: 'users' })
        ).toBe(
            JSON.stringify({
                kind: 'table',
                schema: 'public',
                name: 'users',
            })
        );

        expect(
            viewIdentityKey({
                kind: 'view',
                schema: null,
                name: 'active_users',
            })
        ).toBe(
            JSON.stringify({
                kind: 'view',
                schema: null,
                name: 'active_users',
            })
        );
    });

    it('distinguishes table from view with the same name', () => {
        const tableKey = tableIdentityKey({
            kind: 'table',
            schema: null,
            name: 'accounts',
        });
        const viewKey = viewIdentityKey({
            kind: 'view',
            schema: null,
            name: 'accounts',
        });

        expect(tableKey).not.toBe(viewKey);
    });

    it('keys fields and relationships deterministically', () => {
        const fieldKey = fieldIdentityKey({
            kind: 'field',
            schema: 'public',
            table: 'users',
            name: 'email',
        });

        expect(fieldKey).toContain('users');
        expect(fieldKey).not.toBe(
            fieldIdentityKey({
                kind: 'field',
                schema: 'public',
                table: 'users',
                name: 'name',
            })
        );

        const relationshipKey = relationshipIdentityKey({
            kind: 'relationship',
            source: {
                schema: 'public',
                table: 'users',
                field: 'id',
            },
            target: {
                schema: 'public',
                table: 'posts',
                field: 'user_id',
            },
        });

        expect(relationshipKey).not.toBe(
            relationshipIdentityKey({
                kind: 'relationship',
                source: {
                    schema: 'public',
                    table: 'posts',
                    field: 'user_id',
                },
                target: {
                    schema: 'public',
                    table: 'users',
                    field: 'id',
                },
            })
        );
    });
});
