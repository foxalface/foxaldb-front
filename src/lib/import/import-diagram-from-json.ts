import { diagramFromJSONInput } from '@/lib/export-import-utils';
import type { Diagram } from '@/lib/domain/diagram';
import type { DatabaseType } from '@/lib/domain/database-type';

export class ImportDiagramJsonError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ImportDiagramJsonError';
    }
}

export const importDiagramFromJson = (
    content: string,
    databaseType: DatabaseType
): Diagram => {
    try {
        const diagram = diagramFromJSONInput(content);

        return {
            ...diagram,
            databaseType,
        };
    } catch {
        throw new ImportDiagramJsonError('Invalid diagram JSON');
    }
};
