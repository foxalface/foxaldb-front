import { describe, expect, it } from 'vitest';
import type { DiagramTagAssignment } from '@/lib/domain/diagram-tag';
import {
    areaHiddenByTagVisibility,
    deriveTagCanvasVisibility,
    relationshipHiddenByTagVisibility,
    tableHiddenByTagVisibility,
} from '../tag-canvas-visibility';
import type {
    TagCanvasVisibilityRelationship,
    TagCanvasVisibilityTable,
} from '../tag-canvas-visibility';

const table = (
    id: string,
    fieldIds: string[] = []
): TagCanvasVisibilityTable => ({
    id,
    fields: fieldIds.map((fieldId) => ({ id: fieldId })),
});

const relationship = (
    id: string,
    sourceTableId: string,
    targetTableId: string
): TagCanvasVisibilityRelationship => ({
    id,
    sourceTableId,
    targetTableId,
});

const assignment = (
    tagId: string,
    targetType: DiagramTagAssignment['targetType'],
    targetId: string
): DiagramTagAssignment => ({
    id: `${targetType}-${targetId}-${tagId}`,
    tagId,
    targetType,
    targetId,
});

const visible = ({
    tables,
    relationships = [],
    tagAssignments = [],
    selectedTagIds,
    matchMode,
    eligibleTableIds,
}: {
    tables: readonly TagCanvasVisibilityTable[];
    relationships?: readonly TagCanvasVisibilityRelationship[];
    tagAssignments?: readonly DiagramTagAssignment[];
    selectedTagIds: readonly string[];
    matchMode: 'any' | 'all' | 'none';
    eligibleTableIds: readonly string[];
}) =>
    deriveTagCanvasVisibility({
        tables,
        relationships,
        tagAssignments,
        selectedTagIds,
        matchMode,
        eligibleTableIds: new Set(eligibleTableIds),
    });

