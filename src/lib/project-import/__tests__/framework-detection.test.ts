import { describe, expect, it } from 'vitest';
import { ArchiveReader } from '../archive/archive-reader';
import { detectProjectCandidates } from '../detection/detect-project';
import { analyzeProjectArchive } from '../analyze-project-archive';
import { collectFileBundle } from '../bundle/collect-file-bundle';
import { getProjectCandidateKey } from '../framework-labels';
import { createTestZipFile } from './fixtures/build-test-zip';

const detectFromZip = async (files: Record<string, string>) => {
    const file = createTestZipFile(files);
    const archive = await ArchiveReader.open(file);
    const candidates = await detectProjectCandidates(archive);
    return { archive, candidates };
};

describe('framework detectors', () => {
    it('detects Laravel with high confidence from artisan, composer, and migrations', async () => {
        const { candidates, archive } = await detectFromZip({
            artisan: '#!/usr/bin/env php',
            'composer.json': '{"require":{"laravel/framework":"^11.0"}}',
            'database/migrations/2024_01_01_000000_create_users_table.php':
                '<?php',
            'database/migrations/2024_01_02_000000_create_posts_table.php':
                '<?php',
        });

        const laravel = candidates.find(
            (candidate) => candidate.framework === 'laravel'
        );

        expect(laravel).toBeDefined();
        expect(laravel?.confidence).toBe('high');
        expect(laravel?.rootPath).toBe('');
        archive.close();
    });

    it('detects Laravel with lower confidence from migrations only', async () => {
        const { candidates, archive } = await detectFromZip({
            'database/migrations/2024_01_01_000000_create_users_table.php':
                '<?php',
        });

        const laravel = candidates.find(
            (candidate) => candidate.framework === 'laravel'
        );

        expect(laravel).toBeDefined();
        expect(laravel?.confidence).toBe('low');
        archive.close();
    });

    it('does not detect Laravel from generic PHP files', async () => {
        const { candidates, archive } = await detectFromZip({
            'src/User.php': '<?php class User {}',
            'index.php': '<?php',
        });

        expect(
            candidates.some((candidate) => candidate.framework === 'laravel')
        ).toBe(false);
        archive.close();
    });

    it('detects Prisma with high confidence from schema.prisma', async () => {
        const { candidates, archive } = await detectFromZip({
            'prisma/schema.prisma': 'model User { id Int @id }',
        });

        const prisma = candidates.find(
            (candidate) => candidate.framework === 'prisma'
        );

        expect(prisma?.confidence).toBe('high');
        archive.close();
    });

    it('does not detect Prisma from package.json alone', async () => {
        const { candidates, archive } = await detectFromZip({
            'package.json': '{"dependencies":{"@prisma/client":"^5.0.0"}}',
        });

        const prisma = candidates.find(
            (candidate) => candidate.framework === 'prisma'
        );

        expect(prisma?.confidence).toBe('low');
        archive.close();
    });

    it('detects Drizzle with high confidence from config, journal, and SQL', async () => {
        const { candidates, archive } = await detectFromZip({
            'drizzle.config.ts': 'export default {}',
            'drizzle/meta/_journal.json':
                '{"version":"7","dialect":"postgresql"}',
            'drizzle/0000_init.sql': 'CREATE TABLE users (id int);',
        });

        const drizzle = candidates.find(
            (candidate) => candidate.framework === 'drizzle'
        );

        expect(drizzle?.confidence).toBe('high');
        archive.close();
    });

    it('does not detect Drizzle from generic SQL folder', async () => {
        const { candidates, archive } = await detectFromZip({
            'sql/0001_init.sql': 'CREATE TABLE users (id int);',
        });

        expect(
            candidates.some((candidate) => candidate.framework === 'drizzle')
        ).toBe(false);
        archive.close();
    });

    it('detects Rails with high confidence from schema.rb and Gemfile', async () => {
        const { candidates, archive } = await detectFromZip({
            'db/schema.rb': 'ActiveRecord::Schema.define { }',
            Gemfile: "gem 'rails', '~> 7.1'",
        });

        const rails = candidates.find(
            (candidate) => candidate.framework === 'rails'
        );

        expect(rails?.confidence).toBe('high');
        archive.close();
    });

    it('does not detect Rails from Gemfile alone', async () => {
        const { candidates, archive } = await detectFromZip({
            Gemfile: "gem 'rails', '~> 7.1'",
        });

        const rails = candidates.find(
            (candidate) => candidate.framework === 'rails'
        );

        expect(rails?.confidence).toBe('low');
        archive.close();
    });

    it('detects Entity Framework Core with high confidence', async () => {
        const { candidates, archive } = await detectFromZip({
            'Migrations/AppDbContextModelSnapshot.cs':
                'partial class AppDbContextModelSnapshot { }',
            'Migrations/20240101000000_InitialMigration.cs':
                'partial class InitialMigration { }',
            'App.csproj':
                '<PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.0.0" />',
        });

        const ef = candidates.find(
            (candidate) => candidate.framework === 'entity_framework_core'
        );

        expect(ef?.confidence).toBe('high');
        archive.close();
    });

    it('does not detect EF Core from generic C# files', async () => {
        const { candidates, archive } = await detectFromZip({
            'Program.cs': 'class Program { static void Main() {} }',
            'User.cs': 'class User { public int Id { get; set; } }',
        });

        expect(
            candidates.some(
                (candidate) => candidate.framework === 'entity_framework_core'
            )
        ).toBe(false);
        archive.close();
    });

    it('detects Django with high confidence from manage.py and migrations', async () => {
        const { candidates, archive } = await detectFromZip({
            'manage.py': '#!/usr/bin/env python',
            'app/migrations/0001_initial.py':
                'from django.db import migrations',
            'pyproject.toml': 'Django>=5.0',
        });

        const django = candidates.find(
            (candidate) => candidate.framework === 'django'
        );

        expect(django?.confidence).toBe('high');
        archive.close();
    });

    it('does not detect Django from random Python package', async () => {
        const { candidates, archive } = await detectFromZip({
            'mypkg/__init__.py': '',
            'mypkg/main.py': 'print("hello")',
        });

        expect(
            candidates.some((candidate) => candidate.framework === 'django')
        ).toBe(false);
        archive.close();
    });
});

