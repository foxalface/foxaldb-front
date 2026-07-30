import { createContext } from 'react';
import {
    EMPTY_CONVERSATION_INDICATOR_INDEX,
    type ConversationIndicatorIndex,
} from '@/lib/conversations/conversation-indicators';

/**
 * Internal partitioned indicator index. Not part of the public conversations API —
 * consume via the specialized `use*ConversationIndicator` hooks only.
 */
export const ConversationIndicatorsContext =
    createContext<ConversationIndicatorIndex>(
        EMPTY_CONVERSATION_INDICATOR_INDEX
    );
