import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChartDB } from '@/hooks/use-chartdb';
import { useConfig } from '@/hooks/use-config';
import { useDiagramAccess } from '@/hooks/use-diagram-access';
import { useStorage } from '@/hooks/use-storage';
import { useToast } from '@/components/toast/use-toast';
import { createDiagram, getDiagram } from '@/lib/api/diagrams';
import { normalizeDiagramFromApi } from '@/lib/api/normalize-diagram-from-api';
import { findGuestLocalDiagramIdForMigration } from '@/lib/diagram/find-guest-local-diagram-id';
import type { EntryFlowEvent, EntryFlowState } from '@/lib/entry-flow';
import { useTranslation } from 'react-i18next';

interface UseEntryFlowGuestMigrationOptions {
    state: EntryFlowState;
    isAuthenticated: boolean;
    isAuthLoading: boolean;
    beginResolution: () => number;
    isResolutionCurrent: (token: number) => boolean;
    dispatchEvent: (event: EntryFlowEvent) => void;
}

export const useEntryFlowGuestMigration = ({
    state,
    isAuthenticated,
    isAuthLoading,
    beginResolution,
    isResolutionCurrent,
    dispatchEvent,
}: UseEntryFlowGuestMigrationOptions): void => {
    const { config, updateConfig } = useConfig();
    const {
        listDiagrams,
        getDiagram: getLocalDiagram,
        deleteDiagram,
    } = useStorage();
    const { loadDiagramFromData } = useChartDB();
    const { setDiagramAccess } = useDiagramAccess();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { t } = useTranslation();

    const migrationEpisodeRef = useRef<string | null>(null);
    const openingMigratedEpisodeRef = useRef<string | null>(null);

    const checkingGuestMigrationEntrySource =
        state.kind === 'checkingGuestMigration' ? state.entrySource : undefined;

    const migratingLocalDiagramId =
        state.kind === 'migratingGuestDiagram'
            ? state.localDiagramId
            : undefined;
    const migratingEntrySource =
        state.kind === 'migratingGuestDiagram' ? state.entrySource : undefined;
    const migratingEpisodeKey =
        migratingLocalDiagramId !== undefined &&
        migratingEntrySource !== undefined
            ? `${migratingLocalDiagramId}:${migratingEntrySource}`
            : undefined;

    const openingMigratedEpisodeKey =
        state.kind === 'openingDiagram' && state.diagramSource === 'migrated'
            ? `${state.diagramId}:${state.entrySource}`
            : undefined;

    useEffect(() => {
        if (isAuthLoading || !config || !isAuthenticated) {
            return;
        }

        if (checkingGuestMigrationEntrySource === undefined) {
            return;
        }

        const token = beginResolution();

        void (async () => {
            try {
                const diagramId =
                    await findGuestLocalDiagramIdForMigration(listDiagrams);

                if (!isResolutionCurrent(token)) {
                    return;
                }

                if (diagramId !== null) {
                    const exists = await getLocalDiagram(diagramId);

                    if (!isResolutionCurrent(token)) {
                        return;
                    }

                    if (!exists) {
                        dispatchEvent({
                            type: 'GUEST_MIGRATION_LOCAL_NOT_FOUND',
                        });
                        return;
                    }

                    dispatchEvent({
                        type: 'GUEST_MIGRATION_LOCAL_FOUND',
                        diagramId,
                    });
                    return;
                }

                dispatchEvent({ type: 'GUEST_MIGRATION_LOCAL_NOT_FOUND' });
            } catch {
                if (!isResolutionCurrent(token)) {
                    return;
                }

                dispatchEvent({
                    type: 'GUEST_MIGRATION_CHECK_FAILED',
                    messageKey: 'guest_migration_errors.check_failed',
                });
            }
        })();
    }, [
        checkingGuestMigrationEntrySource,
        isAuthenticated,
        isAuthLoading,
        config,
        beginResolution,
        isResolutionCurrent,
        dispatchEvent,
        listDiagrams,
        getLocalDiagram,
    ]);

    useEffect(() => {
        if (isAuthLoading || !config || !isAuthenticated) {
            return;
        }

        if (
            migratingEpisodeKey === undefined ||
            migratingLocalDiagramId === undefined
        ) {
            migrationEpisodeRef.current = null;
            return;
        }

        if (migrationEpisodeRef.current === migratingEpisodeKey) {
            return;
        }

        migrationEpisodeRef.current = migratingEpisodeKey;
        const token = beginResolution();
        const localDiagramId = migratingLocalDiagramId;

        void (async () => {
            try {
                const full = await getLocalDiagram(localDiagramId, {
                    includeTables: true,
                    includeRelationships: true,
                    includeDependencies: true,
                    includeAreas: true,
                    includeCustomTypes: true,
                    includeNotes: true,
                });

                if (!isResolutionCurrent(token) || !full) {
                    if (isResolutionCurrent(token) && !full) {
                        dispatchEvent({
                            type: 'GUEST_MIGRATION_FAILED',
                            messageKey: 'guest_migration_errors.import_failed',
                        });
                        toast({
                            title: t('guest_migration_errors.import_failed'),
                            variant: 'destructive',
                        });
                    }

                    return;
                }

                const result = await createDiagram({
                    name: full.name,
                    content: full,
                });

                const remoteDiagramId = String(result.diagram.id);

                if (!isResolutionCurrent(token)) {
                    return;
                }

                dispatchEvent({
                    type: 'GUEST_MIGRATION_REMOTE_CREATED',
                    remoteDiagramId,
                });

                const remoteDiagram = await getDiagram(remoteDiagramId);

                if (!isResolutionCurrent(token)) {
                    return;
                }

                if (!remoteDiagram) {
                    dispatchEvent({
                        type: 'GUEST_MIGRATION_FAILED',
                        messageKey: 'guest_migration_errors.activation_failed',
                    });
                    toast({
                        title: t('guest_migration_errors.activation_failed'),
                        variant: 'destructive',
                    });
                    return;
                }

                const normalizedDiagram = normalizeDiagramFromApi(
                    remoteDiagram,
                    remoteDiagramId
                );

                loadDiagramFromData(normalizedDiagram);
                setDiagramAccess(remoteDiagram.access ?? null);
                await updateConfig({
                    config: { defaultDiagramId: remoteDiagramId },
                });
                navigate(`/diagrams/${remoteDiagramId}`);

                if (!isResolutionCurrent(token)) {
                    return;
                }

                try {
                    await deleteDiagram(localDiagramId);
                } catch {
                    if (!isResolutionCurrent(token)) {
                        return;
                    }

                    dispatchEvent({
                        type: 'GUEST_MIGRATION_CLEANUP_FAILED',
                        remoteDiagramId,
                    });
                    toast({
                        title: t('guest_migration_errors.cleanup_failed'),
                        variant: 'destructive',
                    });
                    return;
                }

                if (!isResolutionCurrent(token)) {
                    return;
                }

                dispatchEvent({
                    type: 'GUEST_MIGRATION_SUCCEEDED',
                    remoteDiagramId,
                });
            } catch {
                if (!isResolutionCurrent(token)) {
                    return;
                }

                dispatchEvent({
                    type: 'GUEST_MIGRATION_FAILED',
                    messageKey: 'guest_migration_errors.import_failed',
                });
                toast({
                    title: t('guest_migration_errors.import_failed'),
                    variant: 'destructive',
                });
            }
        })();
    }, [
        migratingEpisodeKey,
        migratingLocalDiagramId,
        isAuthenticated,
        isAuthLoading,
        config,
        beginResolution,
        isResolutionCurrent,
        dispatchEvent,
        getLocalDiagram,
        deleteDiagram,
        loadDiagramFromData,
        setDiagramAccess,
        updateConfig,
        navigate,
        toast,
        t,
    ]);

    useEffect(() => {
        if (isAuthLoading || !config || !isAuthenticated) {
            return;
        }

        if (openingMigratedEpisodeKey === undefined) {
            openingMigratedEpisodeRef.current = null;
            return;
        }

        if (openingMigratedEpisodeRef.current === openingMigratedEpisodeKey) {
            return;
        }

        openingMigratedEpisodeRef.current = openingMigratedEpisodeKey;
        const token = beginResolution();

        void (async () => {
            if (!isResolutionCurrent(token)) {
                return;
            }

            dispatchEvent({ type: 'DIAGRAM_OPENED' });
        })();
    }, [
        openingMigratedEpisodeKey,
        isAuthenticated,
        isAuthLoading,
        config,
        beginResolution,
        isResolutionCurrent,
        dispatchEvent,
    ]);
};
