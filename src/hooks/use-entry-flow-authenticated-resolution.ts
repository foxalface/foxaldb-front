import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAlert } from '@/context/alert-context/alert-context';
import { useChartDB } from '@/hooks/use-chartdb';
import { useConfig } from '@/hooks/use-config';
import { useDiagramAccess } from '@/hooks/use-diagram-access';
import { useFullScreenLoader } from '@/hooks/use-full-screen-spinner';
import { useRedoUndoStack } from '@/hooks/use-redo-undo-stack';
import { getDiagram, getDiagrams } from '@/lib/api/diagrams';
import { normalizeDiagramFromApi } from '@/lib/api/normalize-diagram-from-api';
import type { Diagram } from '@/lib/domain/diagram';
import {
    isDiagramAccessDenied,
    kickOutOfDiagram,
} from '@/lib/realtime/kick-out-of-diagram';
import type { EntryFlowEvent, EntryFlowState } from '@/lib/entry-flow';
import { toRemoteDiagramSummaries } from '@/lib/entry-flow';

interface UseEntryFlowAuthenticatedResolutionOptions {
    state: EntryFlowState;
    isAuthenticated: boolean;
    isAuthLoading: boolean;
    routeDiagramId: string | undefined;
    beginResolution: () => number;
    isResolutionCurrent: (token: number) => boolean;
    dispatchEvent: (event: EntryFlowEvent) => void;
}

const AUTHENTICATED_OPENING_SOURCES = new Set([
    'remote',
    'directRoute',
    'created',
]);

