import { useAuth } from '@/hooks/use-auth';
import { useAlert } from '@/context/alert-context/alert-context';
import { useDiagramAccess } from '@/hooks/use-diagram-access';
import { useChartDB } from '@/hooks/use-chartdb';
import { useConfig } from '@/hooks/use-config';
import { useStorage } from '@/hooks/use-storage';
import { useDialog } from '@/hooks/use-dialog';
import { useFullScreenLoader } from '@/hooks/use-full-screen-spinner';
import { useRedoUndoStack } from '@/hooks/use-redo-undo-stack';
import { getDiagram, getDiagrams } from '@/lib/api/diagrams';
import { normalizeDiagramFromApi } from '@/lib/api/normalize-diagram-from-api';
import {
    isDiagramAccessDenied,
    kickOutOfDiagram,
} from '@/lib/realtime/kick-out-of-diagram';
import type { Diagram } from '@/lib/domain/diagram';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

export const useDiagramLoader = () => {
    const [initialDiagram, setInitialDiagram] = useState<Diagram | undefined>();
    const { diagramId } = useParams<{ diagramId: string }>();
    const { config } = useConfig();
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const { setDiagramAccess, clearDiagramAccess } = useDiagramAccess();
    const { listDiagrams } = useStorage();
    const { currentDiagram, loadDiagram, loadDiagramFromData } = useChartDB();
    const { resetRedoStack, resetUndoStack } = useRedoUndoStack();
    const { showLoader, hideLoader } = useFullScreenLoader();
    const {
        openCreateDiagramDialog,
        openOpenDiagramDialog,
        closeOpenDiagramDialog,
    } = useDialog();
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const { t } = useTranslation();

    const currentDiagramLoadingRef = useRef<string | undefined>(undefined);

    useEffect(() => {
        if (!config || isAuthLoading) {
            return;
        }

        if (!isAuthenticated) {
            if (currentDiagramLoadingRef.current === 'guest') {
                return;
            }

            currentDiagramLoadingRef.current = 'guest';
            clearDiagramAccess();

            void (async () => {
                try {
                    const diagrams = await listDiagrams();

                    if (diagrams.length > 0) {
                        const loaded = await loadDiagram(diagrams[0].id);
                        if (loaded) {
                            setInitialDiagram(loaded);
                        } else {
                            setInitialDiagram(undefined);
                            openCreateDiagramDialog();
                        }
                    } else {
                        setInitialDiagram(undefined);
                        openCreateDiagramDialog();
                    }
                } catch {
                    setInitialDiagram(undefined);
                    openCreateDiagramDialog();
                }
            })();

            return;
        }

        if (currentDiagram?.id === diagramId) {
            return;
        }

        const loadDefaultDiagram = async () => {
            if (diagramId) {
                setInitialDiagram(undefined);
                showLoader();
                resetRedoStack();
                resetUndoStack();

                try {
                    const diagram = await getDiagram(diagramId);

                    const normalizedDiagram = normalizeDiagramFromApi(
                        diagram,
                        diagramId
                    );

                    loadDiagramFromData(normalizedDiagram);
                    setInitialDiagram(normalizedDiagram);
                    setDiagramAccess(diagram.access ?? null);
                    closeOpenDiagramDialog();
                    hideLoader();
                } catch (error: unknown) {
                    hideLoader();

                    if (isDiagramAccessDenied(error)) {
                        currentDiagramLoadingRef.current = undefined;
                        setInitialDiagram(undefined);
                        kickOutOfDiagram({
                            title: t('diagram_access.removed.title'),
                            message: t('diagram_access.removed.description'),
                            dedupeKey: `loader:${diagramId}`,
                            clearDiagramAccess,
                            loadDiagramFromData,
                            navigate,
                            showAlert,
                            openOpenDiagramDialog,
                        });
                        return;
                    }

                    clearDiagramAccess();
                    openOpenDiagramDialog({ canClose: false });
                }

                return;
            }

            clearDiagramAccess();
            const diagrams = await getDiagrams();

            if (diagrams.length > 0) {
                openOpenDiagramDialog({ canClose: false });
            } else {
                openCreateDiagramDialog();
            }
        };

        if (
            currentDiagramLoadingRef.current === (diagramId ?? '') &&
            currentDiagramLoadingRef.current !== undefined
        ) {
            return;
        }

        currentDiagramLoadingRef.current = diagramId ?? '';

        loadDefaultDiagram();
    }, [
        diagramId,
        openCreateDiagramDialog,
        openOpenDiagramDialog,
        closeOpenDiagramDialog,
        config,
        isAuthenticated,
        isAuthLoading,
        resetRedoStack,
        resetUndoStack,
        hideLoader,
        showLoader,
        currentDiagram?.id,
        loadDiagram,
        loadDiagramFromData,
        listDiagrams,
        setDiagramAccess,
        clearDiagramAccess,
        navigate,
        showAlert,
        t,
    ]);

    return { initialDiagram };
};
