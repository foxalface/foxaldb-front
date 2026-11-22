import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Plus } from 'lucide-react';
import { Button } from '@/components/button/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/dropdown-menu/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/select/select';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/tooltip/tooltip';
import type { Area } from '@/lib/domain/area';
import type { EditorSchemaOption } from '@/lib/domain/editor-filter-eligibility';
import type { DiagramTag } from '@/lib/domain/diagram-tag';
import type {
    FilterExpression,
    FilterGroup,
    FilterGroupOperator,
} from '@/lib/domain/filter-expression';
import { FilterQueryEmptyState } from './filter-query-empty-state';
import {
    FILTER_MAX_GROUP_DEPTH,
    addConditionToGroup,
    addGroupToGroup,
    canAddFilterGroup,
    clearFilterGroupChildren,
    groupHasIncompleteDescendantConditions,
    removeFilterNode,
    replaceFilterCondition,
    setGroupOperator,
} from '@/lib/domain/filter-expression';
import { isFilterExpressionSupported } from '@/lib/domain/filter-evaluation';
import { cn } from '@/lib/utils';
import { FilterQueryConditionRow } from './filter-query-condition-row';
import { FilterQueryDestructiveButton } from './filter-query-destructive-button';
import { useFilterQueryFoldout } from './filter-query-foldout-context';
import { FilterQueryGroupFoldToggle } from './filter-query-group-fold-toggle';

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
    const { isGroupExpanded, toggleGroupExpanded } = useFilterQueryFoldout();
    const isRoot = depth === 0;
    const isNested = depth > 0;
    const childCount = group.children.length;
    const showGroupOperator = childCount >= 2;
    const withinComplexity = isFilterExpressionSupported(root);
    const canAddCondition = !readOnly && withinComplexity;
    const canAddGroup =
        !readOnly &&
        depth < FILTER_MAX_GROUP_DEPTH &&
        canAddFilterGroup(root, group.id) &&
        withinComplexity;
    const expanded = isRoot || isGroupExpanded(group.id);
    const hasIncompleteDescendants =
        isNested && groupHasIncompleteDescendantConditions(group);
    const showGroupIncompleteWarning = hasIncompleteDescendants && !expanded;
    const rootDeleteDisabled = isRoot && childCount === 0;
    const groupIncompleteWarningLabel = t(
        'side_panel.filters_section.query.group_incomplete_warning'
    );

    const handleDelete = () => {
        if (rootDeleteDisabled) {
            return;
        }

        if (isRoot) {
            onChange(clearFilterGroupChildren(root, group.id));
            return;
        }

        onChange(removeFilterNode(root, group.id));
    };

    return (
        <div
            className={cn(
                'flex flex-col gap-2',
                isNested &&
                    'rounded-md border border-border/70 bg-muted/25 p-2 pl-3 pt-2'
            )}
            data-testid={`filter-query-group-${group.id}`}
            data-expanded={expanded ? 'true' : 'false'}
        >
            <div
                className={cn(
                    'flex items-center justify-between gap-2',
                    isNested && 'pt-0.5'
                )}
            >
                <div className="flex min-h-8 min-w-0 flex-1 items-center gap-1.5">
                    {isNested ? (
                        <FilterQueryGroupFoldToggle
                            groupId={group.id}
                            expanded={expanded}
                            collapseLabel={t(
                                'side_panel.filters_section.query.collapse_group'
                            )}
                            expandLabel={t(
                                'side_panel.filters_section.query.expand_group'
                            )}
                            onToggle={() => toggleGroupExpanded(group.id)}
                        />
                    ) : null}
                    {showGroupOperator ? (
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
                                className="h-8 w-24 shrink-0 text-xs"
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
                    ) : null}
                    {showGroupIncompleteWarning ? (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span
                                    className="inline-flex shrink-0 items-center"
                                    role="img"
                                    aria-label={groupIncompleteWarningLabel}
                                    data-testid={`filter-query-group-incomplete-${group.id}`}
                                >
                                    <AlertTriangle
                                        className="size-3.5 text-amber-600 dark:text-amber-500"
                                        aria-hidden="true"
                                    />
                                </span>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                {groupIncompleteWarningLabel}
                            </TooltipContent>
                        </Tooltip>
                    ) : null}
                </div>
                {readOnly ? null : (
                    <div className="flex shrink-0 items-center gap-1">
                        <DropdownMenu>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            className="size-8 shrink-0 p-0"
                                            disabled={
                                                !canAddCondition && !canAddGroup
                                            }
                                            aria-label={t(
                                                'side_panel.filters_section.query.add'
                                            )}
                                            data-testid={`filter-query-add-${group.id}`}
                                        >
                                            <Plus
                                                className="size-4"
                                                aria-hidden="true"
                                            />
                                        </Button>
                                    </DropdownMenuTrigger>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    {t('side_panel.filters_section.query.add')}
                                </TooltipContent>
                            </Tooltip>
                            <DropdownMenuContent align="start">
                                <DropdownMenuItem
                                    disabled={!canAddCondition}
                                    data-testid={`filter-query-add-condition-${group.id}`}
                                    onClick={() =>
                                        onChange(
                                            addConditionToGroup(root, group.id)
                                        )
                                    }
                                >
                                    {t(
                                        'side_panel.filters_section.query.add_condition'
                                    )}
                                </DropdownMenuItem>
                                {canAddGroup ? (
                                    <DropdownMenuItem
                                        data-testid={`filter-query-add-group-${group.id}`}
                                        onClick={() =>
                                            onChange(
                                                addGroupToGroup(root, group.id)
                                            )
                                        }
                                    >
                                        {t(
                                            'side_panel.filters_section.query.add_group'
                                        )}
                                    </DropdownMenuItem>
                                ) : null}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <FilterQueryDestructiveButton
                            label={
                                isRoot
                                    ? t(
                                          'side_panel.filters_section.query.delete_all'
                                      )
                                    : t(
                                          'side_panel.filters_section.query.delete_group'
                                      )
                            }
                            testId={`filter-query-delete-${group.id}`}
                            disabled={rootDeleteDisabled}
                            onClick={handleDelete}
                        />
                    </div>
                )}
            </div>
            {expanded ? (
                <>
                    {childCount === 0 ? (
                        isRoot ? (
                            <div data-testid="filter-query-empty-root">
                                <FilterQueryEmptyState
                                    title={t(
                                        'side_panel.filters_section.query.empty_state.title'
                                    )}
                                    description={t(
                                        'side_panel.filters_section.query.empty_state.description'
                                    )}
                                    addConditionLabel={t(
                                        'side_panel.filters_section.query.empty_state.add_condition'
                                    )}
                                    addGroupLabel={t(
                                        'side_panel.filters_section.query.empty_state.add_group'
                                    )}
                                    onAddCondition={
                                        readOnly || !canAddCondition
                                            ? undefined
                                            : () =>
                                                  onChange(
                                                      addConditionToGroup(
                                                          root,
                                                          group.id
                                                      )
                                                  )
                                    }
                                    onAddGroup={
                                        readOnly || !canAddGroup
                                            ? undefined
                                            : () =>
                                                  onChange(
                                                      addGroupToGroup(
                                                          root,
                                                          group.id
                                                      )
                                                  )
                                    }
                                />
                            </div>
                        ) : (
                            <p
                                className="text-xs text-muted-foreground"
                                data-testid={`filter-query-empty-${group.id}`}
                            >
                                {t('side_panel.filters_section.query.empty')}
                            </p>
                        )
                    ) : null}
                    {childCount > 0 ? (
                        <div
                            className="flex flex-col gap-2"
                            data-testid={`filter-query-group-body-${group.id}`}
                        >
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
                    ) : null}
                </>
            ) : null}
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
