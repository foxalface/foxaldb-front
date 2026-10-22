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
    private wasInterrupted = false;
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
            if (payload === undefined) {
                return;
            }

            const { current } = payload;

            if (current === 'connected') {
                if (this.hasConnectedOnce && this.wasInterrupted) {
                    this.wasInterrupted = false;
                    this.setStatus('connected');
                    console.info('[realtime] reconnect detected');
                    this.notifyReconnect();
                    return;
                }

                this.hasConnectedOnce = true;
                this.setStatus('connected');
                console.info('[realtime] connected');
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

            if (
                current === 'connecting' ||
                current === 'unavailable' ||
                current === 'disconnected' ||
                current === 'failed'
            ) {
                this.wasInterrupted = true;
                this.setStatus(
                    current === 'failed' ? 'failed' : 'reconnecting'
                );
                console.info(`[realtime] ${current}`);
            }
        };

        connection.bind('state_change', this.handleStateChange);
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
