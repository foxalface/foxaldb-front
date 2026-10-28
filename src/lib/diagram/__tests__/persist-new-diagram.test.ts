import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import type { Diagram } from '@/lib/domain/diagram';
import { getParserLocation } from '@/lib/project-import/parser-location';
import {
    OnlineCreationRequiresAuthenticationError,
    openPersistedNewDiagram,
    persistNewDiagram,
    type PersistedNewDiagram,
} from '../persist-new-diagram';
import { appliesGuestDeviceDiagramLimit } from '../diagram-creation-destination';

const createDiagram = vi.fn();

vi.mock('@/lib/api/diagrams', () => ({
    createDiagram: (...args: unknown[]) => createDiagram(...args),
}));

const diagram: Diagram = {
    id: 'local-1',
    name: 'Laravel import',
    databaseType: DatabaseType.MYSQL,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
};

describe('persistNewDiagram', () => {
    const addDiagram = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        addDiagram.mockResolvedValue(undefined);
        createDiagram.mockResolvedValue({ diagram: { id: 99 } });
    });

    it('writes a guest device diagram to Dexie only', async () => {
        const persisted = await persistNewDiagram(diagram, 'device', {
            addDiagram,
            isAuthenticated: false,
        });

        expect(addDiagram).toHaveBeenCalledWith({ diagram });
        expect(createDiagram).not.toHaveBeenCalled();
        expect(persisted).toEqual({
            destination: 'device',
            localId: 'local-1',
            diagram,
        });
    });

    it('writes an authenticated device diagram to Dexie and does not POST', async () => {
        const persisted = await persistNewDiagram(diagram, 'device', {
            addDiagram,
            isAuthenticated: true,
        });

        expect(addDiagram).toHaveBeenCalledTimes(1);
        expect(createDiagram).not.toHaveBeenCalled();
        expect(persisted.destination).toBe('device');
    });

    it('creates an authenticated online diagram without Dexie or memory load', async () => {
        const persisted = await persistNewDiagram(diagram, 'online', {
            addDiagram,
            isAuthenticated: true,
        });

        expect(createDiagram).toHaveBeenCalledWith({
            name: diagram.name,
            content: diagram,
        });
        expect(addDiagram).not.toHaveBeenCalled();
        expect(persisted).toEqual({
            destination: 'online',
            diagramId: '99',
        });
    });

    it('refuses online creation when the session cannot authenticate', async () => {
        await expect(
            persistNewDiagram(diagram, 'online', {
                addDiagram,
                isAuthenticated: false,
            })
        ).rejects.toBeInstanceOf(OnlineCreationRequiresAuthenticationError);

        expect(createDiagram).not.toHaveBeenCalled();
        expect(addDiagram).not.toHaveBeenCalled();
    });

    it('does not write Dexie when the create API fails', async () => {
        createDiagram.mockRejectedValue(new Error('network'));

        await expect(
            persistNewDiagram(diagram, 'online', {
                addDiagram,
                isAuthenticated: true,
            })
        ).rejects.toThrow('network');

        expect(addDiagram).not.toHaveBeenCalled();
    });

    it('keeps a remote parser result on device storage', async () => {
        expect(getParserLocation('laravel')).toBe('remote');

        await persistNewDiagram(diagram, 'device', {
            addDiagram,
            isAuthenticated: true,
        });

        expect(addDiagram).toHaveBeenCalledWith({ diagram });
        expect(createDiagram).not.toHaveBeenCalled();
    });
});

describe('openPersistedNewDiagram', () => {
    const setDiagramLocation = vi.fn();
    const clearDiagramAccess = vi.fn();
    const loadDiagramFromData = vi.fn();
    const navigate = vi.fn();
    const updateDefaultDiagramId = vi.fn().mockResolvedValue(undefined);

    const devicePersisted: PersistedNewDiagram = {
        destination: 'device',
        localId: diagram.id,
        diagram,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('sets device location and loads memory without navigating for an in-session guest', async () => {
        await openPersistedNewDiagram(devicePersisted, {
            setDiagramLocation,
            clearDiagramAccess,
            loadDiagramFromData,
            navigate,
            navigateAfterDeviceOpen: false,
        });

        expect(setDiagramLocation).toHaveBeenCalledWith({
            type: 'device',
            localId: 'local-1',
        });
        expect(clearDiagramAccess).toHaveBeenCalledTimes(1);
        expect(loadDiagramFromData).toHaveBeenCalledWith(diagram);
        expect(navigate).not.toHaveBeenCalled();
    });

    it('navigates an authenticated device diagram after location is set', async () => {
        await openPersistedNewDiagram(devicePersisted, {
            setDiagramLocation,
            clearDiagramAccess,
            loadDiagramFromData,
            navigate,
            updateDefaultDiagramId,
            navigateAfterDeviceOpen: true,
        });

        expect(setDiagramLocation).toHaveBeenCalledWith({
            type: 'device',
            localId: 'local-1',
        });
        expect(loadDiagramFromData).toHaveBeenCalledWith(diagram);
        expect(updateDefaultDiagramId).toHaveBeenCalledWith('local-1');
        expect(navigate).toHaveBeenCalledWith('/diagrams/local-1');
        expect(setDiagramLocation.mock.invocationCallOrder[0]).toBeLessThan(
            loadDiagramFromData.mock.invocationCallOrder[0]
        );
    });

    it('navigates an online diagram without loading it or setting location', async () => {
        await openPersistedNewDiagram(
            { destination: 'online', diagramId: '99' },
            {
                setDiagramLocation,
                clearDiagramAccess,
                loadDiagramFromData,
                navigate,
                updateDefaultDiagramId,
                navigateAfterDeviceOpen: true,
            }
        );

        expect(navigate).toHaveBeenCalledWith('/diagrams/99');
        expect(updateDefaultDiagramId).toHaveBeenCalledWith('99');
        expect(setDiagramLocation).not.toHaveBeenCalled();
        expect(clearDiagramAccess).not.toHaveBeenCalled();
        expect(loadDiagramFromData).not.toHaveBeenCalled();
    });
});

describe('appliesGuestDeviceDiagramLimit', () => {
    it('applies only to an unauthenticated device destination', () => {
        expect(appliesGuestDeviceDiagramLimit('device', false)).toBe(true);
        expect(appliesGuestDeviceDiagramLimit('device', true)).toBe(false);
        expect(appliesGuestDeviceDiagramLimit('online', false)).toBe(false);
        expect(appliesGuestDeviceDiagramLimit('online', true)).toBe(false);
    });
});
