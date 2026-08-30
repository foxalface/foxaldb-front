import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as ClientModule from '@/lib/api/client';
import { ApiError } from '@/lib/api/client';
import { DatabaseType } from '@/lib/domain/database-type';
import {
    FOXALDB_DO_NOT_EXPOSE_PROJECT_SOURCE,
    createValidProjectImportApiResponse,
} from './fixtures/project-import-api-response';
import type { ProjectImportValidationRejectedError } from '../project-import-errors';
import {
    InvalidRemoteProjectFrameworkError,
    ProjectImportNetworkError,
    ProjectImportParserUnavailableError,
    ProjectImportRemoteFailureError,
    ProjectImportUnauthenticatedError,
} from '../project-import-errors';
import {
    mapRemoteProjectImportError,
    parseRemoteProject,
} from '../remote/parse-remote-project';

const { apiRequestMock } = vi.hoisted(() => ({
    apiRequestMock: vi.fn(),
}));

vi.mock('@/lib/api/client', async () => {
    const actual = (await vi.importActual(
        '@/lib/api/client'
    )) as typeof ClientModule;

    return {
        ...actual,
        apiRequest: apiRequestMock,
    };
});

describe('parseRemoteProject', () => {
    beforeEach(() => {
        apiRequestMock.mockReset();
    });

    const bundleFiles = [
        {
            relativePath:
                'database/migrations/2024_01_01_000000_create_users_table.php',
            content: FOXALDB_DO_NOT_EXPOSE_PROJECT_SOURCE,
        },
    ];

    it('posts JSON bundle to the project import endpoint', async () => {
        apiRequestMock.mockResolvedValueOnce(
            createValidProjectImportApiResponse('laravel')
        );

        await parseRemoteProject({
            framework: 'laravel',
            files: bundleFiles,
            rootPath: 'apps/api',
            targetDatabaseType: DatabaseType.MYSQL,
        });

        expect(apiRequestMock).toHaveBeenCalledWith('/project-import/parse', {
            method: 'POST',
            data: {
                framework: 'laravel',
                files: [
                    {
                        path: bundleFiles[0].relativePath,
                        content: bundleFiles[0].content,
                    },
                ],
                rootPath: 'apps/api',
                targetDatabaseType: DatabaseType.MYSQL,
            },
        });
    });

    it('omits rootPath when the candidate root is the archive root', async () => {
        apiRequestMock.mockResolvedValueOnce(
            createValidProjectImportApiResponse('django')
        );

        await parseRemoteProject({
            framework: 'django',
            files: [
                { relativePath: 'manage.py', content: '#!/usr/bin/env python' },
            ],
            rootPath: '',
            targetDatabaseType: DatabaseType.POSTGRESQL,
        });

        expect(apiRequestMock).toHaveBeenCalledWith('/project-import/parse', {
            method: 'POST',
            data: {
                framework: 'django',
                files: [
                    { path: 'manage.py', content: '#!/usr/bin/env python' },
                ],
                targetDatabaseType: DatabaseType.POSTGRESQL,
            },
        });
    });

    it('rejects local frameworks before making a network request', async () => {
        await expect(
            parseRemoteProject({
                framework: 'prisma',
                files: bundleFiles,
                rootPath: '',
                targetDatabaseType: DatabaseType.MYSQL,
            })
        ).rejects.toBeInstanceOf(InvalidRemoteProjectFrameworkError);

        expect(apiRequestMock).not.toHaveBeenCalled();
    });

    it('does not send ZIP, File, Blob, or FormData payloads', async () => {
        apiRequestMock.mockResolvedValueOnce(
            createValidProjectImportApiResponse('entity_framework_core')
        );

        await parseRemoteProject({
            framework: 'entity_framework_core',
            files: bundleFiles,
            rootPath: '',
            targetDatabaseType: DatabaseType.SQL_SERVER,
        });

        const [, options] = apiRequestMock.mock.calls[0] as [
            string,
            { data: unknown },
        ];

        expect(options.data).not.toBeInstanceOf(FormData);
        expect(options.data).not.toBeInstanceOf(Blob);
        expect(options.data).not.toBeInstanceOf(File);
        expect(JSON.stringify(options.data)).not.toContain('PK');
    });

    it('maps backend 401 responses to unauthenticated errors', async () => {
        apiRequestMock.mockRejectedValueOnce(
            new ApiError('Unauthenticated.', 401, {
                message: 'Unauthenticated.',
            })
        );

        await expect(
            parseRemoteProject({
                framework: 'laravel',
                files: bundleFiles,
                rootPath: '',
                targetDatabaseType: DatabaseType.MYSQL,
            })
        ).rejects.toBeInstanceOf(ProjectImportUnauthenticatedError);
    });

    it('maps backend 422 responses to validation rejected errors', async () => {
        apiRequestMock.mockRejectedValueOnce(
            new ApiError('Unsafe path.', 422, {
                message: 'Unsafe path.',
                code: 'unsafe_path',
                path: '../secret.php',
            })
        );

        await expect(
            parseRemoteProject({
                framework: 'laravel',
                files: bundleFiles,
                rootPath: '',
                targetDatabaseType: DatabaseType.MYSQL,
            })
        ).rejects.toMatchObject({
            code: 'project_import_validation_rejected',
            path: '../secret.php',
        } satisfies Partial<ProjectImportValidationRejectedError>);
    });

    it('maps backend 501 parser-unavailable responses', async () => {
        apiRequestMock.mockRejectedValueOnce(
            new ApiError(
                'Project parser is not available for this framework.',
                501,
                {
                    message:
                        'Project parser is not available for this framework.',
                    code: 'project_parser_unavailable',
                }
            )
        );

        await expect(
            parseRemoteProject({
                framework: 'laravel',
                files: bundleFiles,
                rootPath: '',
                targetDatabaseType: DatabaseType.MYSQL,
            })
        ).rejects.toBeInstanceOf(ProjectImportParserUnavailableError);
    });

    it('maps network failures to project import network errors', () => {
        expect(() =>
            mapRemoteProjectImportError(new TypeError('Failed to fetch'))
        ).toThrow(ProjectImportNetworkError);
    });

    it('maps unexpected remote failures to remote failure errors', () => {
        expect(() =>
            mapRemoteProjectImportError(new ApiError('Server error', 500, {}))
        ).toThrow(ProjectImportRemoteFailureError);
    });

    it('never exposes project source content in thrown errors', async () => {
        apiRequestMock.mockRejectedValueOnce(
            new ApiError('Unsafe path.', 422, {
                message: 'Unsafe path.',
                code: 'unsafe_path',
                path: 'database/migrations/2024_01_01_000000_create_users_table.php',
            })
        );

        try {
            await parseRemoteProject({
                framework: 'laravel',
                files: bundleFiles,
                rootPath: '',
                targetDatabaseType: DatabaseType.MYSQL,
            });
        } catch (error) {
            expect(JSON.stringify(error)).not.toContain(
                FOXALDB_DO_NOT_EXPOSE_PROJECT_SOURCE
            );
        }
    });
});
