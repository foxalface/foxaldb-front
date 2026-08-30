import { describe, expect, it } from 'vitest';
import { ArchiveReader } from '../archive/archive-reader';
import { analyzeProjectArchive } from '../analyze-project-archive';
import { collectFileBundle } from '../bundle/collect-file-bundle';
import { detectProjectCandidates } from '../detection/detect-project';
import { discoverProjectRootCandidates } from '../detection/project-root-discovery';
import { buildArchivePathIndex } from '../detection/archive-paths';
import { createTestZipFile } from './fixtures/build-test-zip';

const EF_CSPROJ =
    '<Project><ItemGroup><PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.0.0" /></ItemGroup></Project>';
const NON_EF_CSPROJ =
    '<Project><ItemGroup><PackageReference Include="Newtonsoft.Json" Version="13.0.0" /></ItemGroup></Project>';
const MODEL_SNAPSHOT =
    'partial class AppDbContextModelSnapshot : ModelSnapshot { protected override void BuildModel(ModelBuilder modelBuilder) {} }';
const AUDIT_SNAPSHOT =
    'partial class AuditDbContextModelSnapshot : ModelSnapshot { protected override void BuildModel(ModelBuilder modelBuilder) {} }';

const detectFromZip = async (files: Record<string, string>) => {
    const file = createTestZipFile(files);
    const archive = await ArchiveReader.open(file);
    const candidates = await detectProjectCandidates(archive);
    return { archive, candidates };
};

const efCandidates = (
    candidates: Awaited<ReturnType<typeof detectProjectCandidates>>
) =>
    candidates.filter(
        (candidate) => candidate.framework === 'entity_framework_core'
    );

