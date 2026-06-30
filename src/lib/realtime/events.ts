export type RealtimeEventName = 'Realtime.Ping';

export interface RealtimePingPayload {
    message: string;
    sentAt: string;
    userId: number;
}

export type RealtimeEventPayloads = {
    'Realtime.Ping': RealtimePingPayload;
};

export type RealtimeEventHandler<T extends RealtimeEventName> = (
    payload: RealtimeEventPayloads[T]
) => void;
