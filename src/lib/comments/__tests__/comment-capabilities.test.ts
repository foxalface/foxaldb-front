import { describe, expect, it } from 'vitest';
import type { DiagramAccess } from '@/lib/api/diagrams';
import type { CommentAuthor } from '@/lib/comments/comment-types';
import { getCommentCapabilities } from '../comment-capabilities';

const author = (id: number): CommentAuthor => ({ id, name: `User ${id}` });

const access = (
    partial: Partial<DiagramAccess> & Pick<DiagramAccess, 'role'>
): DiagramAccess => ({
    can_edit: partial.can_edit ?? partial.role !== 'viewer',
    can_manage_members: partial.can_manage_members ?? partial.role === 'owner',
    role: partial.role,
});

const caps = (input: {
    user: CommentAuthor | null;
    currentUserId: number | null | undefined;
    diagramAccess: DiagramAccess | null | undefined;
}) =>
    getCommentCapabilities({
        comment: { user: input.user },
        currentUserId: input.currentUserId,
        diagramAccess: input.diagramAccess,
    });

describe('getCommentCapabilities', () => {
    it('allows owner to edit and delete their own comment', () => {
        expect(
            caps({
                user: author(1),
                currentUserId: 1,
                diagramAccess: access({ role: 'owner', can_edit: true }),
            })
        ).toEqual({ canEdit: true, canDelete: true, hasActions: true });
    });

    it('allows owner to delete but not edit another user comment', () => {
        expect(
            caps({
                user: author(2),
                currentUserId: 1,
                diagramAccess: access({ role: 'owner', can_edit: true }),
            })
        ).toEqual({ canEdit: false, canDelete: true, hasActions: true });
    });

    it('allows owner to delete but not edit a deleted-author comment', () => {
        expect(
            caps({
                user: null,
                currentUserId: 1,
                diagramAccess: access({ role: 'owner', can_edit: true }),
            })
        ).toEqual({ canEdit: false, canDelete: true, hasActions: true });
    });

    it('allows editor to edit and delete their own comment', () => {
        expect(
            caps({
                user: author(2),
                currentUserId: 2,
                diagramAccess: access({ role: 'editor', can_edit: true }),
            })
        ).toEqual({ canEdit: true, canDelete: true, hasActions: true });
    });

    it('denies editor edit and delete on another user comment', () => {
        expect(
            caps({
                user: author(1),
                currentUserId: 2,
                diagramAccess: access({ role: 'editor', can_edit: true }),
            })
        ).toEqual({ canEdit: false, canDelete: false, hasActions: false });
    });

    it('denies editor edit and delete on a deleted-author comment', () => {
        expect(
            caps({
                user: null,
                currentUserId: 2,
                diagramAccess: access({ role: 'editor', can_edit: true }),
            })
        ).toEqual({ canEdit: false, canDelete: false, hasActions: false });
    });

    it('denies viewer all actions even on their own comment', () => {
        expect(
            caps({
                user: author(3),
                currentUserId: 3,
                diagramAccess: access({ role: 'viewer', can_edit: false }),
            })
        ).toEqual({ canEdit: false, canDelete: false, hasActions: false });
    });

    it('denies all actions when access is null', () => {
        expect(
            caps({
                user: author(1),
                currentUserId: 1,
                diagramAccess: null,
            })
        ).toEqual({ canEdit: false, canDelete: false, hasActions: false });
    });

    it('denies all actions when access is undefined', () => {
        expect(
            caps({
                user: author(1),
                currentUserId: 1,
                diagramAccess: undefined,
            })
        ).toEqual({ canEdit: false, canDelete: false, hasActions: false });
    });

    it('denies all actions when current user is missing', () => {
        expect(
            caps({
                user: author(1),
                currentUserId: null,
                diagramAccess: access({ role: 'owner', can_edit: true }),
            })
        ).toEqual({ canEdit: false, canDelete: false, hasActions: false });

        expect(
            caps({
                user: author(1),
                currentUserId: undefined,
                diagramAccess: access({ role: 'editor', can_edit: true }),
            })
        ).toEqual({ canEdit: false, canDelete: false, hasActions: false });
    });

    it('denies edit when comment user is missing (deleted author)', () => {
        expect(
            caps({
                user: null,
                currentUserId: 1,
                diagramAccess: access({ role: 'editor', can_edit: true }),
            }).canEdit
        ).toBe(false);
    });

    it('denies edit and delete when IDs match but can_edit is false', () => {
        expect(
            caps({
                user: author(1),
                currentUserId: 1,
                diagramAccess: access({ role: 'viewer', can_edit: false }),
            })
        ).toEqual({ canEdit: false, canDelete: false, hasActions: false });

        expect(
            caps({
                user: author(1),
                currentUserId: 1,
                diagramAccess: {
                    role: 'editor',
                    can_edit: false,
                    can_manage_members: false,
                },
            })
        ).toEqual({ canEdit: false, canDelete: false, hasActions: false });
    });

    it('allows owner delete without edit when can_edit is false', () => {
        expect(
            caps({
                user: author(2),
                currentUserId: 1,
                diagramAccess: {
                    role: 'owner',
                    can_edit: false,
                    can_manage_members: true,
                },
            })
        ).toEqual({ canEdit: false, canDelete: true, hasActions: true });

        expect(
            caps({
                user: null,
                currentUserId: 1,
                diagramAccess: {
                    role: 'owner',
                    can_edit: false,
                    can_manage_members: true,
                },
            })
        ).toEqual({ canEdit: false, canDelete: true, hasActions: true });
    });
});
