import React, { useCallback } from 'react';
import { ListFilter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/button/button';
import { Checkbox } from '@/components/checkbox/checkbox';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/popover/popover';
import { ConversationTargetTypeIcon } from '@/components/conversations/conversation-target-type-icon';
import {
    CONVERSATION_TARGET_TYPES,
    type ConversationTargetType,
} from '@/lib/conversations/conversation-types';

const TARGETS_KEY = 'side_panel.conversations_section.targets';

export interface ConversationTargetTypeFilterProps {
    selectedTargetTypes: ReadonlyArray<ConversationTargetType>;
    onSelectedTargetTypesChange: (
        targetTypes: ConversationTargetType[]
    ) => void;
}

export const ConversationTargetTypeFilter: React.FC<
    ConversationTargetTypeFilterProps
> = ({ selectedTargetTypes, onSelectedTargetTypesChange }) => {
    const { t } = useTranslation();

    const handleToggleType = useCallback(
        (targetType: ConversationTargetType, checked: boolean) => {
            if (checked) {
                onSelectedTargetTypesChange([
                    ...selectedTargetTypes,
                    targetType,
                ]);
                return;
            }

            onSelectedTargetTypesChange(
                selectedTargetTypes.filter((type) => type !== targetType)
            );
        },
        [onSelectedTargetTypesChange, selectedTargetTypes]
    );

    const triggerAriaLabel = t(
        'side_panel.conversations_section.type_filter.trigger_aria'
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
                    {t('side_panel.conversations_section.type_filter.trigger')}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-52 p-3">
                <div className="flex flex-col gap-2">
                    <p className="text-sm font-semibold">
                        {t(
                            'side_panel.conversations_section.type_filter.label'
                        )}
                    </p>
                    <ul className="flex flex-col gap-1" role="list">
                        {CONVERSATION_TARGET_TYPES.map((targetType) => {
                            const isChecked =
                                selectedTargetTypes.includes(targetType);

                            return (
                                <li key={targetType}>
                                    <label className="flex cursor-pointer items-center justify-between gap-2 rounded-md px-1 py-1.5 hover:bg-muted/60">
                                        <span className="inline-flex min-w-0 items-center gap-2 text-sm">
                                            <ConversationTargetTypeIcon
                                                targetType={targetType}
                                                className="text-muted-foreground"
                                            />
                                            <span className="truncate">
                                                {t(
                                                    `${TARGETS_KEY}.${targetType}`
                                                )}
                                            </span>
                                        </span>
                                        <Checkbox
                                            checked={isChecked}
                                            onCheckedChange={(value) =>
                                                handleToggleType(
                                                    targetType,
                                                    value === true
                                                )
                                            }
                                            aria-label={t(
                                                `${TARGETS_KEY}.${targetType}`
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
