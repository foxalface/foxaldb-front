import type { DiagramAccessRole } from '@/lib/api/diagrams';
import type { OpenDiagramOnlineRow } from './open-diagram-list-types';

export const OPEN_DIAGRAM_ROLE_FILTER_ROLES: DiagramAccessRole[] = [
    'owner',
    'editor',
    'viewer',
];

export type OpenDiagramRoleFilterState = Record<DiagramAccessRole, boolean>;

export const DEFAULT_OPEN_DIAGRAM_ROLE_FILTER: OpenDiagramRoleFilterState = {
    owner: true,
    editor: true,
    viewer: true,
};

export const isOpenDiagramRoleFilterDefault = (
    state: OpenDiagramRoleFilterState
): boolean =>
    OPEN_DIAGRAM_ROLE_FILTER_ROLES.every((role) => state[role] === true);

export const isOpenDiagramRoleFilterActive = (
    state: OpenDiagramRoleFilterState
): boolean => !isOpenDiagramRoleFilterDefault(state);

export const setOpenDiagramRoleFilterRole = (
    state: OpenDiagramRoleFilterState,
    role: DiagramAccessRole,
    checked: boolean
): OpenDiagramRoleFilterState => ({
    ...state,
    [role]: checked,
});

export const filterOnlineRowsByRole = (
    rows: OpenDiagramOnlineRow[],
    roleFilter: OpenDiagramRoleFilterState
): OpenDiagramOnlineRow[] => {
    if (isOpenDiagramRoleFilterDefault(roleFilter)) {
        return rows;
    }

    return rows.filter((row) => roleFilter[row.role] === true);
};
