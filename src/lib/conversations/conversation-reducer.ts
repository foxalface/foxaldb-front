import type {
    DiagramConversation,
    DiagramConversationMessage,
    ConversationReactionAggregate,
} from './conversation-types';
import {
    nextReadBoundary,
    nextUnreadIncrementHighWaterMark,
    shouldApplyReadReconciliation,
    shouldIncrementUnreadForMessage,
} from './conversation-read-sync';
import {
    reconcileConversationReactionAggregates,
    type ConversationReactionAggregateWithoutOwnership,
} from './conversation-reaction-reconcile';

export type ConversationsStatus = 'idle' | 'loading' | 'ready' | 'error';

export type ConversationMessagesStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface ConversationMessagesSlice {
    byId: Map<number, DiagramConversationMessage>;
    status: ConversationMessagesStatus;
    error: unknown;
    loadGeneration: number;
    nextCursor: string | null;
}

export interface ConversationsState {
    diagramId: string | null;
    summariesById: Map<number, DiagramConversation>;
    summariesStatus: ConversationsStatus;
    summariesError: unknown;
    summariesLoadGeneration: number;
    activeSummariesNextCursor: string | null;
    archivedSummariesNextCursor: string | null;
    totalUnreadCount: number;
    readBoundariesByConversationId: Map<number, number | null>;
    unreadIncrementHighWaterMarkByConversationId: Map<number, number>;
    messagesByConversationId: Map<number, ConversationMessagesSlice>;
}

export type ConversationsAction =
    | {
          type: 'SUMMARIES_LOAD_STARTED';
          diagramId: string;
          generation: number;
          append?: boolean;
      }
    | {
          type: 'SUMMARIES_LOAD_SUCCEEDED';
          diagramId: string;
          generation: number;
          conversations: DiagramConversation[];
          status: 'active' | 'archived';
          nextCursor: string | null;
          append: boolean;
          totalUnreadCount: number;
      }
    | {
          type: 'SUMMARIES_LOAD_FAILED';
          diagramId: string;
          generation: number;
          error: unknown;
      }
    | {
          type: 'CONVERSATION_UPSERTED';
          conversation: DiagramConversation;
          preserveUnreadCount?: boolean;
      }
    | { type: 'CONVERSATION_REMOVED'; conversationId: number }
    | { type: 'UNREAD_TOTAL_SET'; totalUnreadCount: number }
    | { type: 'UNREAD_TOTAL_INCREMENT'; amount?: number }
    | {
          type: 'CONVERSATION_UNREAD_SET';
          conversationId: number;
          unreadCount: number;
      }
    | {
          type: 'CONVERSATION_UNREAD_INCREMENT';
          conversationId: number;
          amount?: number;
      }
    | {
          type: 'UNREAD_FROM_MESSAGE';
          conversationId: number;
          messageId: number;
      }
    | {
          type: 'READ_STATE_RECONCILED';
          conversationId: number;
          unreadCount: number;
          totalUnreadCount: number;
          lastReadMessageId: number | null;
      }
    | {
          type: 'MESSAGES_LOAD_STARTED';
          conversationId: number;
          generation: number;
          append?: boolean;
      }
    | {
          type: 'MESSAGES_LOAD_SUCCEEDED';
          conversationId: number;
          generation: number;
          messages: DiagramConversationMessage[];
          nextCursor: string | null;
          append: boolean;
      }
    | {
          type: 'MESSAGES_LOAD_FAILED';
          conversationId: number;
          generation: number;
          error: unknown;
      }
    | { type: 'MESSAGE_UPSERTED'; message: DiagramConversationMessage }
    | {
          type: 'MESSAGE_REMOVED';
          conversationId: number;
          messageId: number;
      }
    | {
          type: 'MESSAGE_REACTIONS_UPDATED';
          conversationId: number;
          messageId: number;
          reactions:
              | ConversationReactionAggregate[]
              | ConversationReactionAggregateWithoutOwnership[];
          ownership: 'authoritative' | 'reconcile';
          currentUserId?: number | null;
      }
    | { type: 'RESET' };

