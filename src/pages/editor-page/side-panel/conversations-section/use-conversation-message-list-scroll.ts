import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
    type RefObject,
} from 'react';
import type { DiagramConversationMessage } from '@/lib/conversations/conversation-types';

const SCROLL_AREA_VIEWPORT_SELECTOR = '[data-radix-scroll-area-viewport]';
const SCROLL_BOTTOM_THRESHOLD_PX = 24;

export const CONVERSATION_MESSAGE_ID_DATA_ATTRIBUTE =
    'data-conversation-message-id';

export const getScrollAreaViewport = (
    scrollAreaRoot: HTMLElement | null
): HTMLElement | null =>
    scrollAreaRoot?.querySelector(SCROLL_AREA_VIEWPORT_SELECTOR) ?? null;

export const isViewportAtBottom = (viewport: HTMLElement): boolean => {
    const { scrollTop, scrollHeight, clientHeight } = viewport;

    return (
        scrollTop + clientHeight >= scrollHeight - SCROLL_BOTTOM_THRESHOLD_PX
    );
};

const scrollViewportToBottom = (viewport: HTMLElement): void => {
    viewport.scrollTop = viewport.scrollHeight;
};

const scrollViewportToMessage = (
    scrollAreaRoot: HTMLElement,
    messageId: number
): void => {
    const messageElement = scrollAreaRoot.querySelector(
        `[${CONVERSATION_MESSAGE_ID_DATA_ATTRIBUTE}="${messageId}"]`
    );

    messageElement?.scrollIntoView({ block: 'start' });
};

const getNewTrailingMessages = (
    messages: ReadonlyArray<DiagramConversationMessage>,
    previousLastMessageId: number | null
): DiagramConversationMessage[] => {
    if (previousLastMessageId === null) {
        return [];
    }

    const previousLastIndex = messages.findIndex(
        (message) => message.id === previousLastMessageId
    );

    if (previousLastIndex === -1) {
        return messages.filter((message) => message.id > previousLastMessageId);
    }

    return messages.slice(previousLastIndex + 1);
};

const computePendingFromAnchor = (
    messages: ReadonlyArray<DiagramConversationMessage>,
    anchorMessageId: number | null
): { count: number; firstMessageId: number | null } => {
    if (anchorMessageId === null) {
        return { count: 0, firstMessageId: null };
    }

    const pendingMessages = messages.filter(
        (message) => message.id > anchorMessageId
    );

    return {
        count: pendingMessages.length,
        firstMessageId: pendingMessages[0]?.id ?? null,
    };
};

export interface UseConversationMessageListScrollOptions {
    conversationId: number;
    messages: ReadonlyArray<DiagramConversationMessage>;
    currentUserId: number | null;
    isInitialLoading: boolean;
    isLoadError: boolean;
    isLoadingMore: boolean;
    scrollAreaRef: RefObject<HTMLElement | null>;
}

export interface UseConversationMessageListScrollResult {
    pendingNewMessageCount: number;
    scrollToFirstPendingMessage: () => void;
}

export const useConversationMessageListScroll = ({
    conversationId,
    messages,
    currentUserId,
    isInitialLoading,
    isLoadError,
    isLoadingMore,
    scrollAreaRef,
}: UseConversationMessageListScrollOptions): UseConversationMessageListScrollResult => {
    const messagesLength = messages.length;
    const lastMessageId =
        messagesLength > 0 ? (messages[messagesLength - 1]?.id ?? null) : null;

    const initialScrollConversationIdRef = useRef<number | null>(null);
    const previousLastMessageIdRef = useRef<number | null>(null);
    const anchorMessageIdRef = useRef<number | null>(null);
    const isAtBottomRef = useRef(true);

    const [pendingNewMessageCount, setPendingNewMessageCount] = useState(0);

    const syncPendingFromAnchor = useCallback(() => {
        const { count } = computePendingFromAnchor(
            messages,
            anchorMessageIdRef.current
        );
        setPendingNewMessageCount(count);
    }, [messages]);

    const clearPendingState = useCallback(() => {
        setPendingNewMessageCount(0);
    }, []);

    useLayoutEffect(() => {
        previousLastMessageIdRef.current = null;
        anchorMessageIdRef.current = null;
        isAtBottomRef.current = true;
        clearPendingState();
    }, [conversationId, clearPendingState]);

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

        if (lastMessageId !== null) {
            anchorMessageIdRef.current = lastMessageId;
            previousLastMessageIdRef.current = lastMessageId;
        }

        isAtBottomRef.current = true;
    }, [
        conversationId,
        isInitialLoading,
        isLoadError,
        messagesLength,
        lastMessageId,
        scrollAreaRef,
    ]);

    useLayoutEffect(() => {
        if (
            isInitialLoading ||
            isLoadError ||
            isLoadingMore ||
            lastMessageId === null
        ) {
            return;
        }

        const previousLastMessageId = previousLastMessageIdRef.current;

        if (previousLastMessageId === lastMessageId) {
            return;
        }

        const viewport = getScrollAreaViewport(scrollAreaRef.current);
        if (!viewport) {
            return;
        }

        if (previousLastMessageId === null) {
            previousLastMessageIdRef.current = lastMessageId;

            if (anchorMessageIdRef.current === null) {
                anchorMessageIdRef.current = lastMessageId;
            }

            return;
        }

        const newMessages = getNewTrailingMessages(
            messages,
            previousLastMessageId
        );
        previousLastMessageIdRef.current = lastMessageId;

        const hasOwnNewMessage =
            currentUserId !== null &&
            newMessages.some((message) => message.user?.id === currentUserId);

        if (
            isAtBottomRef.current ||
            hasOwnNewMessage ||
            newMessages.length === 0
        ) {
            scrollViewportToBottom(viewport);
            anchorMessageIdRef.current = lastMessageId;
            isAtBottomRef.current = true;
            clearPendingState();
            return;
        }

        syncPendingFromAnchor();
    }, [
        messages,
        currentUserId,
        isInitialLoading,
        isLoadError,
        isLoadingMore,
        lastMessageId,
        scrollAreaRef,
        clearPendingState,
        syncPendingFromAnchor,
    ]);

    useEffect(() => {
        const viewport = getScrollAreaViewport(scrollAreaRef.current);
        if (!viewport || isInitialLoading || isLoadError) {
            return;
        }

        const handleScroll = () => {
            const atBottom = isViewportAtBottom(viewport);
            isAtBottomRef.current = atBottom;

            if (atBottom && lastMessageId !== null) {
                anchorMessageIdRef.current = lastMessageId;
                clearPendingState();
            }
        };

        viewport.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            viewport.removeEventListener('scroll', handleScroll);
        };
    }, [
        conversationId,
        isInitialLoading,
        isLoadError,
        lastMessageId,
        scrollAreaRef,
        clearPendingState,
    ]);

    const scrollToFirstPendingMessage = useCallback(() => {
        const scrollAreaRoot = scrollAreaRef.current;
        if (!scrollAreaRoot) {
            return;
        }

        const { firstMessageId } = computePendingFromAnchor(
            messages,
            anchorMessageIdRef.current
        );

        if (firstMessageId === null) {
            return;
        }

        scrollViewportToMessage(scrollAreaRoot, firstMessageId);
        anchorMessageIdRef.current = firstMessageId;
        syncPendingFromAnchor();
    }, [messages, scrollAreaRef, syncPendingFromAnchor]);

    return {
        pendingNewMessageCount,
        scrollToFirstPendingMessage,
    };
};
