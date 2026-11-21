import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/button/button';
import { FilterQueryBuilder } from '@/components/filter-query-builder/filter-query-builder';
import {
    sidePanelFilterClearButtonClassName,
    sidePanelFilterClearButtonIcon,
} from '@/components/side-panel-empty-state/side-panel-filter-clear-action';
import { useEditorFilters } from '@/context/editor-filters-context/use-editor-filters';
import { useChartDB } from '@/hooks/use-chartdb';
import { listDiagramSchemaOptions } from '@/lib/domain/editor-filter-eligibility';
import { expressionHasViewCondition } from '@/lib/domain/filter-expression';

export const FiltersSection: React.FC = () => {
    const { t } = useTranslation();
    const { currentDiagram } = useChartDB();
    const { expression, showViews, hasQuery, setExpression, clearFilters } =
        useEditorFilters();
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
            <div className="flex items-center justify-end px-2 py-1">
                {hasQuery ? (
                    <Button
                        type="button"
                        variant="outline"
                        className={sidePanelFilterClearButtonClassName}
                        onClick={clearFilters}
                    >
                        {sidePanelFilterClearButtonIcon}
                        {t('side_panel.filters_section.clear')}
                    </Button>
                ) : null}
            </div>
            {viewsHidden ? (
                <p
                    className="px-2 pb-2 text-xs text-muted-foreground"
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
