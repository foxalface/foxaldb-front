import type {
    ProjectImportInput,
    ProjectImportResult,
} from '../../project-execution-types';
import { FOXALDB_DO_NOT_EXPOSE_RAILS_SOURCE } from './rails-constants';
import { buildDiagramFromRailsSchema } from './rails-diagram-builder';
import { RailsSchemaParseError, parseRailsSchema } from './rails-schema-parser';

export class RailsProjectParseFailedError extends Error {
    readonly diagnostics: ProjectImportResult['diagnostics'];

    constructor(
        message: string,
        diagnostics: ProjectImportResult['diagnostics'] = []
    ) {
        super(message);
        this.name = 'RailsProjectParseFailedError';
        this.diagnostics = diagnostics;
    }
}

const selectSchemaFile = (
    files: ProjectImportInput['bundle']['files']
): { relativePath: string; content: string } => {
    const schemaFiles = files.filter(
        (file) =>
            file.relativePath === 'db/schema.rb' ||
            file.relativePath.endsWith('/db/schema.rb')
    );

    if (schemaFiles.length === 0) {
        throw new RailsProjectParseFailedError(
            'db/schema.rb is required for Rails project import.',
            [
                {
                    severity: 'error',
                    code: 'rails_schema_missing',
                    message:
                        'db/schema.rb was not found in the selected project bundle.',
                    path: 'db/schema.rb',
                },
            ]
        );
    }

    const canonical = schemaFiles.find(
        (file) => file.relativePath === 'db/schema.rb'
    );

    if (schemaFiles.length > 1 && !canonical) {
        throw new RailsProjectParseFailedError(
            'Multiple db/schema.rb files were found; unable to choose an authoritative schema.',
            [
                {
                    severity: 'error',
                    code: 'rails_parse_warning',
                    message:
                        'Multiple db/schema.rb files were found in the selected project bundle.',
                    path: 'db/schema.rb',
                },
            ]
        );
    }

    return canonical ?? schemaFiles[0];
};

const assertNoSourceLeak = (value: string): void => {
    if (value.includes(FOXALDB_DO_NOT_EXPOSE_RAILS_SOURCE)) {
        throw new Error('Rails source leakage detected.');
    }
};

export const parseRailsProject = async (
    input: ProjectImportInput
): Promise<ProjectImportResult> => {
    const schemaFile = selectSchemaFile(input.bundle.files);

    let document;

    try {
        document = parseRailsSchema(schemaFile.content);
    } catch (error) {
        const message =
            error instanceof RailsSchemaParseError
                ? error.message
                : 'The Rails schema.rb file could not be parsed.';

        assertNoSourceLeak(message);

        throw new RailsProjectParseFailedError(message, [
            {
                severity: 'error',
                code: 'rails_parse_warning',
                message,
                path: schemaFile.relativePath,
            },
        ]);
    }

    if (document.tables.length === 0) {
        throw new RailsProjectParseFailedError(
            'No tables could be reconstructed from db/schema.rb.',
            [
                {
                    severity: 'error',
                    code: 'rails_parse_warning',
                    message:
                        'No usable tables were found in the Rails schema dump.',
                    path: schemaFile.relativePath,
                },
            ]
        );
    }

    const usableTables = document.tables.filter(
        (table) => table.columns.length > 0 || table.options.id !== false
    );

    if (usableTables.length === 0) {
        throw new RailsProjectParseFailedError(
            'No usable tables could be reconstructed from db/schema.rb.',
            [
                {
                    severity: 'error',
                    code: 'rails_parse_warning',
                    message:
                        'Tables were found but no scalar columns could be reconstructed.',
                    path: schemaFile.relativePath,
                },
            ]
        );
    }

    const { diagram, diagnostics } = buildDiagramFromRailsSchema(
        { ...document, tables: usableTables },
        input.targetDatabaseType,
        input.bundle.rootPath
    );

    diagnostics.forEach((diagnostic) => {
        assertNoSourceLeak(diagnostic.message);
        if (diagnostic.path) {
            assertNoSourceLeak(diagnostic.path);
        }
    });

    return {
        diagram,
        framework: 'rails',
        diagnostics,
    };
};

export { FOXALDB_DO_NOT_EXPOSE_RAILS_SOURCE };