export const useEntryFlowAuthenticatedResolution = ({
    state,
    isAuthenticated,
    isAuthLoading,
    routeDiagramId,
    beginResolution,
    isResolutionCurrent,
    dispatchEvent,
}: UseEntryFlowAuthenticatedResolutionOptions): {
    authenticatedInitialDiagram: Diagram | undefined;
} => {
    const { config, updateConfig } = useConfig();
    const { currentDiagram, loadDiagramFromData } = useChartDB();
    const { diagramAccess, setDiagramAccess, clearDiagramAccess } =
        useDiagramAccess();
    const { resetRedoStack, resetUndoStack } = useRedoUndoStack();
    const { showLoader, hideLoader } = useFullScreenLoader();
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const { t } = useTranslation();

    const [authenticatedInitialDiagram, setAuthenticatedInitialDiagram] =
        useState<Diagram | undefined>();

    const remoteListEpisodeRef = useRef<string | null>(null);
    const openingEpisodeRef = useRef<string | null>(null);

    const loadingRemoteEntrySource =
        state.kind === 'loadingRemoteDiagrams' ? state.entrySource : undefined;

    const openingEpisodeKey =
        state.kind === 'openingDiagram' &&
        AUTHENTICATED_OPENING_SOURCES.has(state.diagramSource)
            ? `${state.diagramId}:${state.diagramSource}`
            : undefined;

    useEffect(() => {
        if (
            state.kind === 'creatingDiagram' ||
            state.kind === 'loadingRemoteDiagrams'
        ) {
            setAuthenticatedInitialDiagram(undefined);
        }
    }, [state.kind]);

    useEffect(() => {
        if (isAuthLoading || !config || !isAuthenticated) {
            return;
        }

        if (loadingRemoteEntrySource === undefined) {
            remoteListEpisodeRef.current = null;
            return;
        }

        const episodeKey = loadingRemoteEntrySource;

        if (remoteListEpisodeRef.current === episodeKey) {
            return;
        }

        remoteListEpisodeRef.current = episodeKey;
        const token = beginResolution();

        void (async () => {
            try {
                clearDiagramAccess();
                const diagrams = await getDiagrams();

                if (!isResolutionCurrent(token)) {
                    return;
                }

                const summaries = toRemoteDiagramSummaries(diagrams);

                if (summaries.length > 0) {
                    dispatchEvent({
                        type: 'REMOTE_DIAGRAMS_FOUND',
                        diagrams: summaries,
                    });
                    return;
                }

                dispatchEvent({ type: 'NO_REMOTE_DIAGRAMS' });
            } catch {
                if (!isResolutionCurrent(token)) {
                    return;
                }

                dispatchEvent({
                    type: 'REMOTE_DIAGRAMS_LOAD_FAILED',
                });
            }
        })();
    }, [
        loadingRemoteEntrySource,
        isAuthenticated,
        isAuthLoading,
        config,
        beginResolution,
        isResolutionCurrent,
        dispatchEvent,
        clearDiagramAccess,
    ]);

    useEffect(() => {
        if (isAuthLoading || !config || !isAuthenticated) {
            return;
        }

        if (state.kind !== 'ready') {
            return;
        }

        if (routeDiagramId === undefined) {
            return;
        }

        if (currentDiagram?.id === routeDiagramId) {
            return;
        }

        dispatchEvent({
            type: 'ROUTE_DIAGRAM_REQUESTED',
            diagramId: routeDiagramId,
        });
    }, [
        state.kind,
        routeDiagramId,
        currentDiagram?.id,
        isAuthenticated,
        isAuthLoading,
        config,
        dispatchEvent,
    ]);

    useEffect(() => {
        if (isAuthLoading || !config || !isAuthenticated) {
            return;
        }

        if (state.kind !== 'ready') {
            return;
        }

        if (routeDiagramId === undefined) {
            return;
        }

        if (currentDiagram?.id !== routeDiagramId) {
            return;
        }

        if (diagramAccess !== null) {
            return;
        }

        const token = beginResolution();

        void (async () => {
            try {
                const diagram = await getDiagram(routeDiagramId);

                if (!isResolutionCurrent(token)) {
                    return;
                }

                setDiagramAccess(diagram.access ?? null);
            } catch (error: unknown) {
                if (!isResolutionCurrent(token)) {
                    return;
                }

                if (isDiagramAccessDenied(error)) {
                    kickOutOfDiagram({
                        title: t('diagram_access.removed.title'),
                        message: t('diagram_access.removed.description'),
                        dedupeKey: `entry-flow:ready:${routeDiagramId}`,
                        clearDiagramAccess,
                        loadDiagramFromData,
                        navigate,
                        showAlert,
                        skipOpenDiagramDialog: true,
                    });
                }
            }
        })();
    }, [
        state.kind,
        routeDiagramId,
        currentDiagram?.id,
        diagramAccess,
        isAuthenticated,
        isAuthLoading,
        config,
        beginResolution,
        isResolutionCurrent,
        setDiagramAccess,
        clearDiagramAccess,
        loadDiagramFromData,
        navigate,
        showAlert,
        t,
    ]);

    useEffect(() => {
        if (isAuthLoading || !config || !isAuthenticated) {
            return;
        }

        if (openingEpisodeKey === undefined) {
            openingEpisodeRef.current = null;
            return;
        }

        if (state.kind !== 'openingDiagram') {
            return;
        }

        if (!AUTHENTICATED_OPENING_SOURCES.has(state.diagramSource)) {
            return;
        }

        if (openingEpisodeRef.current === openingEpisodeKey) {
            return;
        }

        openingEpisodeRef.current = openingEpisodeKey;
        const token = beginResolution();
        const { diagramId, diagramSource } = state;

        const alreadyLoadedDiagram =
            currentDiagram?.id === diagramId ? currentDiagram : undefined;

        void (async () => {
            setAuthenticatedInitialDiagram(undefined);
            showLoader();
            resetRedoStack();
            resetUndoStack();

            try {
                if (alreadyLoadedDiagram && diagramSource !== 'created') {
                    const diagram = await getDiagram(diagramId);

                    if (!isResolutionCurrent(token)) {
                        return;
                    }

                    setDiagramAccess(diagram.access ?? null);
                    setAuthenticatedInitialDiagram(alreadyLoadedDiagram);
                    hideLoader();
                    dispatchEvent({ type: 'DIAGRAM_OPENED' });
                    return;
                }

                const diagram = await getDiagram(diagramId);

                if (!isResolutionCurrent(token)) {
                    return;
                }

                const normalizedDiagram = normalizeDiagramFromApi(
                    diagram,
                    diagramId
                );

                loadDiagramFromData(normalizedDiagram);
                setDiagramAccess(diagram.access ?? null);
                setAuthenticatedInitialDiagram(normalizedDiagram);

                await updateConfig({
                    config: { defaultDiagramId: diagramId },
                });

                if (!isResolutionCurrent(token)) {
                    return;
                }

                if (routeDiagramId !== diagramId) {
                    navigate(`/diagrams/${diagramId}`);
                }

                if (!isResolutionCurrent(token)) {
                    return;
                }

                hideLoader();
                dispatchEvent({ type: 'DIAGRAM_OPENED' });
            } catch (error: unknown) {
                hideLoader();

                if (!isResolutionCurrent(token)) {
                    return;
                }

                if (isDiagramAccessDenied(error)) {
                    kickOutOfDiagram({
                        title: t('diagram_access.removed.title'),
                        message: t('diagram_access.removed.description'),
                        dedupeKey: `entry-flow:${diagramId}`,
                        clearDiagramAccess,
                        loadDiagramFromData,
                        navigate,
                        showAlert,
                        skipOpenDiagramDialog: true,
                    });
                    dispatchEvent({ type: 'ACCESS_DENIED_RECOVERY' });
                    return;
                }

                clearDiagramAccess();
                dispatchEvent({
                    type: 'DIAGRAM_OPEN_FAILED',
                });
            }
        })();
        // currentDiagram is read synchronously for skip-fetch optimization only.
        // eslint-disable-next-line react-hooks/exhaustive-deps -- narrowed opening deps
    }, [
        openingEpisodeKey,
        isAuthenticated,
        isAuthLoading,
        config,
        beginResolution,
        isResolutionCurrent,
        dispatchEvent,
        clearDiagramAccess,
        loadDiagramFromData,
        setDiagramAccess,
        updateConfig,
        navigate,
        showLoader,
        hideLoader,
        resetRedoStack,
        resetUndoStack,
        showAlert,
        t,
        routeDiagramId,
    ]);

    return { authenticatedInitialDiagram };
};
