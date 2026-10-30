import type { StorageContext } from '@/context/storage-context/storage-context';
import {
    appliesGuestDeviceDiagramLimit,
    type DiagramCreationDestination,
} from '@/lib/diagram/diagram-creation-destination';

export class GuestDeviceDiagramLimitError extends Error {
    constructor() {
        super('guest_device_diagram_limit');
        this.name = 'GuestDeviceDiagramLimitError';
    }
}

/**
 * Blocks a new Device diagram write for guests who already store one diagram.
 * Online destinations and authenticated Device writes are unaffected.
 */
export const assertGuestDeviceDiagramWriteAllowed = async (
    destination: DiagramCreationDestination,
    isAuthenticated: boolean,
    listDiagrams: StorageContext['listDiagrams']
): Promise<void> => {
    if (!appliesGuestDeviceDiagramLimit(destination, isAuthenticated)) {
        return;
    }

    const diagrams = await listDiagrams();

    if (diagrams.length >= 1) {
        throw new GuestDeviceDiagramLimitError();
    }
};

export const assertGuestDeviceOnlyWriteAllowed = async (
    isAuthenticated: boolean,
    listDiagrams: StorageContext['listDiagrams']
): Promise<void> =>
    assertGuestDeviceDiagramWriteAllowed(
        'device',
        isAuthenticated,
        listDiagrams
    );
