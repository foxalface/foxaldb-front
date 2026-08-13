import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useRef } from 'react';
import type { DiagramConversationMessage } from '@/lib/conversations/conversation-types';
import { aliceWonderAuthor, bobAuthor } from '@/test/user-identity-fixtures';
import {
    getScrollAreaViewport,
    useConversationMessageListScroll,
} from '../use-conversation-message-list-scroll';

const buildMessage = (
    overrides: Partial<DiagramConversationMessage> = {}
): DiagramConversationMessage => ({
    id: overrides.id ?? 100,
    conversationId: 10,
    body: overrides.body ?? 'Hello team',
    user: overrides.user ?? aliceWonderAuthor,
    createdAt: overrides.createdAt ?? '2026-08-07T14:45:00.000Z',
    updatedAt:
        overrides.updatedAt ??
        overrides.createdAt ??
        '2026-08-07T14:45:00.000Z',
    reactions: [],
    ...overrides,
});

const createScrollAreaFixture = (
    scrollHeight: number
): {
    scrollArea: HTMLDivElement;
    viewport: HTMLDivElement;
} => {
    const scrollArea = document.createElement('div');
    const viewport = document.createElement('div');
    viewport.setAttribute('data-radix-scroll-area-viewport', '');
    Object.defineProperty(viewport, 'scrollHeight', {
        configurable: true,
        value: scrollHeight,
    });
    Object.defineProperty(viewport, 'clientHeight', {
        configurable: true,
        value: 400,
    });
    scrollArea.appendChild(viewport);
    document.body.appendChild(scrollArea);

    return { scrollArea, viewport };
};

const scrollViewportUp = (viewport: HTMLDivElement): void => {
    viewport.scrollTop = 120;
    act(() => {
        viewport.dispatchEvent(new Event('scroll'));
    });
};

