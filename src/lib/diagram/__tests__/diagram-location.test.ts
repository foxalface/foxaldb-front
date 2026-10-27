import { describe, expect, it } from 'vitest';
import {
    deviceDiagramLocation,
    isDeviceDiagramLocation,
    isLegacyNumericDexieShadowId,
    isOnlineDiagramLocation,
    onlineDiagramLocation,
    readOnlineDiagramId,
} from '@/lib/diagram/diagram-location';

describe('DiagramLocation', () => {
    it('keeps device and online identities distinct', () => {
        const device = deviceDiagramLocation('workspaceabcd');
        const online = onlineDiagramLocation('42');

        expect(isDeviceDiagramLocation(device)).toBe(true);
        expect(isOnlineDiagramLocation(device)).toBe(false);
        expect(isOnlineDiagramLocation(online)).toBe(true);
        expect(isDeviceDiagramLocation(online)).toBe(false);
    });

    it('does not treat auth or a numeric id as an online channel by themselves', () => {
        expect(readOnlineDiagramId(null, '42')).toBeNull();
        expect(
            readOnlineDiagramId(deviceDiagramLocation('42'), '42')
        ).toBeNull();
        expect(
            readOnlineDiagramId(onlineDiagramLocation('42'), 'other')
        ).toBeNull();
        expect(readOnlineDiagramId(onlineDiagramLocation('42'), '42')).toBe(
            '42'
        );
    });

    it('identifies legacy numeric Dexie shadows without deleting them', () => {
        expect(isLegacyNumericDexieShadowId('42')).toBe(true);
        expect(isLegacyNumericDexieShadowId('workspaceabcd')).toBe(false);
    });
});
