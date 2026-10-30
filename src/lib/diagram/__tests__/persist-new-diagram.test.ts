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
    const listDiagrams = vi.fn().mockResolvedValue([]);

    beforeEach(() => {
        vi.clearAllMocks();
        addDiagram.mockResolvedValue(undefined);
        listDiagrams.mockResolvedValue([]);
        createDiagram.mockResolvedValue({ diagram: { id: 99 } });
    });

    it('writes a guest device diagram to Dexie only', async () => {
        const persisted = await persistNewDiagram(diagram, 'device', {
            addDiagram,
            listDiagrams,
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
            listDiagrams,
            isAuthenticated: true,
        });

        expect(addDiagram).toHaveBeenCalledTimes(1);
        expect(createDiagram).not.toHaveBeenCalled();
        expect(persisted.destination).toBe('device');
    });

    it('creates an authenticated online diagram without Dexie or memory load', async () => {
        const persisted = await persistNewDiagram(diagram, 'online', {
            addDiagram,
            listDiagrams,
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
                listDiagrams,
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
                listDiagrams,
                isAuthenticated: true,
            })
        ).rejects.toThrow('network');

        expect(addDiagram).not.toHaveBeenCalled();
    });

    it('keeps a remote parser result on device storage', async () => {
        expect(getParserLocation('laravel')).toBe('remote');

        await persistNewDiagram(diagram, 'device', {
            addDiagram,
            listDiagrams,
            isAuthenticated: true,
        });

        expect(addDiagram).toHaveBeenCalledWith({ diagram });
        expect(createDiagram).not.toHaveBeenCalled();
    });

    it('refuses a second guest device diagram at the persistence boundary', async () => {
        listDiagrams.mockResolvedValue([{ id: 'existing' }]);

        await expect(
            persistNewDiagram(diagram, 'device', {
                addDiagram,
                listDiagrams,
                isAuthenticated: false,
            })
        ).rejects.toMatchObject({ name: 'GuestDeviceDiagramLimitError' });

        expect(addDiagram).not.toHaveBeenCalled();
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
        loadDiagramFromData.mockReset();
        updateDefaultDiagramId.mockReset();
        updateDefaultDiagramId.mockResolvedValue(undefined);
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

    it('loads device memory before setting location and navigating', async () => {
        await openPersistedNewDiagram(devicePersisted, {
            setDiagramLocation,
            clearDiagramAccess,
            loadDiagramFromData,
            navigate,
            updateDefaultDiagramId,
            navigateAfterDeviceOpen: true,
        });

        expect(loadDiagramFromData).toHaveBeenCalledWith(diagram);
        expect(setDiagramLocation).toHaveBeenCalledWith({
            type: 'device',
            localId: 'local-1',
        });
        expect(navigate).toHaveBeenCalledWith('/diagrams/local-1');
        expect(updateDefaultDiagramId).toHaveBeenCalledWith('local-1');
        expect(loadDiagramFromData.mock.invocationCallOrder[0]).toBeLessThan(
            setDiagramLocation.mock.invocationCallOrder[0]
        );
        expect(setDiagramLocation.mock.invocationCallOrder[0]).toBeLessThan(
            navigate.mock.invocationCallOrder[0]
        );
        expect(navigate.mock.invocationCallOrder[0]).toBeLessThan(
            updateDefaultDiagramId.mock.invocationCallOrder[0]
        );
    });

    it('leaves location and access unchanged when device load fails', async () => {
        loadDiagramFromData.mockImplementation(() => {
            throw new Error('load failed');
        });

        await expect(
            openPersistedNewDiagram(devicePersisted, {
                setDiagramLocation,
                clearDiagramAccess,
                loadDiagramFromData,
                navigate,
                updateDefaultDiagramId,
                navigateAfterDeviceOpen: true,
            })
        ).rejects.toThrow('load failed');

        expect(setDiagramLocation).not.toHaveBeenCalled();
        expect(clearDiagramAccess).not.toHaveBeenCalled();
        expect(navigate).not.toHaveBeenCalled();
        expect(updateDefaultDiagramId).not.toHaveBeenCalled();
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
        expect(navigate.mock.invocationCallOrder[0]).toBeLessThan(
            updateDefaultDiagramId.mock.invocationCallOrder[0]
        );
        expect(setDiagramLocation).not.toHaveBeenCalled();
        expect(clearDiagramAccess).not.toHaveBeenCalled();
        expect(loadDiagramFromData).not.toHaveBeenCalled();
    });

    it('still navigates when the default diagram id write fails', async () => {
        updateDefaultDiagramId.mockRejectedValue(new Error('config failed'));

        await expect(
            openPersistedNewDiagram(
                { destination: 'online', diagramId: '99' },
                {
                    setDiagramLocation,
                    clearDiagramAccess,
                    loadDiagramFromData,
                    navigate,
                    updateDefaultDiagramId,
                    navigateAfterDeviceOpen: true,
                }
            )
        ).rejects.toThrow('config failed');

        expect(navigate).toHaveBeenCalledWith('/diagrams/99');
        expect(setDiagramLocation).not.toHaveBeenCalled();
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
