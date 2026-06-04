import { useAuth } from '@/hooks/use-auth';
import { useDiagramAccess } from '@/hooks/use-diagram-access';
import { useChartDB } from '@/hooks/use-chartdb';
import type { Diagram } from '@/lib/domain/diagram';
import type { DatabaseEdition } from '@/lib/domain/database-edition';
import type { DatabaseType } from '@/lib/domain/database-type';
import { updateDiagram } from '@/lib/api/diagrams';
import { isValidBackendDiagramId } from '@/lib/realtime/diagram-id';
import { isRemoteSyncActive } from '@/lib/realtime/diagram-sync-state';
import { useEffect, useRef } from 'react';

const AUTOSAVE_DEBOUNCE_MS = 900;

type AutosaveSnapshotContent = Pick<
    Diagram,
    | 'name'
    | 'databaseType'
    | 'databaseEdition'
    | 'tables'
    | 'relationships'
    | 'dependencies'
    | 'areas'
    | 'customTypes'
    | 'notes'
>;

const toAutosaveSnapshot = (diagram: {
    name: string;
    databaseType: DatabaseType;
    databaseEdition?: DatabaseEdition;
    tables: NonNullable<Diagram['tables']>;
    relationships: NonNullable<Diagram['relationships']>;
    dependencies: NonNullable<Diagram['dependencies']>;
    areas: NonNullable<Diagram['areas']>;
    customTypes: NonNullable<Diagram['customTypes']>;
    notes: NonNullable<Diagram['notes']>;
}): string => JSON.stringify(diagram satisfies AutosaveSnapshotContent);

const buildAutosaveSnapshotFromDiagram = (diagram: Diagram): string =>
    toAutosaveSnapshot({
        name: diagram.name ?? 'Untitled diagram',
        databaseType: diagram.databaseType,
        databaseEdition: diagram.databaseEdition,
        tables: diagram.tables ?? [],
        relationships: diagram.relationships ?? [],
        dependencies: diagram.dependencies ?? [],
        areas: diagram.areas ?? [],
        customTypes: diagram.customTypes ?? [],
        notes: diagram.notes ?? [],
    });

export const useDiagramAutosave = () => {
    const { isAuthenticated } = useAuth();
    const { diagramAccess } = useDiagramAccess();
    const { currentDiagram } = useChartDB();
    const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
        null
    );
    const activeDiagramIdRef = useRef<string | null>(null);
    const lastSavedPayloadRef = useRef<string | null>(null);
    const isSavingRef = useRef(false);
    const latestDiagramRef = useRef<Diagram | null>(null);
    const latestPayloadRef = useRef<string | null>(null);
    const latestDiagramIdRef = useRef<string | null>(null);

    useEffect(() => {
        if (
            !isAuthenticated ||
            !currentDiagram ||
            !isValidBackendDiagramId(currentDiagram.id)
        ) {
            return;
        }

        if (diagramAccess !== null && diagramAccess.can_edit === false) {
            return;
        }

        const diagramId = String(currentDiagram.id);
        const payload = buildAutosaveSnapshotFromDiagram(currentDiagram);

        latestDiagramRef.current = currentDiagram;
        latestPayloadRef.current = payload;
        latestDiagramIdRef.current = diagramId;

        if (isRemoteSyncActive()) {
            return;
        }

        if (activeDiagramIdRef.current !== diagramId) {
            activeDiagramIdRef.current = diagramId;
            lastSavedPayloadRef.current = payload;
            return;
        }

        if (payload === lastSavedPayloadRef.current) {
            return;
        }

        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        debounceTimeoutRef.current = setTimeout(async () => {
            if (isSavingRef.current) {
                return;
            }

            if (isRemoteSyncActive()) {
                return;
            }

            const diagram = latestDiagramRef.current;
            const savePayload = latestPayloadRef.current;
            const saveDiagramId = latestDiagramIdRef.current;

            if (
                diagram === null ||
                savePayload === null ||
                saveDiagramId === null
            ) {
                return;
            }

            if (!isValidBackendDiagramId(diagram.id)) {
                return;
            }

            if (String(diagram.id) !== saveDiagramId) {
                return;
            }

            if (savePayload === lastSavedPayloadRef.current) {
                return;
            }

            isSavingRef.current = true;
            try {
                await updateDiagram(saveDiagramId, {
                    name: diagram.name ?? 'Untitled diagram',
                    content: diagram,
                });
                lastSavedPayloadRef.current = savePayload;
            } catch (error) {
                console.error('Failed to autosave diagram', error);
            } finally {
                isSavingRef.current = false;
            }
        }, AUTOSAVE_DEBOUNCE_MS);

        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [isAuthenticated, currentDiagram, diagramAccess]);
};
