import { describe, expect, it } from 'vitest';
import {
    formatConversationMessageExactTooltip,
    formatConversationMessageTime,
    getLocalDayKey,
    getPreviousDayKey,
    groupConversationMessagesByLocalDay,
    resolveConversationDaySeparatorLabel,
} from '@/lib/conversations/conversation-message-datetime';
import type { DiagramConversationMessage } from '@/lib/conversations/conversation-types';

const buildMessage = (
    overrides: Partial<DiagramConversationMessage> = {}
): DiagramConversationMessage => ({
    id: overrides.id ?? 1,
    conversationId: 10,
    body: 'Hello',
    user: null,
    createdAt: overrides.createdAt ?? '2026-08-07T14:45:00.000Z',
    updatedAt: overrides.createdAt ?? '2026-08-07T14:45:00.000Z',
    reactions: [],
    ...overrides,
});

describe('conversation-message-datetime', () => {
    it('maps local day keys across time zones near midnight', () => {
        const utcIso = '2026-08-07T22:30:00.000Z';
        const date = new Date(utcIso);

        expect(getLocalDayKey(date, 'Europe/Paris')).toBe('2026-08-08');
        expect(getLocalDayKey(date, 'America/New_York')).toBe('2026-08-07');
        expect(getLocalDayKey(date, 'Asia/Tokyo')).toBe('2026-08-08');
    });

    it('formats French message time with h separator', () => {
        expect(
            formatConversationMessageTime(
                '2026-08-07T14:45:00.000Z',
                'fr-FR',
                'Europe/Paris'
            )
        ).toBe('16 h 45');
    });

    it('formats English message time with meridiem', () => {
        const formatted = formatConversationMessageTime(
            '2026-08-07T14:45:00.000Z',
            'en-US',
            'America/New_York'
        );

        expect(formatted).toMatch(/10:45\s*AM/i);
    });

    it('formats exact tooltip with localized long date', () => {
        const tooltip = formatConversationMessageExactTooltip(
            '2026-08-07T14:45:00.000Z',
            'fr-FR',
            'Europe/Paris'
        );

        expect(tooltip).toContain('2026');
        expect(tooltip).toMatch(/16:45|16 h 45/);
    });

    it('resolves today and yesterday labels', () => {
        const referenceNow = new Date('2026-08-07T12:00:00.000Z');
        const translate = (key: 'today' | 'yesterday') =>
            key === 'today' ? 'Today' : 'Yesterday';

        expect(
            resolveConversationDaySeparatorLabel({
                anchorIso: '2026-08-07T08:00:00.000Z',
                referenceNow,
                intlLocale: 'en-US',
                timeZone: 'Europe/Paris',
                translate,
            })
        ).toBe('Today');

        expect(
            resolveConversationDaySeparatorLabel({
                anchorIso: '2026-08-06T20:00:00.000Z',
                referenceNow,
                intlLocale: 'en-US',
                timeZone: 'Europe/Paris',
                translate,
            })
        ).toBe('Yesterday');
    });

    it('resolves long weekday label for older days', () => {
        const label = resolveConversationDaySeparatorLabel({
            anchorIso: '2026-08-04T10:00:00.000Z',
            referenceNow: new Date('2026-08-07T12:00:00.000Z'),
            intlLocale: 'fr-FR',
            timeZone: 'Europe/Paris',
            translate: () => 'unused',
        });

        expect(label).toMatch(/4/);
        expect(label?.toLowerCase()).toMatch(/août|aout/);
    });

    it('groups chronological messages by local day without duplicates', () => {
        const messages = [
            buildMessage({
                id: 1,
                createdAt: '2026-08-06T10:00:00.000Z',
            }),
            buildMessage({
                id: 2,
                createdAt: '2026-08-06T18:00:00.000Z',
            }),
            buildMessage({
                id: 3,
                createdAt: '2026-08-07T09:00:00.000Z',
            }),
        ];

        const groups = groupConversationMessagesByLocalDay(
            messages,
            'Europe/Paris'
        );

        expect(groups).toHaveLength(2);
        expect(groups[0]?.messages.map((message) => message.id)).toEqual([
            1, 2,
        ]);
        expect(groups[1]?.messages.map((message) => message.id)).toEqual([3]);
    });

    it('computes previous day keys across month boundaries', () => {
        expect(getPreviousDayKey('2026-08-01')).toBe('2026-07-31');
    });
});
