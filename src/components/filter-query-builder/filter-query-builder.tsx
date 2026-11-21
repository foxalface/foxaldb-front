import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Area } from '@/lib/domain/area';
import type { EditorSchemaOption } from '@/lib/domain/editor-filter-eligibility';
import type { DiagramTag } from '@/lib/domain/diagram-tag';
import type { FilterGroup } from '@/lib/domain/filter-expression';
import { isFilterExpressionSupported } from '@/lib/domain/filter-evaluation';
import { FilterQueryGroup } from './filter-query-group';

export interface FilterQueryBuilderProps {
    expression: FilterGroup;
    onChange: (expression: FilterGroup) => void;
    tags: readonly DiagramTag[];
    areas: readonly Area[];
    schemas: readonly EditorSchemaOption[];
    readOnly?: boolean;
}

export const FilterQueryBuilder: React.FC<FilterQueryBuilderProps> = ({
    expression,
    onChange,
    tags,
    areas,
    schemas,
    readOnly = false,
}) => {
    const { t } = useTranslation();
    const [changeRejected, setChangeRejected] = useState(false);
    const expressionTooComplex = !isFilterExpressionSupported(expression);
    const applyChange = (next: FilterGroup) => {
        if (!isFilterExpressionSupported(next)) {
            setChangeRejected(true);
            return;
        }

        if (changeRejected) {
            setChangeRejected(false);
        }

        onChange(next);
    };

    return (
        <div className="flex flex-col gap-2">
            {expressionTooComplex || changeRejected ? (
                <p
                    className="text-xs text-muted-foreground"
                    data-testid="filter-query-too-complex"
                >
                    {t('side_panel.filters_section.query.too_complex')}
                </p>
            ) : null}
            <FilterQueryGroup
                root={expression}
                group={expression}
                depth={0}
                tags={tags}
                areas={areas}
                schemas={schemas}
                readOnly={readOnly}
                onChange={applyChange}
            />
        </div>
    );
};
