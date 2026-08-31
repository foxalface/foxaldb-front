import { DatabaseType } from '@/lib/domain/database-type';
import { detectDatabaseType, sqlImportToDiagram } from '@/lib/data/sql-import';
import type {
    ProjectImportInput,
    ProjectImportResult,
} from '../../project-execution-types';
import { FOXALDB_DO_NOT_EXPOSE_DRIZZLE_SOURCE } from './drizzle-constants';
import {
    detectDrizzleSourceDialect,
    isDrizzleMigrationSqlPath,
    orderDrizzleMigrationSqlFiles,
} from './drizzle-migration-order';

export class DrizzleProjectParseFailedError extends Error {
    readonly diagnostics: ProjectImportResult['diagnostics'];

    constructor(
        message: string,
        diagnostics: ProjectImportResult['diagnostics'] = []
    ) {
        super(message);
        this.name = 'DrizzleProjectParseFailedError';
        this.diagnostics = diagnostics;
    }
}

const assertNoSourceLeak = (value: string): void => {
    if (value.includes(FOXALDB_DO_NOT_EXPOSE_DRIZZLE_SOURCE)) {
        throw new Error('Drizzle source leakage detected.');
    }
};

const mapDrizzleDialectToDatabaseType = (
    dialect: string | null
): DatabaseType | null => {
    switch (dialect?.toLowerCase()) {
        case 'postgresql':
        case 'pg':
            return DatabaseType.POSTGRESQL;
        case 'mysql':
            return DatabaseType.MYSQL;
        case 'sqlite':
            return DatabaseType.SQLITE;
        case 'sql_server':
        case 'mssql':
            return DatabaseType.SQL_SERVER;
        default:
            return null;
    }
};

const selectConfigContent = (
    files: ProjectImportInput['bundle']['files']
): string | null => {
    const configFile = files.find((file) =>
        /^drizzle\.config\.(ts|js|mjs|cjs)$/.test(
            file.relativePath.slice(file.relativePath.lastIndexOf('/') + 1)
        )
    );

    return configFile?.content ?? null;
};

const resolveDiagramName = (rootPath: string): string => {
    const segments = rootPath.split('/').filter(Boolean);
    const basename = segments.at(-1) ?? 'project';

    return `${basename} Import`;
};

export const parseDrizzleProject = async (
    input: ProjectImportInput
): Promise<ProjectImportResult> => {
    const migrationSqlFiles = input.bundle.files.filter((file) =>
        isDrizzleMigrationSqlPath(file.relativePath)
    );

    if (migrationSqlFiles.length === 0) {
        throw new DrizzleProjectParseFailedError(
            'No Drizzle migration SQL files were found in the selected project bundle.',
            [
                {
                    severity: 'error',
                    code: 'drizzle_migration_missing',
                    message:
                        'At least one Drizzle migration SQL file is required for import.',
                    path: 'drizzle',
                },
            ]
        );
    }

    const { orderedFiles, journalDialect, diagnostics } =
        orderDrizzleMigrationSqlFiles(
            input.bundle.files,
            input.bundle.rootPath
        );

    if (orderedFiles.length === 0) {
        throw new DrizzleProjectParseFailedError(
            'No usable Drizzle migration SQL files could be ordered for import.',
            [
                {
                    severity: 'error',
                    code: 'drizzle_migration_missing',
                    message:
                        'Drizzle migration SQL files were present but could not be ordered.',
                },
            ]
        );
    }

    const combinedSql = orderedFiles
        .map((file) => file.content.trim())
        .filter((content) => content.length > 0)
        .join('\n\n');

    if (combinedSql.length === 0) {
        throw new DrizzleProjectParseFailedError(
            'Drizzle migration SQL files were empty.',
            [
                {
                    severity: 'error',
                    code: 'drizzle_unsupported_sql',
                    message:
                        'Drizzle migration SQL files did not contain any statements.',
                },
            ]
        );
    }

    const configContent = selectConfigContent(input.bundle.files);
    const configuredDialect = detectDrizzleSourceDialect(
        journalDialect,
        configContent
    );
    const configuredSourceType =
        mapDrizzleDialectToDatabaseType(configuredDialect);
    const detectedSourceType = detectDatabaseType(combinedSql);
    const sourceDatabaseType =
        configuredSourceType ?? detectedSourceType ?? DatabaseType.POSTGRESQL;

    if (
        configuredSourceType &&
        detectedSourceType &&
        configuredSourceType !== detectedSourceType
    ) {
        diagnostics.push({
            severity: 'warning',
            code: 'drizzle_source_dialect_mismatch',
            message:
                'Drizzle configuration dialect differs from detected SQL syntax; wizard target database type remains authoritative.',
        });
    }

    let diagram;

    try {
        diagram = await sqlImportToDiagram({
            sqlContent: combinedSql,
            sourceDatabaseType,
            targetDatabaseType: input.targetDatabaseType,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : 'Drizzle migration SQL could not be parsed.';

        assertNoSourceLeak(message);

        throw new DrizzleProjectParseFailedError(message, [
            {
                severity: 'error',
                code: 'drizzle_unsupported_sql',
                message,
            },
        ]);
    }

    if (!diagram.tables || diagram.tables.length === 0) {
        throw new DrizzleProjectParseFailedError(
            'No tables could be reconstructed from Drizzle migration SQL.',
            [
                {
                    severity: 'error',
                    code: 'drizzle_unsupported_sql',
                    message:
                        'Drizzle migration SQL did not produce any usable tables.',
                },
            ]
        );
    }

    const resultDiagnostics = [...diagnostics];

    diagram = {
        ...diagram,
        name: resolveDiagramName(input.bundle.rootPath),
        databaseType: input.targetDatabaseType,
    };

    resultDiagnostics.forEach((diagnostic) => {
        assertNoSourceLeak(diagnostic.message);
        if (diagnostic.path) {
            assertNoSourceLeak(diagnostic.path);
        }
    });

    return {
        diagram,
        framework: 'drizzle',
        diagnostics: resultDiagnostics,
    };
};

export { FOXALDB_DO_NOT_EXPOSE_DRIZZLE_SOURCE };