describe('deriveTagCanvasVisibility', () => {
    it('keeps the complete eligible universe when no tags are selected', () => {
        const result = visible({
            tables: [table('users', ['users.id']), table('orders')],
            relationships: [relationship('rel', 'users', 'orders')],
            tagAssignments: [assignment('red', 'table', 'users')],
            selectedTagIds: [],
            matchMode: 'none',
            eligibleTableIds: ['users', 'orders'],
        });

        expect([...result.visibleTableIds]).toEqual(['users', 'orders']);
        expect([...result.visibleRelationshipIds]).toEqual(['rel']);
    });

    it('matches a table that carries one selected tag in ANY mode', () => {
        const result = visible({
            tables: [table('users'), table('orders')],
            tagAssignments: [
                assignment('red', 'table', 'users'),
                assignment('blue', 'table', 'orders'),
            ],
            selectedTagIds: ['red'],
            matchMode: 'any',
            eligibleTableIds: ['users', 'orders'],
        });

        expect(result.visibleTableIds).toEqual(new Set(['users']));
    });

    it('hides a table that does not carry a selected tag in ANY mode', () => {
        const result = visible({
            tables: [table('orders')],
            tagAssignments: [assignment('blue', 'table', 'orders')],
            selectedTagIds: ['red'],
            matchMode: 'any',
            eligibleTableIds: ['orders'],
        });

        expect(result.visibleTableIds.size).toBe(0);
    });

    it('promotes a parent table from a field that matches ANY', () => {
        const result = visible({
            tables: [table('users', ['email'])],
            tagAssignments: [assignment('red', 'field', 'email')],
            selectedTagIds: ['red'],
            matchMode: 'any',
            eligibleTableIds: ['users'],
        });

        expect(result.visibleTableIds).toEqual(new Set(['users']));
    });

    it('promotes both relationship endpoints that match ANY', () => {
        const result = visible({
            tables: [table('users'), table('orders')],
            relationships: [relationship('rel', 'users', 'orders')],
            tagAssignments: [assignment('red', 'relationship', 'rel')],
            selectedTagIds: ['red'],
            matchMode: 'any',
            eligibleTableIds: ['users', 'orders'],
        });

        expect(result.visibleTableIds).toEqual(new Set(['users', 'orders']));
        expect(result.visibleRelationshipIds).toEqual(new Set(['rel']));
    });

    it('requires every selected tag on a table in ALL mode', () => {
        const result = visible({
            tables: [table('users'), table('orders')],
            tagAssignments: [
                assignment('red', 'table', 'users'),
                assignment('blue', 'table', 'users'),
                assignment('red', 'table', 'orders'),
            ],
            selectedTagIds: ['red', 'blue'],
            matchMode: 'all',
            eligibleTableIds: ['users', 'orders'],
        });

        expect(result.visibleTableIds).toEqual(new Set(['users']));
    });

    it('promotes a field parent in ALL mode only when the field has every tag', () => {
        const result = visible({
            tables: [table('users', ['email']), table('orders', ['total'])],
            tagAssignments: [
                assignment('red', 'field', 'email'),
                assignment('blue', 'field', 'email'),
                assignment('red', 'field', 'total'),
            ],
            selectedTagIds: ['red', 'blue'],
            matchMode: 'all',
            eligibleTableIds: ['users', 'orders'],
        });

        expect(result.visibleTableIds).toEqual(new Set(['users']));
    });

    it('promotes relationship endpoints in ALL mode only when the relationship has every tag', () => {
        const result = visible({
            tables: [table('users'), table('orders'), table('products')],
            relationships: [
                relationship('full', 'users', 'orders'),
                relationship('partial', 'orders', 'products'),
            ],
            tagAssignments: [
                assignment('red', 'relationship', 'full'),
                assignment('blue', 'relationship', 'full'),
                assignment('red', 'relationship', 'partial'),
            ],
            selectedTagIds: ['red', 'blue'],
            matchMode: 'all',
            eligibleTableIds: ['users', 'orders', 'products'],
        });

        expect(result.visibleTableIds).toEqual(new Set(['users', 'orders']));
        expect(result.visibleRelationshipIds).toEqual(new Set(['full']));
    });

    it('uses matchesTags for tables in NONE mode, including untagged tables', () => {
        const result = visible({
            tables: [table('plain'), table('marked')],
            tagAssignments: [assignment('red', 'table', 'marked')],
            selectedTagIds: ['red'],
            matchMode: 'none',
            eligibleTableIds: ['plain', 'marked'],
        });

        expect(result.visibleTableIds).toEqual(new Set(['plain']));
    });

    it('does not let an untagged field anchor its parent in NONE mode', () => {
        const result = visible({
            tables: [table('users', ['email'])],
            tagAssignments: [assignment('red', 'table', 'users')],
            selectedTagIds: ['red'],
            matchMode: 'none',
            eligibleTableIds: ['users'],
        });

        expect(result.visibleTableIds.size).toBe(0);
    });

    it('does not let an untagged relationship anchor endpoints in NONE mode', () => {
        const result = visible({
            tables: [table('users'), table('orders')],
            relationships: [relationship('rel', 'users', 'orders')],
            tagAssignments: [
                assignment('red', 'table', 'users'),
                assignment('red', 'table', 'orders'),
            ],
            selectedTagIds: ['red'],
            matchMode: 'none',
            eligibleTableIds: ['users', 'orders'],
        });

        expect(result.visibleTableIds.size).toBe(0);
        expect(result.visibleRelationshipIds.size).toBe(0);
    });

    it('lets a field tagged only with unrelated tags promote its parent in NONE mode', () => {
        const result = visible({
            tables: [table('users', ['email'])],
            tagAssignments: [
                assignment('red', 'table', 'users'),
                assignment('blue', 'field', 'email'),
            ],
            selectedTagIds: ['red'],
            matchMode: 'none',
            eligibleTableIds: ['users'],
        });

        expect(result.visibleTableIds).toEqual(new Set(['users']));
    });

    it('lets a relationship tagged only with unrelated tags promote endpoints in NONE mode', () => {
        const result = visible({
            tables: [table('users'), table('orders')],
            relationships: [relationship('rel', 'users', 'orders')],
            tagAssignments: [
                assignment('red', 'table', 'users'),
                assignment('red', 'table', 'orders'),
                assignment('blue', 'relationship', 'rel'),
            ],
            selectedTagIds: ['red'],
            matchMode: 'none',
            eligibleTableIds: ['users', 'orders'],
        });

        expect(result.visibleTableIds).toEqual(new Set(['users', 'orders']));
        expect(result.visibleRelationshipIds).toEqual(new Set(['rel']));
    });

    it('keeps every field of a promoted parent and does not expose field hiding', () => {
        const users = table('users', ['email', 'name']);
        const result = visible({
            tables: [users],
            tagAssignments: [
                assignment('red', 'field', 'email'),
                assignment('blue', 'field', 'name'),
            ],
            selectedTagIds: ['red'],
            matchMode: 'any',
            eligibleTableIds: ['users'],
        });

        expect(result.visibleTableIds).toEqual(new Set(['users']));
        expect(users.fields.map((field) => field.id)).toEqual([
            'email',
            'name',
        ]);
        expect(result).not.toHaveProperty('visibleFieldIds');
    });

    it('keeps a non-matching field parent visible when the table itself matches', () => {
        const result = visible({
            tables: [table('users', ['email'])],
            tagAssignments: [
                assignment('red', 'table', 'users'),
                assignment('blue', 'field', 'email'),
            ],
            selectedTagIds: ['red'],
            matchMode: 'any',
            eligibleTableIds: ['users'],
        });

        expect(result.visibleTableIds).toEqual(new Set(['users']));
    });

    it('keeps an untagged relationship between visible tables', () => {
        const result = visible({
            tables: [table('users'), table('orders')],
            relationships: [relationship('rel', 'users', 'orders')],
            tagAssignments: [
                assignment('red', 'table', 'users'),
                assignment('red', 'table', 'orders'),
            ],
            selectedTagIds: ['red'],
            matchMode: 'any',
            eligibleTableIds: ['users', 'orders'],
        });

        expect(result.visibleRelationshipIds).toEqual(new Set(['rel']));
    });

    it('does not let an untagged relationship promote a hidden table', () => {
        const result = visible({
            tables: [table('users'), table('orders')],
            relationships: [relationship('rel', 'users', 'orders')],
            tagAssignments: [assignment('red', 'table', 'users')],
            selectedTagIds: ['red'],
            matchMode: 'any',
            eligibleTableIds: ['users', 'orders'],
        });

        expect(result.visibleTableIds).toEqual(new Set(['users']));
        expect(result.visibleRelationshipIds.size).toBe(0);
    });

    it('hides a tagged relationship that fails the filter even when both tables are visible', () => {
        const result = visible({
            tables: [table('users'), table('orders')],
            relationships: [relationship('rel', 'users', 'orders')],
            tagAssignments: [
                assignment('red', 'table', 'users'),
                assignment('red', 'table', 'orders'),
                assignment('blue', 'relationship', 'rel'),
            ],
            selectedTagIds: ['red'],
            matchMode: 'any',
            eligibleTableIds: ['users', 'orders'],
        });

        expect(result.visibleTableIds).toEqual(new Set(['users', 'orders']));
        expect(result.visibleRelationshipIds.size).toBe(0);
    });

    it('does not show a relationship unless both endpoints are visible', () => {
        const result = visible({
            tables: [table('users'), table('orders')],
            relationships: [relationship('rel', 'users', 'orders')],
            tagAssignments: [
                assignment('red', 'relationship', 'rel'),
                assignment('red', 'table', 'orders'),
            ],
            selectedTagIds: ['red'],
            matchMode: 'any',
            eligibleTableIds: ['orders'],
        });

        expect(result.visibleTableIds).toEqual(new Set(['orders']));
        expect(result.visibleRelationshipIds.size).toBe(0);
    });

    it('treats a view through table assignments and refuses to resurrect an ineligible view', () => {
        const result = visible({
            tables: [
                table('active_users', ['active_users.id']),
                table('users'),
            ],
            relationships: [relationship('rel', 'users', 'active_users')],
            tagAssignments: [
                assignment('red', 'table', 'active_users'),
                assignment('red', 'field', 'active_users.id'),
                assignment('red', 'relationship', 'rel'),
            ],
            selectedTagIds: ['red'],
            matchMode: 'any',
            eligibleTableIds: ['users'],
        });

        expect(result.visibleTableIds).toEqual(new Set(['users']));
        expect(result.visibleRelationshipIds.size).toBe(0);
    });

    it('does not let a matching table, field, or relationship bypass an existing gate', () => {
        const result = visible({
            tables: [table('hidden_table', ['secret']), table('visible_peer')],
            relationships: [
                relationship('rel', 'hidden_table', 'visible_peer'),
            ],
            tagAssignments: [
                assignment('red', 'table', 'hidden_table'),
                assignment('red', 'field', 'secret'),
                assignment('red', 'relationship', 'rel'),
            ],
            selectedTagIds: ['red'],
            matchMode: 'any',
            eligibleTableIds: ['visible_peer'],
        });

        expect(result.visibleTableIds).toEqual(new Set(['visible_peer']));
        expect(result.visibleRelationshipIds.size).toBe(0);
    });

    it('limits structural closure to the eligible universe', () => {
        const result = visible({
            tables: [table('inside', ['inside.email']), table('outside')],
            relationships: [relationship('rel', 'inside', 'outside')],
            tagAssignments: [
                assignment('red', 'field', 'inside.email'),
                assignment('red', 'relationship', 'rel'),
            ],
            selectedTagIds: ['red'],
            matchMode: 'any',
            eligibleTableIds: ['inside'],
        });

        expect(result.visibleTableIds).toEqual(new Set(['inside']));
    });
});

