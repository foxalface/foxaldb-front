import type { Diagram } from '@/lib/domain/diagram';
import type { DatabaseType } from '@/lib/domain/database-type';
import {
    parseDiagramJsonContent,
    type DiagramJsonParseFailure,
} from './parse-diagram-json-content';

export class ImportDiagramJsonError extends Error {
    readonly failure: DiagramJsonParseFailure;

    constructor(failure: DiagramJsonParseFailure) {
        super('Invalid diagram JSON');
        this.name = 'ImportDiagramJsonError';
        this.failure = failure;
    }
}

export const importDiagramFromJson = (
    content: string,
    databaseType: DatabaseType
): Diagram => {
    const result = parseDiagramJsonContent(content, databaseType);

    if (!result.ok) {
        throw new ImportDiagramJsonError(result.failure);
    }

    return result.diagram;
};
