import type { ProjectFramework } from '../../project-types';

export const FOXALDB_DO_NOT_EXPOSE_PROJECT_SOURCE =
    'SECRET_MIGRATION_BODY_SHOULD_NEVER_APPEAR_IN_ERRORS';

export const createValidProjectImportApiResponse = (
    framework: ProjectFramework = 'laravel'
) => ({
    data: {
        apiVersion: '1' as const,
        framework,
        diagram: {
            name: 'Imported Diagram',
            databaseType: 'mysql',
            tables: [
                {
                    id: 'table-1',
                    name: 'users',
                    schema: null,
                    x: 0,
                    y: 0,
                    fields: [],
                    indexes: [],
                    color: '#ffffff',
                    isView: false,
                    createdAt: 0,
                    width: 200,
                    comments: null,
                    order: 0,
                },
            ],
            relationships: [],
            dependencies: [],
            areas: [],
            customTypes: [],
            notes: [],
        },
        diagnostics: [] as Array<{
            severity: 'info' | 'warning' | 'error';
            code: string;
            message: string;
            path?: string;
        }>,
    },
});
