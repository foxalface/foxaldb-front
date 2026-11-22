import React from 'react';
import { Button } from '@/components/button/button';
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/empty/empty';
import {
    sidePanelEmptyStateClassName,
    sidePanelEmptyStateIcon,
} from '@/components/side-panel-empty-state/side-panel-empty-state';
import { cn } from '@/lib/utils';

const emptyActionButtonClassName = 'h-8 w-full gap-1.5 font-normal';

export const FilterQueryEmptyState: React.FC<{
    title: string;
    description: string;
    addConditionLabel: string;
    addGroupLabel: string;
    onAddCondition?: () => void;
    onAddGroup?: () => void;
}> = ({
    title,
    description,
    addConditionLabel,
    addGroupLabel,
    onAddCondition,
    onAddGroup,
}) => {
    const showActions = onAddCondition ?? onAddGroup;

    return (
        <div
            className={cn(
                'flex flex-1 flex-col items-center justify-center space-y-1',
                sidePanelEmptyStateClassName
            )}
        >
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="default">
                        {sidePanelEmptyStateIcon}
                    </EmptyMedia>
                    <EmptyTitle>{title}</EmptyTitle>
                    <EmptyDescription>{description}</EmptyDescription>
                </EmptyHeader>
                {showActions ? (
                    <EmptyContent className="w-full max-w-xs gap-2">
                        {onAddCondition ? (
                            <Button
                                type="button"
                                variant="outline"
                                className={emptyActionButtonClassName}
                                onClick={onAddCondition}
                            >
                                {addConditionLabel}
                            </Button>
                        ) : null}
                        {onAddGroup ? (
                            <Button
                                type="button"
                                variant="outline"
                                className={emptyActionButtonClassName}
                                onClick={onAddGroup}
                            >
                                {addGroupLabel}
                            </Button>
                        ) : null}
                    </EmptyContent>
                ) : (
                    <EmptyContent />
                )}
            </Empty>
        </div>
    );
};
