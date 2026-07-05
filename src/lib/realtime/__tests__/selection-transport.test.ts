import { describe, expect, it, vi } from 'vitest';
import type { PresenceChannel } from 'laravel-echo';
import { SelectionTransport } from '../selection-transport';
import type { SelectionAction } from '../selection-reducer';

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

describe('SelectionTransport', () => {
    it('dispatches UPDATE for valid remote selection whispers', () => {
        const channel = createPresenceChannelMock();
        const onAction = vi.fn<(action: SelectionAction) => void>();
        const transport = new SelectionTransport({
            getPresenceChannel: () => channel as unknown as PresenceChannel,
            selfUserId: 1,
            isKnownPresenceUser: (userId) => userId === 2,
            onAction,
            now: () => 5_000,
        });

        transport.start();
        channel.emitWhisper('selection', {
            userId: 2,
            selections: [{ entityType: 'table', entityId: 'table-1' }],
        });

        expect(onAction).toHaveBeenCalledWith({
            type: 'UPDATE',
            userId: 2,
            selections: [{ entityType: 'table', entityId: 'table-1' }],
            receivedAt: 5_000,
        });
    });

    it('dispatches UPDATE with empty selections for cleared selection', () => {
        const channel = createPresenceChannelMock();
        const onAction = vi.fn<(action: SelectionAction) => void>();
        const transport = new SelectionTransport({
            getPresenceChannel: () => channel as unknown as PresenceChannel,
            selfUserId: 1,
            isKnownPresenceUser: () => true,
            onAction,
        });

        transport.start();
        channel.emitWhisper('selection', { userId: 2, selections: [] });

        expect(onAction).toHaveBeenCalledWith({
            type: 'UPDATE',
            userId: 2,
            selections: [],
            receivedAt: expect.any(Number),
        });
    });

    it('ignores malformed selection whispers', () => {
        const channel = createPresenceChannelMock();
        const onAction = vi.fn<(action: SelectionAction) => void>();
        const transport = new SelectionTransport({
            getPresenceChannel: () => channel as unknown as PresenceChannel,
            selfUserId: 1,
            isKnownPresenceUser: () => true,
            onAction,
        });

        transport.start();
        channel.emitWhisper('selection', {
            userId: 2,
            selections: [{ entityType: 'table', entityId: 123 }],
        });

        expect(onAction).not.toHaveBeenCalled();
    });

    it('ignores self selection whispers', () => {
        const channel = createPresenceChannelMock();
        const onAction = vi.fn<(action: SelectionAction) => void>();
        const transport = new SelectionTransport({
            getPresenceChannel: () => channel as unknown as PresenceChannel,
            selfUserId: 1,
            isKnownPresenceUser: () => true,
            onAction,
        });

        transport.start();
        channel.emitWhisper('selection', {
            userId: 1,
            selections: [{ entityType: 'table', entityId: 'table-1' }],
        });

        expect(onAction).not.toHaveBeenCalled();
    });

    it('ignores whispers from users not in the presence map', () => {
        const channel = createPresenceChannelMock();
        const onAction = vi.fn<(action: SelectionAction) => void>();
        const transport = new SelectionTransport({
            getPresenceChannel: () => channel as unknown as PresenceChannel,
            selfUserId: 1,
            isKnownPresenceUser: (userId) => userId === 2,
            onAction,
        });

        transport.start();
        channel.emitWhisper('selection', {
            userId: 99,
            selections: [{ entityType: 'table', entityId: 'table-1' }],
        });

        expect(onAction).not.toHaveBeenCalled();
    });

    it('sends selection payloads through the presence channel', () => {
        const channel = createPresenceChannelMock();
        const transport = new SelectionTransport({
            getPresenceChannel: () => channel as unknown as PresenceChannel,
            selfUserId: 1,
            isKnownPresenceUser: () => true,
            onAction: vi.fn(),
        });

        transport.sendSelection({
            userId: 1,
            selections: [{ entityType: 'table', entityId: 'table-1' }],
        });

        expect(channel.whisper).toHaveBeenCalledWith('selection', {
            userId: 1,
            selections: [{ entityType: 'table', entityId: 'table-1' }],
        });
    });

    it('dispatches CLEAR and stops listening on stop', () => {
        const channel = createPresenceChannelMock();
        const onAction = vi.fn<(action: SelectionAction) => void>();
        const transport = new SelectionTransport({
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
