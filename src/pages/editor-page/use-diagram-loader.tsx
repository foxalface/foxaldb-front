import { useChartDB } from '@/hooks/use-chartdb';
import { useConfig } from '@/hooks/use-config';
import { useDialog } from '@/hooks/use-dialog';
import { useFullScreenLoader } from '@/hooks/use-full-screen-spinner';
import { useRedoUndoStack } from '@/hooks/use-redo-undo-stack';
import { getDiagram, getDiagrams } from '@/lib/api/diagrams';
import { DatabaseType } from '@/lib/domain/database-type';
import type { Diagram } from '@/lib/domain/diagram';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

const normalizeDiagramFromApi = (
    rawDiagram: unknown,
    diagramIdFromRoute?: string
): Diagram => {
    const raw = (rawDiagram ?? {}) as Record<string, unknown>;
    const content = (raw.content ?? {}) as Record<string, unknown>;
    const now = new Date();
    const parseDate = (value: unknown) =>
        value instanceof Date
            ? value
            : typeof value === 'string' || typeof value === 'number'
              ? new Date(value)
              : now;

    return {
        id:
            (content.id as string | undefined) ??
            (raw.id as string | undefined) ??
            diagramIdFromRoute ??
            '',
        name:
            (content.name as string | undefined) ??
            (raw.name as string | undefined) ??
            'Untitled Diagram',
        databaseType:
            (content.databaseType as Diagram['databaseType'] | undefined) ??
            DatabaseType.GENERIC,
        databaseEdition: content.databaseEdition as
            | Diagram['databaseEdition']
            | undefined,
        tables: Array.isArray(content.tables) ? content.tables : [],
        relationships: Array.isArray(content.relationships)
            ? content.relationships
            : [],
        dependencies: Array.isArray(content.dependencies)
            ? content.dependencies
            : [],
        areas: Array.isArray(content.areas) ? content.areas : [],
        customTypes: Array.isArray(content.customTypes)
            ? content.customTypes
            : [],
        notes: Array.isArray(content.notes) ? content.notes : [],
        createdAt: parseDate(content.createdAt ?? raw.createdAt),
        updatedAt: parseDate(content.updatedAt ?? raw.updatedAt),
    };
};

export const useDiagramLoader = () => {
    const [initialDiagram, setInitialDiagram] = useState<Diagram | undefined>();
    const { diagramId } = useParams<{ diagramId: string }>();
    const { config } = useConfig();
    const { currentDiagram, loadDiagramFromData } = useChartDB();
    const { resetRedoStack, resetUndoStack } = useRedoUndoStack();
    const { showLoader, hideLoader } = useFullScreenLoader();
    const {
        openCreateDiagramDialog,
        openOpenDiagramDialog,
        closeOpenDiagramDialog,
    } = useDialog();

    const currentDiagramLoadingRef = useRef<string | undefined>(undefined);

    useEffect(() => {
        if (!config) {
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
        resetRedoStack,
        resetUndoStack,
        hideLoader,
        showLoader,
        currentDiagram?.id,
        loadDiagramFromData,
    ]);

    return { initialDiagram };
};
