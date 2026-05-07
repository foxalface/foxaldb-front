import { useChartDB } from '@/hooks/use-chartdb';
import { updateDiagram } from '@/lib/api/diagrams';
import { useEffect, useRef } from 'react';

const AUTOSAVE_DEBOUNCE_MS = 900;

const isValidBackendDiagramId = (id: unknown): id is string | number => {
    if (typeof id === 'number') {
        return Number.isInteger(id) && id > 0;
    }

    if (typeof id === 'string') {
        return /^\d+$/.test(id);
    }

    return false;
};

const toAutosaveSnapshot = (diagram: {
    name: string;
    tables: unknown;
    relationships: unknown;
    dependencies: unknown;
}): string => JSON.stringify(diagram);

export const useDiagramAutosave = () => {
    const { currentDiagram } = useChartDB();
    const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
        null
    );
    const activeDiagramIdRef = useRef<string | null>(null);
    const lastSavedPayloadRef = useRef<string | null>(null);
    const isSavingRef = useRef(false);

    useEffect(() => {
        if (!currentDiagram || !isValidBackendDiagramId(currentDiagram.id)) {
            return;
        }

        const diagramId = String(currentDiagram.id);
        const payload = toAutosaveSnapshot({
            name: currentDiagram.name ?? 'Untitled diagram',
            tables: currentDiagram.tables ?? [],
            relationships: currentDiagram.relationships ?? [],
            dependencies: currentDiagram.dependencies ?? [],
        });

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

            isSavingRef.current = true;
            try {
                await updateDiagram(diagramId, {
                    name: currentDiagram.name ?? 'Untitled diagram',
                    content: currentDiagram,
                });
                lastSavedPayloadRef.current = payload;
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
    }, [currentDiagram]);
};
