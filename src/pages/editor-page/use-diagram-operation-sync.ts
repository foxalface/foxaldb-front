import type { ChartDBEvent } from '@/context/chartdb-context/chartdb-context';
import { useAuth } from '@/hooks/use-auth';
import { useChartDB } from '@/hooks/use-chartdb';
import { postDiagramOperation } from '@/lib/api/diagrams';
import { getClientId } from '@/lib/realtime/client-id';
import { isValidBackendDiagramId } from '@/lib/realtime/diagram-id';
import type { DiagramOperationRequest } from '@/lib/realtime/diagram-operations';
import { isRemoteSyncActive } from '@/lib/realtime/diagram-sync-state';
import { useCallback, useEffect, useRef } from 'react';

const UPDATE_TABLE_DEBOUNCE_MS = 120;
const UPDATE_FIELD_DEBOUNCE_MS = 150;
const UPDATE_RELATIONSHIP_DEBOUNCE_MS = 150;
const UPDATE_NOTE_DEBOUNCE_MS = 150;
const UPDATE_AREA_DEBOUNCE_MS = 150;
const UPDATE_DEPENDENCY_DEBOUNCE_MS = 150;

const shouldPostDiagramSyncEvent = (event: ChartDBEvent): boolean => {
    switch (event.action) {
        case 'add_tables':
            return event.data.tables.length > 0;
        case 'remove_tables':
            return event.data.tableIds.length > 0;
        case 'update_table':
            return (
                event.data.id.length > 0 &&
                Object.keys(event.data.table).length > 0
            );
        case 'add_field':
            return (
                event.data.tableId.length > 0 && event.data.field.id.length > 0
            );
        case 'remove_field':
            return (
                event.data.tableId.length > 0 && event.data.fieldId.length > 0
            );
        case 'update_field':
            return (
                event.data.tableId.length > 0 &&
                event.data.fieldId.length > 0 &&
                Object.keys(event.data.field).length > 0
            );
        case 'add_relationships':
            return event.data.relationships.length > 0;
        case 'remove_relationships':
            return event.data.relationshipIds.length > 0;
        case 'update_relationship':
            return (
                event.data.id.length > 0 &&
                Object.keys(event.data.relationship).length > 0
            );
        case 'add_notes':
            return event.data.notes.length > 0;
        case 'remove_notes':
            return event.data.noteIds.length > 0;
        case 'update_note':
            return (
                event.data.id.length > 0 &&
                Object.keys(event.data.note).length > 0
            );
        case 'add_areas':
            return event.data.areas.length > 0;
        case 'remove_areas':
            return event.data.areaIds.length > 0;
        case 'update_area':
            return (
                event.data.id.length > 0 &&
                Object.keys(event.data.area).length > 0
            );
        case 'add_dependencies':
            return event.data.dependencies.length > 0;
        case 'remove_dependencies':
            return event.data.dependencyIds.length > 0;
        case 'update_dependency':
            return (
                event.data.id.length > 0 &&
                Object.keys(event.data.dependency).length > 0
            );
        case 'load_diagram':
            return false;
    }
};

