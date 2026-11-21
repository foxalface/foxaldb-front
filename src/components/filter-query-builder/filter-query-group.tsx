import React from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { Button } from '@/components/button/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/select/select';
import type { Area } from '@/lib/domain/area';
import type { EditorSchemaOption } from '@/lib/domain/editor-filter-eligibility';
import type { DiagramTag } from '@/lib/domain/diagram-tag';
import type {
    FilterExpression,
    FilterGroup,
    FilterGroupOperator,
} from '@/lib/domain/filter-expression';
import {
    FILTER_MAX_GROUP_DEPTH,
    addConditionToGroup,
    addGroupToGroup,
    canAddFilterGroup,
    removeFilterNode,
    replaceFilterCondition,
    setGroupOperator,
} from '@/lib/domain/filter-expression';
import { isFilterExpressionSupported } from '@/lib/domain/filter-evaluation';
import { FilterQueryConditionRow } from './filter-query-condition-row';

export const FilterQueryGroup: React.FC<{
    root: FilterGroup;
    group: FilterGroup;
    depth: number;
    tags: readonly DiagramTag[];
    areas: readonly Area[];
    schemas: readonly EditorSchemaOption[];
    readOnly?: boolean;
    onChange: (expression: FilterGroup) => void;
}> = ({
    root,
    group,
    depth,
    tags,
    areas,
    schemas,
    readOnly = false,
    onChange,
}) => {
    const { t } = useTranslation();
    const isRoot = depth === 0;
    const withinComplexity = isFilterExpressionSupported(root);
    const canAddCondition = !readOnly && withinComplexity;
    const canAddGroup =
        !readOnly &&
        depth < FILTER_MAX_GROUP_DEPTH &&
        canAddFilterGroup(root, group.id) &&
        withinComplexity;

    return (
        <div
            className={
                depth === 0
                    ? 'flex flex-col gap-2'
                    : 'flex flex-col gap-2 border-l pl-2'
            }
        >
            <div className="flex items-center gap-2">
                <Select
                    value={group.operator}
                    disabled={readOnly}
                    onValueChange={(value) =>
                        onChange(
                            setGroupOperator(
                                root,
                                group.id,
                                value as FilterGroupOperator
                            )
                        )
                    }
                >
                    <SelectTrigger
                        className="h-8 w-24 text-xs"
                        aria-label={t(
                            'side_panel.filters_section.query.group_operator'
                        )}
                        data-testid={`filter-query-group-operator-${group.id}`}
                    >
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="and">
                            {t(
                                'side_panel.filters_section.query.operator_group.and'
                            )}
                        </SelectItem>
                        <SelectItem value="or">
                            {t(
                                'side_panel.filters_section.query.operator_group.or'
                            )}
                        </SelectItem>
                    </SelectContent>
                </Select>
                {readOnly || isRoot ? null : (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        aria-label={t(
                            'side_panel.filters_section.query.remove'
                        )}
                        data-testid={`filter-query-remove-${group.id}`}
                        onClick={() =>
                            onChange(removeFilterNode(root, group.id))
                        }
                    >
                        <X className="size-3.5" aria-hidden="true" />
                        {t('side_panel.filters_section.query.remove')}
                    </Button>
                )}
            </div>
            {group.children.length === 0 && isRoot ? (
                <p className="text-xs text-muted-foreground">
                    {t('side_panel.filters_section.query.empty')}
                </p>
            ) : null}
            <div className="flex flex-col gap-2">
                {group.children.map((child) => (
                    <FilterQueryNode
                        key={child.id}
                        root={root}
                        node={child}
                        depth={depth + 1}
                        tags={tags}
                        areas={areas}
                        schemas={schemas}
                        readOnly={readOnly}
                        onChange={onChange}
                    />
                ))}
            </div>
            {readOnly ? null : (
                <div className="flex flex-wrap gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        disabled={!canAddCondition}
                        data-testid={`filter-query-add-condition-${group.id}`}
                        onClick={() =>
                            onChange(addConditionToGroup(root, group.id))
                        }
                    >
                        {t('side_panel.filters_section.query.add_condition')}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        disabled={!canAddGroup}
                        data-testid={`filter-query-add-group-${group.id}`}
                        onClick={() =>
                            onChange(addGroupToGroup(root, group.id))
                        }
                    >
                        {t('side_panel.filters_section.query.add_group')}
                    </Button>
                </div>
            )}
        </div>
    );
};

const FilterQueryNode: React.FC<{
    root: FilterGroup;
    node: FilterExpression;
    depth: number;
    tags: readonly DiagramTag[];
    areas: readonly Area[];
    schemas: readonly EditorSchemaOption[];
    readOnly?: boolean;
    onChange: (expression: FilterGroup) => void;
}> = ({ root, node, depth, tags, areas, schemas, readOnly, onChange }) => {
    if (node.kind === 'group') {
        return (
            <FilterQueryGroup
                root={root}
                group={node}
                depth={depth}
                tags={tags}
                areas={areas}
                schemas={schemas}
                readOnly={readOnly}
                onChange={onChange}
            />
        );
    }

    return (
        <FilterQueryConditionRow
            condition={node}
            tags={tags}
            areas={areas}
            schemas={schemas}
            readOnly={readOnly}
            onChange={(condition) =>
                onChange(replaceFilterCondition(root, node.id, condition))
            }
            onRemove={() => onChange(removeFilterNode(root, node.id))}
        />
    );
};
