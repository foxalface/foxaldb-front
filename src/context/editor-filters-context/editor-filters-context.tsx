import { createContext } from 'react';
import type { FilterGroup } from '@/lib/domain/filter-expression';
import { emptyFilterGroup } from '@/lib/domain/filter-expression';
import { emptyFn } from '@/lib/utils';

export interface EditorFiltersContextValue {
    expression: FilterGroup;
    showViews: boolean;
    hasQuery: boolean;
    setExpression: (expression: FilterGroup) => void;
    setShowViews: (showViews: boolean) => void;
    clearFilters: () => void;
}

export const editorFiltersContext = createContext<EditorFiltersContextValue>({
    expression: emptyFilterGroup(),
    showViews: false,
    hasQuery: false,
    setExpression: emptyFn,
    setShowViews: emptyFn,
    clearFilters: emptyFn,
});
