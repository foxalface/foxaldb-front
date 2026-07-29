import { useEffect, useState } from 'react';
import { useChartDB } from '@/hooks/use-chartdb';
import { useConfig } from '@/hooks/use-config';
import { useDiagramAccess } from '@/hooks/use-diagram-access';
import { useStorage } from '@/hooks/use-storage';
import { findGuestLocalDiagramId } from '@/lib/diagram/find-guest-local-diagram-id';
import type { Diagram } from '@/lib/domain/diagram';
import type { EntryFlowEvent, EntryFlowState } from '@/lib/entry-flow';

interface UseEntryFlowGuestResolutionOptions {
    state: EntryFlowState;
    isAuthenticated: boolean;
    isAuthLoading: boolean;
    beginResolution: () => number;
    isResolutionCurrent: (token: number) => boolean;
    dispatchEvent: (event: EntryFlowEvent) => void;
}

export const useEntryFlowGuestResolution = ({
    state,
    isAuthenticated,
    isAuthLoading,
    beginResolution,
    isResolutionCurrent,
    dispatchEvent,
}: UseEntryFlowGuestResolutionOptions): {
    guestInitialDiagram: Diagram | undefined;
} => {
    const { config } = useConfig();
    const { listDiagrams } = useStorage();
    const { currentDiagram, loadDiagram } = useChartDB();
    const { clearDiagramAccess } = useDiagramAccess();
    const [guestInitialDiagram, setGuestInitialDiagram] = useState<
        Diagram | undefined
    >();

    useEffect(() => {
        if (state.kind === 'creatingDiagram') {
            setGuestInitialDiagram(undefined);
        }
    }, [state.kind]);

    useEffect(() => {
        if (isAuthLoading || !config || isAuthenticated) {
            return;
        }

        if (state.kind !== 'checkingLocalDiagram') {
            return;
        }

        const token = beginResolution();
        clearDiagramAccess();

        void (async () => {
            try {
                const diagramId = await findGuestLocalDiagramId(listDiagrams);

                if (!isResolutionCurrent(token)) {
                    return;
                }

                if (diagramId !== null) {
                    dispatchEvent({
                        type: 'LOCAL_DIAGRAM_FOUND',
                        diagramId,
                    });
                    return;
                }

                dispatchEvent({ type: 'LOCAL_DIAGRAM_NOT_FOUND' });
            } catch {
                if (!isResolutionCurrent(token)) {
                    return;
                }

                dispatchEvent({ type: 'LOCAL_DIAGRAM_CHECK_FAILED' });
            }
        })();
    }, [
        state.kind,
        isAuthenticated,
        isAuthLoading,
        config,
        beginResolution,
        isResolutionCurrent,
        dispatchEvent,
        listDiagrams,
        clearDiagramAccess,
    ]);

    const openingDiagramId =
        state.kind === 'openingDiagram' ? state.diagramId : undefined;
    const openingDiagramSource =
        state.kind === 'openingDiagram' ? state.diagramSource : undefined;
    const openingEntrySource =
        state.kind === 'openingDiagram' ? state.entrySource : undefined;

    useEffect(() => {
        if (isAuthLoading || !config || isAuthenticated) {
            return;
        }

        if (state.kind !== 'openingDiagram') {
            return;
        }

        if (state.entrySource !== 'guestContinuation') {
            return;
        }

        if (
            state.diagramSource !== 'local' &&
            state.diagramSource !== 'created'
        ) {
            return;
        }

        const token = beginResolution();
        const { diagramId, diagramSource } = state;
        const alreadyLoadedDiagram =
            diagramSource === 'created' && currentDiagram?.id === diagramId
                ? currentDiagram
                : undefined;

        void (async () => {
            try {
                clearDiagramAccess();

                if (alreadyLoadedDiagram) {
                    if (!isResolutionCurrent(token)) {
                        return;
                    }

                    setGuestInitialDiagram(alreadyLoadedDiagram);
                    dispatchEvent({ type: 'DIAGRAM_OPENED' });
                    return;
                }

                const diagram = await loadDiagram(diagramId);

                if (!isResolutionCurrent(token)) {
                    return;
                }

                if (diagram) {
                    setGuestInitialDiagram(diagram);
                    dispatchEvent({ type: 'DIAGRAM_OPENED' });
                    return;
                }

                dispatchEvent({ type: 'DIAGRAM_OPEN_FAILED' });
            } catch {
                if (!isResolutionCurrent(token)) {
                    return;
                }

                dispatchEvent({ type: 'DIAGRAM_OPEN_FAILED' });
            }
        })();
        // currentDiagram is read synchronously for the created path only; omitting
        // it from deps avoids re-opening when loadDiagramFromData updates chartdb.
        // eslint-disable-next-line react-hooks/exhaustive-deps -- narrowed opening deps
    }, [
        state.kind,
        openingDiagramId,
        openingDiagramSource,
        openingEntrySource,
        isAuthenticated,
        isAuthLoading,
        config,
        beginResolution,
        isResolutionCurrent,
        dispatchEvent,
        clearDiagramAccess,
        loadDiagram,
    ]);

    return { guestInitialDiagram };
};
