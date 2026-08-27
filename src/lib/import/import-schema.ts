import { loadFromDatabaseMetadata } from '@/lib/data/import-metadata/import';
import { filterMetadataByTables } from '@/lib/data/import-metadata/filter-metadata';
import { loadDatabaseMetadata } from '@/lib/data/import-metadata/metadata-types/database-metadata';
import { sqlImportToDiagram } from '@/lib/data/sql-import';
import type { DatabaseEdition } from '@/lib/domain/database-edition';
import type { Diagram } from '@/lib/domain/diagram';
import type { DatabaseType } from '@/lib/domain/database-type';
import type { SelectedTable } from '@/lib/data/import-metadata/filter-metadata';
import { detectImportFormat } from './detect-format';
import { DDL_IMPORT_SUPPORTED_TYPES } from './sql-evidence';
import type { ImportFormat } from './types';

export class ImportSchemaResolutionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ImportSchemaResolutionError';
    }
}

export interface ImportDiagnostic {
    level: 'error' | 'warning' | 'info';
    message: string;
    line?: number;
    column?: number;
}

export interface ImportSchemaInput {
    content: string;
    selectedDatabaseType: DatabaseType;
    resolvedSourceDialect?: DatabaseType;
    databaseEdition?: DatabaseEdition;
    diagramNumber?: number;
    databaseMetadata?: Parameters<
        typeof loadFromDatabaseMetadata
    >[0]['databaseMetadata'];
    selectedTables?: SelectedTable[];
}

export interface ImportSchemaResult {
    diagram: Diagram;
    format: ImportFormat;
    sourceDialect: DatabaseType | null;
    diagnostics: ImportDiagnostic[];
}

const isSqlFormat = (format: ImportFormat): boolean =>
    format === 'sql' || format === 'postgres_dump';

export const importSchema = async (
    input: ImportSchemaInput
): Promise<ImportSchemaResult> => {
    const trimmed = input.content.trim();

    if (!trimmed) {
        throw new ImportSchemaResolutionError('Import content is empty');
    }

    const formatResult = detectImportFormat(trimmed);

    if (formatResult.format === 'dbml') {
        const { defaultDBMLDiagramName, importDBMLToDiagram } =
            await import('@/lib/dbml/dbml-import/dbml-import');
        const diagram = await importDBMLToDiagram(trimmed, {
            databaseType: input.selectedDatabaseType,
        });

        if (
            input.diagramNumber !== undefined &&
            diagram.name === defaultDBMLDiagramName
        ) {
            diagram.name = `Diagram ${input.diagramNumber}`;
        }

        return {
            diagram,
            format: 'dbml',
            sourceDialect: null,
            diagnostics: [],
        };
    }

    if (formatResult.format === 'metadata_json') {
        let metadata = input.databaseMetadata ?? loadDatabaseMetadata(trimmed);

        if (input.selectedTables && input.selectedTables.length > 0) {
            metadata = filterMetadataByTables({
                metadata,
                selectedTables: input.selectedTables,
            });
        }

        const diagram = await loadFromDatabaseMetadata({
            databaseType: input.selectedDatabaseType,
            databaseMetadata: metadata,
            diagramNumber: input.diagramNumber,
            databaseEdition:
                input.databaseEdition?.trim().length === 0
                    ? undefined
                    : input.databaseEdition,
        });

        return {
            diagram,
            format: 'metadata_json',
            sourceDialect: null,
            diagnostics: [],
        };
    }

    if (isSqlFormat(formatResult.format)) {
        const sourceDialect = input.resolvedSourceDialect;

        if (!sourceDialect) {
            throw new ImportSchemaResolutionError(
                'SQL source dialect must be resolved before import'
            );
        }

        if (!DDL_IMPORT_SUPPORTED_TYPES.has(sourceDialect)) {
            throw new ImportSchemaResolutionError(
                'SQL source dialect is not supported for import'
            );
        }

        try {
            const diagram = await sqlImportToDiagram({
                sqlContent: trimmed,
                sourceDatabaseType: sourceDialect,
                targetDatabaseType: input.selectedDatabaseType,
            });

            return {
                diagram,
                format: formatResult.format,
                sourceDialect,
                diagnostics: [],
            };
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : String(error);
            throw new ImportSchemaResolutionError(message);
        }
    }

    throw new ImportSchemaResolutionError('Unsupported import format');
};
