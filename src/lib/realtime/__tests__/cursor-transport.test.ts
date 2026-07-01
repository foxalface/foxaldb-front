import { describe, expect, it, vi } from 'vitest';
import type { PresenceChannel } from 'laravel-echo';
import { CursorTransport } from '../cursor-transport';
import type { CursorAction } from '../cursor-reducer';

const createPresenceChannelMock = () => {
    const whisperListeners = new Map<string, Set<(payload: unknown) => void>>();

    const channel = {
        listenForWhisper: vi.fn(
            (event: string, callback: (payload: unknown) => void) => {
                const listeners =
                    whisperListeners.get(event) ??
                    new Set<(payload: unknown) => void>();
                listeners.add(callback);
                whisperListeners.set(event, listeners);
                return channel;
            }
        ),
        stopListeningForWhisper: vi.fn(
            (event: string, callback: (payload: unknown) => void) => {
                whisperListeners.get(event)?.delete(callback);
                return channel;
            }
        ),
        whisper: vi.fn(),
        emitWhisper: (event: string, payload: unknown) => {
            for (const listener of whisperListeners.get(event) ?? []) {
                listener(payload);
            }
        },
    };

    return channel;
};

describe('CursorTransport', () => {
    it('dispatches UPDATE for valid remote cursor whispers', () => {
        const channel = createPresenceChannelMock();
        const onAction = vi.fn<(action: CursorAction) => void>();
        const transport = new CursorTransport({
            getPresenceChannel: () => channel as unknown as PresenceChannel,
            selfUserId: 1,
            isKnownPresenceUser: (userId) => userId === 2,
            onAction,
            now: () => 5_000,
        });

        transport.start();
        channel.emitWhisper('cursor', { userId: 2, x: 100, y: 200 });

        expect(onAction).toHaveBeenCalledWith({
            type: 'UPDATE',
            cursor: {
                userId: 2,
                x: 100,
                y: 200,
                receivedAt: 5_000,
                stale: false,
            },
        });
    });

    it('ignores malformed cursor whispers', () => {
        const channel = createPresenceChannelMock();
        const onAction = vi.fn<(action: CursorAction) => void>();
        const transport = new CursorTransport({
            getPresenceChannel: () => channel as unknown as PresenceChannel,
            selfUserId: 1,
            isKnownPresenceUser: () => true,
            onAction,
        });

        transport.start();
        channel.emitWhisper('cursor', { userId: 2, x: 'bad', y: 10 });

        expect(onAction).not.toHaveBeenCalled();
    });

    it('ignores self cursor whispers', () => {
        const channel = createPresenceChannelMock();
        const onAction = vi.fn<(action: CursorAction) => void>();
        const transport = new CursorTransport({
            getPresenceChannel: () => channel as unknown as PresenceChannel,
            selfUserId: 1,
            isKnownPresenceUser: () => true,
            onAction,
        });

        transport.start();
        channel.emitWhisper('cursor', { userId: 1, x: 10, y: 20 });

        expect(onAction).not.toHaveBeenCalled();
    });

    it('ignores whispers from users not in the presence map', () => {
        const channel = createPresenceChannelMock();
        const onAction = vi.fn<(action: CursorAction) => void>();
        const transport = new CursorTransport({
            getPresenceChannel: () => channel as unknown as PresenceChannel,
            selfUserId: 1,
            isKnownPresenceUser: (userId) => userId === 2,
            onAction,
        });

        transport.start();
        channel.emitWhisper('cursor', { userId: 99, x: 10, y: 20 });

        expect(onAction).not.toHaveBeenCalled();
    });

    it('sends cursor payloads through the presence channel', () => {
        const channel = createPresenceChannelMock();
        const transport = new CursorTransport({
            getPresenceChannel: () => channel as unknown as PresenceChannel,
            selfUserId: 1,
            isKnownPresenceUser: () => true,
            onAction: vi.fn(),
        });

        transport.sendCursor({ userId: 1, x: 42, y: 84 });

        expect(channel.whisper).toHaveBeenCalledWith('cursor', {
            userId: 1,
            x: 42,
            y: 84,
        });
    });

    it('dispatches CLEAR and stops listening on stop', () => {
        const channel = createPresenceChannelMock();
        const onAction = vi.fn<(action: CursorAction) => void>();
        const transport = new CursorTransport({
            getPresenceChannel: () => channel as unknown as PresenceChannel,
            selfUserId: 1,
            isKnownPresenceUser: () => true,
            onAction,
        });

        transport.start();
        transport.stop();

        expect(channel.stopListeningForWhisper).toHaveBeenCalled();
        expect(onAction).toHaveBeenCalledWith({ type: 'CLEAR' });
    });
});
