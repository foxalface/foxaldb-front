import { afterEach, describe, expect, it, vi } from 'vitest';
import type Echo from 'laravel-echo';
import type { PresenceChannel } from 'laravel-echo';
import { ChannelManager } from '../channel-manager';
import { EventDispatcher } from '../event-dispatcher';
import { clearEchoInstance, setEchoInstance } from '../echo';

const createPresenceChannelMock = () => ({
    here: vi.fn().mockReturnThis(),
    joining: vi.fn().mockReturnThis(),
    leaving: vi.fn().mockReturnThis(),
    error: vi.fn().mockReturnThis(),
    whisper: vi.fn(),
    listenForWhisper: vi.fn().mockReturnThis(),
    stopListeningForWhisper: vi.fn().mockReturnThis(),
});

const createPrivateChannelMock = () => ({
    listen: vi.fn().mockReturnThis(),
    stopListening: vi.fn(),
});

const createEchoMock = () => {
    const presenceChannel = createPresenceChannelMock();
    const privateChannels: Array<ReturnType<typeof createPrivateChannelMock>> =
        [];

    return {
        presenceChannel,
        privateChannels,
        echo: {
            private: vi.fn(() => {
                const channel = createPrivateChannelMock();
                privateChannels.push(channel);
                return channel;
            }),
            join: vi.fn(() => presenceChannel as unknown as PresenceChannel),
            leaveChannel: vi.fn(),
        },
    };
};

describe('ChannelManager getDiagramPrivateChannel', () => {
    afterEach(() => {
        clearEchoInstance();
    });

    it('returns null before any diagram private channel has been joined', () => {
        const { echo } = createEchoMock();
        setEchoInstance(echo as unknown as Echo<'reverb'>);

        const manager = new ChannelManager(new EventDispatcher());

        expect(manager.getDiagramPrivateChannel()).toBeNull();
    });

    it('returns the exact managed private channel after diagram join', () => {
        const { echo, privateChannels } = createEchoMock();
        setEchoInstance(echo as unknown as Echo<'reverb'>);

        const manager = new ChannelManager(new EventDispatcher());
        manager.joinUserChannel(1);
        manager.joinDiagram('42');

        // joinUserChannel + joinDiagram each call echo.private once
        expect(privateChannels).toHaveLength(2);
        expect(manager.getDiagramPrivateChannel()).toBe(privateChannels[1]);
    });

    it('returns null after the managed private channel is left', () => {
        const { echo } = createEchoMock();
        setEchoInstance(echo as unknown as Echo<'reverb'>);

        const manager = new ChannelManager(new EventDispatcher());
        manager.joinUserChannel(1);
        manager.joinDiagram('42');
        manager.leaveDiagram();

        expect(manager.getDiagramPrivateChannel()).toBeNull();
    });

    it('returns the replacement instance after rejoin', () => {
        const { echo, privateChannels } = createEchoMock();
        setEchoInstance(echo as unknown as Echo<'reverb'>);

        const manager = new ChannelManager(new EventDispatcher());
        manager.joinUserChannel(1);
        manager.joinDiagram('42');

        const channelBeforeRejoin = manager.getDiagramPrivateChannel();
        expect(channelBeforeRejoin).toBe(privateChannels[1]);

        manager.rejoinAll();

        const channelAfterRejoin = manager.getDiagramPrivateChannel();
        // rejoinAll leaves then rejoins user + diagram private channels
        expect(privateChannels).toHaveLength(4);
        expect(channelAfterRejoin).toBe(privateChannels[3]);
        expect(channelAfterRejoin).not.toBe(channelBeforeRejoin);
    });

    it('does not call echo.private or mutate manager state when read', () => {
        const { echo, privateChannels } = createEchoMock();
        setEchoInstance(echo as unknown as Echo<'reverb'>);

        const manager = new ChannelManager(new EventDispatcher());
        manager.joinUserChannel(1);
        manager.joinDiagram('42');

        const privateCallCount = echo.private.mock.calls.length;
        const channelBefore = manager.getDiagramPrivateChannel();

        expect(manager.getDiagramPrivateChannel()).toBe(channelBefore);
        expect(manager.getDiagramPrivateChannel()).toBe(channelBefore);
        expect(echo.private).toHaveBeenCalledTimes(privateCallCount);
        expect(privateChannels).toHaveLength(2);
        expect(manager.getCurrentDiagramId()).toBe('42');
    });
});
