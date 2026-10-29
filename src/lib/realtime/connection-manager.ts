import { getEcho, clearEchoInstance } from './echo';

export type ConnectionStatus =
    | 'idle'
    | 'connecting'
    | 'connected'
    | 'reconnecting'
    | 'disconnected'
    | 'failed';

type ConnectionStatusListener = (status: ConnectionStatus) => void;

type ReconnectListener = () => void;

interface PusherStateChange {
    previous: string;
    current: string;
}

interface PusherConnectionLike {
    bind: (
        event: string,
        handler: (payload?: PusherStateChange) => void
    ) => void;
    unbind: (
        event: string,
        handler?: (payload?: PusherStateChange) => void
    ) => void;
    state?: string;
}

const INTERRUPTION_STATES = new Set([
    'connecting',
    'unavailable',
    'disconnected',
    'failed',
]);

interface EchoPusherConnector {
    pusher?: {
        connection: PusherConnectionLike;
    };
}

const getPusherConnection = (): PusherConnectionLike | null => {
    const echo = getEcho();
    if (echo === null) {
        return null;
    }

    const connector = echo.connector as EchoPusherConnector;
    return connector.pusher?.connection ?? null;
};

export class ConnectionManager {
    private status: ConnectionStatus = 'idle';
    private hasConnectedOnce = false;
    private wasInterrupted = false;
    private ignoreTransportEvents = false;
    private statusListeners = new Set<ConnectionStatusListener>();
    private reconnectListeners = new Set<ReconnectListener>();
    private boundConnection: PusherConnectionLike | null = null;
    private handleStateChange: ((payload?: PusherStateChange) => void) | null =
        null;

    getStatus(): ConnectionStatus {
        return this.status;
    }

    onStatusChange(listener: ConnectionStatusListener): () => void {
        this.statusListeners.add(listener);
        return () => {
            this.statusListeners.delete(listener);
        };
    }

    onReconnect(listener: ReconnectListener): () => void {
        this.reconnectListeners.add(listener);
        return () => {
            this.reconnectListeners.delete(listener);
        };
    }

    attach(): void {
        if (getEcho() === null) {
            this.setStatus('failed');
            return;
        }

        this.setStatus('connecting');
        this.bindConnectionEvents();
    }

    disconnect(): void {
        // Logout and other intentional teardowns must not look like a
        // transport reconnect, even if unbind misses the closing event.
        this.ignoreTransportEvents = true;
        this.unbindConnectionEvents();

        const echo = getEcho();
        if (echo !== null) {
            try {
                echo.disconnect();
            } catch (error) {
                console.warn('Failed to disconnect Echo', error);
            }
        }

        clearEchoInstance();
        this.hasConnectedOnce = false;
        this.wasInterrupted = false;
        this.ignoreTransportEvents = false;
        this.setStatus('idle');
    }

    private bindConnectionEvents(): void {
        const connection = getPusherConnection();
        if (connection === null) {
            return;
        }

        this.unbindConnectionEvents();
        this.boundConnection = connection;

        this.handleStateChange = (payload) => {
            this.applyTransportState(payload?.current);
        };

        connection.bind('state_change', this.handleStateChange);
        this.applyObservedState(connection.state);
    }

    /**
     * Reconnect means a connected state after the transport left connected,
     * once the session has already connected once.
     * The first connected state is not a reconnect.
     * A repeated connected notification is not another reconnect.
     */
    private applyTransportState(current: string | undefined): void {
        if (this.ignoreTransportEvents || current === undefined) {
            return;
        }

        if (current === 'connected') {
            if (this.hasConnectedOnce && this.wasInterrupted) {
                this.wasInterrupted = false;
                this.setStatus('connected');
                console.info('[realtime] reconnect detected');
                this.notifyReconnect();
                return;
            }

            if (!this.hasConnectedOnce) {
                this.hasConnectedOnce = true;
                this.setStatus('connected');
                console.info('[realtime] connected');
            }

            return;
        }

        if (!this.hasConnectedOnce) {
            if (current === 'connecting') {
                this.setStatus('connecting');
            } else if (current === 'failed') {
                this.setStatus('failed');
            }

            return;
        }

        if (INTERRUPTION_STATES.has(current)) {
            this.wasInterrupted = true;
            this.setStatus(current === 'failed' ? 'failed' : 'reconnecting');
            console.info(`[realtime] ${current}`);
        }
    }

    private applyObservedState(state: string | undefined): void {
        if (state === undefined || state === 'initialized') {
            return;
        }

        // Binding after the socket is already up must not treat that as a
        // fresh session, and must not drop an interruption we already saw.
        if (
            state === 'connected' &&
            this.hasConnectedOnce &&
            this.wasInterrupted
        ) {
            this.applyTransportState('connected');
            return;
        }

        if (state === 'connected' && !this.hasConnectedOnce) {
            this.hasConnectedOnce = true;
            this.setStatus('connected');
            return;
        }

        if (this.hasConnectedOnce && INTERRUPTION_STATES.has(state)) {
            this.wasInterrupted = true;
            this.setStatus(state === 'failed' ? 'failed' : 'reconnecting');
        }
    }

    private unbindConnectionEvents(): void {
        if (this.boundConnection === null) {
            return;
        }

        if (this.handleStateChange !== null) {
            this.boundConnection.unbind('state_change', this.handleStateChange);
        }

        this.boundConnection = null;
        this.handleStateChange = null;
    }

    private setStatus(status: ConnectionStatus): void {
        this.status = status;

        for (const listener of this.statusListeners) {
            listener(status);
        }
    }

    private notifyReconnect(): void {
        for (const listener of this.reconnectListeners) {
            listener();
        }
    }
}
