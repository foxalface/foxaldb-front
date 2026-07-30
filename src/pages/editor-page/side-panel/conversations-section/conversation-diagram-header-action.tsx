import React from 'react';
import { SlBubbles } from 'react-icons/sl';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/button/button';
import { useOpenTargetConversation } from '@/hooks/use-open-target-conversation';
import type { DiagramConversationTarget } from '@/lib/conversations/conversation-types';

export interface ConversationDiagramHeaderActionProps {}

const DIAGRAM_TARGET: DiagramConversationTarget = {
    targetType: 'diagram',
    targetId: null,
};

export const ConversationDiagramHeaderAction: React.FC<
    ConversationDiagramHeaderActionProps
> = () => {
    const { t } = useTranslation();
    const { hasActiveConversation, canCreate, isPending, openConversation } =
        useOpenTargetConversation(DIAGRAM_TARGET);

    if (!hasActiveConversation && !canCreate) {
        return null;
    }

    const labelKey = hasActiveConversation
        ? 'side_panel.conversations_section.target_entry.open'
        : isPending
          ? 'side_panel.conversations_section.target_entry.pending'
          : 'side_panel.conversations_section.target_entry.start';

    return (
        <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 gap-1.5 px-2 text-xs"
            aria-busy={isPending}
            disabled={isPending}
            data-testid="conversation-diagram-header-action"
            onClick={() => {
                void openConversation();
            }}
        >
            <SlBubbles className="size-3.5" aria-hidden="true" />
            {t(labelKey)}
        </Button>
    );
};
