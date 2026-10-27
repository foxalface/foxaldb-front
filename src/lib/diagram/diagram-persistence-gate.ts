import type { StorageContext } from '@/context/storage-context/storage-context';
import type { DBTable } from '@/lib/domain/db-table';
import {
    isOnlineDiagramLocation,
    type DiagramLocation,
} from '@/lib/diagram/diagram-location';

/**
 * ChartDB persistence boundary.
 *
 * Device location (and unresolved null) keeps the existing Dexie writes.
 * Online location updates editor memory through the caller, but diagram
 * content writes on this storage object do not create or update a Dexie
 * shadow. Reads of the current tables come from editor memory so field
 * mutations can still record undo without a Dexie row.
 *
 * Other Dexie callers (Open Diagram, copy, Put online) use storage directly
 * and are not wrapped by this gate.
 */
export const withDiagramLocationPersistence = (
    storage: StorageContext,
    readLocation: () => DiagramLocation | null,
    readTables: () => readonly DBTable[],
    readCurrentDiagramId: () => string
): StorageContext => {
    const shouldSkip = (targetDiagramId: string): boolean => {
        const location = readLocation();

        return (
            isOnlineDiagramLocation(location) &&
            targetDiagramId === location.diagramId
        );
    };

    return {
        ...storage,
        addDiagram: async (params) => {
            if (shouldSkip(params.diagram.id)) {
                return;
            }

            await storage.addDiagram(params);
        },
        updateDiagram: async (params) => {
            if (shouldSkip(params.id)) {
                return;
            }

            await storage.updateDiagram(params);
        },
        deleteDiagram: async (id) => {
            if (shouldSkip(id)) {
                return;
            }

            await storage.deleteDiagram(id);
        },
        addTable: async (params) => {
            if (shouldSkip(params.diagramId)) {
                return;
            }

            await storage.addTable(params);
        },
        getTable: async (params) => {
            const location = readLocation();

            if (
                isOnlineDiagramLocation(location) &&
                params.diagramId === location.diagramId
            ) {
                return readTables().find((table) => table.id === params.id);
            }

            return storage.getTable(params);
        },
        updateTable: async (params) => {
            if (shouldSkip(readCurrentDiagramId())) {
                return;
            }

            await storage.updateTable(params);
        },
        putTable: async (params) => {
            if (shouldSkip(params.diagramId)) {
                return;
            }

            await storage.putTable(params);
        },
        deleteTable: async (params) => {
            if (shouldSkip(params.diagramId)) {
                return;
            }

            await storage.deleteTable(params);
        },
        deleteDiagramTables: async (diagramId) => {
            if (shouldSkip(diagramId)) {
                return;
            }

            await storage.deleteDiagramTables(diagramId);
        },
        addRelationship: async (params) => {
            if (shouldSkip(params.diagramId)) {
                return;
            }

            await storage.addRelationship(params);
        },
        updateRelationship: async (params) => {
            if (shouldSkip(readCurrentDiagramId())) {
                return;
            }

            await storage.updateRelationship(params);
        },
        deleteRelationship: async (params) => {
            if (shouldSkip(params.diagramId)) {
                return;
            }

            await storage.deleteRelationship(params);
        },
        deleteDiagramRelationships: async (diagramId) => {
            if (shouldSkip(diagramId)) {
                return;
            }

            await storage.deleteDiagramRelationships(diagramId);
        },
        addDependency: async (params) => {
            if (shouldSkip(params.diagramId)) {
                return;
            }

            await storage.addDependency(params);
        },
        updateDependency: async (params) => {
            if (shouldSkip(readCurrentDiagramId())) {
                return;
            }

            await storage.updateDependency(params);
        },
        deleteDependency: async (params) => {
            if (shouldSkip(params.diagramId)) {
                return;
            }

            await storage.deleteDependency(params);
        },
        deleteDiagramDependencies: async (diagramId) => {
            if (shouldSkip(diagramId)) {
                return;
            }

            await storage.deleteDiagramDependencies(diagramId);
        },
        addArea: async (params) => {
            if (shouldSkip(params.diagramId)) {
                return;
            }

            await storage.addArea(params);
        },
        updateArea: async (params) => {
            if (shouldSkip(readCurrentDiagramId())) {
                return;
            }

            await storage.updateArea(params);
        },
        deleteArea: async (params) => {
            if (shouldSkip(params.diagramId)) {
                return;
            }

            await storage.deleteArea(params);
        },
        deleteDiagramAreas: async (diagramId) => {
            if (shouldSkip(diagramId)) {
                return;
            }

            await storage.deleteDiagramAreas(diagramId);
        },
        addCustomType: async (params) => {
            if (shouldSkip(params.diagramId)) {
                return;
            }

            await storage.addCustomType(params);
        },
        updateCustomType: async (params) => {
            if (shouldSkip(readCurrentDiagramId())) {
                return;
            }

            await storage.updateCustomType(params);
        },
        deleteCustomType: async (params) => {
            if (shouldSkip(params.diagramId)) {
                return;
            }

            await storage.deleteCustomType(params);
        },
        deleteDiagramCustomTypes: async (diagramId) => {
            if (shouldSkip(diagramId)) {
                return;
            }

            await storage.deleteDiagramCustomTypes(diagramId);
        },
        addNote: async (params) => {
            if (shouldSkip(params.diagramId)) {
                return;
            }

            await storage.addNote(params);
        },
        updateNote: async (params) => {
            if (shouldSkip(readCurrentDiagramId())) {
                return;
            }

            await storage.updateNote(params);
        },
        deleteNote: async (params) => {
            if (shouldSkip(params.diagramId)) {
                return;
            }

            await storage.deleteNote(params);
        },
        deleteDiagramNotes: async (diagramId) => {
            if (shouldSkip(diagramId)) {
                return;
            }

            await storage.deleteDiagramNotes(diagramId);
        },
    };
};
