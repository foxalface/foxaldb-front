import { createContext } from 'react';
import type { TagMatchMode } from '@/lib/domain/diagram-tag';
import { emptyFn } from '@/lib/utils';

export interface TagFilterContextValue {
    selectedTagIds: readonly string[];
    matchMode: TagMatchMode;
    hasTagConstraint: boolean;
    toggleTag: (tagId: string) => void;
    setMatchMode: (mode: TagMatchMode) => void;
    clearTagFilter: () => void;
}

export const tagFilterContext = createContext<TagFilterContextValue>({
    selectedTagIds: [],
    matchMode: 'any',
    hasTagConstraint: false,
    toggleTag: emptyFn,
    setMatchMode: emptyFn,
    clearTagFilter: emptyFn,
});
