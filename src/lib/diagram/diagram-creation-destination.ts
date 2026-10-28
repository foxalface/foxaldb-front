/**
 * Where a new diagram should be created.
 *
 * This exists before persistence, for the create or restore session that is
 * about to write a diagram. It is not DiagramLocation.
 *
 * DiagramLocation exists only after a diagram becomes current and answers
 * where that current diagram lives.
 */
export type DiagramCreationDestination = 'device' | 'online';

/**
 * Defaults apply when a new create or restore session opens.
 * Guest sessions start on this device. Authenticated sessions start online.
 */
export const defaultDiagramCreationDestination = (
    isAuthenticated: boolean
): DiagramCreationDestination => (isAuthenticated ? 'online' : 'device');

/**
 * The guest one-diagram limit is a device-storage rule for unauthenticated
 * users. Authenticated device creation is not guest storage.
 */
export const appliesGuestDeviceDiagramLimit = (
    destination: DiagramCreationDestination,
    isAuthenticated: boolean
): boolean => destination === 'device' && !isAuthenticated;
