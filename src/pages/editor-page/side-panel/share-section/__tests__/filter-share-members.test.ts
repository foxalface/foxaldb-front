import { describe, expect, it } from 'vitest';
import type { DiagramMemberResource } from '@/lib/api/diagram-members';
import {
    DEFAULT_SELECTED_MEMBER_ROLES,
    filterShareMembers,
    hasActiveShareMemberFilter,
    isShareMemberRoleFilterActive,
    sortShareMembers,
} from '../filter-share-members';

const createMember = (
    id: number,
    role: 'editor' | 'viewer',
    fullName: string,
    email: string
): DiagramMemberResource => ({
    id,
    role,
    user: {
        id,
        firstName: fullName.split(' ')[0] ?? fullName,
        lastName: fullName.split(' ').slice(1).join(' '),
        fullName,
        email,
    },
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
});

describe('filterShareMembers', () => {
    const members = [
        createMember(1, 'viewer', 'Zoe Viewer', 'zoe@example.com'),
        createMember(2, 'editor', 'Alice Editor', 'alice@example.com'),
        createMember(3, 'editor', 'Bob Editor', 'bob@example.com'),
    ];

    it('sorts members by role then name', () => {
        expect(
            sortShareMembers(members).map((member) => member.user.fullName)
        ).toEqual(['Alice Editor', 'Bob Editor', 'Zoe Viewer']);
    });

    it('filters members by selected roles', () => {
        expect(
            filterShareMembers(members, {
                filterText: '',
                selectedRoles: ['editor'],
            }).map((member) => member.id)
        ).toEqual([2, 3]);
    });

    it('filters members by text', () => {
        expect(
            filterShareMembers(members, {
                filterText: 'zoe',
                selectedRoles: DEFAULT_SELECTED_MEMBER_ROLES,
            }).map((member) => member.id)
        ).toEqual([1]);
    });

    it('combines text and role filters', () => {
        expect(
            filterShareMembers(members, {
                filterText: 'editor',
                selectedRoles: ['editor'],
            }).map((member) => member.id)
        ).toEqual([2, 3]);
    });

    it('detects active filters', () => {
        expect(
            hasActiveShareMemberFilter({
                filterText: '',
                selectedRoles: DEFAULT_SELECTED_MEMBER_ROLES,
            })
        ).toBe(false);
        expect(
            hasActiveShareMemberFilter({
                filterText: 'alice',
                selectedRoles: DEFAULT_SELECTED_MEMBER_ROLES,
            })
        ).toBe(true);
        expect(
            hasActiveShareMemberFilter({
                filterText: '',
                selectedRoles: ['editor'],
            })
        ).toBe(true);
    });

    it('detects active role filters', () => {
        expect(
            isShareMemberRoleFilterActive(DEFAULT_SELECTED_MEMBER_ROLES)
        ).toBe(false);
        expect(isShareMemberRoleFilterActive(['viewer'])).toBe(true);
    });
});
