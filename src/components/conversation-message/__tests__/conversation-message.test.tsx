import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Avatar, AvatarFallback } from '@/components/avatar/avatar';
import {
    ConversationMessage,
    ConversationMessageAuthor,
    ConversationMessageAvatar,
    ConversationMessageBody,
    ConversationMessageBodyText,
    ConversationMessageContent,
    ConversationMessageFooter,
    ConversationMessageHeader,
    ConversationMessageHeaderMeta,
    ConversationMessageHeaderTitleRow,
    ConversationMessageLayout,
    ConversationMessageReactionTrigger,
    ConversationMessageReactions,
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

    it('applies current-user presentation variant without reversing DOM order', () => {
        render(
            <ConversationMessage
                isCurrentUser
                data-testid="current-user-message"
            >
                <ConversationMessageLayout data-testid="layout">
                    <ConversationMessageAvatar data-testid="avatar-slot">
                        <span>Avatar</span>
                    </ConversationMessageAvatar>
                    <ConversationMessageContent
                        isCurrentUser
                        data-testid="content"
                    >
                        <ConversationMessageBody isCurrentUser>
                            <ConversationMessageBodyText>
                                My message
                            </ConversationMessageBodyText>
                        </ConversationMessageBody>
                    </ConversationMessageContent>
                </ConversationMessageLayout>
            </ConversationMessage>
        );

        const message = screen.getByTestId('current-user-message');
        expect(message).toHaveAttribute('data-current-user', 'true');

        const layout = screen.getByTestId('layout');
        const avatarSlot = screen.getByTestId('avatar-slot');
        const content = screen.getByTestId('content');

        expect(layout.firstElementChild).toBe(avatarSlot);
        expect(layout.lastElementChild).toBe(content);
        expect(content).toHaveClass('ml-auto');
        expect(content).toHaveClass('max-w-[88%]');
    });

    it('applies other-user presentation without end alignment', () => {
        render(
            <ConversationMessage isCurrentUser={false} data-testid="other-user">
                <ConversationMessageContent data-testid="content">
                    <ConversationMessageBody>
                        <ConversationMessageBodyText>
                            Their message
                        </ConversationMessageBodyText>
                    </ConversationMessageBody>
                </ConversationMessageContent>
            </ConversationMessage>
        );

        expect(screen.getByTestId('other-user')).toHaveAttribute(
            'data-current-user',
            'false'
        );
        expect(screen.getByTestId('content')).not.toHaveClass('ml-auto');
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
