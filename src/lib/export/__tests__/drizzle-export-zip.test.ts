import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { unzipSync, strFromU8 } from 'fflate';
import type { DrizzleExportFile } from '@/lib/api/drizzle-export-types';
import {
    buildDrizzleExportZip,
    isUnsafeZipPath,
    DrizzleExportZipError,
    resolveDrizzleExportFilename,
} from '../drizzle-export-zip';
import { DRIZZLE_EXPORT_FALLBACK_FILENAME } from '../drizzle-export-constants';

const sampleFiles: DrizzleExportFile[] = [
    { path: 'README.md', content: '# Shop' },
    { path: 'schema.ts', content: 'export const users = pgTable("users");' },
    {
        path: 'drizzle.config.ts',
        content: 'export default { dialect: "postgresql" };',
    },
];

describe('drizzle export zip helper', () => {
    it('converts each backend file into exactly one ZIP entry', () => {
        const zipBytes = buildDrizzleExportZip(sampleFiles);
        const unzipped = unzipSync(zipBytes);

        expect(Object.keys(unzipped)).toEqual(
            sampleFiles.map((file) => file.path)
        );
    });

    it('preserves UTF-8 content without mutating source text', () => {
        const utf8Content = 'café — 日本語 — naïve';
        const files: DrizzleExportFile[] = [
            { path: 'schema.ts', content: utf8Content },
        ];

        const zipBytes = buildDrizzleExportZip(files);
        const unzipped = unzipSync(zipBytes);

        expect(strFromU8(unzipped['schema.ts']!)).toBe(utf8Content);
        expect(files[0]?.content).toBe(utf8Content);
    });

    it('includes optional FoxalDB-NOTES.md only when the backend supplied it', () => {
        const withNotes = buildDrizzleExportZip([
            { path: 'README.md', content: '# Shop' },
            { path: 'FoxalDB-NOTES.md', content: 'note' },
            {
                path: 'schema.ts',
                content: 'export const users = pgTable("users");',
            },
        ]);
        expect(Object.keys(unzipSync(withNotes))).toContain('FoxalDB-NOTES.md');

        const withoutNotes = unzipSync(buildDrizzleExportZip(sampleFiles));
        expect(Object.keys(withoutNotes)).not.toContain('FoxalDB-NOTES.md');
        expect(Object.keys(withoutNotes)).toHaveLength(sampleFiles.length);
    });

    it('uses deterministic entry order for identical backend files', () => {
        const first = Object.keys(
            unzipSync(buildDrizzleExportZip(sampleFiles))
        );
        const second = Object.keys(
            unzipSync(buildDrizzleExportZip(sampleFiles))
        );

        expect(first).toEqual(second);
        expect(first).toEqual(sampleFiles.map((file) => file.path));
    });

    it('uses deterministic ZIP metadata and bytes for identical backend files', () => {
        const first = buildDrizzleExportZip(sampleFiles);
        const second = buildDrizzleExportZip(sampleFiles);

        expect(Array.from(first)).toEqual(Array.from(second));
    });

    it('does not add frontend-generated files', () => {
        const zipBytes = buildDrizzleExportZip(sampleFiles);
        const unzipped = unzipSync(zipBytes);

        expect(Object.keys(unzipped)).toHaveLength(sampleFiles.length);
        expect(Object.keys(unzipped)).not.toContain('package.json');
        expect(Object.keys(unzipped)).not.toContain('tsconfig.json');
        expect(Object.keys(unzipped)).not.toContain('relations.ts');
    });

    it('rejects ../ traversal paths without normalizing them', () => {
        expect(isUnsafeZipPath('../evil.ts')).toBe(true);
        expect(isUnsafeZipPath('schema/../evil.ts')).toBe(true);

        try {
            buildDrizzleExportZip([{ path: '../evil.ts', content: 'bad' }]);
            expect.fail('expected unsafe path to throw');
        } catch (error) {
            expect(error).toBeInstanceOf(DrizzleExportZipError);
            expect((error as DrizzleExportZipError).code).toBe('unsafe_path');
            expect((error as DrizzleExportZipError).path).toBe('../evil.ts');
        }
    });

    it('rejects absolute Unix paths', () => {
        expect(isUnsafeZipPath('/tmp/evil.ts')).toBe(true);
        expect(() =>
            buildDrizzleExportZip([{ path: '/etc/passwd', content: 'bad' }])
        ).toThrowError(/unsafe/i);
    });

    it('rejects Windows drive paths', () => {
        expect(isUnsafeZipPath('C:\\Windows\\evil.ts')).toBe(true);
        expect(isUnsafeZipPath('D:/tmp/evil.ts')).toBe(true);
        expect(() =>
            buildDrizzleExportZip([
                { path: 'C:\\Windows\\evil.ts', content: 'bad' },
            ])
        ).toThrow(DrizzleExportZipError);
    });

    it('rejects backslash traversal', () => {
        expect(isUnsafeZipPath('schema\\..\\evil.ts')).toBe(true);
        expect(() =>
            buildDrizzleExportZip([
                { path: 'schema\\..\\evil.ts', content: 'bad' },
            ])
        ).toThrow(DrizzleExportZipError);
    });

    it('rejects empty paths', () => {
        expect(isUnsafeZipPath('')).toBe(true);
        expect(isUnsafeZipPath('   ')).toBe(true);
        expect(() =>
            buildDrizzleExportZip([{ path: '', content: 'bad' }])
        ).toThrow(DrizzleExportZipError);
    });

    it('rejects paths with NUL or other control characters', () => {
        expect(isUnsafeZipPath('schema.ts\u0000')).toBe(true);
        expect(() =>
            buildDrizzleExportZip([{ path: 'schema.ts\u0000', content: 'bad' }])
        ).toThrow(DrizzleExportZipError);
    });

    it('rejects duplicate paths instead of silently overwriting', () => {
        try {
            buildDrizzleExportZip([
                { path: 'schema.ts', content: 'first' },
                { path: 'schema.ts', content: 'second' },
            ]);
            expect.fail('expected duplicate path to throw');
        } catch (error) {
            expect(error).toBeInstanceOf(DrizzleExportZipError);
            expect((error as DrizzleExportZipError).code).toBe(
                'duplicate_path'
            );
            expect((error as DrizzleExportZipError).path).toBe('schema.ts');
        }
    });

    it('fails safely when there are zero files', () => {
        try {
            buildDrizzleExportZip([]);
            expect.fail('expected empty files to throw');
        } catch (error) {
            expect(error).toBeInstanceOf(DrizzleExportZipError);
            expect((error as DrizzleExportZipError).code).toBe('empty_files');
        }
    });

    it('uses the backend filename when it is a valid archive name', () => {
        expect(resolveDrizzleExportFilename('shop-database-drizzle.zip')).toBe(
            'shop-database-drizzle.zip'
        );
    });

    it('falls back when the backend filename is missing or unsafe', () => {
        expect(resolveDrizzleExportFilename(undefined)).toBe(
            DRIZZLE_EXPORT_FALLBACK_FILENAME
        );
        expect(resolveDrizzleExportFilename('../evil.zip')).toBe(
            DRIZZLE_EXPORT_FALLBACK_FILENAME
        );
        expect(resolveDrizzleExportFilename('/tmp/evil.zip')).toBe(
            DRIZZLE_EXPORT_FALLBACK_FILENAME
        );
        expect(resolveDrizzleExportFilename('foo/bar.zip')).toBe(
            DRIZZLE_EXPORT_FALLBACK_FILENAME
        );
        expect(resolveDrizzleExportFilename('')).toBe(
            DRIZZLE_EXPORT_FALLBACK_FILENAME
        );
        expect(DRIZZLE_EXPORT_FALLBACK_FILENAME).toBe('diagram-drizzle.zip');
    });

    it('has no filesystem access', () => {
        const source = readFileSync(
            path.join(process.cwd(), 'src/lib/export/drizzle-export-zip.ts'),
            'utf8'
        );

        expect(source).not.toMatch(/\bfrom ['"]node:fs['"]/);
        expect(source).not.toMatch(/\bfrom ['"]fs['"]/);
        expect(source).not.toMatch(/\brequire\(['"]fs['"]\)/);
        expect(source).not.toMatch(/\bfrom ['"]node:path['"]/);
        expect(source).not.toMatch(/\bwriteFile/);
    });

    it('uses the existing fflate dependency and does not add another ZIP library', () => {
        const source = readFileSync(
            path.join(process.cwd(), 'src/lib/export/drizzle-export-zip.ts'),
            'utf8'
        );
        const packageJson = JSON.parse(
            readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')
        ) as {
            dependencies: Record<string, string>;
            devDependencies?: Record<string, string>;
        };

        expect(source).toMatch(/from ['"]fflate['"]/);
        expect(packageJson.dependencies.fflate).toBeDefined();
        expect(packageJson.dependencies.jszip).toBeUndefined();
        expect(packageJson.dependencies['adm-zip']).toBeUndefined();
        expect(packageJson.devDependencies?.jszip).toBeUndefined();
    });
});
