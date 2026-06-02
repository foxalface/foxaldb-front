import { useAuth } from '@/hooks/use-auth';
import { useChartDB } from '@/hooks/use-chartdb';
import { useConfig } from '@/hooks/use-config';
import { useStorage } from '@/hooks/use-storage';
import { useDialog } from '@/hooks/use-dialog';
import { useFullScreenLoader } from '@/hooks/use-full-screen-spinner';
import { useRedoUndoStack } from '@/hooks/use-redo-undo-stack';
import { getDiagram, getDiagrams } from '@/lib/api/diagrams';
import { normalizeDiagramFromApi } from '@/lib/api/normalize-diagram-from-api';
import type { Diagram } from '@/lib/domain/diagram';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

export const useDiagramLoader = () => {
    const [initialDiagram, setInitialDiagram] = useState<Diagram | undefined>();
    const { diagramId } = useParams<{ diagramId: string }>();
    const { config } = useConfig();
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const { listDiagrams } = useStorage();
    const { currentDiagram, loadDiagram, loadDiagramFromData } = useChartDB();
    const { resetRedoStack, resetUndoStack } = useRedoUndoStack();
    const { showLoader, hideLoader } = useFullScreenLoader();
    const {
        openCreateDiagramDialog,
        openOpenDiagramDialog,
        closeOpenDiagramDialog,
    } = useDialog();

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
                    closeOpenDiagramDialog();
                    hideLoader();
                } catch {
                    openOpenDiagramDialog({ canClose: false });
                    hideLoader();
                }

                return;
            }

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
    ]);

    return { initialDiagram };
};
