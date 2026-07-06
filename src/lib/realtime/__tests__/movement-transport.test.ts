import { describe, expect, it, vi } from 'vitest';
import type { PresenceChannel } from 'laravel-echo';
import { MovementTransport } from '../movement-transport';
import type { MovementAction } from '../movement-reducer';

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

describe('MovementTransport', () => {
    it('dispatches UPDATE for valid remote movement whispers', () => {
        const channel = createPresenceChannelMock();
        const onAction = vi.fn<(action: MovementAction) => void>();
        const transport = new MovementTransport({
            getPresenceChannel: () => channel as unknown as PresenceChannel,
            selfUserId: 1,
            isKnownPresenceUser: (userId) => userId === 2,
            onAction,
            now: () => 5_000,
        });

        transport.start();
        channel.emitWhisper('table-movement', {
            userId: 2,
            phase: 'move',
            tables: [{ id: 'table-1', x: 100, y: 200 }],
        });

        expect(onAction).toHaveBeenCalledWith({
            type: 'UPDATE',
            userId: 2,
            phase: 'move',
            tables: [{ id: 'table-1', x: 100, y: 200 }],
            receivedAt: 5_000,
        });
    });

    it('dispatches UPDATE for end phase movement', () => {
        const channel = createPresenceChannelMock();
        const onAction = vi.fn<(action: MovementAction) => void>();
        const transport = new MovementTransport({
            getPresenceChannel: () => channel as unknown as PresenceChannel,
            selfUserId: 1,
            isKnownPresenceUser: () => true,
            onAction,
            now: () => 3_000,
        });

        transport.start();
        channel.emitWhisper('table-movement', {
            userId: 2,
            phase: 'end',
            tables: [{ id: 'table-1', x: 50, y: 60 }],
        });

        expect(onAction).toHaveBeenCalledWith({
            type: 'UPDATE',
            userId: 2,
            phase: 'end',
            tables: [{ id: 'table-1', x: 50, y: 60 }],
            receivedAt: 3_000,
        });
    });

    it('ignores malformed movement whispers', () => {
        const channel = createPresenceChannelMock();
        const onAction = vi.fn<(action: MovementAction) => void>();
        const transport = new MovementTransport({
            getPresenceChannel: () => channel as unknown as PresenceChannel,
            selfUserId: 1,
            isKnownPresenceUser: () => true,
            onAction,
        });

        transport.start();
        channel.emitWhisper('table-movement', {
            userId: 2,
            phase: 'move',
            tables: [{ id: 'table-1', x: 'bad', y: 10 }],
        });

        expect(onAction).not.toHaveBeenCalled();
    });

    it('ignores self movement whispers', () => {
        const channel = createPresenceChannelMock();
        const onAction = vi.fn<(action: MovementAction) => void>();
        const transport = new MovementTransport({
            getPresenceChannel: () => channel as unknown as PresenceChannel,
            selfUserId: 1,
            isKnownPresenceUser: () => true,
            onAction,
        });

        transport.start();
        channel.emitWhisper('table-movement', {
            userId: 1,
            phase: 'move',
            tables: [{ id: 'table-1', x: 10, y: 20 }],
        });

        expect(onAction).not.toHaveBeenCalled();
    });

    it('ignores whispers from users not in the presence map', () => {
        const channel = createPresenceChannelMock();
        const onAction = vi.fn<(action: MovementAction) => void>();
        const transport = new MovementTransport({
            getPresenceChannel: () => channel as unknown as PresenceChannel,
            selfUserId: 1,
            isKnownPresenceUser: (userId) => userId === 2,
            onAction,
        });

        transport.start();
        channel.emitWhisper('table-movement', {
            userId: 99,
            phase: 'move',
            tables: [{ id: 'table-1', x: 10, y: 20 }],
        });

        expect(onAction).not.toHaveBeenCalled();
    });

    it('sends movement payloads through the presence channel', () => {
        const channel = createPresenceChannelMock();
        const transport = new MovementTransport({
            getPresenceChannel: () => channel as unknown as PresenceChannel,
            selfUserId: 1,
            isKnownPresenceUser: () => true,
            onAction: vi.fn(),
        });

        transport.sendMovement({
            userId: 1,
            phase: 'move',
            tables: [{ id: 'table-1', x: 42, y: 84 }],
        });

        expect(channel.whisper).toHaveBeenCalledWith('table-movement', {
            userId: 1,
            phase: 'move',
            tables: [{ id: 'table-1', x: 42, y: 84 }],
        });
    });

    it('dispatches CLEAR and stops listening on stop', () => {
        const channel = createPresenceChannelMock();
        const onAction = vi.fn<(action: MovementAction) => void>();
        const transport = new MovementTransport({
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
