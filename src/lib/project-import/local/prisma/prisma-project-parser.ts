import type {
    ProjectImportInput,
    ProjectImportResult,
} from '../../project-execution-types';
import { FOXALDB_DO_NOT_EXPOSE_PRISMA_SOURCE } from './prisma-constants';
import { buildDiagramFromPrismaSchema } from './prisma-diagram-builder';
import {
    PrismaSchemaParseError,
    parsePrismaSchema,
    reclassifyDocumentFieldKinds,
} from './prisma-schema-parser';

export class PrismaProjectParseFailedError extends Error {
    readonly diagnostics: ProjectImportResult['diagnostics'];

    constructor(
        message: string,
        diagnostics: ProjectImportResult['diagnostics'] = []
    ) {
        super(message);
        this.name = 'PrismaProjectParseFailedError';
        this.diagnostics = diagnostics;
    }
}

const selectSchemaFile = (
    files: ProjectImportInput['bundle']['files']
): { relativePath: string; content: string } => {
    const schemaFiles = files.filter(
        (file) =>
            file.relativePath === 'prisma/schema.prisma' ||
            file.relativePath.endsWith('/prisma/schema.prisma')
    );

    if (schemaFiles.length === 0) {
        throw new PrismaProjectParseFailedError(
            'schema.prisma is required for Prisma project import.',
            [
                {
                    severity: 'error',
                    code: 'prisma_parse_warning',
                    message:
                        'schema.prisma was not found in the selected project bundle.',
                    path: 'schema.prisma',
                },
            ]
        );
    }

    const canonical = schemaFiles.find(
        (file) => file.relativePath === 'prisma/schema.prisma'
    );

    if (schemaFiles.length > 1 && !canonical) {
        throw new PrismaProjectParseFailedError(
            'Multiple schema.prisma files were found; unable to choose an authoritative schema.',
            [
                {
                    severity: 'error',
                    code: 'prisma_parse_warning',
                    message:
                        'Multiple schema.prisma files were found in the selected project bundle.',
                    path: 'schema.prisma',
                },
            ]
        );
    }

    return canonical ?? schemaFiles[0];
};

const assertNoSourceLeak = (value: string): void => {
    if (value.includes(FOXALDB_DO_NOT_EXPOSE_PRISMA_SOURCE)) {
        throw new Error('Prisma source leakage detected.');
    }
};

export const parsePrismaProject = async (
    input: ProjectImportInput
): Promise<ProjectImportResult> => {
    const schemaFile = selectSchemaFile(input.bundle.files);

    let document;

    try {
        document = reclassifyDocumentFieldKinds(
            parsePrismaSchema(schemaFile.content)
        );
    } catch (error) {
        const message =
            error instanceof PrismaSchemaParseError
                ? 'The Prisma schema could not be parsed.'
                : 'The Prisma schema is malformed.';

        assertNoSourceLeak(message);

        throw new PrismaProjectParseFailedError(message, [
            {
                severity: 'error',
                code: 'prisma_parse_warning',
                message,
                path: schemaFile.relativePath,
            },
        ]);
    }

    if (document.models.length === 0) {
        throw new PrismaProjectParseFailedError(
            'No Prisma models could be reconstructed from schema.prisma.',
            [
                {
                    severity: 'error',
                    code: 'prisma_parse_warning',
                    message:
                        'No usable Prisma models were found in schema.prisma.',
                    path: schemaFile.relativePath,
                },
            ]
        );
    }

    const usableModels = document.models.filter((model) =>
        model.fields.some(
            (field) => field.kind === 'scalar' || field.kind === 'enum'
        )
    );

    if (usableModels.length === 0) {
        throw new PrismaProjectParseFailedError(
            'No usable Prisma models could be reconstructed from schema.prisma.',
            [
                {
                    severity: 'error',
                    code: 'prisma_parse_warning',
                    message:
                        'Prisma models were found but no scalar columns could be reconstructed.',
                    path: schemaFile.relativePath,
                },
            ]
        );
    }

    const { diagram, diagnostics } = buildDiagramFromPrismaSchema(
        document,
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
        framework: 'prisma',
        diagnostics,
    };
};

export { FOXALDB_DO_NOT_EXPOSE_PRISMA_SOURCE };
