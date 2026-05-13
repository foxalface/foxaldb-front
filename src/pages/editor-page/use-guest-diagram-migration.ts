import { useAuth } from '@/hooks/use-auth';
import { useConfig } from '@/hooks/use-config';
import { useStorage } from '@/hooks/use-storage';
import { createDiagram } from '@/lib/api/diagrams';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const isGuestDiagramId = (id: string): boolean => !/^\d+$/.test(id);

export const useGuestDiagramMigration = (): void => {
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const { listDiagrams, getDiagram, deleteDiagram } = useStorage();
    const { updateConfig, config } = useConfig();
    const navigate = useNavigate();

    const migrationDoneRef = useRef(false);
    const migrationLockRef = useRef(false);

    useEffect(() => {
        if (!isAuthenticated || isAuthLoading || !config) {
            return;
        }

        if (migrationDoneRef.current || migrationLockRef.current) {
            return;
        }

        migrationLockRef.current = true;

        void (async () => {
            try {
                const diagrams = await listDiagrams();

                const guestDiagram = diagrams.find((d) =>
                    isGuestDiagramId(d.id)
                );

                if (!guestDiagram) {
                    return;
                }

                const full = await getDiagram(guestDiagram.id, {
                    includeTables: true,
                    includeRelationships: true,
                    includeDependencies: true,
                    includeAreas: true,
                    includeCustomTypes: true,
                    includeNotes: true,
                });

                if (!full) {
                    return;
                }

                const result = await createDiagram({
                    name: full.name,
                    content: full,
                });

                const newId = String(result.diagram.id);

                await updateConfig({
                    config: { defaultDiagramId: newId },
                });

                await deleteDiagram(guestDiagram.id);

                console.info('Guest diagram migrated to backend', newId);

                navigate(`/diagrams/${newId}`);

                migrationDoneRef.current = true;
            } catch (error) {
                console.error('Guest diagram migration failed', error);
            } finally {
                migrationLockRef.current = false;
            }
        })();
    }, [
        isAuthenticated,
        isAuthLoading,
        config,
        listDiagrams,
        getDiagram,
        deleteDiagram,
        updateConfig,
        navigate,
    ]);
};
