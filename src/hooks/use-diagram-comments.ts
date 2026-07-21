import { useContext } from 'react';
import {
    CommentsContext,
    INACTIVE_COMMENTS_CONTEXT,
} from '@/context/comments-context/comments-context';
import type { CommentsStatus } from '@/lib/comments/comment-reducer';
import type { DiagramComment } from '@/lib/comments/comment-types';

export interface UseDiagramCommentsResult {
    comments: ReadonlyArray<DiagramComment>;
    status: CommentsStatus;
    error: unknown;
    isActive: boolean;
    diagramId: string | null;
    reload: () => Promise<void>;
}

export const useDiagramComments = (): UseDiagramCommentsResult => {
    const context = useContext(CommentsContext);
    const value = context ?? INACTIVE_COMMENTS_CONTEXT;

    return {
        comments: value.comments,
        status: value.status,
        error: value.error,
        isActive: value.isActive,
        diagramId: value.diagramId,
        reload: value.reload,
    };
};
