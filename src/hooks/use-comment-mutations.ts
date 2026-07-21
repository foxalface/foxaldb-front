import { useContext } from 'react';
import {
    CommentsContext,
    INACTIVE_COMMENTS_CONTEXT,
} from '@/context/comments-context/comments-context';
import type {
    CreateDiagramCommentInput,
    DiagramComment,
    UpdateDiagramCommentInput,
} from '@/lib/comments/comment-types';

export interface UseCommentMutationsResult {
    createComment: (
        input: CreateDiagramCommentInput
    ) => Promise<DiagramComment>;
    updateComment: (
        commentId: number,
        input: UpdateDiagramCommentInput
    ) => Promise<DiagramComment>;
    deleteComment: (commentId: number) => Promise<void>;
}

export const useCommentMutations = (): UseCommentMutationsResult => {
    const context = useContext(CommentsContext);
    const value = context ?? INACTIVE_COMMENTS_CONTEXT;

    return {
        createComment: value.createComment,
        updateComment: value.updateComment,
        deleteComment: value.deleteComment,
    };
};
