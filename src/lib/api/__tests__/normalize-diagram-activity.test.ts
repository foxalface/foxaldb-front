import { describe, expect, it } from 'vitest';
import { normalizeDiagramActivityFromApi } from '../normalize-diagram-activity';
import { buildUserIdentity } from '@/lib/user';

describe('normalizeDiagramActivityFromApi', () => {
    it('maps structured user identity from snake_case DTO', () => {
        const normalized = normalizeDiagramActivityFromApi({
            id: 1,
            diagram_id: 42,
            user_id: 7,
            user: {
                id: 7,
                first_name: 'Jean-Pierre',
                last_name: 'Martin',
                full_name: 'Jean-Pierre Martin',
                email: 'jp@example.com',
            },
            action: 'add_tables',
            metadata: {},
            created_at: '2026-01-01T00:00:00Z',
        });

        expect(normalized.user).toEqual({
            ...buildUserIdentity(7, 'Jean-Pierre', 'Martin'),
            email: 'jp@example.com',
        });
        expect(normalized.user).not.toHaveProperty('name');
        expect(normalized.createdAt).toBe('2026-01-01T00:00:00Z');
    });

    it('preserves null user', () => {
        const normalized = normalizeDiagramActivityFromApi({
            id: 2,
            diagram_id: 42,
            user_id: null,
            user: null,
            action: 'remove_tables',
            metadata: {},
            created_at: '2026-01-02T00:00:00Z',
        });

        expect(normalized.user).toBeNull();
    });
});
