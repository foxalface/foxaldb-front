import { useDiagramTableMovementBroadcast } from '@/pages/editor-page/use-diagram-table-movement-broadcast';
import type React from 'react';

/**
 * Isolated React Flow store subscriber. Must render inside ReactFlow so Canvas
 * does not subscribe to the flow store (avoids parent re-render loops).
 */
export const TableMovementBroadcastListener: React.FC = () => {
    useDiagramTableMovementBroadcast();
    return null;
};
