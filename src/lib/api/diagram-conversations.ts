import type {
    ConversationStatus,
    ConversationTargetType,
    CreateConversationMessageInput,
    DiagramConversation,
    DiagramConversationMessage,
    FindOrCreateDiagramConversationInput,
    ListConversationMessagesOptions,
    PaginatedResult,
    UpdateConversationMessageInput,
} from '@/lib/conversations/conversation-types';
import { apiRequest } from './client';
import { normalizeDiagramConversationFromApi } from './normalize-diagram-conversation';
import { normalizeDiagramConversationMessageFromApi } from './normalize-diagram-conversation-message';

export interface DiagramConversationDto {
    id: number;
    diagram_id: number;
    target_type: ConversationTargetType;
    target_id: string | null;
    status: ConversationStatus;
    archived_at: string | null;
    message_count: number;
    last_message_at: string | null;
    last_message_preview: string | null;
    last_message_author: {
        id: number;
        first_name: string;
        last_name: string;
        full_name: string;
    } | null;
    created_at: string;
    updated_at: string;
}

export interface DiagramConversationMessageDto {
    id: number;
    conversation_id: number;
    body: string;
    user: {
        id: number;
        first_name: string;
        last_name: string;
        full_name: string;
    } | null;
    created_at: string;
    updated_at: string;
}

interface DiagramConversationsListResponse {
    data: DiagramConversationDto[];
    next_cursor: string | null;
}

interface DiagramConversationResponse {
    data: DiagramConversationDto;
}

interface DiagramConversationMessagesListResponse {
    data: DiagramConversationMessageDto[];
    next_cursor: string | null;
}

interface ConversationMessageMutationResponse {
    data: {
        message: DiagramConversationMessageDto;
        conversation: DiagramConversationDto;
    };
}

const conversationsPath = (diagramId: string): string =>
    `/diagrams/${encodeURIComponent(diagramId)}/conversations`;

const conversationPath = (diagramId: string, conversationId: number): string =>
    `${conversationsPath(diagramId)}/${conversationId}`;

const messagesPath = (diagramId: string, conversationId: number): string =>
    `${conversationPath(diagramId, conversationId)}/messages`;

const messagePath = (
    diagramId: string,
    conversationId: number,
    messageId: number
): string => `${messagesPath(diagramId, conversationId)}/${messageId}`;

const normalizePaginatedConversations = (
    response: DiagramConversationsListResponse
): PaginatedResult<DiagramConversation> => ({
    data: response.data.map(normalizeDiagramConversationFromApi),
    nextCursor: response.next_cursor,
});

const normalizePaginatedMessages = (
    response: DiagramConversationMessagesListResponse
): PaginatedResult<DiagramConversationMessage> => ({
    data: response.data.map(normalizeDiagramConversationMessageFromApi),
    nextCursor: response.next_cursor,
});

const buildListSummariesQuery = (options: {
    status?: ConversationStatus;
    cursor?: string;
    limit?: number;
}): string => {
    const params = new URLSearchParams();

    if (options.status !== undefined) {
        params.set('status', options.status);
    }

    if (options.cursor !== undefined) {
        params.set('cursor', options.cursor);
    }

    if (options.limit !== undefined) {
        params.set('limit', String(options.limit));
    }

    const query = params.toString();

    return query.length > 0 ? `?${query}` : '';
};

const buildListMessagesQuery = (
    options?: ListConversationMessagesOptions
): string => {
    if (options === undefined) {
        return '';
    }

    const params = new URLSearchParams();

    if (options.cursor !== undefined) {
        params.set('cursor', options.cursor);
    }

    if (options.limit !== undefined) {
        params.set('limit', String(options.limit));
    }

    if (options.direction !== undefined) {
        params.set('direction', options.direction);
    }

    const query = params.toString();

    return query.length > 0 ? `?${query}` : '';
};

