import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { useChartDB } from '@/hooks/use-chartdb';
import {
    emptyFilterGroup,
    filterNormalizationScopeFromDiagram,
    hasActiveFilter,
    normalizeFilterExpression,
    type FilterGroup,
} from '@/lib/domain/filter-expression';
import { editorFiltersContext } from './editor-filters-context';

export const EditorFiltersProvider: React.FC<React.PropsWithChildren> = ({
    children,
}) => {
    const { diagramId, currentDiagram } = useChartDB();
    const [expression, setExpressionState] = useState<FilterGroup>(() =>
        emptyFilterGroup()
    );
    const [showViews, setShowViewsState] = useState(false);
    const previousDiagramIdRef = useRef(diagramId);
    const tags = currentDiagram.tags;
    const areas = currentDiagram.areas;
    const tables = currentDiagram.tables;
    const databaseType = currentDiagram.databaseType;
    const normalizationScope = useMemo(
        () =>
            filterNormalizationScopeFromDiagram({
                tags,
                areas,
                tables,
                databaseType,
            }),
        [tags, areas, tables, databaseType]
    );

    useEffect(() => {
        if (previousDiagramIdRef.current === diagramId) {
            return;
        }

        previousDiagramIdRef.current = diagramId;
        setExpressionState(emptyFilterGroup());
        setShowViewsState(false);
    }, [diagramId]);

    useEffect(() => {
        setExpressionState((current) =>
            normalizeFilterExpression(current, normalizationScope)
        );
    }, [normalizationScope]);

    const setExpression = useCallback(
        (next: FilterGroup) => {
            setExpressionState(
                normalizeFilterExpression(next, normalizationScope)
            );
        },
        [normalizationScope]
    );

    const setShowViews = useCallback((next: boolean) => {
        setShowViewsState(next);
    }, []);

    const clearFilters = useCallback(() => {
        setExpressionState(emptyFilterGroup());
    }, []);

    const hasQuery = hasActiveFilter(expression);

    const value = useMemo(
        () => ({
            expression,
            showViews,
            hasQuery,
            setExpression,
            setShowViews,
            clearFilters,
        }),
        [
            expression,
            showViews,
            hasQuery,
            setExpression,
            setShowViews,
            clearFilters,
        ]
    );

    return (
        <editorFiltersContext.Provider value={value}>
            {children}
        </editorFiltersContext.Provider>
    );
};
