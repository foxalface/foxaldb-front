import React from 'react';
import {
    FileType2,
    HelpCircle,
    Table,
    Waypoints,
    Workflow,
    type LucideIcon,
} from 'lucide-react';
import type { ConversationTargetType } from '@/lib/conversations/conversation-types';
import { cn } from '@/lib/utils';

const CONVERSATION_TARGET_TYPE_ICONS: Record<
    ConversationTargetType,
    LucideIcon
> = {
    diagram: Waypoints,
    table: Table,
    field: FileType2,
    relationship: Workflow,
};

export interface ConversationTargetTypeIconProps {
    targetType: ConversationTargetType;
    className?: string;
}

export const ConversationTargetTypeIcon: React.FC<
    ConversationTargetTypeIconProps
> = ({ targetType, className }) => {
    const Icon = CONVERSATION_TARGET_TYPE_ICONS[targetType] ?? HelpCircle;

    return (
        <Icon
            data-testid={`conversation-target-type-icon-${targetType}`}
            className={cn('size-3.5 shrink-0', className)}
            aria-hidden="true"
        />
    );
};
