import { useAuth } from '@/hooks/use-auth';
import { useChartDB } from '@/hooks/use-chartdb';
import { useStorage } from '@/hooks/use-storage';
import { getClientId } from '@/lib/realtime/client-id';
import { isValidBackendDiagramId } from '@/lib/realtime/diagram-id';
import { getEcho } from '@/lib/realtime/echo';
import {
    applyRemoteDiagramOperation,
    isDiagramOperationAction,
    type DiagramOperationData,
    type DiagramOperationPayload,
} from '@/lib/realtime/diagram-operations';
import {
    remoteSyncDepthRef,
    syncRemoteApplyState,
} from '@/lib/realtime/diagram-sync-state';
import { useEffect, useRef } from 'react';

interface DiagramTestPayload {
    message: string;
    sentAt: string;
    userId: number;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const parseDiagramOperationPayload = (
    value: unknown
): DiagramOperationPayload | null => {
    if (!isRecord(value)) {
        return null;
    }

    const action = value.action;
    const data = value.data;
    const userId = value.userId;
    const clientId = value.clientId;
    const sentAt = value.sentAt;

    if (typeof action !== 'string' || !isDiagramOperationAction(action)) {
        return null;
    }

    if (!isRecord(data)) {
        return null;
    }

    if (typeof clientId !== 'string') {
        return null;
    }

    if (typeof userId !== 'number') {
        return null;
    }

    if (typeof sentAt !== 'string') {
        return null;
    }

    return {
        action,
        data: data as DiagramOperationData,
        userId,
        clientId,
        sentAt,
    };
};

export const useDiagramRealtime = (): void => {
    const { isAuthenticated, isLoading } = useAuth();
    const {
        getTable: getTableFromStorage,
        getRelationship: getRelationshipFromStorage,
        getNote: getNoteFromStorage,
        getArea: getAreaFromStorage,
    } = useStorage();
    const {
        currentDiagram,
        tables,
        relationships,
        notes,
        areas,
        addTables,
        updateTable,
        removeTables,
        addField,
        removeField,
        updateField,
        addRelationships,
        removeRelationships,
        updateRelationship,
        addNotes,
        removeNotes,
        updateNote,
        addAreas,
        removeAreas,
        updateArea,
    } = useChartDB();

    const existingTableIdsRef = useRef<ReadonlySet<string>>(new Set());
    existingTableIdsRef.current = new Set(tables.map((table) => table.id));

    const existingRelationshipIdsRef = useRef<ReadonlySet<string>>(new Set());
    existingRelationshipIdsRef.current = new Set(
        relationships.map((relationship) => relationship.id)
    );

    const existingFieldIdsByTableRef = useRef<
        ReadonlyMap<string, ReadonlySet<string>>
    >(new Map());
    existingFieldIdsByTableRef.current = new Map(
        tables.map((table) => [
            table.id,
            new Set(table.fields.map((field) => field.id)),
        ])
    );

    const existingNoteIdsRef = useRef<ReadonlySet<string>>(new Set());
    existingNoteIdsRef.current = new Set(notes.map((note) => note.id));

    const existingAreaIdsRef = useRef<ReadonlySet<string>>(new Set());
    existingAreaIdsRef.current = new Set(areas.map((area) => area.id));

    const diagramId =
        currentDiagram && isValidBackendDiagramId(currentDiagram.id)
            ? String(currentDiagram.id)
            : null;

    useEffect(() => {
        if (isLoading || !isAuthenticated || diagramId === null) {
            return;
        }

        const echo = getEcho();

        if (echo === null) {
            return;
        }

        let channel: ReturnType<typeof echo.private> | null = null;

        const handleDiagramTest = (payload: DiagramTestPayload): void => {
            console.log('[DiagramTest]', payload);
        };

        const handleDiagramOperation = (value: unknown): void => {
            const payload = parseDiagramOperationPayload(value);

            if (payload === null) {
                console.warn('[DiagramOperation] Invalid payload', value);
                return;
            }

            if (payload.clientId === getClientId()) {
                return;
            }

            remoteSyncDepthRef.current += 1;
            syncRemoteApplyState();

            void applyRemoteDiagramOperation(
                payload,
                {
                    addTables,
                    updateTable,
                    removeTables,
                    addField,
                    removeField,
                    updateField,
                    addRelationships,
                    removeRelationships,
                    updateRelationship,
                    addNotes,
                    removeNotes,
                    updateNote,
                    addAreas,
                    removeAreas,
                    updateArea,
                },
                {
                    existingTableIds: existingTableIdsRef.current,
                    getTableFromStorage: (tableId: string) =>
                        getTableFromStorage({
                            diagramId,
                            id: tableId,
                        }),
                    existingRelationshipIds: existingRelationshipIdsRef.current,
                    getRelationshipFromStorage: (relationshipId: string) =>
                        getRelationshipFromStorage({
                            diagramId,
                            id: relationshipId,
                        }),
                    existingFieldIdsByTable: existingFieldIdsByTableRef.current,
                    existingNoteIds: existingNoteIdsRef.current,
                    getNoteFromStorage: (noteId: string) =>
                        getNoteFromStorage({
                            diagramId,
                            id: noteId,
                        }),
                    existingAreaIds: existingAreaIdsRef.current,
                    getAreaFromStorage: (areaId: string) =>
                        getAreaFromStorage({
                            diagramId,
                            id: areaId,
                        }),
                }
            )
                .catch((error: unknown) => {
                    console.warn(
                        '[DiagramOperation] Failed to apply operation',
                        error
                    );
                })
                .finally(() => {
                    remoteSyncDepthRef.current = Math.max(
                        0,
                        remoteSyncDepthRef.current - 1
                    );
                    syncRemoteApplyState();
                });
        };

        try {
            channel = echo.private(`diagram.${diagramId}`);

            channel
                .listen('.DiagramTest', handleDiagramTest)
                .listen('.DiagramOperation', handleDiagramOperation)
                .error((error: unknown) => {
                    console.warn(
                        `[DiagramRealtime] channel error (diagram.${diagramId})`,
                        error
                    );
                });
        } catch (error) {
            console.warn(
                `[DiagramRealtime] failed to subscribe (diagram.${diagramId})`,
                error
            );
            return;
        }

        return () => {
            try {
                channel?.stopListening('.DiagramTest', handleDiagramTest);
                channel?.stopListening(
                    '.DiagramOperation',
                    handleDiagramOperation
                );
                echo.leave(`diagram.${diagramId}`);
            } catch (error) {
                console.warn(
                    `[DiagramRealtime] failed to cleanup (diagram.${diagramId})`,
                    error
                );
            }
        };
    }, [
        isLoading,
        isAuthenticated,
        diagramId,
        tables,
        notes,
        areas,
        addTables,
        updateTable,
        removeTables,
        addField,
        removeField,
        updateField,
        addRelationships,
        removeRelationships,
        updateRelationship,
        addNotes,
        removeNotes,
        updateNote,
        addAreas,
        removeAreas,
        updateArea,
        getTableFromStorage,
        getRelationshipFromStorage,
        getNoteFromStorage,
        getAreaFromStorage,
    ]);
};
