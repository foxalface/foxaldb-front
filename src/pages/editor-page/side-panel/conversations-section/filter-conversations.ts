import {
    CONVERSATION_TARGET_TYPES,
    type ConversationTargetType,
    type DiagramConversation,
} from '@/lib/conversations/conversation-types';
import {
    resolveConversationTargetLabel,
    type ConversationTargetLabelContext,
} from './resolve-conversation-target-label';

export interface ConversationListFilterOptions {
    filterText: string;
    selectedTargetTypes: ReadonlyArray<ConversationTargetType>;
}

export const DEFAULT_SELECTED_CONVERSATION_TARGET_TYPES: ConversationTargetType[] =
    [...CONVERSATION_TARGET_TYPES];

export const isConversationTypeFilterActive = (
    selectedTargetTypes: ReadonlyArray<ConversationTargetType>
): boolean => selectedTargetTypes.length !== CONVERSATION_TARGET_TYPES.length;

export const matchesConversationTypeFilter = (
    conversation: DiagramConversation,
    selectedTargetTypes: ReadonlyArray<ConversationTargetType>
): boolean => {
    if (selectedTargetTypes.length === 0) {
        return false;
    }

    return selectedTargetTypes.includes(conversation.targetType);
};

export const matchesConversationTextFilter = (
    conversation: DiagramConversation,
    filterText: string,
    context: ConversationTargetLabelContext
): boolean => {
    if (!filterText?.trim?.()) {
        return true;
    }

    const searchText = filterText.toLowerCase();
    const targetLabel = resolveConversationTargetLabel(conversation, context);
    const lastMessageBody = conversation.lastMessageBody?.trim() ?? '';
    const authorName = conversation.lastMessageAuthor?.fullName?.trim() ?? '';

    return (
        targetLabel.title.toLowerCase().includes(searchText) ||
        targetLabel.typeLabel.toLowerCase().includes(searchText) ||
        lastMessageBody.toLowerCase().includes(searchText) ||
        authorName.toLowerCase().includes(searchText)
    );
};

export const matchesConversationFilter = (
    conversation: DiagramConversation,
    filterText: string,
    context: ConversationTargetLabelContext,
    selectedTargetTypes: ReadonlyArray<ConversationTargetType> = DEFAULT_SELECTED_CONVERSATION_TARGET_TYPES
): boolean =>
    matchesConversationTypeFilter(conversation, selectedTargetTypes) &&
    matchesConversationTextFilter(conversation, filterText, context);

export const filterConversations = (
    conversations: ReadonlyArray<DiagramConversation>,
    options: ConversationListFilterOptions,
    context: ConversationTargetLabelContext
): DiagramConversation[] =>
    conversations.filter((conversation) =>
        matchesConversationFilter(
            conversation,
            options.filterText,
            context,
            options.selectedTargetTypes
        )
    );

export const hasActiveConversationFilter = (
    options: ConversationListFilterOptions
): boolean =>
    options.filterText.trim().length > 0 ||
    isConversationTypeFilterActive(options.selectedTargetTypes);
