import type { PresenceChannel } from 'laravel-echo';
import type { CursorAction } from './cursor-reducer';
import {
    parseCursorWhisperPayload,
    type CursorState,
    type CursorWhisperPayload,
} from './cursor-types';

const CURSOR_WHISPER_EVENT = 'cursor';

export interface CursorTransportOptions {
    getPresenceChannel: () => PresenceChannel | null;
    selfUserId: number;
    isKnownPresenceUser: (userId: number) => boolean;
    onAction: (action: CursorAction) => void;
    now?: () => number;
}

export class CursorTransport {
    private whisperHandler: ((payload: unknown) => void) | null = null;

    constructor(private readonly options: CursorTransportOptions) {}

    start(): void {
        if (this.whisperHandler !== null) {
            return;
        }

        const channel = this.options.getPresenceChannel();

        if (channel === null) {
            return;
        }

        this.whisperHandler = (payload: unknown) => {
            const parsed = parseCursorWhisperPayload(payload);

            if (parsed === null) {
                return;
            }

            if (parsed.userId === this.options.selfUserId) {
                return;
            }

            if (!this.options.isKnownPresenceUser(parsed.userId)) {
                return;
            }

            this.options.onAction({
                type: 'UPDATE',
                cursor: this.toCursorState(parsed),
            });
        };

        channel.listenForWhisper(CURSOR_WHISPER_EVENT, this.whisperHandler);
    }

    stop(): void {
        const channel = this.options.getPresenceChannel();

        if (channel !== null && this.whisperHandler !== null) {
            channel.stopListeningForWhisper(
                CURSOR_WHISPER_EVENT,
                this.whisperHandler
            );
        }

        this.whisperHandler = null;
        this.options.onAction({ type: 'CLEAR' });
    }

    sendCursor(payload: CursorWhisperPayload): void {
        const channel = this.options.getPresenceChannel();

        if (channel === null) {
            return;
        }

        channel.whisper(CURSOR_WHISPER_EVENT, payload);
    }

    private toCursorState(payload: CursorWhisperPayload): CursorState {
        const now = this.options.now ?? Date.now;

        return {
            userId: payload.userId,
            x: payload.x,
            y: payload.y,
            receivedAt: now(),
            stale: false,
        };
    }
}