export const initialConversationMessagesSlice =
    (): ConversationMessagesSlice => ({
        byId: new Map(),
        status: 'idle',
        error: null,
        loadGeneration: 0,
        nextCursor: null,
    });

export const initialConversationsState = (): ConversationsState => ({
    diagramId: null,
    summariesById: new Map(),
    summariesStatus: 'idle',
    summariesError: null,
    summariesLoadGeneration: 0,
    activeSummariesNextCursor: null,
    archivedSummariesNextCursor: null,
    totalUnreadCount: 0,
    readBoundariesByConversationId: new Map(),
    unreadIncrementHighWaterMarkByConversationId: new Map(),
    messagesByConversationId: new Map(),
});

const isStaleSummariesLoad = (
    state: ConversationsState,
    diagramId: string,
    generation: number
): boolean =>
    generation !== state.summariesLoadGeneration ||
    diagramId !== state.diagramId;

const isStaleMessagesLoad = (
    slice: ConversationMessagesSlice,
    generation: number
): boolean => generation !== slice.loadGeneration;

const conversationsToMap = (
    conversations: DiagramConversation[]
): Map<number, DiagramConversation> => {
    const byId = new Map<number, DiagramConversation>();

    for (const conversation of conversations) {
        byId.set(conversation.id, conversation);
    }

    return byId;
};

const messagesToMap = (
    messages: DiagramConversationMessage[]
): Map<number, DiagramConversationMessage> => {
    const byId = new Map<number, DiagramConversationMessage>();

    for (const message of messages) {
        byId.set(message.id, message);
    }

    return byId;
};

const mergeConversationMaps = (
    existing: Map<number, DiagramConversation>,
    incoming: Map<number, DiagramConversation>
): Map<number, DiagramConversation> => {
    const merged = new Map(existing);

    for (const [id, conversation] of incoming) {
        merged.set(id, conversation);
    }

    return merged;
};

const mergeMessageMaps = (
    existing: Map<number, DiagramConversationMessage>,
    incoming: Map<number, DiagramConversationMessage>
): Map<number, DiagramConversationMessage> => {
    const merged = new Map(existing);

    for (const [id, message] of incoming) {
        merged.set(id, message);
    }

    return merged;
};

const isIdleEmptyState = (state: ConversationsState): boolean =>
    state.diagramId === null &&
    state.summariesById.size === 0 &&
    state.summariesStatus === 'idle' &&
    state.summariesError === null &&
    state.summariesLoadGeneration === 0 &&
    state.activeSummariesNextCursor === null &&
    state.archivedSummariesNextCursor === null &&
    state.totalUnreadCount === 0 &&
    state.readBoundariesByConversationId.size === 0 &&
    state.unreadIncrementHighWaterMarkByConversationId.size === 0 &&
    state.messagesByConversationId.size === 0;

const getMessagesSlice = (
    state: ConversationsState,
    conversationId: number
): ConversationMessagesSlice => {
    const existing = state.messagesByConversationId.get(conversationId);

    return existing ?? initialConversationMessagesSlice();
};

const setMessagesSlice = (
    state: ConversationsState,
    conversationId: number,
    slice: ConversationMessagesSlice
): Map<number, ConversationMessagesSlice> => {
    const messagesByConversationId = new Map(state.messagesByConversationId);
    messagesByConversationId.set(conversationId, slice);

    return messagesByConversationId;
};

