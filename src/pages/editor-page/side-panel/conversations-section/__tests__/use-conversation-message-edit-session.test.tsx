import React, { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type {
    ConversationStatus,
    DiagramConversationMessage,
} from '@/lib/conversations/conversation-types';
import { aliceWonderAuthor } from '@/test/user-identity-fixtures';
import { initI18n } from '@/i18n/i18n';
import { useConversationMessageEditSession } from '../use-conversation-message-edit-session';

const buildMessage = (
    overrides: Partial<DiagramConversationMessage> = {}
): DiagramConversationMessage => ({
    id: 100,
    conversationId: 10,
    body: 'Hello team',
    user: aliceWonderAuthor,
    createdAt: '2026-01-02T10:00:00.000Z',
    updatedAt: '2026-01-02T10:00:00.000Z',
    reactions: [],
    ...overrides,
});

const mutationsState = vi.hoisted(() => ({
    updateMessage: vi.fn(),
    setMessage: null as ((message: DiagramConversationMessage) => void) | null,
}));

vi.mock('@/hooks/use-conversation-mutations', () => ({
    useConversationMutations: () => ({
        updateMessage: mutationsState.updateMessage,
    }),
}));

interface SessionHarnessProps {
    initialMessage: DiagramConversationMessage;
    onSaved?: () => void;
}

const SessionHarness: React.FC<SessionHarnessProps> = ({
    initialMessage,
    onSaved = () => undefined,
}) => {
    const [message, setMessage] = useState(initialMessage);
    mutationsState.setMessage = setMessage;

    const session = useConversationMessageEditSession({
        message,
        conversationId: message.conversationId,
        conversationStatus: 'active' as ConversationStatus,
        onCancel: () => undefined,
        onSaved,
        onRequestFocus: () => undefined,
    });

    return (
        <form
            data-testid="edit-session-form"
            onSubmit={(event) => {
                event.preventDefault();
                void session.save();
            }}
        >
            <textarea
                aria-label="Message"
                value={session.body}
                onChange={(event) => {
                    session.setBodyFromInput(event.target.value);
                }}
                onKeyDown={(event) => {
                    if (
                        event.key === 'Enter' &&
                        !event.shiftKey &&
                        !event.nativeEvent.isComposing &&
                        !session.isSubmitting &&
                        session.canSave
                    ) {
                        event.preventDefault();
                        void session.save();
                    }
                }}
            />
            <button type="submit" disabled={!session.canSave}>
                Save
            </button>
        </form>
    );
};

beforeAll(async () => {
    await initI18n();
});

describe('useConversationMessageEditSession', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mutationsState.setMessage = null;
        mutationsState.updateMessage.mockImplementation(
            async (
                _conversationId: number,
                messageId: number,
                input: { body: string }
            ) => {
                const nextMessage = {
                    ...buildMessage(),
                    id: messageId,
                    body: input.body,
                    updatedAt: '2026-01-02T12:00:00.000Z',
                };
                mutationsState.setMessage?.(nextMessage);
                return nextMessage;
            }
        );
    });

    it('applies save on a single click when mutation updates message body before completion', async () => {
        const user = userEvent.setup();
        const onSaved = vi.fn();

        render(
            <SessionHarness initialMessage={buildMessage()} onSaved={onSaved} />
        );

        const textarea = screen.getByRole('textbox', { name: 'Message' });
        await user.clear(textarea);
        await user.type(textarea, 'Updated body');
        await user.click(screen.getByRole('button', { name: 'Save' }));

        await waitFor(() => {
            expect(mutationsState.updateMessage).toHaveBeenCalledTimes(1);
            expect(mutationsState.updateMessage).toHaveBeenCalledWith(10, 100, {
                body: 'Updated body',
            });
            expect(onSaved).toHaveBeenCalledTimes(1);
        });

        expect(textarea).toHaveValue('Updated body');
    });

    it('applies save on keyboard submission without requiring blur', async () => {
        const user = userEvent.setup();
        const onSaved = vi.fn();

        render(
            <SessionHarness initialMessage={buildMessage()} onSaved={onSaved} />
        );

        const textarea = screen.getByRole('textbox', { name: 'Message' });
        await user.clear(textarea);
        await user.type(textarea, 'Keyboard save');
        await user.keyboard('{Enter}');

        await waitFor(() => {
            expect(mutationsState.updateMessage).toHaveBeenCalledTimes(1);
            expect(mutationsState.updateMessage).toHaveBeenCalledWith(10, 100, {
                body: 'Keyboard save',
            });
            expect(onSaved).toHaveBeenCalledTimes(1);
        });
    });
});
