import type { DiagramComment } from '@/lib/comments/comment-types';
import type { DiagramCommentDto } from './diagram-comments';

export const normalizeDiagramCommentFromApi = (
    comment: DiagramCommentDto
): DiagramComment => ({
    id: comment.id,
    diagramId: comment.diagram_id,
    targetType: comment.target_type,
    targetId: comment.target_id,
    body: comment.body,
    user:
        comment.user === null
            ? null
            : {
                  id: comment.user.id,
                  name: comment.user.name,
              },
    createdAt: comment.created_at,
    updatedAt: comment.updated_at,
});
