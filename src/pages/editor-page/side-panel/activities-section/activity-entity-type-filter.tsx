import React, { useCallback, useMemo } from 'react';
import { ListFilter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/button/button';
import { Checkbox } from '@/components/checkbox/checkbox';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/popover/popover';
import { SidePanelEntityTypeIcon } from '@/components/side-panel/side-panel-entity-type-icon';
import {
    ACTIVITY_ENTITY_TYPES,
    type ActivityEntityType,
} from '@/components/side-panel/side-panel-entity-type-icons';
import { SidePanelTypeFilterHeader } from '@/components/side-panel/side-panel-type-filter-header';
import {
    getTypeFilterCheckboxState,
    getTypeFilterSelectionAfterHeaderToggle,
} from '@/components/side-panel/side-panel-type-filter-utils';

const TYPES_KEY = 'side_panel.activities_section.types';

export interface ActivityEntityTypeFilterProps {
    selectedEntityTypes: ReadonlyArray<ActivityEntityType>;
    onSelectedEntityTypesChange: (entityTypes: ActivityEntityType[]) => void;
}

export const ActivityEntityTypeFilter: React.FC<
    ActivityEntityTypeFilterProps
> = ({ selectedEntityTypes, onSelectedEntityTypesChange }) => {
    const { t } = useTranslation();

    const handleToggleType = useCallback(
        (entityType: ActivityEntityType, checked: boolean) => {
            if (checked) {
                onSelectedEntityTypesChange([
                    ...selectedEntityTypes,
                    entityType,
                ]);
                return;
            }

            onSelectedEntityTypesChange(
                selectedEntityTypes.filter((type) => type !== entityType)
            );
        },
        [onSelectedEntityTypesChange, selectedEntityTypes]
    );

    const headerCheckedState = useMemo(
        () =>
            getTypeFilterCheckboxState(
                selectedEntityTypes.length,
                ACTIVITY_ENTITY_TYPES.length
            ),
        [selectedEntityTypes.length]
    );

    const handleToggleAll = useCallback(() => {
        onSelectedEntityTypesChange(
            getTypeFilterSelectionAfterHeaderToggle(
                selectedEntityTypes,
                ACTIVITY_ENTITY_TYPES
            )
        );
    }, [onSelectedEntityTypesChange, selectedEntityTypes]);

    const triggerAriaLabel = t(
        'side_panel.activities_section.type_filter.trigger_aria'
    );

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="secondary"
                    className="h-8 shrink-0 p-2 text-xs"
                    aria-label={triggerAriaLabel}
                >
                    <ListFilter className="h-4" aria-hidden="true" />
                    {t('side_panel.activities_section.type_filter.trigger')}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-52 p-3">
                <div className="flex flex-col gap-2">
                    <SidePanelTypeFilterHeader
                        label={t(
                            'side_panel.activities_section.type_filter.label'
                        )}
                        checkedState={headerCheckedState}
                        onCheckedChange={handleToggleAll}
                        checkboxAriaLabel={t('select_all')}
                    />
                    <ul className="flex flex-col gap-1" role="list">
                        {ACTIVITY_ENTITY_TYPES.map((entityType) => {
                            const isChecked =
                                selectedEntityTypes.includes(entityType);

                            return (
                                <li key={entityType}>
                                    <label className="flex cursor-pointer items-center justify-between gap-2 rounded-md px-1 py-1.5 hover:bg-muted/60">
                                        <span className="inline-flex min-w-0 items-center gap-2 text-sm">
                                            <SidePanelEntityTypeIcon
                                                entityType={entityType}
                                                className="text-muted-foreground"
                                            />
                                            <span className="truncate">
                                                {t(
                                                    `${TYPES_KEY}.${entityType}`
                                                )}
                                            </span>
                                        </span>
                                        <Checkbox
                                            checked={isChecked}
                                            onCheckedChange={(value) =>
                                                handleToggleType(
                                                    entityType,
                                                    value === true
                                                )
                                            }
                                            aria-label={t(
                                                `${TYPES_KEY}.${entityType}`
                                            )}
                                        />
                                    </label>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </PopoverContent>
        </Popover>
    );
};
