import { createTestZipFile } from './build-test-zip';

const EF_CSPROJ =
    '<Project><ItemGroup><PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.0.0" /></ItemGroup></Project>';
const APP_SNAPSHOT =
    'partial class AppDbContextModelSnapshot : ModelSnapshot { protected override void BuildModel(ModelBuilder modelBuilder) {} }';
const CATALOG_SNAPSHOT =
    'partial class CatalogDbContextModelSnapshot : ModelSnapshot { protected override void BuildModel(ModelBuilder modelBuilder) {} }';

/** Manual QA fixture: EF Core App + Catalog DbContexts */
export const createEfTwoDbContextQaZip = () =>
    createTestZipFile(
        {
            'App.csproj': EF_CSPROJ,
            'Migrations/AppDbContextModelSnapshot.cs': APP_SNAPSHOT,
            'CatalogMigrations/CatalogDbContextModelSnapshot.cs':
                CATALOG_SNAPSHOT,
        },
        'foxaldb-qa-ef-two-dbcontext.zip'
    );
