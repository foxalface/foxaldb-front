import { useAuth } from '@/hooks/use-auth';
import { useDiagramAccess } from '@/hooks/use-diagram-access';
import { useChartDB } from '@/hooks/use-chartdb';
import { readDiagramContentHashFromApi } from '@/lib/api/diagram-content-hash';
import { getDiagram } from '@/lib/api/diagrams';
import { normalizeDiagramFromApi } from '@/lib/api/normalize-diagram-from-api';
import {
    clearScheduledDiagramAutosave,
    configureDiagramAutosaveStaleHandlers,
    observeDiagramForAutosave,
    readDiagramAutosaveContentHash,
    setDiagramAutosaveContentHash,
    setDiagramAutosaveEnabled,
} from '@/lib/diagram-autosave/diagram-autosave-controller';
import { isValidBackendDiagramId } from '@/lib/realtime/diagram-id';
import { isRemoteSyncActive } from '@/lib/realtime/diagram-sync-state';
import { useEffect } from 'react';

export const useDiagramAutosave = (): void => {
    const { isAuthenticated } = useAuth();
    const { diagramAccess } = useDiagramAccess();
    const { currentDiagram, replaceDiagram } = useChartDB();

    const canSave =
        isAuthenticated &&
        currentDiagram !== undefined &&
        currentDiagram !== null &&
        isValidBackendDiagramId(currentDiagram.id) &&
        !(diagramAccess !== null && diagramAccess.can_edit === false);

    useEffect(() => {
        configureDiagramAutosaveStaleHandlers({
            refetchDiagram: async (diagramId) => {
                const raw = await getDiagram(diagramId);
                const contentHash = readDiagramContentHashFromApi(raw);

                if (contentHash !== null) {
                    setDiagramAutosaveContentHash(diagramId, contentHash);
                }

                return normalizeDiagramFromApi(raw, diagramId);
            },
            replaceAuthoritative: async (diagram) => {
                await replaceDiagram(diagram, {
                    updateHistory: false,
                    authoritative: true,
                    resetHistory: true,
                    authoritativeContentHash:
                        readDiagramAutosaveContentHash() ?? undefined,
                });
            },
        });

        return () => {
            configureDiagramAutosaveStaleHandlers(null);
        };
    }, [replaceDiagram]);

    useEffect(() => {
        setDiagramAutosaveEnabled(canSave);

        if (!canSave || !currentDiagram) {
            return () => {
                clearScheduledDiagramAutosave();
            };
        }

        observeDiagramForAutosave(currentDiagram, {
            schedule: !isRemoteSyncActive(),
        });

        return () => {
            clearScheduledDiagramAutosave();
        };
    }, [canSave, currentDiagram, diagramAccess]);
};
