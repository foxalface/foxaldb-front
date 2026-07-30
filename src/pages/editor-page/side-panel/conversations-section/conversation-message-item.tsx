import React, { useLayoutEffect, useMemo, useState } from 'react';
import TimeAgo from 'timeago-react';
import { useTranslation } from 'react-i18next';
import { register as registerLocale } from 'timeago.js';
import { Avatar, AvatarFallback } from '@/components/avatar/avatar';
import type { DiagramConversationMessage } from '@/lib/conversations/conversation-types';
import { getUserInitials } from '@/lib/user';
import { resolveTimeAgoLocale } from '../comments-section/comment-timeago-locale';

export interface ConversationMessageItemProps {
    message: DiagramConversationMessage;
}

const parseTimestamp = (
    timestamp: string
): { date: Date; exactLabel: string } | null => {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return {
        date,
        exactLabel: date.toLocaleString(),
    };
};

const registerTimeAgoLanguage = (language: string): string => {
    const { locale, lang } = resolveTimeAgoLocale(language);
    registerLocale(lang, locale);
    return lang;
};

const isMessageEdited = (message: DiagramConversationMessage): boolean =>
    message.updatedAt !== message.createdAt;

export const ConversationMessageItem: React.FC<
    ConversationMessageItemProps
> = ({ message }) => {
    const { t, i18n } = useTranslation();
    const [timeAgoLocale, setTimeAgoLocale] = useState(() =>
        registerTimeAgoLanguage(i18n.language)
    );

    useLayoutEffect(() => {
        setTimeAgoLocale(registerTimeAgoLanguage(i18n.language));
    }, [i18n.language]);

    const displayName = message.user?.fullName?.trim()
        ? message.user.fullName.trim()
        : t('side_panel.conversations_section.deleted_user');

    const initials = useMemo(() => {
        if (!message.user) {
            return '?';
        }

        return getUserInitials(message.user.firstName, message.user.lastName);
    }, [message.user]);

    const parsedCreatedAt = useMemo(
        () => parseTimestamp(message.createdAt),
        [message.createdAt]
    );

    const edited = isMessageEdited(message);

    return (
        <article
            className="flex flex-col gap-1.5 px-1 py-3"
            data-testid={`conversation-message-${message.id}`}
        >
            <div className="flex min-w-0 items-start gap-2">
                <Avatar className="size-7 shrink-0" aria-hidden="true">
                    <AvatarFallback className="text-[10px] font-medium">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                        <span className="truncate text-sm font-medium text-foreground">
                            {displayName}
                        </span>
                        {parsedCreatedAt ? (
                            <time
                                className="shrink-0 text-xs text-muted-foreground"
                                dateTime={message.createdAt}
                                title={parsedCreatedAt.exactLabel}
                            >
                                <TimeAgo
                                    datetime={parsedCreatedAt.date}
                                    locale={timeAgoLocale}
                                />
                            </time>
                        ) : null}
                        {edited ? (
                            <span
                                className="shrink-0 text-xs text-muted-foreground"
                                aria-label={t(
                                    'side_panel.conversations_section.detail.message.edited_aria'
                                )}
                            >
                                {t(
                                    'side_panel.conversations_section.detail.message.edited'
                                )}
                            </span>
                        ) : null}
                    </div>
                    <p className="mt-1 whitespace-pre-wrap break-words text-sm text-foreground [overflow-wrap:anywhere]">
                        {message.body}
                    </p>
                </div>
            </div>
        </article>
    );
};
