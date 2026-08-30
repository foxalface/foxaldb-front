import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import { ArchiveReader } from '../archive/archive-reader';
import { importProject } from '../import-project';
import { ProjectImportParserUnavailableError } from '../project-import-errors';
import type { ProjectDetectionCandidate } from '../project-types';
import { createTestZipFile } from './fixtures/build-test-zip';

const {
    isProjectImportParserAvailableMock,
    parseLocalProjectMock,
    parseRemoteProjectMock,
} = vi.hoisted(() => ({
    isProjectImportParserAvailableMock: vi.fn(),
    parseLocalProjectMock: vi.fn(),
    parseRemoteProjectMock: vi.fn(),
}));

vi.mock('../project-import-capability', async () => {
    const actual = await vi.importActual('../project-import-capability');

    return {
        ...actual,
        isProjectImportParserAvailable: isProjectImportParserAvailableMock,
    };
});

vi.mock('../local/local-project-parser', () => ({
    parseLocalProject: parseLocalProjectMock,
}));

vi.mock('../remote/parse-remote-project', () => ({
    parseRemoteProject: parseRemoteProjectMock,
}));

const baseCandidate = (
    framework: ProjectDetectionCandidate['framework']
): ProjectDetectionCandidate => ({
    framework,
    rootPath: '',
    relevantFiles: ['composer.json'],
    score: 20,
    confidence: 'high',
    evidence: [],
    parserLocation: framework === 'prisma' ? 'local' : 'remote',
});

describe('importProject', () => {
    beforeEach(() => {
        isProjectImportParserAvailableMock.mockReset();
        parseLocalProjectMock.mockReset();
        parseRemoteProjectMock.mockReset();
        isProjectImportParserAvailableMock.mockReturnValue(false);
    });

    it('returns parser unavailable when execution is disabled', async () => {
        const file = createTestZipFile({
            'composer.json': '{"require":{"laravel/framework":"^11.0"}}',
            'database/migrations/2024_01_01_000000_create_users_table.php':
                '<?php',
        });
        const archive = await ArchiveReader.open(file);

        await expect(
            importProject({
                archive,
                candidate: baseCandidate('laravel'),
                targetDatabaseType: DatabaseType.MYSQL,
            })
        ).rejects.toBeInstanceOf(ProjectImportParserUnavailableError);

        expect(parseRemoteProjectMock).not.toHaveBeenCalled();
        expect(parseLocalProjectMock).not.toHaveBeenCalled();

        archive.close();
    });

    it.each(['laravel', 'entity_framework_core', 'django'] as const)(
        'dispatches %s to remote execution',
        async (framework) => {
            isProjectImportParserAvailableMock.mockReturnValue(true);
            parseRemoteProjectMock.mockResolvedValueOnce({
                diagram: {
                    id: '',
                    name: 'Imported',
                    databaseType: DatabaseType.MYSQL,
                },
                framework,
                diagnostics: [],
            });

            const file = createTestZipFile({
                'composer.json': '{"require":{"laravel/framework":"^11.0"}}',
                'database/migrations/2024_01_01_000000_create_users_table.php':
                    '<?php',
            });
            const archive = await ArchiveReader.open(file);

            await importProject({
                archive,
                candidate: baseCandidate(framework),
                targetDatabaseType: DatabaseType.MYSQL,
            });

            expect(parseRemoteProjectMock).toHaveBeenCalledOnce();
            expect(parseLocalProjectMock).not.toHaveBeenCalled();

            archive.close();
        }
    );

    it('dispatches prisma to local execution when enabled', async () => {
        isProjectImportParserAvailableMock.mockReturnValue(true);
        parseLocalProjectMock.mockResolvedValueOnce({
            diagram: {
                id: '',
                name: 'Prisma Import',
                databaseType: DatabaseType.POSTGRESQL,
            },
            framework: 'prisma',
            diagnostics: [],
        });

        const file = createTestZipFile({
            'prisma/schema.prisma': 'model User { id Int @id }',
        });
        const archive = await ArchiveReader.open(file);

        await importProject({
            archive,
            candidate: baseCandidate('prisma'),
            targetDatabaseType: DatabaseType.POSTGRESQL,
        });

        expect(parseLocalProjectMock).toHaveBeenCalledOnce();
        expect(parseRemoteProjectMock).not.toHaveBeenCalled();

        archive.close();
    });

    it.each(['prisma', 'rails', 'drizzle'] as const)(
        'dispatches %s to local execution',
        async (framework) => {
            isProjectImportParserAvailableMock.mockReturnValue(true);
            parseLocalProjectMock.mockRejectedValueOnce(
                new ProjectImportParserUnavailableError()
            );

            const file = createTestZipFile({
                'prisma/schema.prisma': 'model User { id Int @id }',
            });
            const archive = await ArchiveReader.open(file);

            await expect(
                importProject({
                    archive,
                    candidate: baseCandidate(framework),
                    targetDatabaseType: DatabaseType.POSTGRESQL,
                })
            ).rejects.toBeInstanceOf(ProjectImportParserUnavailableError);

            expect(parseLocalProjectMock).toHaveBeenCalledOnce();
            expect(parseRemoteProjectMock).not.toHaveBeenCalled();

            archive.close();
        }
    );

    it('preserves bundle-relative paths for remote requests', async () => {
        isProjectImportParserAvailableMock.mockReturnValue(true);
        parseRemoteProjectMock.mockResolvedValueOnce({
            diagram: {
                id: '',
                name: 'Imported',
                databaseType: DatabaseType.MYSQL,
            },
            framework: 'laravel',
            diagnostics: [],
        });

        const file = createTestZipFile({
            'apps/api/composer.json':
                '{"require":{"laravel/framework":"^11.0"}}',
            'apps/api/database/migrations/2024_01_01_000000_create_users_table.php':
                '<?php',
        });
        const archive = await ArchiveReader.open(file);

        await importProject({
            archive,
            candidate: {
                ...baseCandidate('laravel'),
                rootPath: 'apps/api',
                relevantFiles: [
                    'apps/api/composer.json',
                    'apps/api/database/migrations/2024_01_01_000000_create_users_table.php',
                ],
            },
            targetDatabaseType: DatabaseType.MYSQL,
        });

        expect(parseRemoteProjectMock).toHaveBeenCalledWith(
            expect.objectContaining({
                rootPath: 'apps/api',
                files: expect.arrayContaining([
                    expect.objectContaining({
                        relativePath:
                            'database/migrations/2024_01_01_000000_create_users_table.php',
                    }),
                ]),
            })
        );

        const remoteCall = parseRemoteProjectMock.mock.calls[0]?.[0] as {
            files: Array<{ relativePath: string }>;
        };

        expect(
            remoteCall.files.some((entry) =>
                entry.relativePath.startsWith('apps/api/')
            )
        ).toBe(false);

        archive.close();
    });
});
