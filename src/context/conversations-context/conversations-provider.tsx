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
    archiveDiagramConversation,
    createConversationMessage,
    deleteConversationMessage,
    deleteDiagramConversation,
    findOrCreateDiagramConversation,
    getDiagramConversation,
    listConversationMessages,
    listDiagramConversations,
    reopenDiagramConversation,
    updateConversationMessage,
} from '@/lib/api/diagram-conversations';
import {
    conversationsReducer,
    initialConversationsState,
} from '@/lib/conversations/conversation-reducer';
import {
    selectActiveConversations,
    selectArchivedConversations,
    selectMessagesErrorForConversation,
    selectMessagesForConversation,
    selectMessagesNextCursorForConversation,
    selectMessagesStatusForConversation,
} from '@/lib/conversations/conversation-selectors';
import { selectConversationIndicatorIndex } from '@/lib/conversations/conversation-indicators';
import type {
    CreateConversationMessageInput,
    DiagramConversation,
    DiagramConversationMessage,
    FindOrCreateDiagramConversationInput,
    UpdateConversationMessageInput,
} from '@/lib/conversations/conversation-types';
import { subscribeToDiagramConversationEvents } from '@/lib/realtime/conversation-subscriber';
import { isValidBackendDiagramId } from '@/lib/realtime/diagram-id';
import {
    adoptConversationSubscription,
    clearActiveConversationSubscription,
    type ActiveConversationSubscription,
} from './conversation-subscription-owner';
import {
    ConversationsAvailabilityContext,
    ConversationsContext,
    createConversationsInactiveError,
    type ConversationsContextValue,
} from './conversations-context';
import { ConversationIndicatorsContext } from './conversation-indicators-context';

