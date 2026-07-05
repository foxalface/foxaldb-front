import React, {
    useCallback,
    useEffect,
    useMemo,
    useReducer,
    useRef,
    useState,
} from 'react';
import { BACKEND_URL } from '@/lib/api/client';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import type { Channel } from 'pusher-js';
import { useAuth } from '@/hooks/use-auth';
import { ChannelManager } from '@/lib/realtime/channel-manager';
import {
    ConnectionManager,
    type ConnectionStatus,
} from '@/lib/realtime/connection-manager';
import {
    initialPresenceState,
    presenceReducer,
} from '@/lib/realtime/presence-reducer';
import { EventDispatcher } from '@/lib/realtime/event-dispatcher';
import type {
    RealtimeEventHandler,
    RealtimeEventName,
} from '@/lib/realtime/events';
import { isValidBackendDiagramId } from '@/lib/realtime/diagram-id';
import type { CursorWhisperPayload } from '@/lib/realtime/cursor-types';
import { CursorActionSubscriber } from '@/lib/realtime/cursor-subscriber';
import type { CursorAction } from '@/lib/realtime/cursor-reducer';
import { SelectionActionSubscriber } from '@/lib/realtime/selection-subscriber';
import type { SelectionAction } from '@/lib/realtime/selection-reducer';
import type { SelectionWhisperPayload } from '@/lib/realtime/selection-types';
import { clearEchoInstance, setEchoInstance } from '@/lib/realtime/echo';
import { RealtimeContext } from './realtime-context';

declare global {
    interface Window {
        Pusher: typeof Pusher;
    }
}

const REVERB_APP_KEY: string =
    import.meta.env.VITE_REVERB_APP_KEY ?? 'foxaldb-key';
const REVERB_HOST: string = import.meta.env.VITE_REVERB_HOST ?? 'localhost';
const REVERB_PORT: number = Number(import.meta.env.VITE_REVERB_PORT ?? '8080');
const REVERB_SCHEME: string = import.meta.env.VITE_REVERB_SCHEME ?? 'http';

const BROADCAST_AUTH_ENDPOINT = `${BACKEND_URL}/broadcasting/auth`;

interface BroadcastAuthResponse {
    auth: string;
}

type PusherAuthorizeCallback = (
    error: Error | null,
    authData: BroadcastAuthResponse | null
) => void;

const getXsrfToken = (): string | undefined => {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : undefined;
};

const getBroadcastAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
        Accept: 'application/json',
    };

    const xsrfToken = getXsrfToken();
    if (xsrfToken) {
        headers['X-XSRF-TOKEN'] = xsrfToken;
    }

    return headers;
};

const authorizeBroadcastChannel = async (
    channelName: string,
    socketId: string,
    callback: PusherAuthorizeCallback
): Promise<void> => {
    try {
        const response = await fetch(BROADCAST_AUTH_ENDPOINT, {
            method: 'POST',
            credentials: 'include',
            headers: {
                ...getBroadcastAuthHeaders(),
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                socket_id: socketId,
                channel_name: channelName,
            }).toString(),
        });

        if (!response.ok) {
            callback(
                new Error(
                    `Broadcast auth failed with status ${response.status}`
                ),
                null
            );
            return;
        }

        const data = (await response.json()) as BroadcastAuthResponse;

        if (typeof data.auth !== 'string') {
            callback(
                new Error('Broadcast auth response is missing auth string'),
                null
            );
            return;
        }

        callback(null, data);
    } catch (error) {
        callback(
            error instanceof Error
                ? error
                : new Error('Broadcast auth request failed'),
            null
        );
    }
};

const createEchoInstance = (): Echo<'reverb'> | null => {
    try {
        window.Pusher = Pusher;

        return new Echo({
            broadcaster: 'reverb',
            key: REVERB_APP_KEY,
            wsHost: REVERB_HOST,
            wsPort: REVERB_PORT,
            wssPort: REVERB_PORT,
            forceTLS: REVERB_SCHEME === 'https',
            enabledTransports: ['ws', 'wss'],
            authEndpoint: BROADCAST_AUTH_ENDPOINT,
            authorizer: (channel: Channel) => ({
                authorize: (
                    socketId: string,
                    callback: PusherAuthorizeCallback
                ) => {
                    void authorizeBroadcastChannel(
                        channel.name,
                        socketId,
                        callback
                    );
                },
            }),
        });
    } catch (error) {
        console.warn('Failed to initialize Echo', error);
        return null;
    }
};