export const useDiagramOperationSync = (): void => {
    const { isAuthenticated, isLoading } = useAuth();
    const { currentDiagram, events } = useChartDB();

    const updateTableTimeoutsRef = useRef<
        Map<string, ReturnType<typeof setTimeout>>
    >(new Map());

    const updateFieldTimeoutsRef = useRef<
        Map<string, ReturnType<typeof setTimeout>>
    >(new Map());

    const updateRelationshipTimeoutsRef = useRef<
        Map<string, ReturnType<typeof setTimeout>>
    >(new Map());

    const updateNoteTimeoutsRef = useRef<
        Map<string, ReturnType<typeof setTimeout>>
    >(new Map());

    const updateAreaTimeoutsRef = useRef<
        Map<string, ReturnType<typeof setTimeout>>
    >(new Map());

    const updateDependencyTimeoutsRef = useRef<
        Map<string, ReturnType<typeof setTimeout>>
    >(new Map());

    const handleChartDBEvent = useCallback(
        (event: ChartDBEvent) => {
            if (isLoading || !isAuthenticated) return;
            if (!currentDiagram) return;
            if (!isValidBackendDiagramId(currentDiagram.id)) return;
            if (isRemoteSyncActive()) return;
            if (!shouldPostDiagramSyncEvent(event)) return;

            const diagramId = String(currentDiagram.id);

            const postOperation = (body: DiagramOperationRequest): void => {
                void postDiagramOperation(diagramId, body).catch(
                    (error: unknown) => {
                        console.warn(
                            '[DiagramOperation] Failed to post operation',
                            error
                        );
                    }
                );
            };

            // ===== TABLE =====

            if (
                event.action === 'add_tables' ||
                event.action === 'remove_tables'
            ) {
                postOperation({
                    action: event.action,
                    data: event.data,
                    clientId: getClientId(),
                });
                return;
            }

            if (event.action === 'update_table') {
                const tableId = event.data.id;

                const existing = updateTableTimeoutsRef.current.get(tableId);
                if (existing) clearTimeout(existing);

                const timeout = setTimeout(() => {
                    updateTableTimeoutsRef.current.delete(tableId);

                    if (isRemoteSyncActive()) return;

                    postOperation({
                        action: 'update_table',
                        data: event.data,
                        clientId: getClientId(),
                    });
                }, UPDATE_TABLE_DEBOUNCE_MS);

                updateTableTimeoutsRef.current.set(tableId, timeout);
                return;
            }

            // ===== FIELD =====

            if (
                event.action === 'add_field' ||
                event.action === 'remove_field'
            ) {
                postOperation({
                    action: event.action,
                    data: event.data,
                    clientId: getClientId(),
                });
                return;
            }

            if (event.action === 'update_field') {
                const key = `${event.data.tableId}:${event.data.fieldId}`;

                const existing = updateFieldTimeoutsRef.current.get(key);
                if (existing) clearTimeout(existing);

                const timeout = setTimeout(() => {
                    updateFieldTimeoutsRef.current.delete(key);

                    if (isRemoteSyncActive()) return;

                    postOperation({
                        action: 'update_field',
                        data: {
                            tableId: event.data.tableId,
                            fieldId: event.data.fieldId,
                            attributes: event.data.field,
                        },
                        clientId: getClientId(),
                    });
                }, UPDATE_FIELD_DEBOUNCE_MS);

                updateFieldTimeoutsRef.current.set(key, timeout);
                return;
            }

            // ===== RELATIONSHIP =====

            if (
                event.action === 'add_relationships' ||
                event.action === 'remove_relationships'
            ) {
                postOperation({
                    action: event.action,
                    data: event.data,
                    clientId: getClientId(),
                });
                return;
            }

            if (event.action === 'update_relationship') {
                const relationshipId = event.data.id;

                const existing =
                    updateRelationshipTimeoutsRef.current.get(relationshipId);
                if (existing) clearTimeout(existing);

                const timeout = setTimeout(() => {
                    updateRelationshipTimeoutsRef.current.delete(
                        relationshipId
                    );

                    if (isRemoteSyncActive()) return;

                    postOperation({
                        action: 'update_relationship',
                        data: {
                            id: event.data.id,
                            attributes: event.data.relationship,
                        },
                        clientId: getClientId(),
                    });
                }, UPDATE_RELATIONSHIP_DEBOUNCE_MS);

                updateRelationshipTimeoutsRef.current.set(
                    relationshipId,
                    timeout
                );
                return;
            }

            // ===== NOTE =====

            if (
                event.action === 'add_notes' ||
                event.action === 'remove_notes'
            ) {
                postOperation({
                    action: event.action,
                    data: event.data,
                    clientId: getClientId(),
                });
                return;
            }

            if (event.action === 'update_note') {
                const noteId = event.data.id;

                const existing = updateNoteTimeoutsRef.current.get(noteId);
                if (existing) clearTimeout(existing);

                const timeout = setTimeout(() => {
                    updateNoteTimeoutsRef.current.delete(noteId);

                    if (isRemoteSyncActive()) return;

                    postOperation({
                        action: 'update_note',
                        data: {
                            id: event.data.id,
                            attributes: event.data.note,
                        },
                        clientId: getClientId(),
                    });
                }, UPDATE_NOTE_DEBOUNCE_MS);

                updateNoteTimeoutsRef.current.set(noteId, timeout);
                return;
            }

            // ===== AREA =====

            if (
                event.action === 'add_areas' ||
                event.action === 'remove_areas'
            ) {
                postOperation({
                    action: event.action,
                    data: event.data,
                    clientId: getClientId(),
                });
                return;
            }

            if (event.action === 'update_area') {
                const areaId = event.data.id;

                const existing = updateAreaTimeoutsRef.current.get(areaId);
                if (existing) clearTimeout(existing);

                const timeout = setTimeout(() => {
                    updateAreaTimeoutsRef.current.delete(areaId);

                    if (isRemoteSyncActive()) return;

                    postOperation({
                        action: 'update_area',
                        data: {
                            id: event.data.id,
                            attributes: event.data.area,
                        },
                        clientId: getClientId(),
                    });
                }, UPDATE_AREA_DEBOUNCE_MS);

                updateAreaTimeoutsRef.current.set(areaId, timeout);
                return;
            }

            // ===== DEPENDENCY =====

            if (
                event.action === 'add_dependencies' ||
                event.action === 'remove_dependencies'
            ) {
                postOperation({
                    action: event.action,
                    data: event.data,
                    clientId: getClientId(),
                });
                return;
            }

            if (event.action === 'update_dependency') {
                const dependencyId = event.data.id;

                const existing =
                    updateDependencyTimeoutsRef.current.get(dependencyId);
                if (existing) clearTimeout(existing);

                const timeout = setTimeout(() => {
                    updateDependencyTimeoutsRef.current.delete(dependencyId);

                    if (isRemoteSyncActive()) return;

                    postOperation({
                        action: 'update_dependency',
                        data: {
                            id: event.data.id,
                            attributes: event.data.dependency,
                        },
                        clientId: getClientId(),
                    });
                }, UPDATE_DEPENDENCY_DEBOUNCE_MS);

                updateDependencyTimeoutsRef.current.set(dependencyId, timeout);
                return;
            }
        },
        [currentDiagram, isAuthenticated, isLoading]
    );

    events.useSubscription(handleChartDBEvent);

    useEffect(() => {
        const updateTableTimeouts = updateTableTimeoutsRef.current;
        const updateFieldTimeouts = updateFieldTimeoutsRef.current;
        const updateRelationshipTimeouts =
            updateRelationshipTimeoutsRef.current;
        const updateNoteTimeouts = updateNoteTimeoutsRef.current;
        const updateAreaTimeouts = updateAreaTimeoutsRef.current;
        const updateDependencyTimeouts = updateDependencyTimeoutsRef.current;

        return () => {
            updateTableTimeouts.forEach(clearTimeout);
            updateTableTimeouts.clear();

            updateFieldTimeouts.forEach(clearTimeout);
            updateFieldTimeouts.clear();

            updateRelationshipTimeouts.forEach(clearTimeout);
            updateRelationshipTimeouts.clear();

            updateNoteTimeouts.forEach(clearTimeout);
            updateNoteTimeouts.clear();

            updateAreaTimeouts.forEach(clearTimeout);
            updateAreaTimeouts.clear();

            updateDependencyTimeouts.forEach(clearTimeout);
            updateDependencyTimeouts.clear();
        };
    }, []);
};
