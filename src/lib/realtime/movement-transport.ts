import type { PresenceChannel } from 'laravel-echo';
import type { MovementAction } from './movement-reducer';
import {
    parseMovementWhisperPayload,
    type MovementWhisperPayload,
} from './movement-types';

const MOVEMENT_WHISPER_EVENT = 'table-movement';

export interface MovementTransportOptions {
    getPresenceChannel: () => PresenceChannel | null;
    selfUserId: number;
    isKnownPresenceUser: (userId: number) => boolean;
    onAction: (action: MovementAction) => void;
    now?: () => number;
}

export class MovementTransport {
    private whisperHandler: ((payload: unknown) => void) | null = null;

    constructor(private readonly options: MovementTransportOptions) {}

    start(): void {
        if (this.whisperHandler !== null) {
            return;
        }

        const channel = this.options.getPresenceChannel();

        if (channel === null) {
            return;
        }

        this.whisperHandler = (payload: unknown) => {
            const parsed = parseMovementWhisperPayload(payload);

            if (parsed === null) {
                return;
            }

            if (parsed.userId === this.options.selfUserId) {
                return;
            }

            if (!this.options.isKnownPresenceUser(parsed.userId)) {
                return;
            }

            const now = this.options.now ?? Date.now;

            this.options.onAction({
                type: 'UPDATE',
                userId: parsed.userId,
                phase: parsed.phase,
                tables: parsed.tables,
                receivedAt: now(),
            });
        };

        channel.listenForWhisper(MOVEMENT_WHISPER_EVENT, this.whisperHandler);
    }

    stop(): void {
        const channel = this.options.getPresenceChannel();

        if (channel !== null && this.whisperHandler !== null) {
            channel.stopListeningForWhisper(
                MOVEMENT_WHISPER_EVENT,
                this.whisperHandler
            );
        }

        this.whisperHandler = null;
        this.options.onAction({ type: 'CLEAR' });
    }

    sendMovement(payload: MovementWhisperPayload): void {
        const channel = this.options.getPresenceChannel();

        if (channel === null) {
            return;
        }

        channel.whisper(MOVEMENT_WHISPER_EVENT, payload);
    }
}
