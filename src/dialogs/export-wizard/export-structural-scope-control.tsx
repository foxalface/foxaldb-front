import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FilterQueryBuilder } from '@/components/filter-query-builder/filter-query-builder';
import { Tabs, TabsList, TabsTrigger } from '@/components/tabs/tabs';
import type { Area } from '@/lib/domain/area';
import type { EditorSchemaOption } from '@/lib/domain/editor-filter-eligibility';
import type { DiagramTag } from '@/lib/domain/diagram-tag';
import {
    cloneFilterExpression,
    emptyFilterGroup,
    type FilterGroup,
} from '@/lib/domain/filter-expression';

export type ExportFilterSelection =
    | { readonly kind: 'all' }
    | { readonly kind: 'current' }
    | { readonly kind: 'custom'; readonly expression: FilterGroup };

interface ExportStructuralScopeControlProps {
    selection: ExportFilterSelection;
    editorExpression: FilterGroup;
    tags: readonly DiagramTag[];
    areas: readonly Area[];
    schemas: readonly EditorSchemaOption[];
    onChange: (selection: ExportFilterSelection) => void;
}

export const ExportStructuralScopeControl: React.FC<
    ExportStructuralScopeControlProps
> = ({ selection, editorExpression, tags, areas, schemas, onChange }) => {
    const { t } = useTranslation();

    const handleKindChange = useCallback(
        (value: string) => {
            if (value === 'all') {
                onChange({ kind: 'all' });
                return;
            }

            if (value === 'current') {
                onChange({ kind: 'current' });
                return;
            }

            if (value !== 'custom' || selection.kind === 'custom') {
                return;
            }

            onChange({
                kind: 'custom',
                expression: cloneFilterExpression(
                    selection.kind === 'current'
                        ? editorExpression
                        : emptyFilterGroup()
                ),
            });
        },
        [editorExpression, onChange, selection.kind]
    );

    return (
        <div
            className="flex flex-col gap-3"
            data-testid="export-structural-scope"
        >
            <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">
                    {t('export_wizard.scope.label')}
                </p>
                <Tabs value={selection.kind} onValueChange={handleKindChange}>
                    <TabsList aria-label={t('export_wizard.scope.label')}>
                        <TabsTrigger
                            value="all"
                            data-testid="export-structural-scope-all"
                        >
                            {t('export_wizard.scope.all')}
                        </TabsTrigger>
                        <TabsTrigger
                            value="current"
                            data-testid="export-structural-scope-current"
                        >
                            {t('export_wizard.scope.current')}
                        </TabsTrigger>
                        <TabsTrigger
                            value="custom"
                            data-testid="export-structural-scope-custom"
                        >
                            {t('export_wizard.scope.custom')}
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
                <p className="text-xs text-muted-foreground">
                    {selection.kind === 'current'
                        ? t('export_wizard.scope.current_hint')
                        : selection.kind === 'custom'
                          ? t('export_wizard.scope.custom_hint')
                          : t('export_wizard.scope.all_hint')}
                </p>
            </div>
            {selection.kind === 'current' ? (
                <FilterQueryBuilder
                    expression={editorExpression}
                    tags={tags}
                    areas={areas}
                    schemas={schemas}
                    readOnly
                    onChange={() => undefined}
                />
            ) : null}
            {selection.kind === 'custom' ? (
                <FilterQueryBuilder
                    expression={selection.expression}
                    tags={tags}
                    areas={areas}
                    schemas={schemas}
                    onChange={(expression) =>
                        onChange({ kind: 'custom', expression })
                    }
                />
            ) : null}
        </div>
    );
};
