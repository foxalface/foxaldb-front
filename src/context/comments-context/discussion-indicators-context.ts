import { createContext } from 'react';
import {
    EMPTY_DISCUSSION_INDICATOR_INDEX,
    type DiscussionIndicatorIndex,
} from '@/lib/comments/discussion-indicators';

/**
 * Internal partitioned indicator index. Not part of the public comments API —
 * consume via the specialized `use*DiscussionIndicator` hooks only.
 */
export const DiscussionIndicatorsContext =
    createContext<DiscussionIndicatorIndex>(EMPTY_DISCUSSION_INDICATOR_INDEX);
