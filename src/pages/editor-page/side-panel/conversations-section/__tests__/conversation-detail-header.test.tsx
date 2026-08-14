import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DiagramConversation } from '@/lib/conversations/conversation-types';
import { en } from '@/i18n/locales/en';
import { TooltipProvider } from '@/components/tooltip/tooltip';
import { ConversationDetailHeader } from '../conversation-detail-header';

const buildConversation = (
    overrides: Partial<DiagramConversation> = {}
): DiagramConversation => ({
    id: 10,
    diagramId: 42,
    targetType: 'table',
    targetId: 'table-1',
    status: 'active',
    archivedAt: null,
    messageCount: 2,
    lastMessageAt: '2026-01-02T12:00:00.000Z',
    lastMessageBody: 'Latest update',
    lastMessageAuthor: null,
    unreadCount: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T12:00:00.000Z',
    ...overrides,
});

const { chartDbState } = vi.hoisted(() => ({
    chartDbState: {
        diagramName: 'Billing',
        tables: [
            {
                id: 'table-1',
                name: 'Clients',
                x: 0,
                y: 0,
                fields: [],
                indexes: [],
                color: '#fff',
                isView: false,
                createdAt: 0,
            },
        ],
        relationships: [],
    },
}));

const focusOnTargetMock = vi.fn();

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => chartDbState,
}));

vi.mock('@/hooks/use-focus-on-conversation-target', () => ({
    useFocusOnConversationTarget: () => ({
        canFocusOnTarget: focusOnTargetMock.canFocusOnTarget ?? true,
        focusOnTarget: focusOnTargetMock,
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: Record<string, unknown>) => {
            const parts = key.split('.');
            let current: unknown = en.translation;
            for (const part of parts) {
                if (
                    typeof current !== 'object' ||
                    current === null ||
                    !(part in current)
                ) {
                    return key;
                }
                current = (current as Record<string, unknown>)[part];
            }

            if (typeof current !== 'string') {
                return key;
            }

            return current.replace(/\{\{(\w+)\}\}/g, (_, token: string) => {
                const value = options?.[token];
                return value === undefined || value === null
                    ? ''
                    : String(value);
            });
        },
        i18n: { language: 'en' },
    }),
}));

describe('ConversationDetailHeader', () => {
    beforeEach(() => {
        focusOnTargetMock.mockReset();
        focusOnTargetMock.canFocusOnTarget = true;
    });

    const renderHeader = (
        props: Partial<
            React.ComponentProps<typeof ConversationDetailHeader>
        > = {}
    ) => {
        const onBack = vi.fn();

        render(
            <TooltipProvider>
                <ConversationDetailHeader
                    conversation={buildConversation()}
                    onBack={onBack}
                    messagesHeadingId="conversation-messages-heading"
                    {...props}
                />
            </TooltipProvider>
        );

        return { onBack };
    };

    it('shows the focus button on the title row for non-diagram targets', () => {
        renderHeader();

        expect(
            screen.getByTestId('conversation-detail-focus-target')
        ).toHaveAttribute('aria-label', 'Show Clients on diagram');
        expect(screen.getByText('Clients')).toHaveClass('flex-1');
    });

    it('hides the focus button for diagram conversations', () => {
        focusOnTargetMock.canFocusOnTarget = false;
        renderHeader({
            conversation: buildConversation({
                targetType: 'diagram',
                targetId: null,
            }),
        });

        expect(
            screen.queryByTestId('conversation-detail-focus-target')
        ).not.toBeInTheDocument();
    });

    it('focuses the conversation target from the header button', async () => {
        const user = userEvent.setup();
        renderHeader();

        await user.click(
            screen.getByTestId('conversation-detail-focus-target')
        );

        expect(focusOnTargetMock).toHaveBeenCalledTimes(1);
    });
});