export const ConversationsProvider: React.FC<React.PropsWithChildren> = ({
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
        conversationsReducer,
        undefined,
        initialConversationsState
    );

    const summariesLoadGenerationRef = useRef(0);
    const messagesLoadGenerationRef = useRef<Map<number, number>>(new Map());
    const scopeDiagramIdRef = useRef<string | null>(null);
    const activeConversationSubscriptionRef =
        useRef<ActiveConversationSubscription | null>(null);
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

    const summariesById = state.summariesById;

    const activeConversations = useMemo(
        () => selectActiveConversations(summariesById),
        [summariesById]
    );

    const archivedConversations = useMemo(
        () => selectArchivedConversations(summariesById),
        [summariesById]
    );

    const indicatorIndex = useMemo(
        () => selectConversationIndicatorIndex(state),
        [state]
    );

    const clearConversationSubscription = useCallback((): void => {
        clearActiveConversationSubscription(activeConversationSubscriptionRef);
    }, []);

    const replaceConversationSubscription = useCallback(():
        | (() => void)
        | null => {
        clearConversationSubscription();

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

        const cleanup = subscribeToDiagramConversationEvents({
            channel,
            diagramId: targetDiagramId,
            dispatch,
        });

        return adoptConversationSubscription(
            activeConversationSubscriptionRef,
            cleanup
        );
    }, [clearConversationSubscription]);

    const loadActiveSummaries = useCallback(
        async (
            targetDiagramId: string,
            options?: { append?: boolean; cursor?: string }
        ): Promise<void> => {
            const generation = ++summariesLoadGenerationRef.current;
            dispatch({
                type: 'SUMMARIES_LOAD_STARTED',
                diagramId: targetDiagramId,
                generation,
                append: options?.append === true,
            });

            try {
                const loaded = await listDiagramConversations(targetDiagramId, {
                    status: 'active',
                    cursor: options?.cursor,
                });

                if (summariesLoadGenerationRef.current !== generation) {
                    return;
                }

                dispatch({
                    type: 'SUMMARIES_LOAD_SUCCEEDED',
                    diagramId: targetDiagramId,
                    generation,
                    conversations: loaded.data,
                    status: 'active',
                    nextCursor: loaded.nextCursor,
                    append: options?.append === true,
                });
            } catch (error) {
                if (summariesLoadGenerationRef.current !== generation) {
                    throw error;
                }

                dispatch({
                    type: 'SUMMARIES_LOAD_FAILED',
                    diagramId: targetDiagramId,
                    generation,
                    error,
                });
                throw error;
            }
        },
        []
    );

    const loadArchivedSummaries = useCallback(
        async (options?: {
            append?: boolean;
            cursor?: string;
        }): Promise<void> => {
            const targetDiagramId = scopeDiagramIdRef.current;
            if (targetDiagramId === null) {
                return;
            }

            const generation = ++summariesLoadGenerationRef.current;
            dispatch({
                type: 'SUMMARIES_LOAD_STARTED',
                diagramId: targetDiagramId,
                generation,
                append: true,
            });

            try {
                const loaded = await listDiagramConversations(targetDiagramId, {
                    status: 'archived',
                    cursor: options?.cursor,
                });

                if (summariesLoadGenerationRef.current !== generation) {
                    return;
                }

                dispatch({
                    type: 'SUMMARIES_LOAD_SUCCEEDED',
                    diagramId: targetDiagramId,
                    generation,
                    conversations: loaded.data,
                    status: 'archived',
                    nextCursor: loaded.nextCursor,
                    append: options?.append === true,
                });
            } catch (error) {
                if (summariesLoadGenerationRef.current !== generation) {
                    throw error;
                }

                dispatch({
                    type: 'SUMMARIES_LOAD_FAILED',
                    diagramId: targetDiagramId,
                    generation,
                    error,
                });
                throw error;
            }
        },
        []
    );

    const loadMessages = useCallback(
        async (conversationId: number): Promise<void> => {
            const targetDiagramId = scopeDiagramIdRef.current;
            if (targetDiagramId === null) {
                return;
            }

            const currentGeneration =
                messagesLoadGenerationRef.current.get(conversationId) ?? 0;
            const generation = currentGeneration + 1;
            messagesLoadGenerationRef.current.set(conversationId, generation);

            dispatch({
                type: 'MESSAGES_LOAD_STARTED',
                conversationId,
                generation,
            });

            try {
                const loaded = await listConversationMessages(
                    targetDiagramId,
                    conversationId
                );

                if (
                    messagesLoadGenerationRef.current.get(conversationId) !==
                    generation
                ) {
                    return;
                }

                dispatch({
                    type: 'MESSAGES_LOAD_SUCCEEDED',
                    conversationId,
                    generation,
                    messages: loaded.data,
                    nextCursor: loaded.nextCursor,
                    append: false,
                });
            } catch (error) {
                if (
                    messagesLoadGenerationRef.current.get(conversationId) !==
                    generation
                ) {
                    throw error;
                }

                dispatch({
                    type: 'MESSAGES_LOAD_FAILED',
                    conversationId,
                    generation,
                    error,
                });
                throw error;
            }
        },
        []
    );

    const loadMoreMessages = useCallback(
        async (conversationId: number): Promise<void> => {
            const targetDiagramId = scopeDiagramIdRef.current;
            if (targetDiagramId === null) {
                return;
            }

            const nextCursor =
                state.messagesByConversationId.get(conversationId)?.nextCursor;

            if (nextCursor === null || nextCursor === undefined) {
                return;
            }

            const currentGeneration =
                messagesLoadGenerationRef.current.get(conversationId) ?? 0;
            const generation = currentGeneration + 1;
            messagesLoadGenerationRef.current.set(conversationId, generation);

            dispatch({
                type: 'MESSAGES_LOAD_STARTED',
                conversationId,
                generation,
                append: true,
            });

            try {
                const loaded = await listConversationMessages(
                    targetDiagramId,
                    conversationId,
                    {
                        cursor: nextCursor,
                        direction: 'older',
                    }
                );

                if (
                    messagesLoadGenerationRef.current.get(conversationId) !==
                    generation
                ) {
                    return;
                }

                dispatch({
                    type: 'MESSAGES_LOAD_SUCCEEDED',
                    conversationId,
                    generation,
                    messages: loaded.data,
                    nextCursor: loaded.nextCursor,
                    append: true,
                });
            } catch (error) {
                if (
                    messagesLoadGenerationRef.current.get(conversationId) !==
                    generation
                ) {
                    throw error;
                }

                dispatch({
                    type: 'MESSAGES_LOAD_FAILED',
                    conversationId,
                    generation,
                    error,
                });
                throw error;
            }
        },
        [state.messagesByConversationId]
    );

    useEffect(() => {
        if (!isActive || diagramId === null) {
            summariesLoadGenerationRef.current += 1;
            messagesLoadGenerationRef.current = new Map();
            dispatch({ type: 'RESET' });
            return;
        }

        void loadActiveSummaries(diagramId).catch(() => {
            // Load errors are stored via SUMMARIES_LOAD_FAILED.
        });

        return () => {
            summariesLoadGenerationRef.current += 1;
            messagesLoadGenerationRef.current = new Map();
        };
    }, [isActive, diagramId, loadActiveSummaries]);

    useEffect(() => {
        if (!isActive || diagramId === null) {
            clearConversationSubscription();
            return;
        }

        const releaseOwnedSubscription = replaceConversationSubscription();

        return () => {
            releaseOwnedSubscription?.();
        };
    }, [
        isActive,
        diagramId,
        realtimeCurrentDiagramId,
        clearConversationSubscription,
        replaceConversationSubscription,
    ]);

    useEffect(() => {
        return () => {
            clearConversationSubscription();
        };
    }, [clearConversationSubscription]);

    const reload = useCallback(async (): Promise<void> => {
        const targetDiagramId = scopeDiagramIdRef.current;
        if (targetDiagramId === null) {
            return;
        }

        await loadActiveSummaries(targetDiagramId);
    }, [loadActiveSummaries]);

    const reloadRef = useRef(reload);
    reloadRef.current = reload;

    const replaceConversationSubscriptionRef = useRef(
        replaceConversationSubscription
    );
    replaceConversationSubscriptionRef.current =
        replaceConversationSubscription;

    useEffect(() => {
        if (!isActive) {
            return;
        }

        return onReconnect(() => {
            try {
                replaceConversationSubscriptionRef.current();
            } catch (error) {
                console.warn(
                    '[Conversations] Failed to restore realtime conversation subscription after reconnect',
                    error
                );
            } finally {
                if (scopeDiagramIdRef.current !== null) {
                    void reloadRef.current().catch(() => {
                        // SUMMARIES_LOAD_FAILED already stores the error.
                    });
                }
            }
        });
    }, [isActive, onReconnect]);

    const loadMoreActiveSummaries = useCallback(async (): Promise<void> => {
        const targetDiagramId = scopeDiagramIdRef.current;
        if (
            targetDiagramId === null ||
            state.activeSummariesNextCursor === null
        ) {
            return;
        }

        await loadActiveSummaries(targetDiagramId, {
            append: true,
            cursor: state.activeSummariesNextCursor,
        });
    }, [loadActiveSummaries, state.activeSummariesNextCursor]);

    const loadMoreArchivedSummaries = useCallback(async (): Promise<void> => {
        const targetDiagramId = scopeDiagramIdRef.current;
        if (
            targetDiagramId === null ||
            state.archivedSummariesNextCursor === null
        ) {
            return;
        }

        await loadArchivedSummaries({
            append: true,
            cursor: state.archivedSummariesNextCursor,
        });
    }, [loadArchivedSummaries, state.archivedSummariesNextCursor]);

    const findOrCreateConversation = useCallback(
        async (
            input: FindOrCreateDiagramConversationInput
        ): Promise<DiagramConversation> => {
            const targetDiagramId = scopeDiagramIdRef.current;
            if (targetDiagramId === null) {
                return Promise.reject(createConversationsInactiveError());
            }

            const conversation = await findOrCreateDiagramConversation(
                targetDiagramId,
                input
            );

            if (scopeDiagramIdRef.current === targetDiagramId) {
                dispatch({
                    type: 'CONVERSATION_UPSERTED',
                    conversation,
                });
            }

            return conversation;
        },
        []
    );

    const archiveConversation = useCallback(
        async (conversationId: number): Promise<DiagramConversation> => {
            const targetDiagramId = scopeDiagramIdRef.current;
            if (targetDiagramId === null) {
                return Promise.reject(createConversationsInactiveError());
            }

            const conversation = await archiveDiagramConversation(
                targetDiagramId,
                conversationId
            );

            if (scopeDiagramIdRef.current === targetDiagramId) {
                dispatch({
                    type: 'CONVERSATION_UPSERTED',
                    conversation,
                });
            }

            return conversation;
        },
        []
    );

    const reopenConversation = useCallback(
        async (conversationId: number): Promise<DiagramConversation> => {
            const targetDiagramId = scopeDiagramIdRef.current;
            if (targetDiagramId === null) {
                return Promise.reject(createConversationsInactiveError());
            }

            const conversation = await reopenDiagramConversation(
                targetDiagramId,
                conversationId
            );

            if (scopeDiagramIdRef.current === targetDiagramId) {
                dispatch({
                    type: 'CONVERSATION_UPSERTED',
                    conversation,
                });
            }

            return conversation;
        },
        []
    );

    const deleteConversation = useCallback(
        async (conversationId: number): Promise<void> => {
            const targetDiagramId = scopeDiagramIdRef.current;
            if (targetDiagramId === null) {
                return Promise.reject(createConversationsInactiveError());
            }

            await deleteDiagramConversation(targetDiagramId, conversationId);

            if (scopeDiagramIdRef.current === targetDiagramId) {
                dispatch({
                    type: 'CONVERSATION_REMOVED',
                    conversationId,
                });
            }
        },
        []
    );

    const createMessage = useCallback(
        async (
            conversationId: number,
            input: CreateConversationMessageInput
        ): Promise<DiagramConversationMessage> => {
            const targetDiagramId = scopeDiagramIdRef.current;
            if (targetDiagramId === null) {
                return Promise.reject(createConversationsInactiveError());
            }

            const result = await createConversationMessage(
                targetDiagramId,
                conversationId,
                input
            );

            if (scopeDiagramIdRef.current === targetDiagramId) {
                dispatch({
                    type: 'CONVERSATION_UPSERTED',
                    conversation: result.conversation,
                });
                dispatch({
                    type: 'MESSAGE_UPSERTED',
                    message: result.message,
                });
            }

            return result.message;
        },
        []
    );

    const updateMessage = useCallback(
        async (
            conversationId: number,
            messageId: number,
            input: UpdateConversationMessageInput
        ): Promise<DiagramConversationMessage> => {
            const targetDiagramId = scopeDiagramIdRef.current;
            if (targetDiagramId === null) {
                return Promise.reject(createConversationsInactiveError());
            }

            const result = await updateConversationMessage(
                targetDiagramId,
                conversationId,
                messageId,
                input
            );

            if (scopeDiagramIdRef.current === targetDiagramId) {
                dispatch({
                    type: 'CONVERSATION_UPSERTED',
                    conversation: result.conversation,
                });
                dispatch({
                    type: 'MESSAGE_UPSERTED',
                    message: result.message,
                });
            }

            return result.message;
        },
        []
    );

    const deleteMessage = useCallback(
        async (conversationId: number, messageId: number): Promise<void> => {
            const targetDiagramId = scopeDiagramIdRef.current;
            if (targetDiagramId === null) {
                return Promise.reject(createConversationsInactiveError());
            }

            await deleteConversationMessage(
                targetDiagramId,
                conversationId,
                messageId
            );

            if (scopeDiagramIdRef.current === targetDiagramId) {
                const conversation = await getDiagramConversation(
                    targetDiagramId,
                    conversationId
                );

                dispatch({
                    type: 'CONVERSATION_UPSERTED',
                    conversation,
                });
                dispatch({
                    type: 'MESSAGE_REMOVED',
                    conversationId,
                    messageId,
                });
            }
        },
        []
    );

    const getMessages = useCallback(
        (conversationId: number) =>
            selectMessagesForConversation(state, conversationId),
        [state]
    );

    const getMessagesStatus = useCallback(
        (conversationId: number) =>
            selectMessagesStatusForConversation(state, conversationId),
        [state]
    );

    const getMessagesError = useCallback(
        (conversationId: number) =>
            selectMessagesErrorForConversation(state, conversationId),
        [state]
    );

    const getMessagesNextCursor = useCallback(
        (conversationId: number) =>
            selectMessagesNextCursorForConversation(state, conversationId),
        [state]
    );

    const value = useMemo<ConversationsContextValue>(
        () => ({
            activeConversations,
            archivedConversations,
            status: state.summariesStatus,
            error: state.summariesError,
            isActive,
            diagramId: isActive ? diagramId : null,
            activeSummariesNextCursor: state.activeSummariesNextCursor,
            archivedSummariesNextCursor: state.archivedSummariesNextCursor,
            reload,
            loadArchivedSummaries,
            loadMoreActiveSummaries,
            loadMoreArchivedSummaries,
            loadMessages,
            loadMoreMessages,
            getMessages,
            getMessagesStatus,
            getMessagesError,
            getMessagesNextCursor,
            findOrCreateConversation,
            archiveConversation,
            reopenConversation,
            deleteConversation,
            createMessage,
            updateMessage,
            deleteMessage,
        }),
        [
            activeConversations,
            archivedConversations,
            state.summariesStatus,
            state.summariesError,
            state.activeSummariesNextCursor,
            state.archivedSummariesNextCursor,
            isActive,
            diagramId,
            reload,
            loadArchivedSummaries,
            loadMoreActiveSummaries,
            loadMoreArchivedSummaries,
            loadMessages,
            loadMoreMessages,
            getMessages,
            getMessagesStatus,
            getMessagesError,
            getMessagesNextCursor,
            findOrCreateConversation,
            archiveConversation,
            reopenConversation,
            deleteConversation,
            createMessage,
            updateMessage,
            deleteMessage,
        ]
    );

    return (
        <ConversationsAvailabilityContext.Provider value={isActive}>
            <ConversationIndicatorsContext.Provider value={indicatorIndex}>
                <ConversationsContext.Provider value={value}>
                    {children}
                </ConversationsContext.Provider>
            </ConversationIndicatorsContext.Provider>
        </ConversationsAvailabilityContext.Provider>
    );
};
