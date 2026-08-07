import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { resolveIntlLocale } from '@/lib/i18n/intl-locale';
import {
    groupConversationMessagesByLocalDay,
    resolveConversationDaySeparatorLabel,
    type ConversationMessageDayGroup,
} from '@/lib/conversations/conversation-message-datetime';
import type { DiagramConversationMessage } from '@/lib/conversations/conversation-types';
import { useUserTimeZone } from '@/hooks/use-user-time-zone';

export interface ConversationMessageDayGroupViewModel extends ConversationMessageDayGroup {
    label: string;
}

export const useConversationMessageDayGroups = (
    messages: ReadonlyArray<DiagramConversationMessage>
): ConversationMessageDayGroupViewModel[] => {
    const { i18n, t } = useTranslation();
    const timeZone = useUserTimeZone();
    const intlLocale = resolveIntlLocale(i18n.language);
    return useMemo(() => {
        const referenceNow = new Date();
        const groups = groupConversationMessagesByLocalDay(messages, timeZone);

        return groups.map((group) => ({
            ...group,
            label:
                resolveConversationDaySeparatorLabel({
                    anchorIso: group.anchorIso,
                    referenceNow,
                    intlLocale,
                    timeZone,
                    translate: (key) =>
                        t(
                            `side_panel.conversations_section.detail.message.day_separator.${key}`
                        ),
                }) ?? group.dayKey,
        }));
    }, [intlLocale, messages, timeZone, t]);
};
