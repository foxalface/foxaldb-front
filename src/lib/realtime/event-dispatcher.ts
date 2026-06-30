import type {
    RealtimeEventHandler,
    RealtimeEventName,
    RealtimeEventPayloads,
} from './events';

type HandlerMap = {
    [K in RealtimeEventName]: Set<RealtimeEventHandler<K>>;
};

export class EventDispatcher {
    private readonly handlers: HandlerMap = {
        'Realtime.Ping': new Set(),
    };

    on<T extends RealtimeEventName>(
        event: T,
        handler: RealtimeEventHandler<T>
    ): () => void {
        const listeners = this.handlers[event] as Set<RealtimeEventHandler<T>>;
        listeners.add(handler);

        return () => {
            listeners.delete(handler);
        };
    }

    emit<T extends RealtimeEventName>(
        event: T,
        payload: RealtimeEventPayloads[T]
    ): void {
        const listeners = this.handlers[event] as Set<RealtimeEventHandler<T>>;

        for (const handler of listeners) {
            handler(payload);
        }
    }

    clear(): void {
        this.handlers['Realtime.Ping'].clear();
    }
}
