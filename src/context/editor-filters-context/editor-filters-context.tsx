import { createContext } from 'react';
import type { TagMatchMode } from '@/lib/domain/diagram-tag';
import { emptyFn } from '@/lib/utils';

export interface EditorFiltersContextValue {
    selectedTagIds: readonly string[];
    tagMatchMode: TagMatchMode;
    selectedAreaIds: readonly string[];
    selectedSchemaIds: readonly string[];
    hasTagConstraint: boolean;
    hasAreaConstraint: boolean;
    hasSchemaConstraint: boolean;
    hasAnyConstraint: boolean;
    toggleTag: (tagId: string) => void;
    setTagMatchMode: (mode: TagMatchMode) => void;
    clearTagFilter: () => void;
    toggleArea: (areaId: string) => void;
    clearAreaFilter: () => void;
    toggleSchema: (schemaId: string) => void;
    clearSchemaFilter: () => void;
    clearAllFilters: () => void;
}

export const editorFiltersContext = createContext<EditorFiltersContextValue>({
    selectedTagIds: [],
    tagMatchMode: 'any',
    selectedAreaIds: [],
    selectedSchemaIds: [],
    hasTagConstraint: false,
    hasAreaConstraint: false,
    hasSchemaConstraint: false,
    hasAnyConstraint: false,
    toggleTag: emptyFn,
    setTagMatchMode: emptyFn,
    clearTagFilter: emptyFn,
    toggleArea: emptyFn,
    clearAreaFilter: emptyFn,
    toggleSchema: emptyFn,
    clearSchemaFilter: emptyFn,
    clearAllFilters: emptyFn,
});
