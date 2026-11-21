import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import type { Diagram } from '@/lib/domain/diagram';
import {
    createFilterGroup,
    type FilterCondition,
} from '@/lib/domain/filter-expression';
import { projectCanvasVisibility } from '@/pages/editor-page/canvas/canvas-filter-visibility';

const createdAt = new Date(0);

const diagram = (): Diagram => ({
    id: 'diagram-1',
    name: 'Catalog',
    databaseType: DatabaseType.POSTGRESQL,
    tables: [
        {
            id: 'users',
            name: 'users',
            x: 0,
            y: 0,
            fields: [
                {
                    id: 'users-id',
                    name: 'id',
                    type: { id: 'text', name: 'text' },
                    primaryKey: true,
                    unique: true,
                    nullable: false,
                    createdAt: 1,
                },
                {
                    id: 'users-email',
                    name: 'email',
                    type: { id: 'text', name: 'text' },
                    primaryKey: false,
                    unique: false,
                    nullable: true,
                    createdAt: 1,
                },
            ],
            indexes: [],
            color: '#fff',
            isView: false,
            createdAt: 1,
        },
        {
            id: 'orders',
            name: 'orders',
            x: 0,
            y: 0,
            fields: [
                {
                    id: 'orders-id',
                    name: 'id',
                    type: { id: 'text', name: 'text' },
                    primaryKey: true,
                    unique: true,
                    nullable: false,
                    createdAt: 1,
                },
            ],
            indexes: [],
            color: '#fff',
            isView: false,
            createdAt: 1,
        },
    ],
    relationships: [],
    tagAssignments: [
        {
            id: 'assign-users',
            tagId: 'backend',
            targetType: 'table',
            targetId: 'users',
        },
        {
            id: 'assign-email',
            tagId: 'pii',
            targetType: 'field',
            targetId: 'users-email',
        },
    ],
    createdAt,
    updatedAt: createdAt,
});

const condition = (
    target: 'table' | 'field',
    tagId: string
): FilterCondition => ({
    kind: 'condition',
    id: target,
    target,
    property: 'tag',
    operator: 'is_any_of',
    value: [tagId],
});

describe('visual export follows the visible canvas filter', () => {
    it('keeps every field of a directly matched table', () => {
        const visibility = projectCanvasVisibility({
            diagram: diagram(),
            expression: createFilterGroup(
                'and',
                [condition('table', 'backend')],
                'root'
            ),
            showViews: false,
            forceShownTableIds: new Set(),
        });

        expect([...(visibility?.visibleTableIds ?? [])]).toEqual(['users']);
        expect([...(visibility?.visibleFieldIds ?? [])].sort()).toEqual([
            'users-email',
            'users-id',
        ]);
    });

    it('omits sibling fields when only a field matches', () => {
        const visibility = projectCanvasVisibility({
            diagram: diagram(),
            expression: createFilterGroup(
                'and',
                [condition('field', 'pii')],
                'root'
            ),
            showViews: true,
            forceShownTableIds: new Set(),
        });

        expect([...(visibility?.visibleFieldIds ?? [])]).toEqual([
            'users-email',
        ]);
        expect(visibility?.visibleTableIds.has('orders')).toBe(false);
    });
});
