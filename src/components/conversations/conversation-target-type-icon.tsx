import React from 'react';
import type { ConversationTargetType } from '@/lib/conversations/conversation-types';
import { getSidePanelEntityTypeIcon } from '@/components/side-panel/side-panel-entity-type-icons';
import { cn } from '@/lib/utils';

export interface ConversationTargetTypeIconProps {
    targetType: ConversationTargetType;
    className?: string;
}

export const ConversationTargetTypeIcon: React.FC<
    ConversationTargetTypeIconProps
> = ({ targetType, className }) => {
    const Icon = getSidePanelEntityTypeIcon(targetType);

    return (
        <Icon
            data-testid={`conversation-target-type-icon-${targetType}`}
            className={cn('size-3.5 shrink-0', className)}
            aria-hidden="true"
        />
    );
};
