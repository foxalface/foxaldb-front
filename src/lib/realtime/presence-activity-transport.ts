import type { PresenceChannel } from 'laravel-echo';

const PRESENCE_ACTIVITY_WHISPER_EVENT = 'presence-activity';

export interface PresenceActivityWhisperPayload {
    userId: number;
    active: boolean;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

export const parsePresenceActivityWhisperPayload = (
    value: unknown
): PresenceActivityWhisperPayload | null => {
    if (!isRecord(value)) {
        return null;
    }

    const userId =
        typeof value.userId === 'number' ? value.userId : Number(value.userId);
    const active = value.active;

    if (
        !Number.isInteger(userId) ||
        userId <= 0 ||
        typeof active !== 'boolean'
    ) {
        return null;
    }

    return { userId, active };
};

export interface PresenceActivityTransportOptions {
    getPresenceChannel: () => PresenceChannel | null;
    selfUserId: number;
    isKnownPresenceUser: (userId: number) => boolean;
    onActivityChange: (userId: number, active: boolean) => void;
}

export class PresenceActivityTransport {
    private whisperHandler: ((payload: unknown) => void) | null = null;

    constructor(private readonly options: PresenceActivityTransportOptions) {}

    start(): void {
        if (this.whisperHandler !== null) {
            return;
        }

        const channel = this.options.getPresenceChannel();

        if (channel === null) {
            return;
        }

        this.whisperHandler = (payload: unknown) => {
            const parsed = parsePresenceActivityWhisperPayload(payload);

            if (parsed === null) {
                return;
            }

            if (parsed.userId === this.options.selfUserId) {
                return;
            }

            if (!this.options.isKnownPresenceUser(parsed.userId)) {
                return;
            }

            this.options.onActivityChange(parsed.userId, parsed.active);
        };

        channel.listenForWhisper(
            PRESENCE_ACTIVITY_WHISPER_EVENT,
            this.whisperHandler
        );
    }

    stop(): void {
        const channel = this.options.getPresenceChannel();

        if (channel !== null && this.whisperHandler !== null) {
            channel.stopListeningForWhisper(
                PRESENCE_ACTIVITY_WHISPER_EVENT,
                this.whisperHandler
            );
        }

        this.whisperHandler = null;
    }

    sendActivity(active: boolean): void {
        const channel = this.options.getPresenceChannel();

        if (channel === null) {
            return;
        }

        channel.whisper(PRESENCE_ACTIVITY_WHISPER_EVENT, {
            userId: this.options.selfUserId,
            active,
        });
    }
}
