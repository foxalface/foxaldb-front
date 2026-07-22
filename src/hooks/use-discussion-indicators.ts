import { useContext } from 'react';
import { DiscussionIndicatorsContext } from '@/context/comments-context/discussion-indicators-context';
import {
    getDiscussionIndicator,
    type DiscussionIndicator,
} from '@/lib/comments/discussion-indicators';

/**
 * Shared private lookup for the three specialized indicator hooks.
 * Outside/inactive providers resolve through the empty index default.
 */
const useDiscussionIndicatorLookup = (
    targetType: 'table' | 'field' | 'relationship',
    targetId: string
): DiscussionIndicator => {
    const index = useContext(DiscussionIndicatorsContext);
    return getDiscussionIndicator(index, targetType, targetId);
};

export const useTableDiscussionIndicator = (
    tableId: string
): DiscussionIndicator => useDiscussionIndicatorLookup('table', tableId);

export const useFieldDiscussionIndicator = (
    fieldId: string
): DiscussionIndicator => useDiscussionIndicatorLookup('field', fieldId);

export const useRelationshipDiscussionIndicator = (
    relationshipId: string
): DiscussionIndicator =>
    useDiscussionIndicatorLookup('relationship', relationshipId);
