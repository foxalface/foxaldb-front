import type { DiagramConversationMessage } from '@/lib/conversations/conversation-types';

export interface ConversationMessageDayGroup {
    dayKey: string;
    anchorIso: string;
    messages: DiagramConversationMessage[];
}

export type ConversationDaySeparatorLabelKey = 'today' | 'yesterday';

export interface ResolveDaySeparatorLabelArgs {
    anchorIso: string;
    referenceNow: Date;
    intlLocale: string;
    timeZone: string;
    translate: (key: ConversationDaySeparatorLabelKey) => string;
}

const parseUtcIso = (utcIso: string): Date | null => {
    const date = new Date(utcIso);
    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date;
};

export const getLocalDayKey = (date: Date, timeZone: string): string =>
    new Intl.DateTimeFormat('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone,
    }).format(date);

export const getPreviousDayKey = (dayKey: string): string => {
    const [year, month, day] = dayKey.split('-').map(Number);
    const civilDate = new Date(year, month - 1, day);
    civilDate.setDate(civilDate.getDate() - 1);

    const previousYear = civilDate.getFullYear();
    const previousMonth = String(civilDate.getMonth() + 1).padStart(2, '0');
    const previousDay = String(civilDate.getDate()).padStart(2, '0');

    return `${previousYear}-${previousMonth}-${previousDay}`;
};

const formatFrenchMessageTime = (
    date: Date,
    intlLocale: string,
    timeZone: string
): string => {
    const parts = new Intl.DateTimeFormat(intlLocale, {
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
        timeZone,
    }).formatToParts(date);

    const hour = parts.find((part) => part.type === 'hour')?.value ?? '';
    const minute = parts.find((part) => part.type === 'minute')?.value ?? '';

    return `${hour} h ${minute}`;
};

export const formatConversationMessageTime = (
    utcIso: string,
    intlLocale: string,
    timeZone: string
): string | null => {
    const date = parseUtcIso(utcIso);
    if (date === null) {
        return null;
    }

    if (intlLocale.startsWith('fr')) {
        return formatFrenchMessageTime(date, intlLocale, timeZone);
    }

    return new Intl.DateTimeFormat(intlLocale, {
        hour: 'numeric',
        minute: '2-digit',
        timeZone,
    }).format(date);
};

export const formatConversationMessageExactTooltip = (
    utcIso: string,
    intlLocale: string,
    timeZone: string
): string | null => {
    const date = parseUtcIso(utcIso);
    if (date === null) {
        return null;
    }

    return new Intl.DateTimeFormat(intlLocale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZone,
    }).format(date);
};

export const resolveConversationDaySeparatorLabel = ({
    anchorIso,
    referenceNow,
    intlLocale,
    timeZone,
    translate,
}: ResolveDaySeparatorLabelArgs): string | null => {
    const anchorDate = parseUtcIso(anchorIso);
    if (anchorDate === null) {
        return null;
    }

    const dayKey = getLocalDayKey(anchorDate, timeZone);
    const todayKey = getLocalDayKey(referenceNow, timeZone);

    if (dayKey === todayKey) {
        return translate('today');
    }

    if (dayKey === getPreviousDayKey(todayKey)) {
        return translate('yesterday');
    }

    return new Intl.DateTimeFormat(intlLocale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        timeZone,
    }).format(anchorDate);
};

export const groupConversationMessagesByLocalDay = (
    messages: ReadonlyArray<DiagramConversationMessage>,
    timeZone: string
): ConversationMessageDayGroup[] => {
    const groups: ConversationMessageDayGroup[] = [];
    let currentGroup: ConversationMessageDayGroup | null = null;

    for (const message of messages) {
        const date = parseUtcIso(message.createdAt);
        if (date === null) {
            continue;
        }

        const dayKey = getLocalDayKey(date, timeZone);

        if (currentGroup === null || currentGroup.dayKey !== dayKey) {
            currentGroup = {
                dayKey,
                anchorIso: message.createdAt,
                messages: [message],
            };
            groups.push(currentGroup);
            continue;
        }

        currentGroup.messages.push(message);
    }

    return groups;
};
