import { describe, expect, it } from 'vitest';
import {
    deviceDiagramLocation,
    onlineDiagramLocation,
} from '@/lib/diagram/diagram-location';
import { planSessionEnd } from '../plan-session-end';

describe('planSessionEnd', () => {
    it('keeps a device diagram open for explicit logout', () => {
        expect(
            planSessionEnd({
                location: deviceDiagramLocation('local-1'),
                currentDiagramId: 'local-1',
                routeDiagramId: 'local-1',
                reason: 'explicit-logout',
            })
        ).toEqual({
            scope: 'device',
            reason: 'explicit-logout',
            survivingIntent: { type: 'none' },
            clearOnlineEditor: false,
            clearDiagramAccess: false,
            clearDiagramLocation: false,
            navigateHome: false,
            requestAuth: false,
        });
    });

    it('keeps a device diagram open for session expiry without an auth dialog', () => {
        const plan = planSessionEnd({
            location: deviceDiagramLocation('local-1'),
            currentDiagramId: 'local-1',
            routeDiagramId: 'local-1',
            reason: 'session-expired',
        });

        expect(plan.scope).toBe('device');
        expect(plan.navigateHome).toBe(false);
        expect(plan.requestAuth).toBe(false);
        expect(plan.clearOnlineEditor).toBe(false);
        expect(plan.survivingIntent).toEqual({ type: 'none' });
    });

    it('preserves the exact online id and does not auto-open auth on explicit logout', () => {
        const plan = planSessionEnd({
            location: onlineDiagramLocation('42'),
            currentDiagramId: '42',
            routeDiagramId: '99',
            reason: 'explicit-logout',
        });

        expect(plan).toMatchObject({
            scope: 'online',
            clearOnlineEditor: true,
            clearDiagramAccess: true,
            clearDiagramLocation: true,
            navigateHome: true,
            requestAuth: false,
            survivingIntent: { type: 'open-online-diagram', diagramId: '42' },
        });
    });

    it('requests auth for online session expiry and keeps the same id', () => {
        const plan = planSessionEnd({
            location: onlineDiagramLocation('42'),
            currentDiagramId: '42',
            routeDiagramId: '42',
            reason: 'session-expired',
        });

        expect(plan.requestAuth).toBe(true);
        expect(plan.survivingIntent).toEqual({
            type: 'open-online-diagram',
            diagramId: '42',
        });
        expect(plan.navigateHome).toBe(true);
        expect(plan.clearDiagramLocation).toBe(true);
    });

    it('preserves a backend route id when location is not committed yet', () => {
        const plan = planSessionEnd({
            location: null,
            currentDiagramId: '',
            routeDiagramId: '42',
            reason: 'session-expired',
        });

        expect(plan.scope).toBe('unscoped');
        expect(plan.survivingIntent).toEqual({
            type: 'open-online-diagram',
            diagramId: '42',
        });
        expect(plan.clearOnlineEditor).toBe(false);
        expect(plan.navigateHome).toBe(true);
        expect(plan.requestAuth).toBe(true);
    });

    it('clears online memory without a device copy when location is missing', () => {
        const plan = planSessionEnd({
            location: null,
            currentDiagramId: '42',
            routeDiagramId: undefined,
            reason: 'explicit-logout',
        });

        expect(plan.clearOnlineEditor).toBe(true);
        expect(plan.clearDiagramLocation).toBe(false);
        expect(plan.navigateHome).toBe(false);
        expect(plan.requestAuth).toBe(false);
        expect(plan.survivingIntent).toEqual({
            type: 'open-online-diagram',
            diagramId: '42',
        });
    });

    it('clears stale intent when nothing online is open', () => {
        expect(
            planSessionEnd({
                location: null,
                currentDiagramId: 'local-1',
                routeDiagramId: 'local-1',
                reason: 'explicit-logout',
            }).survivingIntent
        ).toEqual({ type: 'none' });
    });
});
