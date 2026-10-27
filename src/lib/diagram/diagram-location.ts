import { isValidBackendDiagramId } from '@/lib/realtime/diagram-id';

/**
 * Explicit storage identity for the diagram currently open in the editor.
 *
 * Device ("On this device"): Dexie is authoritative.
 * Online ("Online"): Laravel is authoritative.
 *
 * Authentication and network status are not part of this type. Location is
 * not an access role.
 *
 * The authoritative runtime value lives in DiagramLocationProvider.
 * Entry resolution and explicit open actions set it. Hard reload starts at
 * null and reconstructs it during that resolution: a non-numeric id is loaded
 * from Dexie and stored as device; a numeric id is loaded from the API and
 * stored as online. After resolution, route id shape is not the storage mode.
 */
export type DiagramLocation =
    | {
          type: 'device';
          localId: string;
      }
    | {
          type: 'online';
          diagramId: string;
      };

export type DeviceDiagramLocation = Extract<
    DiagramLocation,
    { type: 'device' }
>;

export type OnlineDiagramLocation = Extract<
    DiagramLocation,
    { type: 'online' }
>;

export const deviceDiagramLocation = (
    localId: string
): DeviceDiagramLocation => ({
    type: 'device',
    localId,
});

export const onlineDiagramLocation = (
    diagramId: string
): OnlineDiagramLocation => ({
    type: 'online',
    diagramId,
});

export const isDeviceDiagramLocation = (
    location: DiagramLocation | null | undefined
): location is DeviceDiagramLocation => location?.type === 'device';

export const isOnlineDiagramLocation = (
    location: DiagramLocation | null | undefined
): location is OnlineDiagramLocation => location?.type === 'online';

/**
 * Dexie rows whose ids are backend numeric ids. They are historical shadows
 * of online diagrams, not device diagrams. Identification only: this does not
 * delete anything.
 */
export const isLegacyNumericDexieShadowId = (id: string): boolean =>
    isValidBackendDiagramId(id);

/**
 * Diagram-channel and API id for the current location.
 *
 * Returns null unless location is online, the open diagram id matches that
 * location, and the id is a valid backend id. Authentication is not consulted.
 */
export const readOnlineDiagramId = (
    location: DiagramLocation | null,
    currentDiagramId: string | null | undefined
): string | null => {
    if (!isOnlineDiagramLocation(location)) {
        return null;
    }

    if (currentDiagramId == null || currentDiagramId === '') {
        return null;
    }

    if (currentDiagramId !== location.diagramId) {
        return null;
    }

    if (!isValidBackendDiagramId(location.diagramId)) {
        return null;
    }

    return location.diagramId;
};
