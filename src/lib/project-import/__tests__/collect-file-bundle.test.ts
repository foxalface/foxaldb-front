import { describe, expect, it } from 'vitest';
import { ArchiveReader } from '../archive/archive-reader';
import { collectFileBundle } from '../bundle/collect-file-bundle';
import type { ProjectDetectionCandidate } from '../project-types';
import { createTestZipFile } from './fixtures/build-test-zip';

const collectForFramework = async (
    files: Record<string, string>,
    candidate: Omit<
        ProjectDetectionCandidate,
        'score' | 'confidence' | 'evidence' | 'parserLocation'
    >
) => {
    const file = createTestZipFile(files);
    const archive = await ArchiveReader.open(file);
    const bundle = await collectFileBundle(archive, {
        ...candidate,
        score: 20,
        confidence: 'high',
        evidence: [],
        parserLocation: 'local',
    });
    archive.close();
    return bundle;
};

describe('collectFileBundle', () => {
    it('collects only Laravel migration files and optional composer.json', async () => {
        const bundle = await collectForFramework(
            {
                'database/migrations/2024_01_01_000000_create_users_table.php':
                    '<?php',
                'composer.json': '{"require":{"laravel/framework":"^11.0"}}',
                'app/Models/User.php': '<?php',
                'vendor/laravel/framework/src/Application.php': '<?php',
                '.env': 'APP_KEY=secret',
                'tests/Feature/ExampleTest.php': '<?php',
            },
            {
                framework: 'laravel',
                rootPath: '',
                relevantFiles: [
                    'database/migrations/2024_01_01_000000_create_users_table.php',
                    'composer.json',
                    'app/Models/User.php',
                ],
            }
        );

        const paths = bundle.files.map((entry) => entry.relativePath).sort();

        expect(paths).toEqual([
            'composer.json',
            'database/migrations/2024_01_01_000000_create_users_table.php',
        ]);
    });

    it('strips project root prefix for nested Laravel project', async () => {
        const bundle = await collectForFramework(
            {
                'apps/api/database/migrations/2024_01_01_000000_create_users_table.php':
                    '<?php',
                'apps/api/composer.json':
                    '{"require":{"laravel/framework":"^11.0"}}',
            },
            {
                framework: 'laravel',
                rootPath: 'apps/api',
                relevantFiles: [
                    'apps/api/database/migrations/2024_01_01_000000_create_users_table.php',
                    'apps/api/composer.json',
                ],
            }
        );

        expect(bundle.files.map((entry) => entry.relativePath)).toEqual([
            'composer.json',
            'database/migrations/2024_01_01_000000_create_users_table.php',
        ]);
    });

    it('collects Prisma schema and migration files only', async () => {
        const bundle = await collectForFramework(
            {
                'prisma/schema.prisma': 'model User { id Int @id }',
                'prisma/migrations/20240101000000_init/migration.sql':
                    'CREATE TABLE "User" ("id" INTEGER NOT NULL);',
                'package.json': '{"dependencies":{"@prisma/client":"^5.0.0"}}',
                'src/index.ts': 'export {}',
            },
            {
                framework: 'prisma',
                rootPath: '',
                relevantFiles: [
                    'prisma/schema.prisma',
                    'prisma/migrations/20240101000000_init/migration.sql',
                    'package.json',
                    'src/index.ts',
                ],
            }
        );

        const paths = bundle.files.map((entry) => entry.relativePath).sort();

        expect(paths).toEqual([
            'package.json',
            'prisma/migrations/20240101000000_init/migration.sql',
            'prisma/schema.prisma',
        ]);
    });

    it('collects Drizzle SQL, journal, and config files', async () => {
        const bundle = await collectForFramework(
            {
                'drizzle.config.ts': 'export default {}',
                'drizzle/meta/_journal.json': '{"version":"7"}',
                'drizzle/0000_init.sql': 'CREATE TABLE users (id int);',
                'src/db.ts': 'export {}',
            },
            {
                framework: 'drizzle',
                rootPath: '',
                relevantFiles: [
                    'drizzle.config.ts',
                    'drizzle/meta/_journal.json',
                    'drizzle/0000_init.sql',
                    'src/db.ts',
                ],
            }
        );

        const paths = bundle.files.map((entry) => entry.relativePath).sort();

        expect(paths).toEqual([
            'drizzle.config.ts',
            'drizzle/0000_init.sql',
            'drizzle/meta/_journal.json',
        ]);
    });

    it('collects Rails schema.rb and optional database.yml', async () => {
        const bundle = await collectForFramework(
            {
                'db/schema.rb': 'ActiveRecord::Schema.define { }',
                'config/database.yml': 'default: &default',
                'app/models/user.rb': 'class User < ApplicationRecord; end',
            },
            {
                framework: 'rails',
                rootPath: '',
                relevantFiles: [
                    'db/schema.rb',
                    'config/database.yml',
                    'app/models/user.rb',
                ],
            }
        );

        const paths = bundle.files.map((entry) => entry.relativePath).sort();

        expect(paths).toEqual(['config/database.yml', 'db/schema.rb']);
    });

    it('collects EF Core snapshots, migrations, and csproj only', async () => {
        const bundle = await collectForFramework(
            {
                'AppDbContextModelSnapshot.cs': 'partial class Snapshot {}',
                'Migrations/20240101000000_InitialMigration.cs':
                    'partial class InitialMigration {}',
                'App.csproj':
                    '<PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.0.0" />',
                'Program.cs': 'class Program {}',
            },
            {
                framework: 'entity_framework_core',
                rootPath: '',
                relevantFiles: [
                    'AppDbContextModelSnapshot.cs',
                    'Migrations/20240101000000_InitialMigration.cs',
                    'App.csproj',
                    'Program.cs',
                ],
            }
        );

        const paths = bundle.files.map((entry) => entry.relativePath).sort();

        expect(paths).toEqual([
            'App.csproj',
            'AppDbContextModelSnapshot.cs',
            'Migrations/20240101000000_InitialMigration.cs',
        ]);
    });

    it('collects Django migrations and optional dependency files', async () => {
        const bundle = await collectForFramework(
            {
                'app/migrations/0001_initial.py':
                    'from django.db import migrations',
                'app/migrations/__init__.py': '',
                'settings.py': 'SECRET_KEY = "x"',
                'pyproject.toml': 'Django>=5.0',
                'app/views.py': 'from django.http import HttpResponse',
            },
            {
                framework: 'django',
                rootPath: '',
                relevantFiles: [
                    'app/migrations/0001_initial.py',
                    'app/migrations/__init__.py',
                    'settings.py',
                    'pyproject.toml',
                    'app/views.py',
                ],
            }
        );

        const paths = bundle.files.map((entry) => entry.relativePath).sort();

        expect(paths).toEqual([
            'app/migrations/0001_initial.py',
            'pyproject.toml',
            'settings.py',
        ]);
    });

    it('rejects duplicate relative paths deterministically', async () => {
        const bundle = await collectForFramework(
            {
                'prisma/schema.prisma': 'model User { id Int @id }',
            },
            {
                framework: 'prisma',
                rootPath: '',
                relevantFiles: ['prisma/schema.prisma', 'prisma/schema.prisma'],
            }
        );

        expect(bundle.files).toHaveLength(1);
        expect(bundle.files[0]?.relativePath).toBe('prisma/schema.prisma');
    });
});
