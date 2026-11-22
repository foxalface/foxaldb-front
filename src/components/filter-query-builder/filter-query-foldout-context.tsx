/* eslint-disable react-refresh/only-export-components -- filter query builder foldout context */
import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';

interface FilterQueryFoldoutContextValue {
    isGroupExpanded: (groupId: string) => boolean;
    toggleGroupExpanded: (groupId: string) => void;
}

const FilterQueryFoldoutContext =
    createContext<FilterQueryFoldoutContextValue | null>(null);

export const FilterQueryFoldoutProvider: React.FC<React.PropsWithChildren> = ({
    children,
}) => {
    const [collapsedGroupIds, setCollapsedGroupIds] = useState<
        ReadonlySet<string>
    >(() => new Set());

    const isGroupExpanded = useCallback(
        (groupId: string) => !collapsedGroupIds.has(groupId),
        [collapsedGroupIds]
    );

    const toggleGroupExpanded = useCallback((groupId: string) => {
        setCollapsedGroupIds((current) => {
            const next = new Set(current);
            if (next.has(groupId)) {
                next.delete(groupId);
            } else {
                next.add(groupId);
            }
            return next;
        });
    }, []);

    const value = useMemo(
        () => ({
            isGroupExpanded,
            toggleGroupExpanded,
        }),
        [isGroupExpanded, toggleGroupExpanded]
    );

    return (
        <FilterQueryFoldoutContext.Provider value={value}>
            {children}
        </FilterQueryFoldoutContext.Provider>
    );
};

export const useFilterQueryFoldout = (): FilterQueryFoldoutContextValue => {
    const context = useContext(FilterQueryFoldoutContext);

    if (!context) {
        throw new Error(
            'useFilterQueryFoldout must be used within FilterQueryFoldoutProvider'
        );
    }

    return context;
};
