import {
    DIAGRAM_MEMBER_ROLES,
    type DiagramMemberResource,
    type DiagramMemberRole,
} from '@/lib/api/diagram-members';

export interface ShareMemberListFilterOptions {
    filterText: string;
    selectedRoles: ReadonlyArray<DiagramMemberRole>;
}

export const DEFAULT_SELECTED_MEMBER_ROLES: DiagramMemberRole[] = [
    ...DIAGRAM_MEMBER_ROLES,
];

const ROLE_SORT_ORDER: Record<DiagramMemberRole, number> = {
    editor: 0,
    viewer: 1,
};

export const isShareMemberRoleFilterActive = (
    selectedRoles: ReadonlyArray<DiagramMemberRole>
): boolean => selectedRoles.length !== DIAGRAM_MEMBER_ROLES.length;

export const matchesShareMemberRoleFilter = (
    member: DiagramMemberResource,
    selectedRoles: ReadonlyArray<DiagramMemberRole>
): boolean => {
    if (selectedRoles.length === 0) {
        return false;
    }

    return selectedRoles.includes(member.role);
};

export const matchesShareMemberTextFilter = (
    member: DiagramMemberResource,
    filterText: string
): boolean => {
    if (!filterText?.trim?.()) {
        return true;
    }

    const searchText = filterText.toLowerCase();

    return (
        member.user.fullName.toLowerCase().includes(searchText) ||
        member.user.email.toLowerCase().includes(searchText)
    );
};

export const matchesShareMemberFilter = (
    member: DiagramMemberResource,
    options: ShareMemberListFilterOptions
): boolean =>
    matchesShareMemberRoleFilter(member, options.selectedRoles) &&
    matchesShareMemberTextFilter(member, options.filterText);

export const sortShareMembers = (
    members: ReadonlyArray<DiagramMemberResource>
): DiagramMemberResource[] =>
    [...members].sort((left, right) => {
        const roleDifference =
            ROLE_SORT_ORDER[left.role] - ROLE_SORT_ORDER[right.role];

        if (roleDifference !== 0) {
            return roleDifference;
        }

        return left.user.fullName.localeCompare(right.user.fullName);
    });

export const filterShareMembers = (
    members: ReadonlyArray<DiagramMemberResource>,
    options: ShareMemberListFilterOptions
): DiagramMemberResource[] =>
    sortShareMembers(
        members.filter((member) => matchesShareMemberFilter(member, options))
    );

export const hasActiveShareMemberFilter = (
    options: ShareMemberListFilterOptions
): boolean =>
    options.filterText.trim().length > 0 ||
    isShareMemberRoleFilterActive(options.selectedRoles);
