import type { DiagramComment } from './comment-types';

export type CommentsStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface CommentsState {
    diagramId: string | null;
    byId: Map<number, DiagramComment>;
    status: CommentsStatus;
    error: unknown;
    loadGeneration: number;
}

export type CommentsAction =
    | { type: 'LOAD_STARTED'; diagramId: string; generation: number }
    | {
          type: 'LOAD_SUCCEEDED';
          diagramId: string;
          generation: number;
          comments: DiagramComment[];
      }
    | {
          type: 'LOAD_FAILED';
          diagramId: string;
          generation: number;
          error: unknown;
      }
    | { type: 'COMMENT_UPSERTED'; comment: DiagramComment }
    | { type: 'COMMENT_REMOVED'; commentId: number }
    | { type: 'RESET' };

export const initialCommentsState = (): CommentsState => ({
    diagramId: null,
    byId: new Map(),
    status: 'idle',
    error: null,
    loadGeneration: 0,
});

const isStaleLoad = (
    state: CommentsState,
    diagramId: string,
    generation: number
): boolean =>
    generation !== state.loadGeneration || diagramId !== state.diagramId;

const commentsToMap = (
    comments: DiagramComment[]
): Map<number, DiagramComment> => {
    const byId = new Map<number, DiagramComment>();

    for (const comment of comments) {
        byId.set(comment.id, comment);
    }

    return byId;
};

const isIdleEmptyState = (state: CommentsState): boolean =>
    state.diagramId === null &&
    state.byId.size === 0 &&
    state.status === 'idle' &&
    state.error === null &&
    state.loadGeneration === 0;

export const commentsReducer = (
    state: CommentsState,
    action: CommentsAction
): CommentsState => {
    switch (action.type) {
        case 'LOAD_STARTED':
            return {
                ...state,
                diagramId: action.diagramId,
                status: 'loading',
                error: null,
                loadGeneration: action.generation,
                byId:
                    action.diagramId === state.diagramId
                        ? state.byId
                        : new Map(),
            };

        case 'LOAD_SUCCEEDED': {
            if (isStaleLoad(state, action.diagramId, action.generation)) {
                return state;
            }

            return {
                ...state,
                byId: commentsToMap(action.comments),
                status: 'ready',
                error: null,
            };
        }

        case 'LOAD_FAILED': {
            if (isStaleLoad(state, action.diagramId, action.generation)) {
                return state;
            }

            return {
                ...state,
                status: 'error',
                error: action.error,
            };
        }

        case 'COMMENT_UPSERTED': {
            if (
                state.diagramId === null ||
                String(action.comment.diagramId) !== state.diagramId
            ) {
                return state;
            }

            const byId = new Map(state.byId);
            byId.set(action.comment.id, action.comment);

            return {
                ...state,
                byId,
            };
        }

        case 'COMMENT_REMOVED': {
            if (!state.byId.has(action.commentId)) {
                return state;
            }

            const byId = new Map(state.byId);
            byId.delete(action.commentId);

            return {
                ...state,
                byId,
            };
        }

        case 'RESET':
            if (isIdleEmptyState(state)) {
                return state;
            }

            return initialCommentsState();

        default:
            return state;
    }
};
