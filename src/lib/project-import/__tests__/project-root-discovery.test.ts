import { describe, expect, it } from 'vitest';
import { buildArchivePathIndex } from '../detection/archive-paths';
import { discoverProjectRootCandidates } from '../detection/project-root-discovery';
import { ArchiveReader } from '../archive/archive-reader';
import { createTestZipFile } from './fixtures/build-test-zip';

const rootsFromZip = async (
    files: Record<string, string>
): Promise<string[]> => {
    const file = createTestZipFile(files);
    const archive = await ArchiveReader.open(file);
    const index = buildArchivePathIndex(archive);
    const roots = discoverProjectRootCandidates(index);
    archive.close();
    return roots;
};

describe('discoverProjectRootCandidates', () => {
    it('finds project at archive root', async () => {
        const roots = await rootsFromZip({
            artisan: '#!/usr/bin/env php',
            'composer.json': '{"require":{"laravel/framework":"^11.0"}}',
            'database/migrations/2024_01_01_000000_create_users_table.php':
                '<?php',
        });

        expect(roots).toContain('');
    });

    it('finds project inside GitHub-style wrapper directory', async () => {
        const roots = await rootsFromZip({
            'project-main/artisan': '#!/usr/bin/env php',
            'project-main/composer.json':
                '{"require":{"laravel/framework":"^11.0"}}',
            'project-main/database/migrations/2024_01_01_000000_create_users_table.php':
                '<?php',
        });

        expect(roots).toEqual(['project-main']);
    });

    it('finds deeply nested valid root', async () => {
        const roots = await rootsFromZip({
            'org/monorepo/apps/api/artisan': '#!/usr/bin/env php',
            'org/monorepo/apps/api/composer.json':
                '{"require":{"laravel/framework":"^11.0"}}',
            'org/monorepo/apps/api/database/migrations/2024_01_01_000000_create_users_table.php':
                '<?php',
        });

        expect(roots).toEqual(['org/monorepo/apps/api']);
    });

    it('finds multiple roots in a monorepo', async () => {
        const roots = await rootsFromZip({
            'repo/apps/api/artisan': '#!/usr/bin/env php',
            'repo/apps/api/composer.json':
                '{"require":{"laravel/framework":"^11.0"}}',
            'repo/apps/api/database/migrations/2024_01_01_000000_create_users_table.php':
                '<?php',
            'repo/packages/db/prisma/schema.prisma':
                'model User { id Int @id }',
            'repo/packages/db/package.json':
                '{"dependencies":{"@prisma/client":"^5.0.0"}}',
        });

        expect(roots).toEqual(['repo/apps/api', 'repo/packages/db']);
    });

    it('orders roots by depth then lexically', async () => {
        const roots = await rootsFromZip({
            'zeta/prisma/schema.prisma': 'model A { id Int @id }',
            'alpha/prisma/schema.prisma': 'model B { id Int @id }',
            'mid/nested/prisma/schema.prisma': 'model C { id Int @id }',
        });

        expect(roots).toEqual(['alpha', 'zeta', 'mid/nested']);
    });

    it('deduplicates duplicate anchors for the same root', async () => {
        const roots = await rootsFromZip({
            'app/artisan': '#!/usr/bin/env php',
            'app/composer.json': '{"require":{"laravel/framework":"^11.0"}}',
            'app/database/migrations/2024_01_01_000000_create_users_table.php':
                '<?php',
            'app/bootstrap/app.php': '<?php',
        });

        expect(roots).toEqual(['app']);
    });

    it('returns empty list when no anchors exist', async () => {
        const roots = await rootsFromZip({
            'readme.md': '# hello',
            'src/index.ts': 'export {}',
        });

        expect(roots).toEqual([]);
    });
});