export const listDiagramConversations = async (
    diagramId: string,
    options?: {
        status?: ConversationStatus;
        cursor?: string;
        limit?: number;
    }
): Promise<PaginatedResult<DiagramConversation>> => {
    const response = await apiRequest<DiagramConversationsListResponse>(
        `${conversationsPath(diagramId)}${buildListSummariesQuery(options ?? {})}`
    );

    return normalizePaginatedConversations(response);
};

export const findOrCreateDiagramConversation = async (
    diagramId: string,
    input: FindOrCreateDiagramConversationInput
): Promise<DiagramConversation> => {
    const response = await apiRequest<DiagramConversationResponse>(
        conversationsPath(diagramId),
        {
            method: 'POST',
            data: {
                target_type: input.targetType,
                target_id: input.targetId,
            },
        }
    );

    return normalizeDiagramConversationFromApi(response.data);
};

export const getDiagramConversation = async (
    diagramId: string,
    conversationId: number
): Promise<DiagramConversation> => {
    const response = await apiRequest<DiagramConversationDto>(
        conversationPath(diagramId, conversationId)
    );

    return normalizeDiagramConversationFromApi(response);
};

export const archiveDiagramConversation = async (
    diagramId: string,
    conversationId: number
): Promise<DiagramConversation> => {
    const response = await apiRequest<DiagramConversationResponse>(
        `${conversationPath(diagramId, conversationId)}/archive`,
        {
            method: 'POST',
        }
    );

    return normalizeDiagramConversationFromApi(response.data);
};

export const reopenDiagramConversation = async (
    diagramId: string,
    conversationId: number
): Promise<DiagramConversation> => {
    const response = await apiRequest<DiagramConversationResponse>(
        `${conversationPath(diagramId, conversationId)}/reopen`,
        {
            method: 'POST',
        }
    );

    return normalizeDiagramConversationFromApi(response.data);
};

export const deleteDiagramConversation = async (
    diagramId: string,
    conversationId: number
): Promise<void> => {
    await apiRequest<null>(conversationPath(diagramId, conversationId), {
        method: 'DELETE',
    });
};

export const listConversationMessages = async (
    diagramId: string,
    conversationId: number,
    options?: ListConversationMessagesOptions
): Promise<PaginatedResult<DiagramConversationMessage>> => {
    const response = await apiRequest<DiagramConversationMessagesListResponse>(
        `${messagesPath(diagramId, conversationId)}${buildListMessagesQuery(options)}`
    );

    return normalizePaginatedMessages(response);
};

export const createConversationMessage = async (
    diagramId: string,
    conversationId: number,
    input: CreateConversationMessageInput
): Promise<{
    message: DiagramConversationMessage;
    conversation: DiagramConversation;
}> => {
    const response = await apiRequest<ConversationMessageMutationResponse>(
        messagesPath(diagramId, conversationId),
        {
            method: 'POST',
            data: {
                body: input.body,
            },
        }
    );

    return {
        message: normalizeDiagramConversationMessageFromApi(
            response.data.message
        ),
        conversation: normalizeDiagramConversationFromApi(
            response.data.conversation
        ),
    };
};

export const updateConversationMessage = async (
    diagramId: string,
    conversationId: number,
    messageId: number,
    input: UpdateConversationMessageInput
): Promise<{
    message: DiagramConversationMessage;
    conversation: DiagramConversation;
}> => {
    const response = await apiRequest<ConversationMessageMutationResponse>(
        messagePath(diagramId, conversationId, messageId),
        {
            method: 'PATCH',
            data: {
                body: input.body,
            },
        }
    );

    return {
        message: normalizeDiagramConversationMessageFromApi(
            response.data.message
        ),
        conversation: normalizeDiagramConversationFromApi(
            response.data.conversation
        ),
    };
};

export const deleteConversationMessage = async (
    diagramId: string,
    conversationId: number,
    messageId: number
): Promise<void> => {
    await apiRequest<null>(messagePath(diagramId, conversationId, messageId), {
        method: 'DELETE',
    });
};
