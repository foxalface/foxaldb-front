import type { ProjectDetectionCandidate } from './project-types';

export type ProjectSummaryMetricKind = 'migrations' | 'schema';

export interface ProjectSummaryMetrics {
    kind: ProjectSummaryMetricKind;
    count: number;
}

export const getProjectSummaryMetrics = (
    candidate: ProjectDetectionCandidate
): ProjectSummaryMetrics => {
    const { framework, relevantFiles } = candidate;

    if (framework === 'prisma') {
        const schemaCount = relevantFiles.filter((filePath) =>
            filePath.endsWith('.prisma')
        ).length;

        return {
            kind: 'schema',
            count: Math.max(schemaCount, 1),
        };
    }

    if (framework === 'drizzle') {
        const sqlCount = relevantFiles.filter((filePath) =>
            filePath.endsWith('.sql')
        ).length;

        return {
            kind: 'schema',
            count: Math.max(sqlCount, 1),
        };
    }

    if (framework === 'rails') {
        const hasSchema = relevantFiles.some((filePath) =>
            filePath.endsWith('db/schema.rb')
        );

        if (hasSchema) {
            return { kind: 'schema', count: 1 };
        }
    }

    const migrationCount = relevantFiles.filter((filePath) => {
        if (framework === 'laravel') {
            return (
                filePath.includes('/database/migrations/') &&
                filePath.endsWith('.php')
            );
        }

        if (framework === 'django') {
            return (
                filePath.includes('/migrations/') &&
                filePath.endsWith('.py') &&
                !filePath.endsWith('/__init__.py')
            );
        }

        if (framework === 'entity_framework_core') {
            return (
                filePath.includes('/Migrations/') &&
                filePath.endsWith('Migration.cs')
            );
        }

        if (framework === 'rails') {
            return (
                filePath.includes('/db/migrate/') && filePath.endsWith('.rb')
            );
        }

        return false;
    }).length;

    return {
        kind: 'migrations',
        count: migrationCount,
    };
};
