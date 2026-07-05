import { createContext } from 'react';
import type { SelectionsByEntity } from '@/lib/realtime/selection-utils';

// Shared remote selection state for the canvas. Relationship selections are
// tracked in selectionsByEntity but edge rendering is deferred (see
// relationship-edge.tsx TODO).
export interface RemoteSelectionsContextValue {
    isSelectionActive: boolean;
    selectionsByEntity: SelectionsByEntity;
}

export const RemoteSelectionsContext =
    createContext<RemoteSelectionsContextValue | null>(null);
