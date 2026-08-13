import React from 'react';
import { IoMdArrowRoundDown } from 'react-icons/io';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/button/button';
import { cn } from '@/lib/utils';

export interface ConversationNewMessagesBadgeProps {
    count: number;
    onClick: () => void;
    className?: string;
}

export const ConversationNewMessagesBadge: React.FC<
    ConversationNewMessagesBadgeProps
> = ({ count, onClick, className }) => {
    const { t } = useTranslation();

    if (count <= 0) {
        return null;
    }

    const label = t(
        'side_panel.conversations_section.detail.new_messages_badge_label',
        { count }
    );
    const ariaLabel = t(
        'side_panel.conversations_section.detail.new_messages_badge_aria',
        { count }
    );

    return (
        <div
            className={cn(
                'pointer-events-none absolute inset-x-0 bottom-2 z-10 flex justify-center',
                className
            )}
        >
            <Button
                type="button"
                size="sm"
                className="pointer-events-auto h-7 gap-1 rounded-full px-2.5 text-xs font-bold shadow-md"
                onClick={onClick}
                aria-label={ariaLabel}
                data-testid="conversation-new-messages-badge"
            >
                <IoMdArrowRoundDown
                    className="!size-3.5 shrink-0"
                    aria-hidden="true"
                />
                <span className="tabular-nums">{count}</span>
                <span>{label}</span>
            </Button>
        </div>
    );
};
