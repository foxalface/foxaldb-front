import { describe, expect, it, vi } from 'vitest';
import type { PresenceChannel } from 'laravel-echo';
import { EditingTransport } from '../editing-transport';
import type { EditingAction } from '../editing-reducer';

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

describe('EditingTransport', () => {
    it('dispatches UPDATE for valid remote editing whispers', () => {
        const channel = createPresenceChannelMock();
        const onAction = vi.fn<(action: EditingAction) => void>();
        const transport = new EditingTransport({
            getPresenceChannel: () => channel as unknown as PresenceChannel,
            selfUserId: 1,
            isKnownPresenceUser: (userId) => userId === 2,
            onAction,
            now: () => 5_000,
        });

        transport.start();
        channel.emitWhisper('editing', {
            userId: 2,
            edits: [{ entityType: 'field', entityId: 'field-1' }],
        });

        expect(onAction).toHaveBeenCalledWith({
            type: 'UPDATE',
            userId: 2,
            edits: [{ entityType: 'field', entityId: 'field-1' }],
            receivedAt: 5_000,
        });
    });

    it('dispatches UPDATE with empty edits for cleared editing', () => {
        const channel = createPresenceChannelMock();
        const onAction = vi.fn<(action: EditingAction) => void>();
        const transport = new EditingTransport({
            getPresenceChannel: () => channel as unknown as PresenceChannel,
            selfUserId: 1,
            isKnownPresenceUser: () => true,
            onAction,
        });

        transport.start();
        channel.emitWhisper('editing', { userId: 2, edits: [] });

        expect(onAction).toHaveBeenCalledWith({
            type: 'UPDATE',
            userId: 2,
            edits: [],
            receivedAt: expect.any(Number),
        });
    });

    it('ignores malformed editing whispers', () => {
        const channel = createPresenceChannelMock();
        const onAction = vi.fn<(action: EditingAction) => void>();
        const transport = new EditingTransport({
            getPresenceChannel: () => channel as unknown as PresenceChannel,
            selfUserId: 1,
            isKnownPresenceUser: () => true,
            onAction,
        });

        transport.start();
        channel.emitWhisper('editing', {
            userId: 2,
            edits: [{ entityType: 'field', entityId: 123 }],
        });

        expect(onAction).not.toHaveBeenCalled();
    });

    it('ignores self editing whispers', () => {
        const channel = createPresenceChannelMock();
        const onAction = vi.fn<(action: EditingAction) => void>();
        const transport = new EditingTransport({
            getPresenceChannel: () => channel as unknown as PresenceChannel,
            selfUserId: 1,
            isKnownPresenceUser: () => true,
            onAction,
        });

        transport.start();
        channel.emitWhisper('editing', {
            userId: 1,
            edits: [{ entityType: 'field', entityId: 'field-1' }],
        });

        expect(onAction).not.toHaveBeenCalled();
    });

    it('ignores whispers from users not in the presence map', () => {
        const channel = createPresenceChannelMock();
        const onAction = vi.fn<(action: EditingAction) => void>();
        const transport = new EditingTransport({
            getPresenceChannel: () => channel as unknown as PresenceChannel,
            selfUserId: 1,
            isKnownPresenceUser: (userId) => userId === 2,
            onAction,
        });

        transport.start();
        channel.emitWhisper('editing', {
            userId: 99,
            edits: [{ entityType: 'field', entityId: 'field-1' }],
        });

        expect(onAction).not.toHaveBeenCalled();
    });

    it('sends editing payloads through the presence channel', () => {
        const channel = createPresenceChannelMock();
        const transport = new EditingTransport({
            getPresenceChannel: () => channel as unknown as PresenceChannel,
            selfUserId: 1,
            isKnownPresenceUser: () => true,
            onAction: vi.fn(),
        });

        transport.sendEditing({
            userId: 1,
            edits: [{ entityType: 'field', entityId: 'field-1' }],
        });

        expect(channel.whisper).toHaveBeenCalledWith('editing', {
            userId: 1,
            edits: [{ entityType: 'field', entityId: 'field-1' }],
        });
    });

    it('dispatches CLEAR and stops listening on stop', () => {
        const channel = createPresenceChannelMock();
        const onAction = vi.fn<(action: EditingAction) => void>();
        const transport = new EditingTransport({
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
