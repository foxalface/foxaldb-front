/* eslint-disable react-refresh/only-export-components -- shared Vitest helpers, not a UI module */
import React from 'react';
import type { DiagramComment } from '@/lib/comments/comment-types';
import type { DiagramCommentEventChannel } from '@/lib/realtime/comment-subscriber';
import { CommentsProvider } from '../comments-provider';

export interface AuthValue {
    user: { id: number; name: string; email: string } | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export type EventCallback = (payload: unknown) => void;

export type FakeChannel = DiagramCommentEventChannel & {
    listeners: Map<string, Set<EventCallback>>;
    stopListeningCalls: Array<{
        event: string;
        callback: EventCallback | undefined;
    }>;
    leaveCalls: number;
    destroyCalls: number;
    listenError: Error | null;
    stopListeningError: Error | null;
    emit: (event: string, payload: unknown) => void;
    listenerCount: (event?: string) => number;
};

export interface RealtimeMockValue {
    currentDiagramId: string | null;
    getDiagramPrivateChannel: () => DiagramCommentEventChannel | null;
    onReconnect: (listener: () => void) => () => void;
}

/**
 * Mutable harness shared within a single Vitest file via module import.
 * Each suite must call {@link resetCommentsProviderTestEnv} in `beforeEach`.
 */
export interface CommentsProviderTestEnv {
    authValue: AuthValue;
    currentDiagram: { id: string } | null;
    realtimeValue: RealtimeMockValue;
    reconnectListeners: Set<() => void>;
}

export const createAuthenticatedAuth = (): AuthValue => ({
    user: { id: 1, name: 'Alice', email: 'a@example.com' },
    isAuthenticated: true,
    isLoading: false,
});

export const createInactiveRealtimeValue = (): RealtimeMockValue => ({
    currentDiagramId: null,
    getDiagramPrivateChannel: () => null,
    onReconnect: () => () => undefined,
});

export const createCommentsProviderTestEnv = (): CommentsProviderTestEnv => ({
    authValue: createAuthenticatedAuth(),
    currentDiagram: { id: '42' },
    realtimeValue: createInactiveRealtimeValue(),
    reconnectListeners: new Set(),
});

export const createCommentFixture = (
    overrides: Partial<DiagramComment> & Pick<DiagramComment, 'id'>
): DiagramComment => ({
    diagramId: 42,
    targetType: 'diagram',
    targetId: null,
    body: `body-${overrides.id}`,
    user: { id: 1, name: 'Alice' },
    createdAt: `2026-01-0${overrides.id}T10:00:00.000Z`,
    updatedAt: `2026-01-0${overrides.id}T10:00:00.000Z`,
    ...overrides,
});

export const deferred = <T,>() => {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
};

export const createFakeChannel = (): FakeChannel => {
    const listeners = new Map<string, Set<EventCallback>>();
    const stopListeningCalls: Array<{
        event: string;
        callback: EventCallback | undefined;
    }> = [];

    const channel: FakeChannel = {
        listeners,
        stopListeningCalls,
        leaveCalls: 0,
        destroyCalls: 0,
        listenError: null,
        stopListeningError: null,
        listen(event, callback) {
            if (channel.listenError !== null) {
                throw channel.listenError;
            }
            let set = listeners.get(event);
            if (set === undefined) {
                set = new Set();
                listeners.set(event, set);
            }
            set.add(callback);
            return channel;
        },
        stopListening(event, callback) {
            stopListeningCalls.push({ event, callback });
            if (channel.stopListeningError !== null) {
                throw channel.stopListeningError;
            }
            const set = listeners.get(event);
            if (set === undefined) {
                return channel;
            }
            if (callback === undefined) {
                set.clear();
            } else {
                set.delete(callback);
            }
            return channel;
        },
        emit(event, payload) {
            const set = listeners.get(event);
            if (set === undefined) {
                return;
            }
            for (const callback of set) {
                callback(payload);
            }
        },
        listenerCount(event) {
            if (event !== undefined) {
                return listeners.get(event)?.size ?? 0;
            }
            let total = 0;
            for (const set of listeners.values()) {
                total += set.size;
            }
            return total;
        },
    };

    return channel;
};

export const createdPayload = (
    overrides: {
        diagramId?: number;
        userId?: number;
        comment?: DiagramComment;
        sentAt?: string;
    } = {}
) => {
    const payloadComment =
        overrides.comment ?? createCommentFixture({ id: 10 });

    return {
        diagramId: overrides.diagramId ?? payloadComment.diagramId,
        userId: overrides.userId ?? 1,
        comment: payloadComment,
        sentAt: overrides.sentAt ?? '2026-07-19T10:06:00.000Z',
    };
};

export const deletedPayload = (
    overrides: {
        diagramId?: number;
        commentId?: number;
        userId?: number;
        sentAt?: string;
    } = {}
) => ({
    diagramId: overrides.diagramId ?? 42,
    commentId: overrides.commentId ?? 10,
    userId: overrides.userId ?? 1,
    sentAt: overrides.sentAt ?? '2026-07-19T10:06:00.000Z',
});

export const fireReconnect = (reconnectListeners: Set<() => void>): void => {
    for (const listener of [...reconnectListeners]) {
        listener();
    }
};

export const setManagedChannel = (
    env: CommentsProviderTestEnv,
    channel: DiagramCommentEventChannel | null,
    diagramId: string | null = '42'
): void => {
    env.realtimeValue = {
        currentDiagramId: diagramId,
        getDiagramPrivateChannel: () => channel,
        onReconnect: (listener) => {
            env.reconnectListeners.add(listener);
            return () => {
                env.reconnectListeners.delete(listener);
            };
        },
    };
};

export const resetCommentsProviderTestEnv = (
    env: CommentsProviderTestEnv
): void => {
    env.authValue = createAuthenticatedAuth();
    env.currentDiagram = { id: '42' };
    env.reconnectListeners = new Set();
    setManagedChannel(env, null, null);
};

export const CommentsProviderTestWrapper = ({
    children,
}: {
    children: React.ReactNode;
}) => <CommentsProvider>{children}</CommentsProvider>;
