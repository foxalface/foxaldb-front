import { describe, expect, it } from 'vitest';
import type { ProjectImportBundlePrecheckError } from '../bundle/validate-project-import-bundle';
import { validateProjectImportBundle } from '../bundle/validate-project-import-bundle';
import type { ProjectFileBundle } from '../project-types';

const limits = {
    maxFiles: 2,
    maxFileBytes: 10,
    maxTotalBytes: 15,
    maxPathLength: 20,
    maxPathDepth: 3,
};

const bundle = (files: ProjectFileBundle['files']): ProjectFileBundle => ({
    framework: 'laravel',
    rootPath: '',
    files,
});

describe('validateProjectImportBundle', () => {
    it('rejects too many files with bundle_too_many_files', () => {
        expect(() =>
            validateProjectImportBundle(
                bundle([
                    { relativePath: 'a.php', content: 'a' },
                    { relativePath: 'b.php', content: 'b' },
                    { relativePath: 'c.php', content: 'c' },
                ]),
                limits
            )
        ).toThrowError(
            expect.objectContaining<Partial<ProjectImportBundlePrecheckError>>({
                code: 'bundle_too_many_files',
            })
        );
    });

    it('rejects per-file size with bundle_file_too_large', () => {
        expect(() =>
            validateProjectImportBundle(
                bundle([{ relativePath: 'big.php', content: 'x'.repeat(11) }]),
                limits
            )
        ).toThrowError(
            expect.objectContaining({ code: 'bundle_file_too_large' })
        );
    });

    it('rejects total size with bundle_total_too_large', () => {
        expect(() =>
            validateProjectImportBundle(
                bundle([
                    { relativePath: 'a.php', content: '123456789' },
                    { relativePath: 'b.php', content: '123456789' },
                ]),
                limits
            )
        ).toThrowError(
            expect.objectContaining({ code: 'bundle_total_too_large' })
        );
    });
});
