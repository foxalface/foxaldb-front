import { createContext } from 'react';
import type { DiagramLocation } from '@/lib/diagram/diagram-location';
import { emptyFn } from '@/lib/utils';

/**
 * Authoritative frontend owner of the current diagram location.
 *
 * Writers: entry resolution and explicit open actions via setDiagramLocation.
 * Readers: ChartDB persistence, autosave, diagram realtime, and the device
 * indicator. Do not keep a second location state.
 *
 * Auth changes do not update this value. Guest migration, while it still
 * exists, must call setDiagramLocation when it moves a device diagram online.
 */
export interface DiagramLocationContextValue {
    location: DiagramLocation | null;
    setDiagramLocation: (location: DiagramLocation | null) => void;
}

export const diagramLocationContext =
    createContext<DiagramLocationContextValue>({
        location: null,
        setDiagramLocation: emptyFn,
    });
