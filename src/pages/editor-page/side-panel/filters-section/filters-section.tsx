import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FilterQueryBuilder } from '@/components/filter-query-builder/filter-query-builder';
import { useEditorFilters } from '@/context/editor-filters-context/use-editor-filters';
import { useChartDB } from '@/hooks/use-chartdb';
import { listDiagramSchemaOptions } from '@/lib/domain/editor-filter-eligibility';
import { expressionHasViewCondition } from '@/lib/domain/filter-expression';

export const FiltersSection: React.FC = () => {
    const { t } = useTranslation();
    const { currentDiagram } = useChartDB();
    const { expression, showViews, setExpression } = useEditorFilters();
    const tags = currentDiagram.tags ?? [];
    const areas = currentDiagram.areas ?? [];
    const schemas = useMemo(
        () =>
            listDiagramSchemaOptions(
                currentDiagram.tables,
                currentDiagram.databaseType
            ),
        [currentDiagram.tables, currentDiagram.databaseType]
    );
    const viewsHidden = !showViews && expressionHasViewCondition(expression);

    return (
        <section
            className="flex flex-1 flex-col overflow-hidden"
            data-vaul-no-drag
        >
            {viewsHidden ? (
                <p
                    className="px-2 pb-2 pt-1 text-xs text-muted-foreground"
                    data-testid="filter-views-hidden-hint"
                >
                    {t('side_panel.filters_section.query.views_hidden')}
                </p>
            ) : null}
            <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
                <FilterQueryBuilder
                    expression={expression}
                    tags={tags}
                    areas={areas}
                    schemas={schemas}
                    onChange={setExpression}
                />
            </div>
        </section>
    );
};
