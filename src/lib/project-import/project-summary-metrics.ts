import { getCandidateImportPaths } from './bundle/candidate-import-paths';
import type { ProjectDetectionCandidate } from './project-types';

export type ProjectSourceFileKind =
    | 'migrations'
    | 'schema'
    | 'model_snapshot'
    | 'sql_migrations';

export interface ProjectSummaryMetrics {
    sourceFileKind: ProjectSourceFileKind;
    count: number;
}

const PROJECT_SUMMARY_METRIC_KEYS: Record<ProjectSourceFileKind, string> = {
    migrations: 'new_diagram_dialog.import_schema.project.migrations_found',
    schema: 'new_diagram_dialog.import_schema.project.schema_files_found',
    model_snapshot:
        'new_diagram_dialog.import_schema.project.model_snapshots_found',
    sql_migrations:
        'new_diagram_dialog.import_schema.project.sql_migrations_found',
};

const PROJECT_SUMMARY_METRIC_BUTTON_KEYS: Record<
    ProjectSourceFileKind,
    string
> = {
    migrations: 'new_diagram_dialog.import_schema.project.migrations_button',
    schema: 'new_diagram_dialog.import_schema.project.schema_files_button',
    model_snapshot:
        'new_diagram_dialog.import_schema.project.model_snapshots_button',
    sql_migrations:
        'new_diagram_dialog.import_schema.project.sql_migrations_button',
};

export const getProjectSummaryMetricTranslationKey = (
    metrics: ProjectSummaryMetrics
): string => PROJECT_SUMMARY_METRIC_KEYS[metrics.sourceFileKind];

export const getProjectSummaryMetricButtonTranslationKey = (
    metrics: ProjectSummaryMetrics
): string => PROJECT_SUMMARY_METRIC_BUTTON_KEYS[metrics.sourceFileKind];

const countLaravelMigrations = (importPaths: string[]): number =>
    importPaths.filter(
        (relativePath) =>
            relativePath.startsWith('database/migrations/') &&
            relativePath.endsWith('.php')
    ).length;

const countDjangoMigrations = (importPaths: string[]): number =>
    importPaths.filter(
        (relativePath) =>
            relativePath.includes('/migrations/') &&
            relativePath.endsWith('.py') &&
            !relativePath.endsWith('/__init__.py')
    ).length;

const countEfModelSnapshots = (importPaths: string[]): number =>
    importPaths.filter((relativePath) =>
        relativePath.endsWith('ModelSnapshot.cs')
    ).length;

const countPrismaSchemaFiles = (importPaths: string[]): number =>
    importPaths.filter((relativePath) => relativePath.endsWith('.prisma'))
        .length;

const countRailsSchemaFiles = (importPaths: string[]): number =>
    importPaths.some((relativePath) => relativePath.endsWith('db/schema.rb'))
        ? 1
        : 0;

const countDrizzleSqlMigrations = (importPaths: string[]): number =>
    importPaths.filter((relativePath) => relativePath.endsWith('.sql')).length;

export const getProjectSummaryMetrics = (
    candidate: ProjectDetectionCandidate
): ProjectSummaryMetrics => {
    const importPaths = getCandidateImportPaths(candidate);

    switch (candidate.framework) {
        case 'laravel':
            return {
                sourceFileKind: 'migrations',
                count: countLaravelMigrations(importPaths),
            };
        case 'django':
            return {
                sourceFileKind: 'migrations',
                count: countDjangoMigrations(importPaths),
            };
        case 'entity_framework_core':
            return {
                sourceFileKind: 'model_snapshot',
                count: countEfModelSnapshots(importPaths),
            };
        case 'prisma':
            return {
                sourceFileKind: 'schema',
                count: Math.max(countPrismaSchemaFiles(importPaths), 1),
            };
        case 'rails':
            return {
                sourceFileKind: 'schema',
                count: Math.max(countRailsSchemaFiles(importPaths), 1),
            };
        case 'drizzle':
            return {
                sourceFileKind: 'sql_migrations',
                count: Math.max(countDrizzleSqlMigrations(importPaths), 1),
            };
        default:
            return {
                sourceFileKind: 'migrations',
                count: 0,
            };
    }
};
