import { describe, expect, it } from 'vitest';
import { ArchiveReader } from '../archive/archive-reader';
import { collectGroupBundle } from '../bundle/collect-group-bundle';
import { analyzeProjectArchive } from '../analyze-project-archive';
import { detectProjectCandidates } from '../detection/detect-project';
import { detectDatabaseGroups } from '../detection/database-groups/detect-database-groups';
import { createTestZipFile } from './fixtures/build-test-zip';

const EF_CSPROJ =
    '<Project><ItemGroup><PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.0.0" /></ItemGroup></Project>';
const APP_SNAPSHOT =
    'partial class AppDbContextModelSnapshot : ModelSnapshot { protected override void BuildModel(ModelBuilder modelBuilder) {} }';
const CATALOG_SNAPSHOT =
    'partial class CatalogDbContextModelSnapshot : ModelSnapshot { protected override void BuildModel(ModelBuilder modelBuilder) {} }';
const API_SNAPSHOT =
    'partial class ApiDbContextModelSnapshot : ModelSnapshot { protected override void BuildModel(ModelBuilder modelBuilder) {} }';
const ADMIN_SNAPSHOT =
    'partial class AdminDbContextModelSnapshot : ModelSnapshot { protected override void BuildModel(ModelBuilder modelBuilder) {} }';

const QA_FILES = {
    'App.csproj': EF_CSPROJ,
    'Migrations/AppDbContextModelSnapshot.cs': APP_SNAPSHOT,
    'CatalogMigrations/CatalogDbContextModelSnapshot.cs': CATALOG_SNAPSHOT,
};

describe('M10.3.1 EF Core project vs database-group duplication', () => {
    it('same project / multi-DbContext QA archive yields one project and two groups', async () => {
        const file = createTestZipFile(QA_FILES);
        const archive = await ArchiveReader.open(file);
        const candidates = await detectProjectCandidates(archive);
        const ef = candidates.filter(
            (candidate) => candidate.framework === 'entity_framework_core'
        );
        const analysis = await analyzeProjectArchive(archive);

        expect(ef).toHaveLength(1);
        expect(ef[0]?.rootPath).toBe('');
        expect(ef[0]?.relevantFiles).toEqual([
            'App.csproj',
            'CatalogMigrations/CatalogDbContextModelSnapshot.cs',
            'Migrations/AppDbContextModelSnapshot.cs',
        ]);
        expect(analysis.status).toBe('detected');

        const groups = await detectDatabaseGroups(archive, ef[0]!);
        expect(groups.status).toBe('multiple');
        expect(groups.groups).toHaveLength(2);
        expect(groups.groups.map((group) => group.label).sort()).toEqual([
            'AppDbContext',
            'CatalogDbContext',
        ]);

        archive.close();
    });

    it('preserves DbContext label casing', async () => {
        const file = createTestZipFile(QA_FILES);
        const archive = await ArchiveReader.open(file);
        const ef = (await detectProjectCandidates(archive)).find(
            (candidate) => candidate.framework === 'entity_framework_core'
        )!;
        const groups = await detectDatabaseGroups(archive, ef);

        expect(
            groups.groups.find((group) => group.label === 'AppDbContext')
        ).toBeDefined();
        expect(
            groups.groups.find((group) => group.label === 'CatalogDbContext')
        ).toBeDefined();

        archive.close();
    });

    it('selected AppDbContext bundle excludes Catalog snapshot', async () => {
        const file = createTestZipFile(QA_FILES);
        const archive = await ArchiveReader.open(file);
        const ef = (await detectProjectCandidates(archive)).find(
            (candidate) => candidate.framework === 'entity_framework_core'
        )!;
        const groups = await detectDatabaseGroups(archive, ef);
        const appGroup = groups.groups.find(
            (group) => group.label === 'AppDbContext'
        )!;
        const bundle = await collectGroupBundle(archive, ef, appGroup);
        const paths = bundle.files.map((entry) => entry.relativePath);

        expect(paths).toContain('Migrations/AppDbContextModelSnapshot.cs');
        expect(paths).not.toContain(
            'CatalogMigrations/CatalogDbContextModelSnapshot.cs'
        );

        archive.close();
    });

    it('selected CatalogDbContext bundle excludes App snapshot', async () => {
        const file = createTestZipFile(QA_FILES);
        const archive = await ArchiveReader.open(file);
        const ef = (await detectProjectCandidates(archive)).find(
            (candidate) => candidate.framework === 'entity_framework_core'
        )!;
        const groups = await detectDatabaseGroups(archive, ef);
        const catalogGroup = groups.groups.find(
            (group) => group.label === 'CatalogDbContext'
        )!;
        const bundle = await collectGroupBundle(archive, ef, catalogGroup);
        const paths = bundle.files.map((entry) => entry.relativePath);

        expect(paths).toContain(
            'CatalogMigrations/CatalogDbContextModelSnapshot.cs'
        );
        expect(paths).not.toContain('Migrations/AppDbContextModelSnapshot.cs');

        archive.close();
    });

    it('true multi-project monorepo remains project ambiguous', async () => {
        const file = createTestZipFile({
            'api/Api.csproj': EF_CSPROJ,
            'api/Migrations/ApiDbContextModelSnapshot.cs': API_SNAPSHOT,
            'admin/Admin.csproj': EF_CSPROJ,
            'admin/Migrations/AdminDbContextModelSnapshot.cs': ADMIN_SNAPSHOT,
        });
        const archive = await ArchiveReader.open(file);
        const candidates = await detectProjectCandidates(archive);
        const ef = candidates.filter(
            (candidate) => candidate.framework === 'entity_framework_core'
        );
        const analysis = await analyzeProjectArchive(archive);

        expect(ef).toHaveLength(2);
        expect(analysis.status).toBe('ambiguous');

        const api = ef.find((candidate) => candidate.rootPath === 'api')!;
        const apiGroups = await detectDatabaseGroups(archive, api);
        expect(apiGroups.status).toBe('single');

        archive.close();
    });

    it('duplicate AppDbContext snapshots in one scope stay single group', async () => {
        const file = createTestZipFile({
            'App.csproj': EF_CSPROJ,
            'Migrations/AppDbContextModelSnapshot.cs': APP_SNAPSHOT,
            'Backup/Migrations/AppDbContextModelSnapshot.cs': APP_SNAPSHOT,
        });
        const archive = await ArchiveReader.open(file);
        const ef = (await detectProjectCandidates(archive)).find(
            (candidate) => candidate.framework === 'entity_framework_core'
        )!;
        const groups = await detectDatabaseGroups(archive, ef);

        expect(groups.status).toBe('single');
        archive.close();
    });
});
