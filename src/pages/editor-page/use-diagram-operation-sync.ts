import type { ChartDBEvent } from '@/context/chartdb-context/chartdb-context';
import type { DiagramTag } from '@/lib/domain/diagram-tag';
import { useAuth } from '@/hooks/use-auth';
import { useDiagramAccess } from '@/hooks/use-diagram-access';
import { useChartDB } from '@/hooks/use-chartdb';
import { useOnlineDiagramId } from '@/hooks/use-diagram-location';
import { postDiagramOperation } from '@/lib/api/diagrams';
import { getClientId } from '@/lib/realtime/client-id';
import type { DiagramOperationRequest } from '@/lib/realtime/diagram-operations';
import {
    isOutboundReplayActive,
    isRemoteSyncActive,
    setClearPendingDiagramOperationSyncTimers,
} from '@/lib/realtime/diagram-sync-state';
import { useCallback, useEffect } from 'react';

const shouldSkipOutboundSync = (): boolean =>
    isRemoteSyncActive() || isOutboundReplayActive();

const UPDATE_DIAGRAM_NAME_DEBOUNCE_MS = 150;
const UPDATE_TABLE_DEBOUNCE_MS = 120;
const UPDATE_FIELD_DEBOUNCE_MS = 150;
const UPDATE_RELATIONSHIP_DEBOUNCE_MS = 150;
const UPDATE_NOTE_DEBOUNCE_MS = 150;
const UPDATE_AREA_DEBOUNCE_MS = 150;
const UPDATE_DEPENDENCY_DEBOUNCE_MS = 150;
const UPDATE_TAG_DEBOUNCE_MS = 150;

const updateDiagramNameTimeouts = new Map<
    string,
    ReturnType<typeof setTimeout>
>();
const updateTableTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
const updateFieldTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
const updateRelationshipTimeouts = new Map<
    string,
    ReturnType<typeof setTimeout>
>();
const updateNoteTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
const updateAreaTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
const updateDependencyTimeouts = new Map<
    string,
    ReturnType<typeof setTimeout>
>();
const updateTagTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

// One client's HTTP posts are not ordered by the transport. Assignment posts
// wait until earlier posts from the same diagram have settled so a tag or
// table exists before its assignment is broadcast.
const diagramOperationTails = new Map<string, Promise<void>>();

const clearTimeoutMap = (
    timeouts: Map<string, ReturnType<typeof setTimeout>>
): void => {
    timeouts.forEach(clearTimeout);
    timeouts.clear();
};

export const clearPendingDiagramOperationSyncTimers = (): void => {
    clearTimeoutMap(updateDiagramNameTimeouts);
    clearTimeoutMap(updateTableTimeouts);
    clearTimeoutMap(updateFieldTimeouts);
    clearTimeoutMap(updateRelationshipTimeouts);
    clearTimeoutMap(updateNoteTimeouts);
    clearTimeoutMap(updateAreaTimeouts);
    clearTimeoutMap(updateDependencyTimeouts);
    clearTimeoutMap(updateTagTimeouts);
    diagramOperationTails.clear();
};

const tagAttributePresent = (value: string | undefined): boolean =>
    typeof value === 'string' && value.trim().length > 0;

const supportedTagAttributes = (
    tag: Partial<Pick<DiagramTag, 'name'>>
): { name?: string } => {
    const attributes: { name?: string } = {};

    if (tagAttributePresent(tag.name)) {
        attributes.name = tag.name;
    }

    return attributes;
};

const shouldPostDiagramSyncEvent = (event: ChartDBEvent): boolean => {
    switch (event.action) {
        case 'update_diagram_name':
            return event.data.name.trim().length > 0;
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
        case 'add_tags':
            return event.data.tags.length > 0;
        case 'remove_tags':
            return event.data.tagIds.length > 0;
        case 'update_tag':
            return (
                event.data.id.length > 0 &&
                tagAttributePresent(event.data.tag.name)
            );
        case 'add_tag_assignments':
            return event.data.assignments.length > 0;
        case 'remove_tag_assignments':
            return event.data.assignmentIds.length > 0;
        case 'load_diagram':
            return false;
    }
};

