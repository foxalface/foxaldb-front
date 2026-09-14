import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { unzipSync, strFromU8 } from 'fflate';
import type { EfCoreExportFile } from '@/lib/api/ef-core-export-types';
import {
    buildEfCoreExportZip,
    EfCoreExportZipError,
    isUnsafeZipPath,
    resolveEfCoreExportFilename,
} from '../ef-core-export-zip';
import { EF_CORE_EXPORT_FALLBACK_FILENAME } from '../ef-core-export-constants';

const sampleFiles: EfCoreExportFile[] = [
    { path: 'README.md', content: '# Catalog' },
    { path: 'Models/Users.cs', content: 'namespace Acme.Catalog.Models;' },
    { path: 'Data/AppDbContext.cs', content: 'public class AppDbContext {}' },
];

describe('ef core export zip helper', () => {
    it('converts each backend file into exactly one ZIP entry', () => {
        const zipBytes = buildEfCoreExportZip(sampleFiles);
        const unzipped = unzipSync(zipBytes);

        expect(Object.keys(unzipped)).toEqual([
            'README.md',
            'Models/Users.cs',
            'Data/AppDbContext.cs',
        ]);
    });

    it('preserves nested paths and UTF-8 content without mutating source text', () => {
        const utf8Content = 'café — 日本語 — naïve';
        const files: EfCoreExportFile[] = [
            { path: 'Models/Café.cs', content: utf8Content },
        ];

        const zipBytes = buildEfCoreExportZip(files);
        const unzipped = unzipSync(zipBytes);

        expect(strFromU8(unzipped['Models/Café.cs']!)).toBe(utf8Content);
        expect(files[0]?.content).toBe(utf8Content);
    });

    it('does not add frontend-generated files', () => {
        const zipBytes = buildEfCoreExportZip(sampleFiles);
        const unzipped = unzipSync(zipBytes);

        expect(Object.keys(unzipped)).toHaveLength(sampleFiles.length);
        expect(Object.keys(unzipped)).not.toContain('FoxalDB-NOTES.md');
        expect(Object.keys(unzipped)).not.toContain('NOTES.md');
    });

    it('rejects unsafe traversal paths', () => {
        expect(isUnsafeZipPath('../evil.cs')).toBe(true);
        expect(() =>
            buildEfCoreExportZip([
                { path: 'Models/../evil.cs', content: 'bad' },
            ])
        ).toThrow(EfCoreExportZipError);

        try {
            buildEfCoreExportZip([{ path: '../evil.cs', content: 'bad' }]);
            expect.fail('expected unsafe path to throw');
        } catch (error) {
            expect(error).toBeInstanceOf(EfCoreExportZipError);
            expect((error as EfCoreExportZipError).code).toBe('unsafe_path');
        }
    });

    it('rejects absolute paths', () => {
        expect(isUnsafeZipPath('/tmp/evil.cs')).toBe(true);
        expect(isUnsafeZipPath('C:\\Windows\\evil.cs')).toBe(true);
        expect(() =>
            buildEfCoreExportZip([{ path: '/etc/passwd', content: 'bad' }])
        ).toThrowError(/unsafe/i);
    });

    it('rejects empty paths', () => {
        expect(isUnsafeZipPath('')).toBe(true);
        expect(isUnsafeZipPath('   ')).toBe(true);
        expect(() =>
            buildEfCoreExportZip([{ path: '', content: 'bad' }])
        ).toThrow(EfCoreExportZipError);
    });

    it('fails safely when there are zero files', () => {
        try {
            buildEfCoreExportZip([]);
            expect.fail('expected empty files to throw');
        } catch (error) {
            expect(error).toBeInstanceOf(EfCoreExportZipError);
            expect((error as EfCoreExportZipError).code).toBe('empty_files');
        }
    });

    it('uses the backend filename when it is a valid archive name', () => {
        expect(resolveEfCoreExportFilename('my-diagram-ef-core.zip')).toBe(
            'my-diagram-ef-core.zip'
        );
    });

    it('falls back when the backend filename is missing or unsafe', () => {
        expect(resolveEfCoreExportFilename(undefined)).toBe(
            EF_CORE_EXPORT_FALLBACK_FILENAME
        );
        expect(resolveEfCoreExportFilename('../evil.zip')).toBe(
            EF_CORE_EXPORT_FALLBACK_FILENAME
        );
        expect(resolveEfCoreExportFilename('/tmp/evil.zip')).toBe(
            EF_CORE_EXPORT_FALLBACK_FILENAME
        );
        expect(resolveEfCoreExportFilename('')).toBe(
            EF_CORE_EXPORT_FALLBACK_FILENAME
        );
    });

    it('has no filesystem access', () => {
        const source = readFileSync(
            path.join(process.cwd(), 'src/lib/export/ef-core-export-zip.ts'),
            'utf8'
        );

        expect(source).not.toMatch(/\bfrom ['"]node:fs['"]/);
        expect(source).not.toMatch(/\bfrom ['"]fs['"]/);
        expect(source).not.toMatch(/\brequire\(['"]fs['"]\)/);
        expect(source).not.toMatch(/\bfrom ['"]node:path['"]/);
        expect(source).not.toMatch(/\bwriteFile/);
    });
});
