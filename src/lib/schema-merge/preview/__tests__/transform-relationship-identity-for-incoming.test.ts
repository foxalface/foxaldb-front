import { describe, expect, it } from 'vitest';
import type { DiffOperation } from '../../diff-types';
import { transformRelationshipIdentityForIncoming } from '../transform-relationship-identity-for-incoming';

const op = (value: DiffOperation): DiffOperation => value;

describe('transformRelationshipIdentityForIncoming', () => {
    it('maps pre-rename field endpoint to incoming field name', () => {
        const fieldRenames = [
            op({
                id: 'r1',
                category: 'field',
                type: 'rename',
                entityId: 'f1',
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
            } as DiffOperation),
        ];

        const result = transformRelationshipIdentityForIncoming(
            {
                kind: 'relationship',
                source: {
                    schema: 'public',
                    table: 'users',
                    field: 'name',
                },
                target: {
                    schema: 'public',
                    table: 'invoices',
                    field: 'user_id',
                },
            },
            fieldRenames,
            []
        );

        expect(result.source.field).toBe('full_name');
        expect(result.target.field).toBe('user_id');
    });
});
