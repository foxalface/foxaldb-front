import { describe, expect, it } from 'vitest';
import type { DiagramActivityResource } from '@/lib/api/diagram-activities';
import {
    DEFAULT_SELECTED_ACTIVITY_ENTITY_TYPES,
    filterActivities,
    hasActiveActivitiesFilter,
    matchesActivityEntityTypeFilter,
    matchesActivityFilter,
} from '../filter-activities';

const t = ((key: string) => key) as Parameters<typeof filterActivities>[2]['t'];

const activity = (
    overrides: Partial<DiagramActivityResource> = {}
): DiagramActivityResource => ({
    id: 1,
    diagramId: 42,
    userId: 7,
    user: {
        id: 7,
        firstName: 'Jean',
        lastName: 'Martin',
        fullName: 'Jean Martin',
        email: 'jp@example.com',
    },
    action: 'add_tables',
    metadata: { tables: [{ id: 't1', name: 'users', isView: false }] },
    createdAt: '2026-01-01T00:00:00Z',
    ...overrides,
});

describe('filter-activities', () => {
    it('returns all activities when all types are selected and text is empty', () => {
        const activities = [activity(), activity({ id: 2 })];

        expect(
            filterActivities(
                activities,
                {
                    filterText: '',
                    selectedEntityTypes: DEFAULT_SELECTED_ACTIVITY_ENTITY_TYPES,
                },
                { t }
            )
        ).toHaveLength(2);
    });

    it('filters activities by user name', () => {
        const activities = [
            activity(),
            activity({
                id: 2,
                user: {
                    id: 8,
                    firstName: 'Alice',
                    lastName: 'Dupont',
                    fullName: 'Alice Dupont',
                    email: 'alice@example.com',
                },
            }),
        ];

        expect(
            filterActivities(
                activities,
                {
                    filterText: 'alice',
                    selectedEntityTypes: DEFAULT_SELECTED_ACTIVITY_ENTITY_TYPES,
                },
                { t }
            )
        ).toHaveLength(1);
    });

    it('filters activities by selected entity types', () => {
        const activities = [
            activity({ id: 1, action: 'add_tables' }),
            activity({ id: 2, action: 'add_notes' }),
        ];

        expect(
            filterActivities(
                activities,
                {
                    filterText: '',
                    selectedEntityTypes: ['note'],
                },
                { t }
            ).map((item) => item.id)
        ).toEqual([2]);
        expect(matchesActivityEntityTypeFilter(activities[0], ['table'])).toBe(
            true
        );
        expect(matchesActivityEntityTypeFilter(activities[1], ['table'])).toBe(
            false
        );
    });

    it('combines text and type filters', () => {
        const activities = [
            activity({
                id: 1,
                action: 'add_tables',
            }),
            activity({
                id: 2,
                action: 'add_notes',
                metadata: {},
            }),
        ];

        expect(
            filterActivities(
                activities,
                {
                    filterText: 'jean',
                    selectedEntityTypes: ['table'],
                },
                { t }
            ).map((item) => item.id)
        ).toEqual([1]);
        expect(
            matchesActivityFilter(
                activities[0],
                {
                    filterText: 'jean',
                    selectedEntityTypes: ['note'],
                },
                { t }
            )
        ).toBe(false);
    });

    it('detects active filter state', () => {
        expect(
            hasActiveActivitiesFilter({
                filterText: '',
                selectedEntityTypes: DEFAULT_SELECTED_ACTIVITY_ENTITY_TYPES,
            })
        ).toBe(false);
        expect(
            hasActiveActivitiesFilter({
                filterText: 'users',
                selectedEntityTypes: DEFAULT_SELECTED_ACTIVITY_ENTITY_TYPES,
            })
        ).toBe(true);
        expect(
            hasActiveActivitiesFilter({
                filterText: '',
                selectedEntityTypes: ['table'],
            })
        ).toBe(true);
        expect(
            hasActiveActivitiesFilter({
                filterText: '',
                selectedEntityTypes: [],
            })
        ).toBe(true);
    });
});