describe('useConversationMessageListScroll', () => {
    it('scrolls to the bottom instantly when messages first appear', () => {
        const { scrollArea, viewport } = createScrollAreaFixture(640);
        const scrollAreaRef = { current: scrollArea };
        const messages = [
            buildMessage({ id: 28 }),
            buildMessage({ id: 29 }),
            buildMessage({ id: 30 }),
        ];

        renderHook(() =>
            useConversationMessageListScroll({
                conversationId: 10,
                messages,
                currentUserId: 1,
                isInitialLoading: false,
                isLoadError: false,
                isLoadingMore: false,
                scrollAreaRef,
            })
        );

        expect(viewport.scrollTop).toBe(640);
    });

    it('does not scroll again when more messages are loaded later', () => {
        const { scrollArea, viewport } = createScrollAreaFixture(640);
        const initialMessages = [
            buildMessage({ id: 28 }),
            buildMessage({ id: 29 }),
            buildMessage({ id: 30 }),
        ];

        const { rerender } = renderHook(
            (props: { messages: DiagramConversationMessage[] }) => {
                const ref = useRef<HTMLDivElement | null>(scrollArea);
                useConversationMessageListScroll({
                    conversationId: 10,
                    messages: props.messages,
                    currentUserId: 1,
                    isInitialLoading: false,
                    isLoadError: false,
                    isLoadingMore: false,
                    scrollAreaRef: ref,
                });
            },
            { initialProps: { messages: initialMessages } }
        );

        scrollViewportUp(viewport);
        Object.defineProperty(viewport, 'scrollHeight', {
            configurable: true,
            value: 960,
        });

        rerender({
            messages: [
                buildMessage({ id: 25 }),
                buildMessage({ id: 26 }),
                buildMessage({ id: 27 }),
                ...initialMessages,
            ],
        });

        expect(viewport.scrollTop).toBe(120);
    });

    it('scrolls to the bottom when a new trailing message is added while at bottom', () => {
        const { scrollArea, viewport } = createScrollAreaFixture(640);
        const initialMessages = [
            buildMessage({ id: 28 }),
            buildMessage({ id: 29 }),
            buildMessage({ id: 30 }),
        ];

        const { rerender } = renderHook(
            (props: { messages: DiagramConversationMessage[] }) => {
                const ref = useRef<HTMLDivElement | null>(scrollArea);
                useConversationMessageListScroll({
                    conversationId: 10,
                    messages: props.messages,
                    currentUserId: 1,
                    isInitialLoading: false,
                    isLoadError: false,
                    isLoadingMore: false,
                    scrollAreaRef: ref,
                });
            },
            { initialProps: { messages: initialMessages } }
        );

        Object.defineProperty(viewport, 'scrollHeight', {
            configurable: true,
            value: 960,
        });

        rerender({
            messages: [...initialMessages, buildMessage({ id: 31 })],
        });

        expect(viewport.scrollTop).toBe(960);
    });

    it('tracks pending messages when scrolled up and a new message arrives', () => {
        const { scrollArea, viewport } = createScrollAreaFixture(640);
        const initialMessages = [
            buildMessage({ id: 28 }),
            buildMessage({ id: 29 }),
            buildMessage({ id: 30 }),
        ];

        const { rerender, result } = renderHook(
            (props: { messages: DiagramConversationMessage[] }) => {
                const ref = useRef<HTMLDivElement | null>(scrollArea);
                return useConversationMessageListScroll({
                    conversationId: 10,
                    messages: props.messages,
                    currentUserId: 1,
                    isInitialLoading: false,
                    isLoadError: false,
                    isLoadingMore: false,
                    scrollAreaRef: ref,
                });
            },
            { initialProps: { messages: initialMessages } }
        );

        scrollViewportUp(viewport);

        rerender({
            messages: [
                ...initialMessages,
                buildMessage({ id: 31, user: bobAuthor }),
            ],
        });

        expect(viewport.scrollTop).toBe(120);
        expect(result.current.pendingNewMessageCount).toBe(1);
    });

    it('scrolls to the first pending message when requested', () => {
        const { scrollArea, viewport } = createScrollAreaFixture(640);
        const initialMessages = [
            buildMessage({ id: 28 }),
            buildMessage({ id: 29 }),
            buildMessage({ id: 30 }),
        ];
        const firstNewMessage = buildMessage({
            id: 31,
            user: bobAuthor,
        });
        const secondNewMessage = buildMessage({
            id: 32,
            user: bobAuthor,
        });

        const scrollIntoView = vi.fn();
        const messageElement = document.createElement('li');
        messageElement.setAttribute('data-conversation-message-id', '31');
        messageElement.scrollIntoView = scrollIntoView;
        scrollArea.appendChild(messageElement);

        const { rerender, result } = renderHook(
            (props: { messages: DiagramConversationMessage[] }) => {
                const ref = useRef<HTMLDivElement | null>(scrollArea);
                return useConversationMessageListScroll({
                    conversationId: 10,
                    messages: props.messages,
                    currentUserId: 1,
                    isInitialLoading: false,
                    isLoadError: false,
                    isLoadingMore: false,
                    scrollAreaRef: ref,
                });
            },
            { initialProps: { messages: initialMessages } }
        );

        scrollViewportUp(viewport);

        rerender({
            messages: [...initialMessages, firstNewMessage, secondNewMessage],
        });

        expect(result.current.pendingNewMessageCount).toBe(2);

        act(() => {
            result.current.scrollToFirstPendingMessage();
        });

        expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start' });
        expect(result.current.pendingNewMessageCount).toBe(1);
    });

    it('scrolls again when opening a different conversation', () => {
        const { scrollArea, viewport } = createScrollAreaFixture(500);
        const messages = [buildMessage({ id: 19 }), buildMessage({ id: 20 })];

        const { rerender } = renderHook(
            (props: { conversationId: number }) => {
                const ref = useRef<HTMLDivElement | null>(scrollArea);
                useConversationMessageListScroll({
                    conversationId: props.conversationId,
                    messages,
                    currentUserId: 1,
                    isInitialLoading: false,
                    isLoadError: false,
                    isLoadingMore: false,
                    scrollAreaRef: ref,
                });
            },
            { initialProps: { conversationId: 10 } }
        );

        expect(viewport.scrollTop).toBe(500);

        viewport.scrollTop = 0;
        Object.defineProperty(viewport, 'scrollHeight', {
            configurable: true,
            value: 720,
        });

        rerender({ conversationId: 20 });

        expect(viewport.scrollTop).toBe(720);
    });

    it('exposes the scroll viewport helper for the message list container', () => {
        const { scrollArea } = createScrollAreaFixture(300);

        expect(getScrollAreaViewport(scrollArea)).not.toBeNull();
    });
});
