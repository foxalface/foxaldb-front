import { describe, expect, it } from 'vitest';
import {
    diagramPresenceChannelFull,
    diagramPrivateChannel,
    diagramPrivateChannelFull,
    userPrivateChannel,
    userPrivateChannelFull,
} from '../channels';

describe('realtime channel builders', () => {
    it('builds user private channel names', () => {
        expect(userPrivateChannel(42)).toBe('user.42');
        expect(userPrivateChannelFull('7')).toBe('private-user.7');
    });

    it('builds diagram channel names', () => {
        expect(diagramPrivateChannel(12)).toBe('diagram.12');
        expect(diagramPrivateChannelFull(12)).toBe('private-diagram.12');
        expect(diagramPresenceChannelFull(12)).toBe('presence-diagram.12');
    });
});
