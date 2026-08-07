import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { initI18n } from '@/i18n/i18n';
import { TooltipProvider } from '@/components/tooltip/tooltip';
import { ConversationMessageReactionsBar } from '../conversation-message-reactions-bar';

vi.mock('@/hooks/use-conversation-mutations', () => ({
    useConversationMutations: () => ({
        addReaction: vi.fn(),
        removeReaction: vi.fn(),
    }),
}));

vi.mock('../conversation-emoji-picker', () => ({
    ConversationEmojiPicker: () => (
        <div data-testid="emoji-picker-mock">Picker</div>
    ),
}));

const renderReactionsBar = (
    props: Partial<
        React.ComponentProps<typeof ConversationMessageReactionsBar>
    > = {}
) =>
    render(
        <TooltipProvider>
            <form data-testid="ancestor-form">
                <ConversationMessageReactionsBar
                    conversationId={10}
                    messageId={100}
                    reactions={[]}
                    canReact={true}
                    isEditing={false}
                    {...props}
                />
            </form>
        </TooltipProvider>
    );

beforeAll(async () => {
    await initI18n();
});

describe('ConversationMessageReactionsBar', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('uses a button trigger that does not submit an ancestor form', async () => {
        const user = userEvent.setup();
        const submitHandler = vi.fn(
            (event: React.FormEvent<HTMLFormElement>) => {
                event.preventDefault();
            }
        );

        render(
            <TooltipProvider>
                <form data-testid="ancestor-form" onSubmit={submitHandler}>
                    <ConversationMessageReactionsBar
                        conversationId={10}
                        messageId={100}
                        reactions={[]}
                        canReact={true}
                        isEditing={false}
                    />
                </form>
            </TooltipProvider>
        );

        const trigger = screen.getByRole('button', { name: 'Add reaction' });
        expect(trigger).toHaveAttribute('type', 'button');

        await user.click(trigger);

        expect(submitHandler).not.toHaveBeenCalled();
    });

    it('opens picker content without submitting an ancestor form', async () => {
        const user = userEvent.setup();

        renderReactionsBar();

        await user.click(screen.getByRole('button', { name: 'Add reaction' }));

        await waitFor(() => {
            expect(screen.getByTestId('emoji-picker-mock')).toBeInTheDocument();
        });
    });

    it('does not navigate when opening the picker', async () => {
        const user = userEvent.setup();
        const originalLocation = window.location.href;

        renderReactionsBar();

        await user.click(screen.getByRole('button', { name: 'Add reaction' }));

        expect(window.location.href).toBe(originalLocation);
    });
});