describe('tag visibility application', () => {
    it('leaves pre-tag hiding unchanged when there is no tag constraint', () => {
        expect(tableHiddenByTagVisibility(true, 'users', null)).toBe(true);
        expect(tableHiddenByTagVisibility(false, 'users', null)).toBe(false);
        expect(relationshipHiddenByTagVisibility('rel', null)).toBe(false);
        expect(
            areaHiddenByTagVisibility({
                areaAlreadyHidden: false,
                tableIdsInArea: ['users'],
                visibility: null,
            })
        ).toBe(false);
    });

    it('hides an area only when every table in it is tag-hidden', () => {
        const visibility = visible({
            tables: [table('users'), table('orders')],
            tagAssignments: [assignment('red', 'table', 'users')],
            selectedTagIds: ['red'],
            matchMode: 'any',
            eligibleTableIds: ['users', 'orders'],
        });

        expect(
            areaHiddenByTagVisibility({
                areaAlreadyHidden: false,
                tableIdsInArea: ['orders'],
                visibility,
            })
        ).toBe(true);
        expect(
            areaHiddenByTagVisibility({
                areaAlreadyHidden: false,
                tableIdsInArea: ['users', 'orders'],
                visibility,
            })
        ).toBe(false);
        expect(
            areaHiddenByTagVisibility({
                areaAlreadyHidden: true,
                tableIdsInArea: ['users'],
                visibility,
            })
        ).toBe(true);
    });
});
