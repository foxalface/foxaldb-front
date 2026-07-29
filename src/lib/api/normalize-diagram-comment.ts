import type { DiagramComment } from '@/lib/comments/comment-types';
import type { DiagramCommentDto } from './diagram-comments';
import { parseUserIdentityFromHttp } from '@/lib/user';

export const normalizeDiagramCommentFromApi = (
    comment: DiagramCommentDto
): DiagramComment => ({
    id: comment.id,
    diagramId: comment.diagram_id,
    targetType: comment.target_type,
    targetId: comment.target_id,
    body: comment.body,
    user:
        comment.user === null ? null : parseUserIdentityFromHttp(comment.user),
    createdAt: comment.created_at,
    updatedAt: comment.updated_at,
});
