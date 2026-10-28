import type { AuthIntent } from '@/lib/auth-intent/auth-intent-types';
import { noneAuthIntent } from '@/lib/auth-intent/auth-intent-types';
import {
    isDeviceDiagramLocation,
    isOnlineDiagramLocation,
    type DiagramLocation,
} from '@/lib/diagram/diagram-location';
import { isValidBackendDiagramId } from '@/lib/realtime/diagram-id';
import type { SessionEndReason, SessionEndScope } from './session-end-types';

export interface SessionEndPlanInput {
    location: DiagramLocation | null;
    currentDiagramId: string | null | undefined;
    routeDiagramId: string | undefined;
    reason: SessionEndReason;
}

export interface SessionEndPlan {
    scope: SessionEndScope;
    reason: SessionEndReason;
    survivingIntent: AuthIntent;
    clearOnlineEditor: boolean;
    clearDiagramAccess: boolean;
    clearDiagramLocation: boolean;
    navigateHome: boolean;
    requestAuth: boolean;
}

const backendDiagramId = (id: string | null | undefined): string | null => {
    if (id == null || id === '' || !isValidBackendDiagramId(id)) {
        return null;
    }

    return String(id);
};

const openOnlineIntent = (diagramId: string): AuthIntent => ({
    type: 'open-online-diagram',
    diagramId,
});

/**
 * Pure session-end decision. Authentication ending does not choose storage.
 * Device stays put. Online is left in memory only, with a one-shot reopen intent.
 */
export const planSessionEnd = ({
    location,
    currentDiagramId,
    routeDiagramId,
    reason,
}: SessionEndPlanInput): SessionEndPlan => {
    const requestAuth = reason === 'session-expired';

    if (isDeviceDiagramLocation(location)) {
        return {
            scope: 'device',
            reason,
            survivingIntent: noneAuthIntent(),
            clearOnlineEditor: false,
            clearDiagramAccess: false,
            clearDiagramLocation: false,
            navigateHome: false,
            requestAuth: false,
        };
    }

    if (isOnlineDiagramLocation(location)) {
        return {
            scope: 'online',
            reason,
            survivingIntent: openOnlineIntent(location.diagramId),
            clearOnlineEditor: true,
            clearDiagramAccess: true,
            clearDiagramLocation: true,
            navigateHome: true,
            requestAuth,
        };
    }

    const memoryId = backendDiagramId(currentDiagramId);
    const routeId = backendDiagramId(routeDiagramId);
    const reopenId = memoryId ?? routeId;

    return {
        scope: 'unscoped',
        reason,
        survivingIntent:
            reopenId === null ? noneAuthIntent() : openOnlineIntent(reopenId),
        clearOnlineEditor: memoryId !== null,
        clearDiagramAccess: true,
        clearDiagramLocation: false,
        navigateHome: routeId !== null,
        requestAuth,
    };
};
