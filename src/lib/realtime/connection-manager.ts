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

interface PusherConnectionLike {
    bind: (event: string, handler: () => void) => void;
    unbind: (event: string, handler?: () => void) => void;
}

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
    private wasDisconnected = false;
    private statusListeners = new Set<ConnectionStatusListener>();
    private reconnectListeners = new Set<ReconnectListener>();
    private boundConnection: PusherConnectionLike | null = null;
    private handleConnected: (() => void) | null = null;
    private handleDisconnected: (() => void) | null = null;
    private handleFailed: (() => void) | null = null;

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
        this.wasDisconnected = false;
        this.setStatus('idle');
    }

    private bindConnectionEvents(): void {
        const connection = getPusherConnection();
        if (connection === null) {
            return;
        }

        this.unbindConnectionEvents();
        this.boundConnection = connection;

        this.handleConnected = () => {
            if (this.hasConnectedOnce && this.wasDisconnected) {
                this.wasDisconnected = false;
                this.setStatus('connected');
                this.notifyReconnect();
            } else {
                this.hasConnectedOnce = true;
                this.setStatus('connected');
            }
        };

        this.handleDisconnected = () => {
            this.wasDisconnected = true;
            if (this.hasConnectedOnce) {
                this.setStatus('reconnecting');
            } else {
                this.setStatus('disconnected');
            }
        };

        this.handleFailed = () => {
            this.setStatus('failed');
        };

        connection.bind('connected', this.handleConnected);
        connection.bind('disconnected', this.handleDisconnected);
        connection.bind('failed', this.handleFailed);
        connection.bind('unavailable', this.handleFailed);
    }

    private unbindConnectionEvents(): void {
        if (this.boundConnection === null) {
            return;
        }

        if (this.handleConnected !== null) {
            this.boundConnection.unbind('connected', this.handleConnected);
        }

        if (this.handleDisconnected !== null) {
            this.boundConnection.unbind(
                'disconnected',
                this.handleDisconnected
            );
        }

        if (this.handleFailed !== null) {
            this.boundConnection.unbind('failed', this.handleFailed);
            this.boundConnection.unbind('unavailable', this.handleFailed);
        }

        this.boundConnection = null;
        this.handleConnected = null;
        this.handleDisconnected = null;
        this.handleFailed = null;
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
