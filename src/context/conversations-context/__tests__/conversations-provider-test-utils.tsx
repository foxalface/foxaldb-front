/* eslint-disable react-refresh/only-export-components -- shared Vitest helpers, not a UI module */
import React from 'react';
import type { DiagramConversation } from '@/lib/conversations/conversation-types';
import type { DiagramPrivateEventChannel } from '@/lib/realtime/diagram-private-channel';
import { ConversationsProvider } from '../conversations-provider';
import { aliceAuthor, testAuthAlice } from '@/test/user-identity-fixtures';

export interface AuthValue {
    user: {
        id: number;
        first_name: string;
        last_name: string;
        full_name: string;
        email: string;
    } | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export type EventCallback = (payload: unknown) => void;

export type FakeChannel = DiagramPrivateEventChannel & {
    listeners: Map<string, Set<EventCallback>>;
    emit: (event: string, payload: unknown) => void;
};

export interface RealtimeMockValue {
    currentDiagramId: string | null;
    getDiagramPrivateChannel: () => DiagramPrivateEventChannel | null;
    getUserPrivateChannel: () => DiagramPrivateEventChannel | null;
    onReconnect: (listener: () => void) => () => void;
}

export interface ConversationsProviderTestEnv {
    authValue: AuthValue;
    currentDiagram: { id: string } | null;
    realtimeValue: RealtimeMockValue;
    reconnectListeners: Set<() => void>;
}

export const createAuthenticatedAuth = (): AuthValue => ({
    user: testAuthAlice(),
    isAuthenticated: true,
    isLoading: false,
});

export const createInactiveRealtimeValue = (): RealtimeMockValue => ({
    currentDiagramId: null,
    getDiagramPrivateChannel: () => null,
    getUserPrivateChannel: () => null,
    onReconnect: () => () => undefined,
});

export const createConversationsProviderTestEnv =
    (): ConversationsProviderTestEnv => ({
        authValue: createAuthenticatedAuth(),
        currentDiagram: { id: '42' },
        realtimeValue: createInactiveRealtimeValue(),
        reconnectListeners: new Set(),
    });

export const createConversationFixture = (
    overrides: Partial<DiagramConversation> & Pick<DiagramConversation, 'id'>
): DiagramConversation => ({
    diagramId: 42,
    targetType: 'diagram',
    targetId: null,
    status: 'active',
    archivedAt: null,
    messageCount: 1,
    lastMessageAt: `2026-01-0${overrides.id}T12:00:00.000Z`,
    lastMessageBody: 'Fixture message',
    lastMessageAuthor: aliceAuthor,
    unreadCount: 0,
    createdAt: `2026-01-0${overrides.id}T10:00:00.000Z`,
    updatedAt: `2026-01-0${overrides.id}T11:00:00.000Z`,
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

    const channel: FakeChannel = {
        listeners,
        listen(event, callback) {
            let set = listeners.get(event);
            if (set === undefined) {
                set = new Set();
                listeners.set(event, set);
            }
            set.add(callback);
            return channel;
        },
        stopListening(event, callback) {
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
    };

    return channel;
};

export const resetConversationsProviderTestEnv = (
    env: ConversationsProviderTestEnv
): void => {
    env.authValue = createAuthenticatedAuth();
    env.currentDiagram = { id: '42' };
    env.realtimeValue = createInactiveRealtimeValue();
    env.reconnectListeners = new Set();
};

export const ConversationsProviderTestWrapper = ({
    children,
}: {
    children: React.ReactNode;
}) => <ConversationsProvider>{children}</ConversationsProvider>;
