import type { ChartDBEvent } from '@/context/chartdb-context/chartdb-context';
import { useAuth } from '@/hooks/use-auth';
import { useChartDB } from '@/hooks/use-chartdb';
import { postDiagramOperation } from '@/lib/api/diagrams';
import { getClientId } from '@/lib/realtime/client-id';
import { isValidBackendDiagramId } from '@/lib/realtime/diagram-id';
import type { DiagramOperationRequest } from '@/lib/realtime/diagram-operations';
import { isApplyingRemoteRef } from '@/lib/realtime/diagram-sync-state';
import { useCallback, useEffect, useRef } from 'react';

const UPDATE_TABLE_DEBOUNCE_MS = 120;
const UPDATE_FIELD_DEBOUNCE_MS = 150;
const UPDATE_RELATIONSHIP_DEBOUNCE_MS = 150;

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

    const handleChartDBEvent = useCallback(
        (event: ChartDBEvent) => {
            if (isLoading || !isAuthenticated) return;
            if (!currentDiagram) return;
            if (!isValidBackendDiagramId(currentDiagram.id)) return;
            if (isApplyingRemoteRef.current) return;
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

                    if (isApplyingRemoteRef.current) return;

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

                    if (isApplyingRemoteRef.current) return;

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

                    if (isApplyingRemoteRef.current) return;

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
        },
        [currentDiagram, isAuthenticated, isLoading]
    );

    events.useSubscription(handleChartDBEvent);

    useEffect(() => {
        const updateTableTimeouts = updateTableTimeoutsRef.current;
        const updateFieldTimeouts = updateFieldTimeoutsRef.current;
        const updateRelationshipTimeouts =
            updateRelationshipTimeoutsRef.current;

        return () => {
            updateTableTimeouts.forEach(clearTimeout);
            updateTableTimeouts.clear();

            updateFieldTimeouts.forEach(clearTimeout);
            updateFieldTimeouts.clear();

            updateRelationshipTimeouts.forEach(clearTimeout);
            updateRelationshipTimeouts.clear();
        };
    }, []);
};
