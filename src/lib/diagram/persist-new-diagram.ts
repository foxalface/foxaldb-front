import type { StorageContext } from '@/context/storage-context/storage-context';
import { createDiagram } from '@/lib/api/diagrams';
import type { Diagram } from '@/lib/domain/diagram';
import type { DiagramCreationDestination } from '@/lib/diagram/diagram-creation-destination';
import {
    deviceDiagramLocation,
    type DiagramLocation,
} from '@/lib/diagram/diagram-location';

/**
 * Online persistence requires an authenticated session. Authentication does
 * not choose the store; the creation destination does. Callers that still
 * need a guest to sign in before an online create handle that before calling
 * this helper.
 */
export class OnlineCreationRequiresAuthenticationError extends Error {
    constructor() {
        super('Online diagram creation requires an authenticated session');
        this.name = 'OnlineCreationRequiresAuthenticationError';
    }
}

export interface PersistNewDiagramDeps {
    addDiagram: StorageContext['addDiagram'];
    isAuthenticated: boolean;
}

export type PersistedNewDiagram =
    | {
          destination: 'device';
          localId: string;
          diagram: Diagram;
      }
    | {
          destination: 'online';
          diagramId: string;
      };

export interface OpenPersistedNewDiagramDeps {
    setDiagramLocation: (location: DiagramLocation) => void;
    clearDiagramAccess: () => void;
    loadDiagramFromData: (diagram: Diagram) => void;
    navigate: (path: string) => void;
    updateDefaultDiagramId?: (diagramId: string) => Promise<void>;
    /**
     * In-session guest creation keeps the current route.
     * Authenticated in-session creation and JSON restore navigate.
     */
    navigateAfterDeviceOpen: boolean;
}

const readCreatedDiagramId = (
    id: number | string | null | undefined
): string => {
    if (id === undefined || id === null || id === '') {
        throw new Error('Backend diagram creation returned no id');
    }

    return String(id);
};

export const persistedNewDiagramId = (
    persisted: PersistedNewDiagram
): string =>
    persisted.destination === 'device'
        ? persisted.localId
        : persisted.diagramId;

/**
 * Writes a new diagram to the store selected by destination.
 *
 * Device writes Dexie and does not call the create API.
 * Online calls the create API and does not write Dexie or load ChartDB.
 * Hydration of an online diagram stays on the existing open path.
 */
export const persistNewDiagram = async (
    diagram: Diagram,
    destination: DiagramCreationDestination,
    deps: PersistNewDiagramDeps
): Promise<PersistedNewDiagram> => {
    if (destination === 'device') {
        await deps.addDiagram({ diagram });

        return {
            destination: 'device',
            localId: diagram.id,
            diagram,
        };
    }

    if (!deps.isAuthenticated) {
        throw new OnlineCreationRequiresAuthenticationError();
    }

    const result = await createDiagram({
        name: diagram.name,
        content: diagram,
    });

    return {
        destination: 'online',
        diagramId: readCreatedDiagramId(result.diagram.id),
    };
};

/**
 * Opens a diagram that was just persisted.
 *
 * Device location is set here, before the diagram is loaded, because a later
 * route change must not be the thing that discovers a device diagram.
 * Online location is left for the existing open resolution, which loads the
 * diagram with GET /diagrams/{id}.
 */
export const openPersistedNewDiagram = async (
    persisted: PersistedNewDiagram,
    deps: OpenPersistedNewDiagramDeps
): Promise<void> => {
    if (persisted.destination === 'device') {
        deps.setDiagramLocation(deviceDiagramLocation(persisted.localId));
        deps.clearDiagramAccess();
        deps.loadDiagramFromData(persisted.diagram);

        if (!deps.navigateAfterDeviceOpen) {
            return;
        }

        if (deps.updateDefaultDiagramId) {
            await deps.updateDefaultDiagramId(persisted.localId);
        }

        deps.navigate(`/diagrams/${persisted.localId}`);
        return;
    }

    if (deps.updateDefaultDiagramId) {
        await deps.updateDefaultDiagramId(persisted.diagramId);
    }

    deps.navigate(`/diagrams/${persisted.diagramId}`);
};
