import { createContext } from 'react';
import type {
    CreateDiagramCommentInput,
    DiagramComment,
    UpdateDiagramCommentInput,
} from '@/lib/comments/comment-types';
import type { CommentsStatus } from '@/lib/comments/comment-reducer';
import { EMPTY_COMMENTS } from '@/lib/comments/comment-selectors';

export interface CommentsContextValue {
    comments: ReadonlyArray<DiagramComment>;
    status: CommentsStatus;
    error: unknown;
    isActive: boolean;
    diagramId: string | null;
    reload: () => Promise<void>;
    createComment: (
        input: CreateDiagramCommentInput
    ) => Promise<DiagramComment>;
    updateComment: (
        commentId: number,
        input: UpdateDiagramCommentInput
    ) => Promise<DiagramComment>;
    deleteComment: (commentId: number) => Promise<void>;
}

/** Internal developer error — not user-facing copy. Fresh instance per call. */
export const createCommentsInactiveError = (): Error =>
    new Error('Diagram comments are not active');

const inactiveReload = (): Promise<void> => Promise.resolve();

const inactiveCreateComment: CommentsContextValue['createComment'] = () =>
    Promise.reject(createCommentsInactiveError());

const inactiveUpdateComment: CommentsContextValue['updateComment'] = () =>
    Promise.reject(createCommentsInactiveError());

const inactiveDeleteComment: CommentsContextValue['deleteComment'] = () =>
    Promise.reject(createCommentsInactiveError());

export const INACTIVE_COMMENTS_CONTEXT: CommentsContextValue = {
    comments: EMPTY_COMMENTS,
    status: 'idle',
    error: null,
    isActive: false,
    diagramId: null,
    reload: inactiveReload,
    createComment: inactiveCreateComment,
    updateComment: inactiveUpdateComment,
    deleteComment: inactiveDeleteComment,
};

export const CommentsContext = createContext<CommentsContextValue | null>(null);
