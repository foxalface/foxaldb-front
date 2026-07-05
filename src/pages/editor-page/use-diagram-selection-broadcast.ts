import { useAuth } from '@/hooks/use-auth';
import { useChartDB } from '@/hooks/use-chartdb';
import { useRealtime } from '@/hooks/use-realtime';
import { isValidBackendDiagramId } from '@/lib/realtime/diagram-id';
import {
    areSelectionSnapshotsEqual,
    buildSelectionSnapshotFromFlowSelection,
} from '@/lib/realtime/selection-utils';
import type { SelectionItem } from '@/lib/realtime/selection-types';
import type { SelectionWhisperPayload } from '@/lib/realtime/selection-types';
import { useStore } from '@xyflow/react';
import { useCallback, useEffect, useRef } from 'react';

const SELECTION_BROADCAST_DEBOUNCE_MS = 50;

const logSelectionSend = (payload: SelectionWhisperPayload): void => {
    if (import.meta.env.DEV) {
        console.log('[DiagramSelection] send', payload);
    }
};

const selectFlowSelectionSnapshot = (state: {
    nodes: ReadonlyArray<{ id: string; type?: string; selected?: boolean }>;
    edges: ReadonlyArray<{ id: string; type?: string; selected?: boolean }>;
}): SelectionItem[] => {
    const tableNodeIds = new Set<string>();
    const relationshipEdgeIds = new Set<string>();
    const selectedNodeIds: string[] = [];
    const selectedEdgeIds: string[] = [];

    for (const node of state.nodes) {
        if (node.type === 'table') {
            tableNodeIds.add(node.id);
        }

        if (node.selected) {
            selectedNodeIds.push(node.id);
        }
    }

    for (const edge of state.edges) {
        if (edge.type === 'relationship-edge') {
            relationshipEdgeIds.add(edge.id);
        }

        if (edge.selected) {
            selectedEdgeIds.push(edge.id);
        }
    }

    return buildSelectionSnapshotFromFlowSelection({
        selectedNodeIds,
        selectedEdgeIds,
        tableNodeIds,
        relationshipEdgeIds,
    });
};

export const useDiagramSelectionBroadcast = (): void => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const { currentDiagram } = useChartDB();
    const { sendSelection } = useRealtime();
    const selectionSnapshot = useStore(
        selectFlowSelectionSnapshot,
        areSelectionSnapshotsEqual
    );

    const diagramId =
        currentDiagram && isValidBackendDiagramId(currentDiagram.id)
            ? String(currentDiagram.id)
            : null;

    const isActive =
        !isLoading && isAuthenticated && diagramId !== null && user !== null;

    const sendSelectionRef = useRef(sendSelection);
    sendSelectionRef.current = sendSelection;

    const lastSentSnapshotRef = useRef<SelectionItem[] | null>(null);
    const debounceTimeoutRef = useRef<number | undefined>(undefined);

    const flushSelectionBroadcast = useCallback(() => {
        debounceTimeoutRef.current = undefined;

        if (!isActive || user === null) {
            return;
        }

        const nextSnapshot = selectionSnapshot;

        if (
            lastSentSnapshotRef.current !== null &&
            areSelectionSnapshotsEqual(
                lastSentSnapshotRef.current,
                nextSnapshot
            )
        ) {
            return;
        }

        const payload: SelectionWhisperPayload = {
            userId: user.id,
            selections: nextSnapshot,
        };

        sendSelectionRef.current(payload);
        logSelectionSend(payload);
        lastSentSnapshotRef.current = nextSnapshot;
    }, [isActive, selectionSnapshot, user]);

    useEffect(() => {
        if (!isActive) {
            lastSentSnapshotRef.current = null;

            if (debounceTimeoutRef.current !== undefined) {
                window.clearTimeout(debounceTimeoutRef.current);
                debounceTimeoutRef.current = undefined;
            }

            return;
        }

        if (debounceTimeoutRef.current !== undefined) {
            window.clearTimeout(debounceTimeoutRef.current);
        }

        debounceTimeoutRef.current = window.setTimeout(
            flushSelectionBroadcast,
            SELECTION_BROADCAST_DEBOUNCE_MS
        );

        return () => {
            if (debounceTimeoutRef.current !== undefined) {
                window.clearTimeout(debounceTimeoutRef.current);
                debounceTimeoutRef.current = undefined;
            }
        };
    }, [flushSelectionBroadcast, isActive, selectionSnapshot]);
};
