import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useRef } from 'react';
import { useConversationMessageListInitialScroll } from '../use-conversation-message-list-initial-scroll';

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
    scrollArea.appendChild(viewport);
    document.body.appendChild(scrollArea);

    return { scrollArea, viewport };
};

describe('useConversationMessageListInitialScroll', () => {
    it('scrolls to the bottom instantly when messages first appear', () => {
        const { scrollArea, viewport } = createScrollAreaFixture(640);
        const scrollAreaRef = { current: scrollArea };

        renderHook(() =>
            useConversationMessageListInitialScroll({
                conversationId: 10,
                messagesLength: 3,
                isInitialLoading: false,
                isLoadError: false,
                scrollAreaRef,
            })
        );

        expect(viewport.scrollTop).toBe(640);
    });

    it('does not scroll again when more messages are loaded later', () => {
        const { scrollArea, viewport } = createScrollAreaFixture(640);

        const { rerender } = renderHook(
            (props: { messagesLength: number }) => {
                const ref = useRef<HTMLDivElement | null>(scrollArea);
                useConversationMessageListInitialScroll({
                    conversationId: 10,
                    messagesLength: props.messagesLength,
                    isInitialLoading: false,
                    isLoadError: false,
                    scrollAreaRef: ref,
                });
            },
            { initialProps: { messagesLength: 3 } }
        );

        viewport.scrollTop = 120;
        Object.defineProperty(viewport, 'scrollHeight', {
            configurable: true,
            value: 960,
        });

        rerender({ messagesLength: 6 });

        expect(viewport.scrollTop).toBe(120);
    });

    it('scrolls again when opening a different conversation', () => {
        const { scrollArea, viewport } = createScrollAreaFixture(500);

        const { rerender } = renderHook(
            (props: { conversationId: number }) => {
                const ref = useRef<HTMLDivElement | null>(scrollArea);
                useConversationMessageListInitialScroll({
                    conversationId: props.conversationId,
                    messagesLength: 2,
                    isInitialLoading: false,
                    isLoadError: false,
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
});