export const useDiagramOperationSync = (): void => {
    const { isAuthenticated, isLoading } = useAuth();
    const { diagramAccess } = useDiagramAccess();
    const { events } = useChartDB();
    const onlineDiagramId = useOnlineDiagramId();

    const handleChartDBEvent = useCallback(
        (event: ChartDBEvent) => {
            if (isLoading || !isAuthenticated) return;
            if (onlineDiagramId === null) return;
            if (diagramAccess !== null && diagramAccess.can_edit === false) {
                return;
            }
            if (shouldSkipOutboundSync()) {
                return;
            }
            if (!shouldPostDiagramSyncEvent(event)) return;

            const diagramId = onlineDiagramId;

            const sendOperation = (
                body: DiagramOperationRequest
            ): Promise<void> =>
                postDiagramOperation(diagramId, body).then(
                    () => undefined,
                    (error: unknown) => {
                        console.warn(
                            '[DiagramOperation] Failed to post operation',
                            error
                        );
                    }
                );

            const postOperation = (body: DiagramOperationRequest): void => {
                if (body.action === 'add_tag_assignments') {
                    const waitFor =
                        diagramOperationTails.get(diagramId) ??
                        Promise.resolve();
                    const pending = waitFor.then(
                        () => sendOperation(body),
                        () => sendOperation(body)
                    );
                    diagramOperationTails.set(diagramId, pending);
                    return;
                }

                const pending = sendOperation(body);
                const previous =
                    diagramOperationTails.get(diagramId) ?? Promise.resolve();
                diagramOperationTails.set(
                    diagramId,
                    previous.then(
                        () => pending,
                        () => pending
                    )
                );
            };

            if (event.action === 'update_diagram_name') {
                const existing = updateDiagramNameTimeouts.get(diagramId);
                if (existing) clearTimeout(existing);

                const timeout = setTimeout(() => {
                    updateDiagramNameTimeouts.delete(diagramId);

                    if (shouldSkipOutboundSync()) return;

                    postOperation({
                        action: 'update_diagram_name',
                        data: { name: event.data.name },
                        clientId: getClientId(),
                    });
                }, UPDATE_DIAGRAM_NAME_DEBOUNCE_MS);

                updateDiagramNameTimeouts.set(diagramId, timeout);
                return;
            }

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

                const existing = updateTableTimeouts.get(tableId);
                if (existing) clearTimeout(existing);

                const timeout = setTimeout(() => {
                    updateTableTimeouts.delete(tableId);

                    if (shouldSkipOutboundSync()) return;

                    postOperation({
                        action: 'update_table',
                        data: event.data,
                        clientId: getClientId(),
                    });
                }, UPDATE_TABLE_DEBOUNCE_MS);

                updateTableTimeouts.set(tableId, timeout);
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

                const existing = updateFieldTimeouts.get(key);
                if (existing) clearTimeout(existing);

                const timeout = setTimeout(() => {
                    updateFieldTimeouts.delete(key);

                    if (shouldSkipOutboundSync()) return;

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

                updateFieldTimeouts.set(key, timeout);
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

                const existing = updateRelationshipTimeouts.get(relationshipId);
                if (existing) clearTimeout(existing);

                const timeout = setTimeout(() => {
                    updateRelationshipTimeouts.delete(relationshipId);

                    if (shouldSkipOutboundSync()) return;

                    postOperation({
                        action: 'update_relationship',
                        data: {
                            id: event.data.id,
                            attributes: event.data.relationship,
                        },
                        clientId: getClientId(),
                    });
                }, UPDATE_RELATIONSHIP_DEBOUNCE_MS);

                updateRelationshipTimeouts.set(relationshipId, timeout);
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

                const existing = updateNoteTimeouts.get(noteId);
                if (existing) clearTimeout(existing);

                const timeout = setTimeout(() => {
                    updateNoteTimeouts.delete(noteId);

                    if (shouldSkipOutboundSync()) return;

                    postOperation({
                        action: 'update_note',
                        data: {
                            id: event.data.id,
                            attributes: event.data.note,
                        },
                        clientId: getClientId(),
                    });
                }, UPDATE_NOTE_DEBOUNCE_MS);

                updateNoteTimeouts.set(noteId, timeout);
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

                const existing = updateAreaTimeouts.get(areaId);
                if (existing) clearTimeout(existing);

                const timeout = setTimeout(() => {
                    updateAreaTimeouts.delete(areaId);

                    if (shouldSkipOutboundSync()) return;

                    postOperation({
                        action: 'update_area',
                        data: {
                            id: event.data.id,
                            attributes: event.data.area,
                        },
                        clientId: getClientId(),
                    });
                }, UPDATE_AREA_DEBOUNCE_MS);

                updateAreaTimeouts.set(areaId, timeout);
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

                const existing = updateDependencyTimeouts.get(dependencyId);
                if (existing) clearTimeout(existing);

                const timeout = setTimeout(() => {
                    updateDependencyTimeouts.delete(dependencyId);

                    if (shouldSkipOutboundSync()) return;

                    postOperation({
                        action: 'update_dependency',
                        data: {
                            id: event.data.id,
                            attributes: event.data.dependency,
                        },
                        clientId: getClientId(),
                    });
                }, UPDATE_DEPENDENCY_DEBOUNCE_MS);

                updateDependencyTimeouts.set(dependencyId, timeout);
                return;
            }

            if (
                event.action === 'add_tags' ||
                event.action === 'remove_tags' ||
                event.action === 'add_tag_assignments' ||
                event.action === 'remove_tag_assignments'
            ) {
                postOperation({
                    action: event.action,
                    data: event.data,
                    clientId: getClientId(),
                });
                return;
            }

            if (event.action === 'update_tag') {
                const tagId = event.data.id;
                const existing = updateTagTimeouts.get(tagId);
                if (existing) clearTimeout(existing);

                const timeout = setTimeout(() => {
                    updateTagTimeouts.delete(tagId);

                    if (shouldSkipOutboundSync()) return;

                    postOperation({
                        action: 'update_tag',
                        data: {
                            id: event.data.id,
                            attributes: supportedTagAttributes(event.data.tag),
                        },
                        clientId: getClientId(),
                    });
                }, UPDATE_TAG_DEBOUNCE_MS);

                updateTagTimeouts.set(tagId, timeout);
            }
        },
        [onlineDiagramId, diagramAccess, isAuthenticated, isLoading]
    );

    events.useSubscription(handleChartDBEvent);

    useEffect(() => {
        setClearPendingDiagramOperationSyncTimers(
            clearPendingDiagramOperationSyncTimers
        );

        return () => {
            setClearPendingDiagramOperationSyncTimers(null);
            clearPendingDiagramOperationSyncTimers();
        };
    }, []);
};