describe('EF Core project root detection (M7.1)', () => {
    it('A. standard QA archive yields exactly one EF candidate at project root', async () => {
        const { candidates, archive } = await detectFromZip({
            'foxaldb-efcore-qa-basic/App.csproj': EF_CSPROJ,
            'foxaldb-efcore-qa-basic/Migrations/AppDbContextModelSnapshot.cs':
                MODEL_SNAPSHOT,
        });

        const ef = efCandidates(candidates);
        expect(ef).toHaveLength(1);
        expect(ef[0]?.rootPath).toBe('foxaldb-efcore-qa-basic');
        expect(ef[0]?.confidence).toBe('high');
        expect(ef[0]?.relevantFiles).toEqual([
            'foxaldb-efcore-qa-basic/App.csproj',
            'foxaldb-efcore-qa-basic/Migrations/AppDbContextModelSnapshot.cs',
        ]);

        const analysis = await analyzeProjectArchive(archive);
        expect(analysis.status).toBe('detected');
        expect(analysis.recommendedCandidate?.framework).toBe(
            'entity_framework_core'
        );

        archive.close();
    });

    it('B. snapshot-only conventional structure yields one candidate at parent of Migrations', async () => {
        const { candidates, archive } = await detectFromZip({
            'project/Migrations/AppDbContextModelSnapshot.cs': MODEL_SNAPSHOT,
        });

        const ef = efCandidates(candidates);
        expect(ef).toHaveLength(1);
        expect(ef[0]?.rootPath).toBe('project');

        archive.close();
    });

    it('C. monorepo yields two distinct EF candidates', async () => {
        const { candidates, archive } = await detectFromZip({
            'repo/ApiA/ApiA.csproj': EF_CSPROJ,
            'repo/ApiA/Migrations/AppDbContextModelSnapshot.cs': MODEL_SNAPSHOT,
            'repo/ApiB/ApiB.csproj': EF_CSPROJ,
            'repo/ApiB/Migrations/AppDbContextModelSnapshot.cs': MODEL_SNAPSHOT,
        });

        const ef = efCandidates(candidates);
        expect(ef).toHaveLength(2);
        expect(ef.map((candidate) => candidate.rootPath).sort()).toEqual([
            'repo/ApiA',
            'repo/ApiB',
        ]);

        archive.close();
    });

    it('D. multiple snapshots in one project yield one frontend candidate', async () => {
        const { candidates, archive } = await detectFromZip({
            'project/App.csproj': EF_CSPROJ,
            'project/Migrations/AppDbContextModelSnapshot.cs': MODEL_SNAPSHOT,
            'project/Migrations/AuditDbContextModelSnapshot.cs': AUDIT_SNAPSHOT,
        });

        const ef = efCandidates(candidates);
        expect(ef).toHaveLength(1);
        expect(ef[0]?.rootPath).toBe('project');
        expect(ef[0]?.relevantFiles).toEqual([
            'project/App.csproj',
            'project/Migrations/AppDbContextModelSnapshot.cs',
            'project/Migrations/AuditDbContextModelSnapshot.cs',
        ]);

        archive.close();
    });

    it('E. nested repository wrapper resolves Api project root', async () => {
        const { candidates, archive } = await detectFromZip({
            'upload/repo/src/Api/Api.csproj': EF_CSPROJ,
            'upload/repo/src/Api/Migrations/AppDbContextModelSnapshot.cs':
                MODEL_SNAPSHOT,
        });

        const ef = efCandidates(candidates);
        expect(ef).toHaveLength(1);
        expect(ef[0]?.rootPath).toBe('upload/repo/src/Api');

        archive.close();
    });

    it('F. migration files alongside snapshot do not create a Migrations root candidate', async () => {
        const { candidates, archive } = await detectFromZip({
            'project/App.csproj': EF_CSPROJ,
            'project/Migrations/AppDbContextModelSnapshot.cs': MODEL_SNAPSHOT,
            'project/Migrations/20260101000000_Initial.cs':
                'partial class Initial : Migration { }',
        });

        const ef = efCandidates(candidates);
        expect(ef).toHaveLength(1);
        expect(ef[0]?.rootPath).toBe('project');
        expect(
            ef[0]?.evidence.some((item) => item.code === 'ef_migrations')
        ).toBe(false);

        archive.close();
    });

    it('G. csproj without EF Core dependency is not an EF candidate', async () => {
        const { candidates, archive } = await detectFromZip({
            'project/App.csproj': NON_EF_CSPROJ,
            'project/Migrations/AppDbContextModelSnapshot.cs': MODEL_SNAPSHOT,
        });

        const ef = efCandidates(candidates);
        expect(ef).toHaveLength(1);
        expect(ef[0]?.evidence.some((item) => item.code === 'ef_csproj')).toBe(
            false
        );
        expect(
            ef[0]?.evidence.some((item) => item.code === 'ef_model_snapshot')
        ).toBe(true);

        archive.close();
    });

    it('does not discover Migrations directory as a separate scan root', async () => {
        const file = createTestZipFile({
            'foxaldb-efcore-qa-basic/App.csproj': EF_CSPROJ,
            'foxaldb-efcore-qa-basic/Migrations/AppDbContextModelSnapshot.cs':
                MODEL_SNAPSHOT,
        });
        const archive = await ArchiveReader.open(file);
        const index = buildArchivePathIndex(archive);
        const roots = discoverProjectRootCandidates(index);

        expect(roots).toEqual(['foxaldb-efcore-qa-basic']);
        expect(roots).not.toContain('foxaldb-efcore-qa-basic/Migrations');

        archive.close();
    });

    it('collects bundle files relative to normalized project root', async () => {
        const file = createTestZipFile({
            'foxaldb-efcore-qa-basic/App.csproj': EF_CSPROJ,
            'foxaldb-efcore-qa-basic/Migrations/AppDbContextModelSnapshot.cs':
                MODEL_SNAPSHOT,
            'foxaldb-efcore-qa-basic/Migrations/20260101000000_Initial.cs':
                'partial class Initial : Migration { }',
        });
        const archive = await ArchiveReader.open(file);
        const analysis = await analyzeProjectArchive(archive);
        const candidate = analysis.recommendedCandidate;

        expect(candidate).toBeDefined();
        expect(candidate?.rootPath).toBe('foxaldb-efcore-qa-basic');

        const bundle = await collectFileBundle(archive, candidate!);
        const paths = bundle.files.map((entry) => entry.relativePath).sort();

        expect(paths).toEqual([
            'App.csproj',
            'Migrations/AppDbContextModelSnapshot.cs',
        ]);

        archive.close();
    });
});

describe('EF Core root detection regressions', () => {
    it('H. Laravel detection remains unchanged', async () => {
        const { candidates, archive } = await detectFromZip({
            artisan: '#!/usr/bin/env php',
            'composer.json': '{"require":{"laravel/framework":"^11.0"}}',
            'database/migrations/2024_01_01_000000_create_users_table.php':
                '<?php',
        });

        const laravel = candidates.find(
            (candidate) => candidate.framework === 'laravel'
        );

        expect(laravel?.confidence).toBe('high');
        expect(laravel?.rootPath).toBe('');
        archive.close();
    });

    it('H. Prisma detection remains unchanged', async () => {
        const { candidates, archive } = await detectFromZip({
            'prisma/schema.prisma': 'model User { id Int @id }',
        });

        const prisma = candidates.find(
            (candidate) => candidate.framework === 'prisma'
        );

        expect(prisma?.confidence).toBe('high');
        expect(prisma?.rootPath).toBe('');
        archive.close();
    });
});
