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

describe('ChannelManager movement transport', () => {
    afterEach(() => {
        clearEchoInstance();
    });

    it('sends movement payloads through the diagram presence channel', () => {
        const presenceChannel = createPresenceChannelMock();
        const echo = createEchoMock(presenceChannel);

        setEchoInstance(echo as unknown as Echo<'reverb'>);

        const manager = new ChannelManager(new EventDispatcher());
        manager.joinUserChannel(1);
        manager.joinDiagram('42');
        manager.sendMovement({
            userId: 1,
            phase: 'move',
            tables: [{ id: 'table-1', x: 100, y: 200 }],
        });

        expect(echo.join).toHaveBeenCalledTimes(1);
        expect(presenceChannel.whisper).toHaveBeenCalledWith('table-movement', {
            userId: 1,
            phase: 'move',
            tables: [{ id: 'table-1', x: 100, y: 200 }],
        });
    });
});
