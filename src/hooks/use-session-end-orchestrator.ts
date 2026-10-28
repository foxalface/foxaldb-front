import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthIntent } from '@/hooks/use-auth-intent';
import { useChartDB } from '@/hooks/use-chartdb';
import { useDiagramAccess } from '@/hooks/use-diagram-access';
import { useDiagramLocation } from '@/hooks/use-diagram-location';
import { useDialog } from '@/hooks/use-dialog';
import { useFullScreenLoader } from '@/hooks/use-full-screen-spinner';
import { abandonDiagramAutosave } from '@/lib/diagram-autosave/diagram-autosave-controller';
import { planSessionEnd } from '@/lib/session-end/plan-session-end';
import { registerSessionEndingHandler } from '@/lib/session-end/session-end-bus';
import type { SessionEndReason } from '@/lib/session-end/session-end-types';
import { clearPendingDiagramOperationSyncTimers } from '@/lib/realtime/diagram-sync-state';
import { createBlankDiagramView } from '@/lib/realtime/kick-out-of-diagram';

export interface SessionEndOrchestratorActions {
    onDeviceSessionEnded: () => void;
    onOnlineSessionEnded: () => void;
    onUnscopedSessionEnded: () => void;
}

/**
 * Single diagram and navigation owner for explicit logout and session expiry.
 *
 * AuthProvider owns the user session. It calls beginSessionEnd synchronously
 * before the user becomes null. This hook then branches on DiagramLocation:
 * a device diagram stays open, an online diagram is cleared from memory and
 * left behind. It does not write Dexie or create a backend diagram.
 */
export const useSessionEndOrchestrator = (
    actions: SessionEndOrchestratorActions
): void => {
    const { location, setDiagramLocation } = useDiagramLocation();
    const { currentDiagram, loadDiagramFromData } = useChartDB();
    const { clearDiagramAccess } = useDiagramAccess();
    const { applySessionEndIntent } = useAuthIntent();
    const { openAuthDialog } = useDialog();
    const { hideLoader } = useFullScreenLoader();
    const navigate = useNavigate();
    const { diagramId: routeDiagramId } = useParams<{ diagramId?: string }>();

    const latestRef = useRef({
        location,
        currentDiagramId: currentDiagram?.id,
        routeDiagramId,
        setDiagramLocation,
        loadDiagramFromData,
        clearDiagramAccess,
        applySessionEndIntent,
        openAuthDialog,
        hideLoader,
        navigate,
        actions,
    });

    latestRef.current = {
        location,
        currentDiagramId: currentDiagram?.id,
        routeDiagramId,
        setDiagramLocation,
        loadDiagramFromData,
        clearDiagramAccess,
        applySessionEndIntent,
        openAuthDialog,
        hideLoader,
        navigate,
        actions,
    };

    useEffect(() => {
        return registerSessionEndingHandler((reason: SessionEndReason) => {
            const latest = latestRef.current;
            const plan = planSessionEnd({
                location: latest.location,
                currentDiagramId: latest.currentDiagramId,
                routeDiagramId: latest.routeDiagramId,
                reason,
            });

            // Replace stale intent before auth flips, so the provider's
            // logout effect cannot clear this one-shot reopen intent.
            latest.applySessionEndIntent(plan.survivingIntent);

            if (plan.clearOnlineEditor) {
                abandonDiagramAutosave();
                clearPendingDiagramOperationSyncTimers();
                latest.loadDiagramFromData(createBlankDiagramView());
            }

            if (plan.clearDiagramAccess) {
                latest.clearDiagramAccess();
            }

            if (plan.clearDiagramLocation) {
                latest.setDiagramLocation(null);
            }

            if (plan.navigateHome) {
                latest.navigate('/');
            }

            if (plan.scope === 'device') {
                latest.actions.onDeviceSessionEnded();
            } else if (plan.scope === 'online') {
                latest.actions.onOnlineSessionEnded();
            } else {
                latest.actions.onUnscopedSessionEnded();
            }

            latest.hideLoader();

            if (plan.requestAuth) {
                latest.openAuthDialog();
            }
        });
    }, []);
};
