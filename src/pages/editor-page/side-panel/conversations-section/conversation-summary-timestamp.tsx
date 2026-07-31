import React, { useLayoutEffect, useMemo, useState } from 'react';
import TimeAgo from 'timeago-react';
import { useTranslation } from 'react-i18next';
import { register as registerLocale } from 'timeago.js';
import { resolveTimeAgoLocale } from '@/lib/i18n/timeago-locale';

export interface ConversationSummaryTimestampProps {
    timestamp: string | null;
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

export const ConversationSummaryTimestamp: React.FC<
    ConversationSummaryTimestampProps
> = ({ timestamp }) => {
    const { t, i18n } = useTranslation();
    const [timeAgoLocale, setTimeAgoLocale] = useState(() =>
        registerTimeAgoLanguage(i18n.language)
    );

    useLayoutEffect(() => {
        setTimeAgoLocale(registerTimeAgoLanguage(i18n.language));
    }, [i18n.language]);

    const parsedTimestamp = useMemo(
        () => (timestamp ? parseTimestamp(timestamp) : null),
        [timestamp]
    );

    if (!parsedTimestamp) {
        return null;
    }

    return (
        <time
            className="shrink-0 text-xs text-muted-foreground"
            dateTime={timestamp ?? undefined}
            title={parsedTimestamp.exactLabel}
        >
            <span className="sr-only">
                {t('side_panel.conversations_section.summary.last_activity')}
                :{' '}
            </span>
            <TimeAgo datetime={parsedTimestamp.date} locale={timeAgoLocale} />
        </time>
    );
};
