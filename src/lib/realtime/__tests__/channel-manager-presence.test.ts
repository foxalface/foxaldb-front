import { afterEach, describe, expect, it, vi } from 'vitest';
import type Echo from 'laravel-echo';
import type { PresenceChannel } from 'laravel-echo';
import { ChannelManager } from '../channel-manager';
import { EventDispatcher } from '../event-dispatcher';
import { clearEchoInstance, setEchoInstance } from '../echo';
import { createDiagramPresenceUser } from '../diagram-presence';

const createPresenceChannelMock = () => {
    const callbacks: {
        here?: (members: unknown[]) => void;
        joining?: (member: unknown) => void;
        leaving?: (member: unknown) => void;
        error?: (error: unknown) => void;
    } = {};

    const channel = {
        here: vi.fn((callback: (members: unknown[]) => void) => {
            callbacks.here = callback;
            return channel;
        }),
        joining: vi.fn((callback: (member: unknown) => void) => {
            callbacks.joining = callback;
            return channel;
        }),
        leaving: vi.fn((callback: (member: unknown) => void) => {
            callbacks.leaving = callback;
            return channel;
        }),
        error: vi.fn((callback: (error: unknown) => void) => {
            callbacks.error = callback;
            return channel;
        }),
        whisper: vi.fn(),
        listenForWhisper: vi.fn().mockReturnThis(),
        stopListeningForWhisper: vi.fn().mockReturnThis(),
    };

    return {
        callbacks,
        channel: channel as unknown as PresenceChannel,
    };
};

const createEchoMock = () => {
    const presence = createPresenceChannelMock();

    return {
        presence,
        echo: {
            private: vi.fn(() => ({
                listen: vi.fn().mockReturnThis(),
                stopListening: vi.fn(),
            })),
            join: vi.fn(() => presence.channel),
            leaveChannel: vi.fn(),
        },
    };
};

describe('ChannelManager presence lifecycle', () => {
    afterEach(() => {
        clearEchoInstance();
    });

    it('dispatches HERE when the presence subscription succeeds', () => {
        const { echo, presence } = createEchoMock();
        setEchoInstance(echo as unknown as Echo<'reverb'>);

        const onHere = vi.fn();
        const manager = new ChannelManager(new EventDispatcher());
        manager.setPresenceHandlers({
            onHere,
            onJoining: vi.fn(),
            onLeaving: vi.fn(),
            onError: vi.fn(),
        });
        manager.joinUserChannel(1);
        manager.joinDiagram('42');

        expect(presence.channel.here).toHaveBeenCalled();
        expect(presence.channel.joining).toHaveBeenCalled();

        presence.callbacks.here?.([
            { id: 1, first_name: 'Alice', last_name: 'Anderson' },
            { id: 2, first_name: 'Bob', last_name: 'Smith' },
        ]);

        expect(onHere).toHaveBeenCalledWith([
            createDiagramPresenceUser(1, 'Alice', 'Anderson'),
            createDiagramPresenceUser(2, 'Bob', 'Smith'),
        ]);
    });

    it('dispatches JOINING and LEAVING for remote members', () => {
        const { echo, presence } = createEchoMock();
        setEchoInstance(echo as unknown as Echo<'reverb'>);

        const onJoining = vi.fn();
        const onLeaving = vi.fn();
        const manager = new ChannelManager(new EventDispatcher());
        manager.setPresenceHandlers({
            onHere: vi.fn(),
            onJoining,
            onLeaving,
            onError: vi.fn(),
        });
        manager.joinUserChannel(1);
        manager.joinDiagram('42');

        presence.callbacks.joining?.({
            id: 2,
            first_name: 'Bob',
            last_name: 'Smith',
        });
        presence.callbacks.leaving?.({
            id: 2,
            first_name: 'Bob',
            last_name: 'Smith',
        });

        expect(onJoining).toHaveBeenCalledWith(
            createDiagramPresenceUser(2, 'Bob', 'Smith')
        );
        expect(onLeaving).toHaveBeenCalledWith(
            createDiagramPresenceUser(2, 'Bob', 'Smith')
        );
    });

    it('leaves the previous diagram channel before joining another', () => {
        const { echo } = createEchoMock();
        setEchoInstance(echo as unknown as Echo<'reverb'>);

        const manager = new ChannelManager(new EventDispatcher());
        manager.setPresenceHandlers({
            onHere: vi.fn(),
            onJoining: vi.fn(),
            onLeaving: vi.fn(),
            onError: vi.fn(),
        });
        manager.joinUserChannel(1);
        manager.joinDiagram('42');
        manager.joinDiagram('84');

        expect(echo.leaveChannel).toHaveBeenCalledWith('private-diagram.42');
        expect(echo.leaveChannel).toHaveBeenCalledWith('presence-diagram.42');
        expect(manager.getCurrentDiagramId()).toBe('84');
    });

    it('can rejoin when the previous join failed after setting the diagram id', () => {
        const { echo, presence } = createEchoMock();
        setEchoInstance(echo as unknown as Echo<'reverb'>);

        const manager = new ChannelManager(new EventDispatcher());
        manager.setPresenceHandlers({
            onHere: vi.fn(),
            onJoining: vi.fn(),
            onLeaving: vi.fn(),
            onError: vi.fn(),
        });
        manager.joinUserChannel(1);

        (
            manager as unknown as { currentDiagramId: string | null }
        ).currentDiagramId = '42';

        manager.joinDiagram('42');

        expect(echo.join).toHaveBeenCalled();
        expect(presence.channel.here).toHaveBeenCalled();
    });

    it('does not duplicate avatars when joinDiagram is called twice', () => {
        const { echo } = createEchoMock();
        setEchoInstance(echo as unknown as Echo<'reverb'>);

        const manager = new ChannelManager(new EventDispatcher());
        manager.setPresenceHandlers({
            onHere: vi.fn(),
            onJoining: vi.fn(),
            onLeaving: vi.fn(),
            onError: vi.fn(),
        });
        manager.joinUserChannel(1);
        manager.joinDiagram('42');
        manager.joinDiagram('42');

        expect(echo.join).toHaveBeenCalledTimes(1);
    });
});
