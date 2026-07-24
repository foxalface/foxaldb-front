import type { DiagramAccess } from '@/lib/api/diagrams';
import type { DiagramComment } from '@/lib/comments/comment-types';

export interface CommentCapabilitiesInput {
    comment: Pick<DiagramComment, 'user'>;
    currentUserId: number | null | undefined;
    diagramAccess: DiagramAccess | null | undefined;
}

export interface CommentCapabilities {
    canEdit: boolean;
    canDelete: boolean;
    hasActions: boolean;
}

/**
 * Mirrors backend DiagramCommentPolicy for UX only.
 * Not an authorization boundary — the API remains authoritative.
 *
 * `hasActions` is true when the current user can edit and/or delete the
 * comment. UI surfaces should still gate individual menu items on `canEdit`
 * and `canDelete` rather than showing actions the user cannot perform.
 */
export const getCommentCapabilities = (
    input: CommentCapabilitiesInput
): CommentCapabilities => {
    const { comment, currentUserId, diagramAccess } = input;

    if (currentUserId == null || diagramAccess == null) {
        return { canEdit: false, canDelete: false, hasActions: false };
    }

    const isOwner = diagramAccess.role === 'owner';
    const canEditDiagram = diagramAccess.can_edit === true;
    const authorId = comment.user?.id ?? null;
    const isAuthor = authorId !== null && authorId === currentUserId;

    const canEdit = isAuthor && canEditDiagram;

    const canDelete = isOwner || (isAuthor && canEditDiagram);

    return {
        canEdit,
        canDelete,
        hasActions: canEdit || canDelete,
    };
};
