import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { formatConversationUnreadCount } from './conversation-unread-count';

export interface ConversationUnreadBadgeProps {
    count: number;
    ariaLabel: string;
    className?: string;
    testId?: string;
}

export const ConversationUnreadBadge: React.FC<
    ConversationUnreadBadgeProps
> = ({ count, ariaLabel, className, testId = 'conversation-unread-badge' }) => {
    if (count <= 0) {
        return null;
    }

    const displayCount = formatConversationUnreadCount(count);

    return (
        <span
            className={cn(
                'pointer-events-none absolute left-0 top-0 z-20 inline-flex min-h-[1.125rem] min-w-[1.125rem] -translate-x-1/3 -translate-y-1/3 items-center justify-center rounded-full bg-pink-600 px-1 text-[10px] font-semibold leading-none text-white dark:bg-pink-500',
                className
            )}
            data-testid={testId}
            aria-label={ariaLabel}
            role="status"
        >
            <span aria-hidden="true">{displayCount}</span>
        </span>
    );
};

export interface ConversationUnreadBadgeWithTranslationProps {
    count: number;
    translationKey: string;
    className?: string;
    testId?: string;
}

export const ConversationUnreadBadgeWithTranslation: React.FC<
    ConversationUnreadBadgeWithTranslationProps
> = ({ count, translationKey, className, testId }) => {
    const { t } = useTranslation();
    const ariaLabel = useMemo(
        () => t(translationKey, { count }),
        [count, t, translationKey]
    );

    return (
        <ConversationUnreadBadge
            count={count}
            ariaLabel={ariaLabel}
            className={className}
            testId={testId}
        />
    );
};
