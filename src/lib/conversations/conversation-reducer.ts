import type {
    DiagramConversation,
    DiagramConversationMessage,
} from './conversation-types';

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
      }
    | {
          type: 'SUMMARIES_LOAD_FAILED';
          diagramId: string;
          generation: number;
          error: unknown;
      }
    | { type: 'CONVERSATION_UPSERTED'; conversation: DiagramConversation }
    | { type: 'CONVERSATION_REMOVED'; conversationId: number }
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

            return {
                ...state,
                summariesById,
                summariesStatus: 'ready',
                summariesError: null,
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
            summariesById.set(action.conversation.id, action.conversation);

            return {
                ...state,
                summariesById,
            };
        }

        case 'CONVERSATION_REMOVED': {
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

            return {
                ...state,
                summariesById,
                messagesByConversationId,
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

        case 'RESET':
            if (isIdleEmptyState(state)) {
                return state;
            }

            return initialConversationsState();

        default:
            return state;
    }
};