export const conversationsReducer = (
    state: ConversationsState,
    action: ConversationsAction
): ConversationsState => {
    switch (action.type) {
        case 'SUMMARIES_LOAD_STARTED':
            return {
                ...state,
                diagramId: action.diagramId,
                summariesStatus:
                    action.append === true ? state.summariesStatus : 'loading',
                summariesError:
                    action.append === true ? state.summariesError : null,
                summariesLoadGeneration: action.generation,
                summariesById:
                    action.diagramId === state.diagramId
                        ? state.summariesById
                        : new Map(),
                activeSummariesNextCursor:
                    action.diagramId === state.diagramId
                        ? state.activeSummariesNextCursor
                        : null,
                archivedSummariesNextCursor:
                    action.diagramId === state.diagramId
                        ? state.archivedSummariesNextCursor
                        : null,
                messagesByConversationId:
                    action.diagramId === state.diagramId
                        ? state.messagesByConversationId
                        : new Map(),
                totalUnreadCount:
                    action.diagramId === state.diagramId
                        ? state.totalUnreadCount
                        : 0,
                readBoundariesByConversationId:
                    action.diagramId === state.diagramId
                        ? state.readBoundariesByConversationId
                        : new Map(),
                unreadIncrementHighWaterMarkByConversationId:
                    action.diagramId === state.diagramId
                        ? state.unreadIncrementHighWaterMarkByConversationId
                        : new Map(),
            };

        case 'SUMMARIES_LOAD_SUCCEEDED': {
            if (
                isStaleSummariesLoad(state, action.diagramId, action.generation)
            ) {
                return state;
            }

            const summariesById = action.append
                ? mergeConversationMaps(
                      state.summariesById,
                      conversationsToMap(action.conversations)
                  )
                : (() => {
                      const nextById = new Map(state.summariesById);

                      for (const [id, conversation] of nextById) {
                          if (conversation.status === action.status) {
                              nextById.delete(id);
                          }
                      }

                      for (const conversation of action.conversations) {
                          nextById.set(conversation.id, conversation);
                      }

                      return nextById;
                  })();

            const syncMapsReset =
                action.append === false && action.status === 'active';

            return {
                ...state,
                summariesById,
                summariesStatus: 'ready',
                summariesError: null,
                totalUnreadCount: action.totalUnreadCount,
                readBoundariesByConversationId: syncMapsReset
                    ? new Map()
                    : state.readBoundariesByConversationId,
                unreadIncrementHighWaterMarkByConversationId: syncMapsReset
                    ? new Map()
                    : state.unreadIncrementHighWaterMarkByConversationId,
                activeSummariesNextCursor:
                    action.status === 'active'
                        ? action.nextCursor
                        : state.activeSummariesNextCursor,
                archivedSummariesNextCursor:
                    action.status === 'archived'
                        ? action.nextCursor
                        : state.archivedSummariesNextCursor,
            };
        }

        case 'SUMMARIES_LOAD_FAILED': {
            if (
                isStaleSummariesLoad(state, action.diagramId, action.generation)
            ) {
                return state;
            }

            return {
                ...state,
                summariesStatus: 'error',
                summariesError: action.error,
            };
        }

        case 'CONVERSATION_UPSERTED': {
            if (
                state.diagramId === null ||
                String(action.conversation.diagramId) !== state.diagramId
            ) {
                return state;
            }

            const summariesById = new Map(state.summariesById);
            const existing = summariesById.get(action.conversation.id);
            const unreadCount =
                action.preserveUnreadCount === true && existing !== undefined
                    ? existing.unreadCount
                    : action.conversation.unreadCount;

            summariesById.set(action.conversation.id, {
                ...action.conversation,
                unreadCount,
            });

            return {
                ...state,
                summariesById,
            };
        }

        case 'CONVERSATION_REMOVED': {
            const removedConversation = state.summariesById.get(
                action.conversationId
            );
            const removedUnreadCount = removedConversation?.unreadCount ?? 0;

            if (!state.summariesById.has(action.conversationId)) {
                const messagesByConversationId = new Map(
                    state.messagesByConversationId
                );
                messagesByConversationId.delete(action.conversationId);

                if (
                    messagesByConversationId.size ===
                    state.messagesByConversationId.size
                ) {
                    return state;
                }

                return {
                    ...state,
                    messagesByConversationId,
                };
            }

            const summariesById = new Map(state.summariesById);
            summariesById.delete(action.conversationId);

            const messagesByConversationId = new Map(
                state.messagesByConversationId
            );
            messagesByConversationId.delete(action.conversationId);

            const readBoundariesByConversationId = new Map(
                state.readBoundariesByConversationId
            );
            readBoundariesByConversationId.delete(action.conversationId);

            const unreadIncrementHighWaterMarkByConversationId = new Map(
                state.unreadIncrementHighWaterMarkByConversationId
            );
            unreadIncrementHighWaterMarkByConversationId.delete(
                action.conversationId
            );

            return {
                ...state,
                summariesById,
                messagesByConversationId,
                readBoundariesByConversationId,
                unreadIncrementHighWaterMarkByConversationId,
                totalUnreadCount: Math.max(
                    0,
                    state.totalUnreadCount - removedUnreadCount
                ),
            };
        }

        case 'READ_STATE_RECONCILED': {
            const storedBoundary = state.readBoundariesByConversationId.get(
                action.conversationId
            );

            if (
                !shouldApplyReadReconciliation(
                    storedBoundary,
                    action.lastReadMessageId
                )
            ) {
                return state;
            }

            const readBoundariesByConversationId = new Map(
                state.readBoundariesByConversationId
            );
            const resolvedBoundary = nextReadBoundary(
                storedBoundary,
                action.lastReadMessageId
            );
            readBoundariesByConversationId.set(
                action.conversationId,
                resolvedBoundary
            );

            const unreadIncrementHighWaterMarkByConversationId = new Map(
                state.unreadIncrementHighWaterMarkByConversationId
            );
            if (resolvedBoundary !== null) {
                unreadIncrementHighWaterMarkByConversationId.set(
                    action.conversationId,
                    nextUnreadIncrementHighWaterMark(
                        unreadIncrementHighWaterMarkByConversationId.get(
                            action.conversationId
                        ),
                        resolvedBoundary
                    )
                );
            }

            const existing = state.summariesById.get(action.conversationId);
            let summariesById = state.summariesById;

            if (existing !== undefined) {
                summariesById = new Map(state.summariesById);
                summariesById.set(action.conversationId, {
                    ...existing,
                    unreadCount: action.unreadCount,
                });
            }

            return {
                ...state,
                summariesById,
                readBoundariesByConversationId,
                unreadIncrementHighWaterMarkByConversationId,
                totalUnreadCount: action.totalUnreadCount,
            };
        }

        case 'UNREAD_FROM_MESSAGE': {
            const readBoundary = state.readBoundariesByConversationId.get(
                action.conversationId
            );
            const incrementHighWaterMark =
                state.unreadIncrementHighWaterMarkByConversationId.get(
                    action.conversationId
                );

            if (
                !shouldIncrementUnreadForMessage(
                    readBoundary,
                    incrementHighWaterMark,
                    action.messageId
                )
            ) {
                return state;
            }

            const existing = state.summariesById.get(action.conversationId);

            if (existing === undefined) {
                return state;
            }

            const summariesById = new Map(state.summariesById);
            summariesById.set(action.conversationId, {
                ...existing,
                unreadCount: existing.unreadCount + 1,
            });

            const unreadIncrementHighWaterMarkByConversationId = new Map(
                state.unreadIncrementHighWaterMarkByConversationId
            );
            unreadIncrementHighWaterMarkByConversationId.set(
                action.conversationId,
                nextUnreadIncrementHighWaterMark(
                    incrementHighWaterMark,
                    action.messageId
                )
            );

            return {
                ...state,
                summariesById,
                unreadIncrementHighWaterMarkByConversationId,
                totalUnreadCount: state.totalUnreadCount + 1,
            };
        }

        case 'UNREAD_TOTAL_SET':
            return {
                ...state,
                totalUnreadCount: action.totalUnreadCount,
            };

        case 'UNREAD_TOTAL_INCREMENT': {
            const amount = action.amount ?? 1;

            return {
                ...state,
                totalUnreadCount: state.totalUnreadCount + amount,
            };
        }

        case 'CONVERSATION_UNREAD_SET': {
            const existing = state.summariesById.get(action.conversationId);

            if (existing === undefined) {
                return state;
            }

            const summariesById = new Map(state.summariesById);
            summariesById.set(action.conversationId, {
                ...existing,
                unreadCount: action.unreadCount,
            });

            return {
                ...state,
                summariesById,
            };
        }

        case 'CONVERSATION_UNREAD_INCREMENT': {
            const existing = state.summariesById.get(action.conversationId);

            if (existing === undefined) {
                return state;
            }

            const amount = action.amount ?? 1;
            const summariesById = new Map(state.summariesById);
            summariesById.set(action.conversationId, {
                ...existing,
                unreadCount: existing.unreadCount + amount,
            });

            return {
                ...state,
                summariesById,
            };
        }

        case 'MESSAGES_LOAD_STARTED': {
            const currentSlice = getMessagesSlice(state, action.conversationId);

            return {
                ...state,
                messagesByConversationId: setMessagesSlice(
                    state,
                    action.conversationId,
                    {
                        ...currentSlice,
                        status:
                            action.append === true
                                ? currentSlice.status
                                : 'loading',
                        error:
                            action.append === true ? currentSlice.error : null,
                        loadGeneration: action.generation,
                        byId:
                            action.append === true ||
                            action.generation === currentSlice.loadGeneration
                                ? currentSlice.byId
                                : new Map(),
                    }
                ),
            };
        }

        case 'MESSAGES_LOAD_SUCCEEDED': {
            const currentSlice = getMessagesSlice(state, action.conversationId);

            if (isStaleMessagesLoad(currentSlice, action.generation)) {
                return state;
            }

            const incoming = messagesToMap(action.messages);
            const byId = action.append
                ? mergeMessageMaps(currentSlice.byId, incoming)
                : incoming;

            return {
                ...state,
                messagesByConversationId: setMessagesSlice(
                    state,
                    action.conversationId,
                    {
                        ...currentSlice,
                        byId,
                        status: 'ready',
                        error: null,
                        nextCursor: action.nextCursor,
                    }
                ),
            };
        }

        case 'MESSAGES_LOAD_FAILED': {
            const currentSlice = getMessagesSlice(state, action.conversationId);

            if (isStaleMessagesLoad(currentSlice, action.generation)) {
                return state;
            }

            return {
                ...state,
                messagesByConversationId: setMessagesSlice(
                    state,
                    action.conversationId,
                    {
                        ...currentSlice,
                        status: 'error',
                        error: action.error,
                    }
                ),
            };
        }

        case 'MESSAGE_UPSERTED': {
            const currentSlice = state.messagesByConversationId.get(
                action.message.conversationId
            );

            if (currentSlice === undefined) {
                return state;
            }

            const byId = new Map(currentSlice.byId);
            byId.set(action.message.id, action.message);

            return {
                ...state,
                messagesByConversationId: setMessagesSlice(
                    state,
                    action.message.conversationId,
                    {
                        ...currentSlice,
                        byId,
                    }
                ),
            };
        }

        case 'MESSAGE_REMOVED': {
            const currentSlice = state.messagesByConversationId.get(
                action.conversationId
            );

            if (
                currentSlice === undefined ||
                !currentSlice.byId.has(action.messageId)
            ) {
                return state;
            }

            const byId = new Map(currentSlice.byId);
            byId.delete(action.messageId);

            return {
                ...state,
                messagesByConversationId: setMessagesSlice(
                    state,
                    action.conversationId,
                    {
                        ...currentSlice,
                        byId,
                    }
                ),
            };
        }

        case 'MESSAGE_REACTIONS_UPDATED': {
            const currentSlice = state.messagesByConversationId.get(
                action.conversationId
            );

            if (currentSlice === undefined) {
                return state;
            }

            const existingMessage = currentSlice.byId.get(action.messageId);

            if (existingMessage === undefined) {
                return state;
            }

            const reactions =
                action.ownership === 'authoritative'
                    ? (action.reactions as ConversationReactionAggregate[])
                    : reconcileConversationReactionAggregates(
                          action.reactions as ConversationReactionAggregateWithoutOwnership[],
                          existingMessage.reactions,
                          action.currentUserId
                      );

            const byId = new Map(currentSlice.byId);
            byId.set(action.messageId, {
                ...existingMessage,
                reactions,
            });

            return {
                ...state,
                messagesByConversationId: setMessagesSlice(
                    state,
                    action.conversationId,
                    {
                        ...currentSlice,
                        byId,
                    }
                ),
            };
        }

        case 'RESET':
            if (isIdleEmptyState(state)) {
                return state;
            }

            return initialConversationsState();

        default:
            return state;
    }
};