describe('analyzeProjectArchive ambiguity', () => {
    it('returns ambiguous status for monorepo with Laravel and Prisma', async () => {
        const file = createTestZipFile({
            'repo/apps/api/artisan': '#!/usr/bin/env php',
            'repo/apps/api/composer.json':
                '{"require":{"laravel/framework":"^11.0"}}',
            'repo/apps/api/database/migrations/2024_01_01_000000_create_users_table.php':
                '<?php',
            'repo/packages/db/prisma/schema.prisma':
                'model User { id Int @id }',
        });

        const archive = await ArchiveReader.open(file);
        const analysis = await analyzeProjectArchive(archive);

        expect(analysis.status).toBe('ambiguous');
        expect(analysis.candidates.length).toBeGreaterThanOrEqual(2);
        expect(analysis.recommendedCandidate).not.toBeNull();
        archive.close();
    });

    it('collects bundle files only from chosen root', async () => {
        const file = createTestZipFile({
            'repo/apps/api/artisan': '#!/usr/bin/env php',
            'repo/apps/api/composer.json':
                '{"require":{"laravel/framework":"^11.0"}}',
            'repo/apps/api/database/migrations/2024_01_01_000000_create_users_table.php':
                '<?php',
            'repo/apps/api/app/Models/User.php': '<?php class User {}',
            'repo/packages/db/prisma/schema.prisma':
                'model User { id Int @id }',
            'repo/packages/db/.env': 'SECRET=1',
        });

        const archive = await ArchiveReader.open(file);
        const analysis = await analyzeProjectArchive(archive);
        const laravel = analysis.candidates.find(
            (candidate) =>
                candidate.framework === 'laravel' &&
                candidate.rootPath === 'repo/apps/api'
        );

        expect(laravel).toBeDefined();

        const bundle = await collectFileBundle(archive, laravel!);
        const relativePaths = bundle.files.map((entry) => entry.relativePath);

        expect(relativePaths).toContain(
            'database/migrations/2024_01_01_000000_create_users_table.php'
        );
        expect(relativePaths).not.toContain('app/Models/User.php');
        expect(relativePaths.some((path) => path.includes('.env'))).toBe(false);
        expect(relativePaths.some((path) => path.includes('prisma'))).toBe(
            false
        );

        archive.close();
    });

    it('uses distinct candidate keys for same-framework multiple roots', async () => {
        const { candidates, archive } = await detectFromZip({
            'apps/a/prisma/schema.prisma': 'model A { id Int @id }',
            'apps/b/prisma/schema.prisma': 'model B { id Int @id }',
        });

        const prismaCandidates = candidates.filter(
            (candidate) =>
                candidate.framework === 'prisma' &&
                (candidate.confidence === 'high' ||
                    candidate.confidence === 'medium')
        );

        expect(prismaCandidates.length).toBe(2);
        expect(
            getProjectCandidateKey(prismaCandidates[0]) !==
                getProjectCandidateKey(prismaCandidates[1])
        ).toBe(true);
        archive.close();
    });
});
