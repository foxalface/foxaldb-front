import type { PresenceChannel } from 'laravel-echo';
import type { EditingAction } from './editing-reducer';
import {
    parseEditingWhisperPayload,
    type EditingWhisperPayload,
} from './editing-types';

const EDITING_WHISPER_EVENT = 'editing';

export interface EditingTransportOptions {
    getPresenceChannel: () => PresenceChannel | null;
    selfUserId: number;
    isKnownPresenceUser: (userId: number) => boolean;
    onAction: (action: EditingAction) => void;
    now?: () => number;
}

export class EditingTransport {
    private whisperHandler: ((payload: unknown) => void) | null = null;

    constructor(private readonly options: EditingTransportOptions) {}

    start(): void {
        if (this.whisperHandler !== null) {
            return;
        }

        const channel = this.options.getPresenceChannel();

        if (channel === null) {
            return;
        }

        this.whisperHandler = (payload: unknown) => {
            const parsed = parseEditingWhisperPayload(payload);

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
                edits: parsed.edits,
                receivedAt: now(),
            });
        };

        channel.listenForWhisper(EDITING_WHISPER_EVENT, this.whisperHandler);
    }

    stop(): void {
        const channel = this.options.getPresenceChannel();

        if (channel !== null && this.whisperHandler !== null) {
            channel.stopListeningForWhisper(
                EDITING_WHISPER_EVENT,
                this.whisperHandler
            );
        }

        this.whisperHandler = null;
        this.options.onAction({ type: 'CLEAR' });
    }

    sendEditing(payload: EditingWhisperPayload): void {
        const channel = this.options.getPresenceChannel();

        if (channel === null) {
            return;
        }

        channel.whisper(EDITING_WHISPER_EVENT, payload);
    }
}
