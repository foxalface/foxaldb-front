import { createContext } from 'react';
import type { DiagramLocation } from '@/lib/diagram/diagram-location';
import { emptyFn } from '@/lib/utils';

/**
 * Authoritative frontend owner of the current diagram location.
 *
 * Writers: entry resolution, explicit open actions, device creation after a
 * Dexie write, and session end when leaving an online diagram (clears to
 * null). Readers: ChartDB persistence, autosave, diagram realtime, and the
 * device indicator. Do not keep a second location state.
 *
 * Auth changes do not retarget a device diagram and do not copy an online
 * diagram into Dexie. Online location is set only by a successful online
 * open. Parser location does not set DiagramLocation.
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
