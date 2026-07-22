import React, { useLayoutEffect, useMemo, useState } from 'react';
import TimeAgo from 'timeago-react';
import { useTranslation } from 'react-i18next';
import { register as registerLocale } from 'timeago.js';
import { Avatar, AvatarFallback } from '@/components/avatar/avatar';
import type { CommentAuthor as CommentAuthorModel } from '@/lib/comments/comment-types';
import { getInitialsFromName } from '@/lib/realtime/presence-utils';
import { resolveTimeAgoLocale } from './comment-timeago-locale';

export interface CommentAuthorProps {
    user: CommentAuthorModel | null;
    createdAt: string;
}

const parseCreatedAt = (
    createdAt: string
): { date: Date; exactLabel: string } | null => {
    const date = new Date(createdAt);
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

export const CommentAuthor: React.FC<CommentAuthorProps> = ({
    user,
    createdAt,
}) => {
    const { t, i18n } = useTranslation();
    const [timeAgoLocale, setTimeAgoLocale] = useState(() =>
        registerTimeAgoLanguage(i18n.language)
    );

    useLayoutEffect(() => {
        setTimeAgoLocale(registerTimeAgoLanguage(i18n.language));
    }, [i18n.language]);

    const displayName = user?.name?.trim()
        ? user.name.trim()
        : t('side_panel.comments_section.deleted_user');

    const initials = useMemo(() => {
        if (!user?.name?.trim()) {
            return '?';
        }
        return getInitialsFromName(user.name);
    }, [user?.name]);

    const parsedCreatedAt = useMemo(
        () => parseCreatedAt(createdAt),
        [createdAt]
    );

    return (
        <div className="flex min-w-0 items-center gap-2">
            <Avatar className="size-7" aria-hidden="true">
                <AvatarFallback className="text-[10px] font-medium">
                    {initials}
                </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                <span className="truncate text-sm font-medium text-foreground">
                    {displayName}
                </span>
                {parsedCreatedAt ? (
                    <time
                        className="shrink-0 text-xs text-muted-foreground"
                        dateTime={createdAt}
                        title={parsedCreatedAt.exactLabel}
                    >
                        <TimeAgo
                            datetime={parsedCreatedAt.date}
                            locale={timeAgoLocale}
                        />
                    </time>
                ) : null}
            </div>
        </div>
    );
};
