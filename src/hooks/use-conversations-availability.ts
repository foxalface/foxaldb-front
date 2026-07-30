import { useContext } from 'react';
import { ConversationsAvailabilityContext } from '@/context/conversations-context/conversations-context';

/**
 * Returns whether diagram conversations are active for the current editor scope.
 * Safe outside ConversationsProvider (defaults to false).
 */
export const useConversationsAvailability = (): boolean =>
    useContext(ConversationsAvailabilityContext);
