import { useContext } from 'react';
import { CommentsAvailabilityContext } from '@/context/comments-context/comments-context';

/**
 * Returns whether diagram comments are active for the current editor scope.
 * Safe outside CommentsProvider (defaults to false).
 */
export const useCommentsAvailability = (): boolean =>
    useContext(CommentsAvailabilityContext);
