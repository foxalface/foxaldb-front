import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import type { OpenDiagramOnlineRow } from '../open-diagram-list-types';
import {
    DEFAULT_OPEN_DIAGRAM_ROLE_FILTER,
    filterOnlineRowsByRole,
    isOpenDiagramRoleFilterActive,
    isOpenDiagramRoleFilterDefault,
    setOpenDiagramRoleFilterRole,
} from '../open-diagram-role-filter';

const onlineRow = (
    role: 'owner' | 'editor' | 'viewer'
): OpenDiagramOnlineRow => ({
    storage: 'online',
    id: role,
    name: role,
    databaseType: DatabaseType.GENERIC,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-03-01'),
    tablesCount: 1,
    role,
});

describe('open-diagram-role-filter', () => {
    it('defaults to all roles enabled', () => {
        expect(
            isOpenDiagramRoleFilterDefault(DEFAULT_OPEN_DIAGRAM_ROLE_FILTER)
        ).toBe(true);
        expect(
            isOpenDiagramRoleFilterActive(DEFAULT_OPEN_DIAGRAM_ROLE_FILTER)
        ).toBe(false);
    });

    it('filters to checked roles only', () => {
        const rows = [
            onlineRow('owner'),
            onlineRow('editor'),
            onlineRow('viewer'),
        ];
        const state = setOpenDiagramRoleFilterRole(
            DEFAULT_OPEN_DIAGRAM_ROLE_FILTER,
            'editor',
            false
        );

        expect(isOpenDiagramRoleFilterActive(state)).toBe(true);
        expect(filterOnlineRowsByRole(rows, state)).toEqual([
            onlineRow('owner'),
            onlineRow('viewer'),
        ]);
    });

    it('returns all rows when every role is checked', () => {
        const rows = [onlineRow('owner'), onlineRow('editor')];
        expect(
            filterOnlineRowsByRole(rows, DEFAULT_OPEN_DIAGRAM_ROLE_FILTER)
        ).toEqual(rows);
    });
});
