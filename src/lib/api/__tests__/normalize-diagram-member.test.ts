import { describe, expect, it } from 'vitest';
import { normalizeDiagramMemberFromApi } from '../normalize-diagram-member';
import { buildUserIdentity } from '@/lib/user';

describe('normalizeDiagramMemberFromApi', () => {
    it('maps structured user identity from snake_case DTO', () => {
        const normalized = normalizeDiagramMemberFromApi({
            id: 5,
            user: {
                id: 3,
                first_name: 'Marie',
                last_name: 'Dupont',
                full_name: 'Marie Dupont',
                email: 'marie@example.com',
            },
            role: 'editor',
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-02T00:00:00Z',
        });

        expect(normalized.user).toEqual({
            ...buildUserIdentity(3, 'Marie', 'Dupont'),
            email: 'marie@example.com',
        });
        expect(normalized.user).not.toHaveProperty('name');
        expect(normalized.createdAt).toBe('2026-01-01T00:00:00Z');
    });
});
