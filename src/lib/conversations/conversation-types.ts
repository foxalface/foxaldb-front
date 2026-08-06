import type { UserIdentity } from '@/lib/user';

export const CONVERSATION_TARGET_TYPES = [
    'diagram',
    'table',
    'field',
    'relationship',
] as const;

export type ConversationTargetType = (typeof CONVERSATION_TARGET_TYPES)[number];

export const CONVERSATION_STATUSES = ['active', 'archived'] as const;

export type ConversationStatus = (typeof CONVERSATION_STATUSES)[number];

export type ConversationAuthor = UserIdentity;

export interface DiagramConversation {
    id: number;
    diagramId: number;
    targetType: ConversationTargetType;
    targetId: string | null;
    status: ConversationStatus;
    archivedAt: string | null;
    messageCount: number;
    lastMessageAt: string | null;
    lastMessageBody: string | null;
    lastMessageAuthor: ConversationAuthor | null;
    createdAt: string;
    updatedAt: string;
}

export interface ConversationReactionAggregate {
    emoji: string;
    count: number;
    reactedByMe: boolean;
    previewUsers: Array<ConversationAuthor | null>;
    previewTruncated: boolean;
}

export interface DiagramConversationMessage {
    id: number;
    conversationId: number;
    body: string;
    user: ConversationAuthor | null;
    createdAt: string;
    updatedAt: string;
    reactions: ConversationReactionAggregate[];
}

export interface ConversationMessageReactionsSnapshot {
    messageId: number;
    reactions: ConversationReactionAggregate[];
}

export type DiagramConversationTarget =
    | {
          targetType: 'diagram';
          targetId: null;
      }
    | {
          targetType: 'table' | 'field' | 'relationship';
          targetId: string;
      };

export type FindOrCreateDiagramConversationInput = DiagramConversationTarget;

export interface CreateConversationMessageInput {
    body: string;
}

export interface UpdateConversationMessageInput {
    body: string;
}

export type ListConversationMessagesDirection = 'older' | 'newer';

export interface ListConversationMessagesOptions {
    cursor?: string;
    limit?: number;
    direction?: ListConversationMessagesDirection;
}

export interface PaginatedResult<T> {
    data: T[];
    nextCursor: string | null;
}
