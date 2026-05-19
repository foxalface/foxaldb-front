import { BACKEND_URL } from '@/lib/api/client';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import type { Channel } from 'pusher-js';

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

let echoInstance: Echo<'reverb'> | null = null;

export const getEcho = (): Echo<'reverb'> | null => {
    if (echoInstance !== null) {
        return echoInstance;
    }

    try {
        window.Pusher = Pusher;

        echoInstance = new Echo({
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

    return echoInstance;
};
