import { describe, expect, it, vi } from 'vitest';
import type { PresenceChannel } from 'laravel-echo';
import { PresenceActivityTransport } from '../presence-activity-transport';

describe('PresenceActivityTransport', () => {
    it('broadcasts and receives activity changes without leaving presence', () => {
        const channel = {
            whisper: vi.fn(),
            listenForWhisper: vi.fn(),
            stopListeningForWhisper: vi.fn(),
        } as unknown as PresenceChannel;

        const onActivityChange = vi.fn();
        const transport = new PresenceActivityTransport({
            getPresenceChannel: () => channel,
            selfUserId: 1,
            isKnownPresenceUser: (userId) => userId === 2,
            onActivityChange,
        });

        transport.start();
        transport.sendActivity(false);

        expect(channel.whisper).toHaveBeenCalledWith('presence-activity', {
            userId: 1,
            active: false,
        });

        const handler = vi.mocked(channel.listenForWhisper).mock.calls[0]?.[1];
        handler?.({ userId: 2, active: false });

        expect(onActivityChange).toHaveBeenCalledWith(2, false);
    });

    it('ignores invalid, self, and unknown presence activity payloads', () => {
        const channel = {
            whisper: vi.fn(),
            listenForWhisper: vi.fn(),
            stopListeningForWhisper: vi.fn(),
        } as unknown as PresenceChannel;

        const onActivityChange = vi.fn();
        const transport = new PresenceActivityTransport({
            getPresenceChannel: () => channel,
            selfUserId: 1,
            isKnownPresenceUser: () => false,
            onActivityChange,
        });

        transport.start();

        const handler = vi.mocked(channel.listenForWhisper).mock.calls[0]?.[1];
        handler?.({ userId: 1, active: false });
        handler?.({ userId: 2, active: false });
        handler?.({ userId: '2', active: false });

        expect(onActivityChange).not.toHaveBeenCalled();
    });
});