export const RealtimeProvider: React.FC<React.PropsWithChildren> = ({
    children,
}) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const [connectionStatus, setConnectionStatus] =
        useState<ConnectionStatus>('idle');
    const [currentDiagramId, setCurrentDiagramId] = useState<string | null>(
        null
    );
    const [presence, dispatchPresence] = useReducer(
        presenceReducer,
        undefined,
        initialPresenceState
    );

    const connectionManagerRef = useRef(new ConnectionManager());
    const dispatcherRef = useRef(new EventDispatcher());
    const channelManagerRef = useRef(new ChannelManager(dispatcherRef.current));
    const cursorSubscriberRef = useRef(new CursorActionSubscriber());
    const selectionSubscriberRef = useRef(new SelectionActionSubscriber());
    const presenceMembersRef = useRef(presence.members);
    presenceMembersRef.current = presence.members;

    useEffect(() => {
        channelManagerRef.current.setCursorPresenceChecker((userId) =>
            presenceMembersRef.current.has(userId)
        );
        channelManagerRef.current.setCursorOnAction((action) => {
            cursorSubscriberRef.current.dispatch(action);
        });
        channelManagerRef.current.setSelectionOnAction((action) => {
            selectionSubscriberRef.current.dispatch(action);
        });
    }, []);

    useEffect(() => {
        const connectionManager = connectionManagerRef.current;

        return connectionManager.onStatusChange((status) => {
            setConnectionStatus(status);

            if (status === 'reconnecting' || status === 'disconnected') {
                dispatchPresence({ type: 'SET_DISCONNECTED' });
            }
        });
    }, []);

    useEffect(() => {
        const channelManager = channelManagerRef.current;

        channelManager.setPresenceHandlers({
            onHere: (members) => dispatchPresence({ type: 'HERE', members }),
            onJoining: (member) =>
                dispatchPresence({ type: 'JOINING', member }),
            onLeaving: (member) =>
                dispatchPresence({ type: 'LEAVING', memberId: member.id }),
            onError: (error) => dispatchPresence({ type: 'SET_ERROR', error }),
        });

        return () => {
            channelManager.setPresenceHandlers(null);
        };
    }, []);

    useEffect(() => {
        const connectionManager = connectionManagerRef.current;
        const channelManager = channelManagerRef.current;

        return connectionManager.onReconnect(() => {
            dispatchPresence({ type: 'SET_DISCONNECTED' });
            channelManager.rejoinAll();
            setCurrentDiagramId(channelManager.getCurrentDiagramId());
        });
    }, []);

    useEffect(() => {
        if (isLoading) {
            return;
        }

        const connectionManager = connectionManagerRef.current;
        const channelManager = channelManagerRef.current;
        const dispatcher = dispatcherRef.current;

        if (!isAuthenticated || user === null) {
            dispatchPresence({ type: 'RESET' });
            channelManager.clearAll();
            dispatcher.clear();
            connectionManager.disconnect();
            setCurrentDiagramId(null);
            return;
        }

        const echo = createEchoInstance();
        if (echo === null) {
            connectionManager.disconnect();
            return;
        }

        setEchoInstance(echo);
        connectionManager.attach();
        channelManager.joinUserChannel(user.id);

        return () => {
            dispatchPresence({ type: 'RESET' });
            channelManager.clearAll();
            dispatcher.clear();
            connectionManager.disconnect();
            clearEchoInstance();
            setCurrentDiagramId(null);
        };
    }, [isAuthenticated, isLoading, user]);

    const joinDiagram = useCallback((diagramId: string) => {
        if (!isValidBackendDiagramId(diagramId)) {
            return;
        }

        dispatchPresence({ type: 'SET_JOINING' });
        channelManagerRef.current.joinDiagram(String(diagramId));
        setCurrentDiagramId(channelManagerRef.current.getCurrentDiagramId());
    }, []);

    const leaveDiagram = useCallback(() => {
        channelManagerRef.current.leaveDiagram();
        dispatchPresence({ type: 'RESET' });
        setCurrentDiagramId(null);
    }, []);

    const on = useCallback(
        <T extends RealtimeEventName>(
            event: T,
            handler: RealtimeEventHandler<T>
        ): (() => void) => {
            return dispatcherRef.current.on(event, handler);
        },
        []
    );

    const sendCursor = useCallback((payload: CursorWhisperPayload): void => {
        channelManagerRef.current.sendCursor(payload);
    }, []);

    const subscribeToCursorActions = useCallback(
        (listener: (action: CursorAction) => void) => {
            return cursorSubscriberRef.current.subscribe(listener);
        },
        []
    );

    const sendSelection = useCallback(
        (payload: SelectionWhisperPayload): void => {
            channelManagerRef.current.sendSelection(payload);
        },
        []
    );

    const subscribeToSelectionActions = useCallback(
        (listener: (action: SelectionAction) => void) => {
            return selectionSubscriberRef.current.subscribe(listener);
        },
        []
    );

    const value = useMemo(
        () => ({
            connectionStatus,
            currentDiagramId,
            presence,
            joinDiagram,
            leaveDiagram,
            sendCursor,
            subscribeToCursorActions,
            sendSelection,
            subscribeToSelectionActions,
            on,
        }),
        [
            connectionStatus,
            currentDiagramId,
            presence,
            joinDiagram,
            leaveDiagram,
            sendCursor,
            subscribeToCursorActions,
            sendSelection,
            subscribeToSelectionActions,
            on,
        ]
    );

    return (
        <RealtimeContext.Provider value={value}>
            {children}
        </RealtimeContext.Provider>
    );
};
