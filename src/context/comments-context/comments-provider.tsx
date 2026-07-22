import React, {
    useCallback,
    useEffect,
    useMemo,
    useReducer,
    useRef,
} from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useChartDB } from '@/hooks/use-chartdb';
import { useRealtime } from '@/hooks/use-realtime';
import {
    createDiagramComment,
    deleteDiagramComment,
    listDiagramComments,
    updateDiagramComment,
} from '@/lib/api/diagram-comments';
import {
    commentsReducer,
    initialCommentsState,
} from '@/lib/comments/comment-reducer';
import { selectAllComments } from '@/lib/comments/comment-selectors';
import type {
    CreateDiagramCommentInput,
    DiagramComment,
    UpdateDiagramCommentInput,
} from '@/lib/comments/comment-types';
import { subscribeToDiagramCommentEvents } from '@/lib/realtime/comment-subscriber';
import { isValidBackendDiagramId } from '@/lib/realtime/diagram-id';
import {
    CommentsAvailabilityContext,
    CommentsContext,
    createCommentsInactiveError,
    type CommentsContextValue,
} from './comments-context';
import {
    adoptCommentSubscription,
    clearActiveCommentSubscription,
    type ActiveCommentSubscription,
} from './comment-subscription-owner';

export const CommentsProvider: React.FC<React.PropsWithChildren> = ({
    children,
}) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const { currentDiagram } = useChartDB();
    const {
        currentDiagramId: realtimeCurrentDiagramId,
        getDiagramPrivateChannel,
        onReconnect,
    } = useRealtime();
    const [state, dispatch] = useReducer(
        commentsReducer,
        undefined,
        initialCommentsState
    );

    const loadGenerationRef = useRef(0);
    const scopeDiagramIdRef = useRef<string | null>(null);
    const activeCommentSubscriptionRef =
        useRef<ActiveCommentSubscription | null>(null);
    const getDiagramPrivateChannelRef = useRef(getDiagramPrivateChannel);
    const realtimeCurrentDiagramIdRef = useRef(realtimeCurrentDiagramId);

    getDiagramPrivateChannelRef.current = getDiagramPrivateChannel;
    realtimeCurrentDiagramIdRef.current = realtimeCurrentDiagramId;

    const diagramId =
        currentDiagram !== null &&
        currentDiagram !== undefined &&
        isValidBackendDiagramId(currentDiagram.id)
            ? String(currentDiagram.id)
            : null;

    const isActive =
        !isLoading && isAuthenticated && user !== null && diagramId !== null;

    scopeDiagramIdRef.current = isActive ? diagramId : null;

    // Intentionally depend on byId only so status/error/generation changes
    // that retain the same Map keep a stable comments array reference.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- state.byId
    const comments = useMemo(() => selectAllComments(state), [state.byId]);

    const clearCommentSubscription = useCallback((): void => {
        clearActiveCommentSubscription(activeCommentSubscriptionRef);
    }, []);

    const replaceCommentSubscription = useCallback((): (() => void) | null => {
        clearCommentSubscription();

        const targetDiagramId = scopeDiagramIdRef.current;
        if (targetDiagramId === null) {
            return null;
        }

        if (realtimeCurrentDiagramIdRef.current !== targetDiagramId) {
            return null;
        }

        const channel = getDiagramPrivateChannelRef.current();
        if (channel === null) {
            return null;
        }

        const cleanup = subscribeToDiagramCommentEvents({
            channel,
            diagramId: targetDiagramId,
            dispatch,
        });

        return adoptCommentSubscription(activeCommentSubscriptionRef, cleanup);
    }, [clearCommentSubscription]);

    const loadComments = useCallback(
        async (targetDiagramId: string): Promise<void> => {
            const generation = ++loadGenerationRef.current;
            dispatch({
                type: 'LOAD_STARTED',
                diagramId: targetDiagramId,
                generation,
            });

            try {
                const loaded = await listDiagramComments(targetDiagramId);

                if (loadGenerationRef.current !== generation) {
                    return;
                }

                dispatch({
                    type: 'LOAD_SUCCEEDED',
                    diagramId: targetDiagramId,
                    generation,
                    comments: loaded,
                });
            } catch (error) {
                if (loadGenerationRef.current !== generation) {
                    throw error;
                }

                dispatch({
                    type: 'LOAD_FAILED',
                    diagramId: targetDiagramId,
                    generation,
                    error,
                });
                throw error;
            }
        },
        []
    );

    useEffect(() => {
        if (!isActive || diagramId === null) {
            loadGenerationRef.current += 1;
            dispatch({ type: 'RESET' });
            return;
        }

        void loadComments(diagramId).catch(() => {
            // Load errors are stored via LOAD_FAILED; callers use reload().
        });

        return () => {
            loadGenerationRef.current += 1;
        };
    }, [isActive, diagramId, loadComments]);

    useEffect(() => {
        if (!isActive || diagramId === null) {
            clearCommentSubscription();
            return;
        }

        const releaseOwnedSubscription = replaceCommentSubscription();

        return () => {
            releaseOwnedSubscription?.();
        };
    }, [
        isActive,
        diagramId,
        realtimeCurrentDiagramId,
        clearCommentSubscription,
        replaceCommentSubscription,
    ]);

    // Final unmount must clear the current subscription even when reconnect
    // replaced the subscription owned by the last active effect setup.
    useEffect(() => {
        return () => {
            clearCommentSubscription();
        };
    }, [clearCommentSubscription]);

    const reload = useCallback(async (): Promise<void> => {
        const targetDiagramId = scopeDiagramIdRef.current;
        if (targetDiagramId === null) {
            return;
        }

        await loadComments(targetDiagramId);
    }, [loadComments]);

    const reloadRef = useRef(reload);
    reloadRef.current = reload;

    const replaceCommentSubscriptionRef = useRef(replaceCommentSubscription);
    replaceCommentSubscriptionRef.current = replaceCommentSubscription;

    useEffect(() => {
        if (!isActive) {
            return;
        }

        return onReconnect(() => {
            try {
                replaceCommentSubscriptionRef.current();
            } catch (error) {
                console.warn(
                    '[Comments] Failed to restore realtime comment subscription after reconnect',
                    error
                );
            } finally {
                if (scopeDiagramIdRef.current !== null) {
                    void reloadRef.current().catch(() => {
                        // LOAD_FAILED already stores the error.
                    });
                }
            }
        });
    }, [isActive, onReconnect]);

    const createComment = useCallback(
        async (input: CreateDiagramCommentInput): Promise<DiagramComment> => {
            const targetDiagramId = scopeDiagramIdRef.current;
            if (targetDiagramId === null) {
                return Promise.reject(createCommentsInactiveError());
            }

            const comment = await createDiagramComment(targetDiagramId, input);

            if (scopeDiagramIdRef.current === targetDiagramId) {
                dispatch({ type: 'COMMENT_UPSERTED', comment });
            }

            return comment;
        },
        []
    );

    const updateComment = useCallback(
        async (
            commentId: number,
            input: UpdateDiagramCommentInput
        ): Promise<DiagramComment> => {
            const targetDiagramId = scopeDiagramIdRef.current;
            if (targetDiagramId === null) {
                return Promise.reject(createCommentsInactiveError());
            }

            const comment = await updateDiagramComment(
                targetDiagramId,
                commentId,
                input
            );

            if (scopeDiagramIdRef.current === targetDiagramId) {
                dispatch({ type: 'COMMENT_UPSERTED', comment });
            }

            return comment;
        },
        []
    );

    const deleteComment = useCallback(
        async (commentId: number): Promise<void> => {
            const targetDiagramId = scopeDiagramIdRef.current;
            if (targetDiagramId === null) {
                return Promise.reject(createCommentsInactiveError());
            }

            await deleteDiagramComment(targetDiagramId, commentId);

            if (scopeDiagramIdRef.current === targetDiagramId) {
                dispatch({ type: 'COMMENT_REMOVED', commentId });
            }
        },
        []
    );

    const value = useMemo<CommentsContextValue>(
        () => ({
            comments,
            status: state.status,
            error: state.error,
            isActive,
            diagramId: isActive ? diagramId : null,
            reload,
            createComment,
            updateComment,
            deleteComment,
        }),
        [
            comments,
            state.status,
            state.error,
            isActive,
            diagramId,
            reload,
            createComment,
            updateComment,
            deleteComment,
        ]
    );

    return (
        <CommentsAvailabilityContext.Provider value={isActive}>
            <CommentsContext.Provider value={value}>
                {children}
            </CommentsContext.Provider>
        </CommentsAvailabilityContext.Provider>
    );
};
