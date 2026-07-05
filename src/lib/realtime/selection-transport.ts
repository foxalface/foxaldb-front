import type { PresenceChannel } from 'laravel-echo';
import type { SelectionAction } from './selection-reducer';
import {
    parseSelectionWhisperPayload,
    type SelectionWhisperPayload,
} from './selection-types';

const SELECTION_WHISPER_EVENT = 'selection';

export interface SelectionTransportOptions {
    getPresenceChannel: () => PresenceChannel | null;
    selfUserId: number;
    isKnownPresenceUser: (userId: number) => boolean;
    onAction: (action: SelectionAction) => void;
    now?: () => number;
}

export class SelectionTransport {
    private whisperHandler: ((payload: unknown) => void) | null = null;

    constructor(private readonly options: SelectionTransportOptions) {}

    start(): void {
        if (this.whisperHandler !== null) {
            return;
        }

        const channel = this.options.getPresenceChannel();

        if (channel === null) {
            return;
        }

        this.whisperHandler = (payload: unknown) => {
            const parsed = parseSelectionWhisperPayload(payload);

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
                selections: parsed.selections,
                receivedAt: now(),
            });
        };

        channel.listenForWhisper(SELECTION_WHISPER_EVENT, this.whisperHandler);
    }

    stop(): void {
        const channel = this.options.getPresenceChannel();

        if (channel !== null && this.whisperHandler !== null) {
            channel.stopListeningForWhisper(
                SELECTION_WHISPER_EVENT,
                this.whisperHandler
            );
        }

        this.whisperHandler = null;
        this.options.onAction({ type: 'CLEAR' });
    }

    sendSelection(payload: SelectionWhisperPayload): void {
        const channel = this.options.getPresenceChannel();

        if (channel === null) {
            return;
        }

        channel.whisper(SELECTION_WHISPER_EVENT, payload);
    }
}
