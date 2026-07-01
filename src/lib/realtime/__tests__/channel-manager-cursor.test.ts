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
});

const createEchoMock = (
    presenceChannel: ReturnType<typeof createPresenceChannelMock>
) => {
    const privateChannel = {
        listen: vi.fn().mockReturnThis(),
        stopListening: vi.fn(),
    };

    return {
        private: vi.fn(() => privateChannel),
        join: vi.fn(() => presenceChannel as unknown as PresenceChannel),
        leaveChannel: vi.fn(),
    };
};

describe('ChannelManager cursor transport', () => {
    afterEach(() => {
        clearEchoInstance();
    });

    it('sends cursor payloads through the diagram presence channel', () => {
        const presenceChannel = createPresenceChannelMock();
        const echo = createEchoMock(presenceChannel);

        setEchoInstance(echo as unknown as Echo<'reverb'>);

        const manager = new ChannelManager(new EventDispatcher());
        manager.joinUserChannel(1);
        manager.joinDiagram('42');
        manager.sendCursor({ userId: 1, x: 10, y: 20 });

        expect(echo.join).toHaveBeenCalledTimes(1);
        expect(presenceChannel.whisper).toHaveBeenCalledWith('cursor', {
            userId: 1,
            x: 10,
            y: 20,
        });
    });
});
