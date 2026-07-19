export const COMMENT_TARGET_TYPES = [
    'diagram',
    'table',
    'field',
    'relationship',
] as const;

export type CommentTargetType = (typeof COMMENT_TARGET_TYPES)[number];

export interface CommentAuthor {
    id: number;
    name: string;
}

export interface DiagramComment {
    id: number;
    diagramId: number;
    targetType: CommentTargetType;
    targetId: string | null;
    body: string;
    user: CommentAuthor | null;
    createdAt: string;
    updatedAt: string;
}

export type DiagramCommentTarget =
    | {
          targetType: 'diagram';
          targetId: null;
      }
    | {
          targetType: 'table' | 'field' | 'relationship';
          targetId: string;
      };

export type CreateDiagramCommentInput = DiagramCommentTarget & {
    body: string;
};

export interface UpdateDiagramCommentInput {
    body: string;
}

export type ListDiagramCommentsFilter = DiagramCommentTarget;
