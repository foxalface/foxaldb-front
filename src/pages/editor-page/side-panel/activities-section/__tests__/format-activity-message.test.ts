import { describe, expect, it } from 'vitest';
import type { TFunction } from 'i18next';
import type { DiagramActivityResource } from '@/lib/api/diagram-activities';
import { resolveActivityActorName } from '../format-activity-message';
import { buildUserIdentity } from '@/lib/user';

const t = ((key: string) => key) as TFunction;

const activity = (
    overrides: Partial<DiagramActivityResource> = {}
): DiagramActivityResource => ({
    id: 1,
    diagramId: 42,
    userId: 7,
    user: {
        ...buildUserIdentity(7, 'Jean-Pierre', 'Martin'),
        email: 'jp@example.com',
    },
    action: 'add_tables',
    metadata: { tables: [{ id: 't1', name: 'users', isView: false }] },
    createdAt: '2026-01-01T00:00:00Z',
    ...overrides,
});

describe('format-activity-message identity', () => {
    it('uses full name from structured activity user', () => {
        expect(resolveActivityActorName(activity(), t)).toBe(
            'Jean-Pierre Martin'
        );
    });

    it('preserves null-user fallback', () => {
        expect(
            resolveActivityActorName(activity({ user: null, userId: null }), t)
        ).toBe('side_panel.activities_section.unknown_user');
    });
});
