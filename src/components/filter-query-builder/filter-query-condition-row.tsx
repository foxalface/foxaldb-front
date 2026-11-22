import React from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/input/input';
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
    FilterCondition,
    FilterProperty,
    FilterTarget,
} from '@/lib/domain/filter-expression';
import {
    operatorsForProperty,
    propertiesForTarget,
    withConditionOperator,
    withConditionProperty,
    withConditionTarget,
    withConditionValue,
} from '@/lib/domain/filter-expression';
import { FilterQueryConditionStatus } from './filter-query-condition-status';
import { FilterQueryDestructiveButton } from './filter-query-destructive-button';
import { FilterQueryMultiValue } from './filter-query-multi-value';

const selectTriggerClassName = 'h-8 text-xs';

export const FilterQueryConditionRow: React.FC<{
    condition: FilterCondition;
    tags: readonly DiagramTag[];
    areas: readonly Area[];
    schemas: readonly EditorSchemaOption[];
    readOnly?: boolean;
    onChange: (condition: FilterCondition) => void;
    onRemove: () => void;
}> = ({
    condition,
    tags,
    areas,
    schemas,
    readOnly = false,
    onChange,
    onRemove,
}) => {
    const { t } = useTranslation();
    const properties = propertiesForTarget(condition.target);
    const operators = operatorsForProperty(condition.property);

    return (
        <div
            className="rounded-md border bg-background p-2"
            data-testid={`filter-query-condition-${condition.id}`}
        >
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-1">
                <Select
                    value={condition.target}
                    disabled={readOnly}
                    onValueChange={(value) =>
                        onChange(
                            withConditionTarget(
                                condition,
                                value as FilterTarget
                            )
                        )
                    }
                >
                    <SelectTrigger
                        className={selectTriggerClassName}
                        aria-label={t(
                            'side_panel.filters_section.query.target.label'
                        )}
                        data-testid={`filter-query-target-${condition.id}`}
                    >
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {(
                            ['table', 'field', 'relationship', 'view'] as const
                        ).map((target) => (
                            <SelectItem key={target} value={target}>
                                {t(
                                    `side_panel.filters_section.query.target.${target}`
                                )}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select
                    value={condition.property}
                    disabled={readOnly}
                    onValueChange={(value) =>
                        onChange(
                            withConditionProperty(
                                condition,
                                value as FilterProperty
                            )
                        )
                    }
                >
                    <SelectTrigger
                        className={selectTriggerClassName}
                        aria-label={t(
                            'side_panel.filters_section.query.property.label'
                        )}
                        data-testid={`filter-query-property-${condition.id}`}
                    >
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {properties.map((property) => (
                            <SelectItem key={property} value={property}>
                                {t(
                                    `side_panel.filters_section.query.property.${property}`
                                )}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <div className="flex items-center justify-end gap-0.5">
                    <FilterQueryConditionStatus
                        condition={condition}
                        activeLabel={t(
                            'side_panel.filters_section.query.status_active'
                        )}
                        incompleteLabel={t(
                            'side_panel.filters_section.query.status_incomplete'
                        )}
                    />
                    {readOnly ? null : (
                        <FilterQueryDestructiveButton
                            label={t(
                                'side_panel.filters_section.query.delete_condition'
                            )}
                            testId={`filter-query-remove-${condition.id}`}
                            onClick={onRemove}
                        />
                    )}
                </div>
                <Select
                    value={condition.operator}
                    disabled={readOnly}
                    onValueChange={(value) =>
                        onChange(withConditionOperator(condition, value))
                    }
                >
                    <SelectTrigger
                        className={selectTriggerClassName}
                        aria-label={t(
                            'side_panel.filters_section.query.operator.label'
                        )}
                        data-testid={`filter-query-operator-${condition.id}`}
                    >
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {operators.map((operator) => (
                            <SelectItem key={operator} value={operator}>
                                {t(
                                    `side_panel.filters_section.query.operator.${operator}`
                                )}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {condition.property === 'name' ? (
                    <Input
                        className="h-8 text-xs"
                        value={condition.value}
                        disabled={readOnly}
                        placeholder={t(
                            'side_panel.filters_section.query.value.name_placeholder'
                        )}
                        aria-label={t(
                            'side_panel.filters_section.query.value.label'
                        )}
                        data-testid={`filter-query-value-${condition.id}`}
                        onChange={(event) =>
                            onChange(
                                withConditionValue(
                                    condition,
                                    event.target.value
                                )
                            )
                        }
                    />
                ) : (
                    <FilterQueryMultiValue
                        conditionId={condition.id}
                        label={t(
                            `side_panel.filters_section.query.value.${condition.property === 'tag' ? 'tags' : condition.property === 'area' ? 'areas' : 'schemas'}`
                        )}
                        selectLabel={t(
                            'side_panel.filters_section.query.value.select'
                        )}
                        options={
                            condition.property === 'tag'
                                ? tags.map((tag) => ({
                                      id: tag.id,
                                      name: tag.name,
                                      color: tag.color,
                                  }))
                                : condition.property === 'area'
                                  ? areas.map((area) => ({
                                        id: area.id,
                                        name: area.name,
                                        color: area.color,
                                    }))
                                  : schemas.map((schema) => ({
                                        id: schema.id,
                                        name: schema.name,
                                    }))
                        }
                        selectedIds={condition.value}
                        readOnly={readOnly}
                        onChange={(value) =>
                            onChange(withConditionValue(condition, value))
                        }
                    />
                )}
            </div>
        </div>
    );
};
