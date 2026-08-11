import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Avatar, AvatarFallback } from '@/components/avatar/avatar';
import {
    ConversationMessage,
    ConversationMessageAuthor,
    ConversationMessageAvatar,
    ConversationMessageBody,
    ConversationMessageBodyRow,
    ConversationMessageBodyText,
    CONVERSATION_MESSAGE_CLUSTER_CLASS,
    CONVERSATION_MESSAGE_GUTTER_CLASS,
    CONVERSATION_MESSAGE_SIDE_ANCHOR_CLASS,
    ConversationMessageContent,
    ConversationMessageFooter,
    ConversationMessageHeader,
    ConversationMessageHeaderMeta,
    ConversationMessageHeaderTitleRow,
    ConversationMessageLayout,
    ConversationMessageReactionTrigger,
    ConversationMessageReactions,
    ConversationMessageRow,
} from '@/components/conversation-message';

describe('ConversationMessage shell', () => {
    it('renders semantic article markup', () => {
        render(
            <ConversationMessage data-testid="message-shell">
                <span>Content</span>
            </ConversationMessage>
        );

        const article = screen.getByTestId('message-shell');
        expect(article.tagName).toBe('ARTICLE');
    });

    it('renders avatar, header, body, and footer slots', () => {
        render(
            <ConversationMessage>
                <ConversationMessageLayout>
                    <ConversationMessageAvatar>
                        <Avatar aria-hidden="true">
                            <AvatarFallback>AW</AvatarFallback>
                        </Avatar>
                    </ConversationMessageAvatar>
                    <ConversationMessageContent>
                        <ConversationMessageHeader>
                            <ConversationMessageHeaderMeta>
                                <ConversationMessageHeaderTitleRow>
                                    <ConversationMessageAuthor>
                                        Alice Wonder
                                    </ConversationMessageAuthor>
                                </ConversationMessageHeaderTitleRow>
                            </ConversationMessageHeaderMeta>
                        </ConversationMessageHeader>
                        <ConversationMessageBody>
                            <ConversationMessageBodyText>
                                Hello team
                            </ConversationMessageBodyText>
                        </ConversationMessageBody>
                        <ConversationMessageFooter>
                            <span data-testid="footer-meta">Footer</span>
                        </ConversationMessageFooter>
                    </ConversationMessageContent>
                </ConversationMessageLayout>
            </ConversationMessage>
        );

        expect(screen.getByText('AW')).toBeInTheDocument();
        expect(screen.getByText('Alice Wonder')).toBeInTheDocument();
        expect(screen.getByText('Hello team')).toBeInTheDocument();
        expect(screen.getByTestId('footer-meta')).toBeInTheDocument();
    });

    it('collapses empty reaction slots without visible or focusable content', () => {
        const { container } = render(
            <ConversationMessage>
                <ConversationMessageFooter>
                    <ConversationMessageReactions />
                    <ConversationMessageReactionTrigger />
                </ConversationMessageFooter>
            </ConversationMessage>
        );

        expect(
            container.querySelector(
                '[data-slot="conversation-message-reactions"]'
            )
        ).toBeNull();
        expect(
            container.querySelector(
                '[data-slot="conversation-message-reaction-trigger"]'
            )
        ).toBeNull();
        expect(container.querySelector('footer')).toBeNull();
    });

    it('collapses empty footer when only reaction slots are present', () => {
        const { container } = render(
            <ConversationMessageFooter>
                <ConversationMessageReactions />
                <ConversationMessageReactionTrigger />
            </ConversationMessageFooter>
        );

        expect(container.firstChild).toBeNull();
    });

    it('aligns other-user messages to the start with avatar adjacent to content', () => {
        render(
            <ConversationMessage isCurrentUser={false} data-testid="other-user">
                <ConversationMessageRow isCurrentUser={false} data-testid="row">
                    <ConversationMessageContent data-testid="content">
                        <ConversationMessageBodyRow data-testid="body-row">
                            <ConversationMessageAvatar data-testid="avatar-slot">
                                <span>Avatar</span>
                            </ConversationMessageAvatar>
                            <ConversationMessageBody>
                                <ConversationMessageBodyText>
                                    Their message
                                </ConversationMessageBodyText>
                            </ConversationMessageBody>
                        </ConversationMessageBodyRow>
                    </ConversationMessageContent>
                </ConversationMessageRow>
            </ConversationMessage>
        );

        const cluster = screen.getByTestId('conversation-message-cluster');
        const bodyRow = screen.getByTestId('body-row');
        const avatarSlot = screen.getByTestId('avatar-slot');
        const content = screen.getByTestId('content');

        expect(screen.getByTestId('other-user')).toHaveAttribute(
            'data-current-user',
            'false'
        );
        expect(cluster).toHaveClass(CONVERSATION_MESSAGE_CLUSTER_CLASS);
        expect(
            screen.getByTestId('conversation-message-gutter-end')
        ).toHaveClass(CONVERSATION_MESSAGE_GUTTER_CLASS);
        expect(
            screen.queryByTestId('conversation-message-gutter-start')
        ).not.toBeInTheDocument();
        expect(bodyRow).not.toHaveClass('flex-row-reverse');
        expect(bodyRow.firstElementChild).toBe(avatarSlot);
        expect(bodyRow).toHaveClass('gap-2');
        expect(avatarSlot).toHaveClass(CONVERSATION_MESSAGE_SIDE_ANCHOR_CLASS);
        expect(content).not.toHaveClass('ml-auto');
        expect(content).not.toHaveClass('flex-1');
        expect(content).toHaveClass('w-full');
    });

    it('aligns current-user messages to the end with timestamp and actions anchors', () => {
        render(
            <ConversationMessage
                isCurrentUser
                data-testid="current-user-message"
            >
                <ConversationMessageRow isCurrentUser data-testid="row">
                    <ConversationMessageContent
                        isCurrentUser
                        data-testid="content"
                    >
                        <ConversationMessageBodyRow data-testid="body-row">
                            <div data-testid="timestamp-slot">Time</div>
                            <ConversationMessageBody isCurrentUser>
                                <ConversationMessageBodyText>
                                    My message
                                </ConversationMessageBodyText>
                            </ConversationMessageBody>
                            <div data-testid="actions-slot">Actions</div>
                        </ConversationMessageBodyRow>
                    </ConversationMessageContent>
                </ConversationMessageRow>
            </ConversationMessage>
        );

        const message = screen.getByTestId('current-user-message');
        const cluster = screen.getByTestId('conversation-message-cluster');
        const bodyRow = screen.getByTestId('body-row');
        const timestampSlot = screen.getByTestId('timestamp-slot');
        const content = screen.getByTestId('content');
        const actionsSlot = screen.getByTestId('actions-slot');

        expect(message).toHaveAttribute('data-current-user', 'true');
        expect(cluster).toHaveClass(CONVERSATION_MESSAGE_CLUSTER_CLASS);
        expect(
            screen.getByTestId('conversation-message-gutter-start')
        ).toHaveClass(CONVERSATION_MESSAGE_GUTTER_CLASS);
        expect(
            screen.queryByTestId('conversation-message-gutter-end')
        ).not.toBeInTheDocument();
        expect(bodyRow).not.toHaveClass('flex-row-reverse');
        expect(bodyRow.firstElementChild).toBe(timestampSlot);
        expect(bodyRow.children[1]?.textContent).toBe('My message');
        expect(bodyRow.lastElementChild).toBe(actionsSlot);
        expect(content).not.toHaveClass('ml-auto');
        expect(content).not.toHaveClass('flex-1');
        expect(content).toHaveClass('w-auto');
        expect(
            screen.getByText('My message').closest('div.text-start')
        ).toHaveClass('text-start');
        expect(screen.getByText('My message')).toHaveClass('select-text');
    });

    it('places header actions after metadata for current-user messages', () => {
        render(
            <ConversationMessageHeader isCurrentUser data-testid="header">
                <ConversationMessageHeaderMeta data-testid="meta">
                    <ConversationMessageHeaderTitleRow isCurrentUser>
                        <ConversationMessageAuthor>
                            Foxal Face
                        </ConversationMessageAuthor>
                    </ConversationMessageHeaderTitleRow>
                </ConversationMessageHeaderMeta>
                <button type="button" data-testid="actions">
                    Actions
                </button>
            </ConversationMessageHeader>
        );

        const header = screen.getByTestId('header');
        const meta = screen.getByTestId('meta');
        const actions = screen.getByTestId('actions');

        expect(header).toHaveClass('justify-end');
        expect(header).not.toHaveClass('flex-row-reverse');
        expect(meta.compareDocumentPosition(actions)).toBe(
            Node.DOCUMENT_POSITION_FOLLOWING
        );
    });

    it('wraps long multiline body without horizontal overflow classes on text', () => {
        const longBody = `${'word '.repeat(40)}\n${'line '.repeat(20)}`;

        render(
            <ConversationMessageBody>
                <ConversationMessageBodyText data-testid="body-text">
                    {longBody}
                </ConversationMessageBodyText>
            </ConversationMessageBody>
        );

        const bodyText = screen.getByTestId('body-text');
        expect(bodyText).toHaveClass('whitespace-pre-wrap');
        expect(bodyText).toHaveClass('break-words');
        expect(bodyText).toHaveClass('[overflow-wrap:anywhere]');
        expect(bodyText).toHaveClass('select-text');
    });

    it('preserves accessible author and timestamp markup', () => {
        render(
            <ConversationMessage>
                <ConversationMessageHeaderTitleRow>
                    <ConversationMessageAuthor>
                        Deleted user
                    </ConversationMessageAuthor>
                    <time dateTime="2026-01-02T10:00:00.000Z">2 hours ago</time>
                </ConversationMessageHeaderTitleRow>
            </ConversationMessage>
        );

        expect(screen.getByText('Deleted user')).toBeInTheDocument();
        expect(
            screen.getByText('2 hours ago', { selector: 'time' })
        ).toHaveAttribute('dateTime', '2026-01-02T10:00:00.000Z');
    });
});
