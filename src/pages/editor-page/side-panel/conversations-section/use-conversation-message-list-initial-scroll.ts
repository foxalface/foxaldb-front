import { useLayoutEffect, useRef, type RefObject } from 'react';

const SCROLL_AREA_VIEWPORT_SELECTOR = '[data-radix-scroll-area-viewport]';

const getScrollAreaViewport = (
    scrollAreaRoot: HTMLElement | null
): HTMLElement | null =>
    scrollAreaRoot?.querySelector(SCROLL_AREA_VIEWPORT_SELECTOR) ?? null;

const scrollViewportToBottom = (viewport: HTMLElement): void => {
    viewport.scrollTop = viewport.scrollHeight;
};

export interface UseConversationMessageListInitialScrollOptions {
    conversationId: number;
    messagesLength: number;
    isInitialLoading: boolean;
    isLoadError: boolean;
    scrollAreaRef: RefObject<HTMLElement | null>;
}

export const useConversationMessageListInitialScroll = ({
    conversationId,
    messagesLength,
    isInitialLoading,
    isLoadError,
    scrollAreaRef,
}: UseConversationMessageListInitialScrollOptions): void => {
    const initialScrollConversationIdRef = useRef<number | null>(null);

    useLayoutEffect(() => {
        if (isInitialLoading || isLoadError || messagesLength === 0) {
            return;
        }

        if (initialScrollConversationIdRef.current === conversationId) {
            return;
        }

        const viewport = getScrollAreaViewport(scrollAreaRef.current);
        if (!viewport) {
            return;
        }

        initialScrollConversationIdRef.current = conversationId;
        scrollViewportToBottom(viewport);
    }, [
        conversationId,
        isInitialLoading,
        isLoadError,
        messagesLength,
        scrollAreaRef,
    ]);
};
