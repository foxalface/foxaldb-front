import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { unzipSync, strFromU8 } from 'fflate';
import type { DjangoExportFile } from '@/lib/api/django-export-types';
import {
    buildDjangoExportZip,
    isUnsafeZipPath,
    DjangoExportZipError,
    resolveDjangoExportFilename,
} from '../django-export-zip';
import { DJANGO_EXPORT_FALLBACK_FILENAME } from '../django-export-constants';

const sampleFiles: DjangoExportFile[] = [
    { path: 'README.md', content: '# Shop' },
    { path: 'foxaldb_models/__init__.py', content: '' },
    { path: 'foxaldb_models/apps.py', content: 'class FoxaldbModelsConfig:' },
    { path: 'foxaldb_models/models.py', content: 'class User(models.Model):' },
    { path: 'foxaldb_models/migrations/__init__.py', content: '' },
    {
        path: 'foxaldb_models/migrations/0001_initial.py',
        content: 'class Migration(migrations.Migration):',
    },
];

describe('django export zip helper', () => {
    it('converts each backend file into exactly one ZIP entry', () => {
        const zipBytes = buildDjangoExportZip(sampleFiles);
        const unzipped = unzipSync(zipBytes);

        expect(Object.keys(unzipped)).toEqual(
            sampleFiles.map((file) => file.path)
        );
    });

    it('preserves nested Django paths and UTF-8 content without mutating source text', () => {
        const utf8Content = 'café — 日本語 — naïve';
        const files: DjangoExportFile[] = [
            { path: 'foxaldb_models/models.py', content: utf8Content },
        ];

        const zipBytes = buildDjangoExportZip(files);
        const unzipped = unzipSync(zipBytes);

        expect(strFromU8(unzipped['foxaldb_models/models.py']!)).toBe(
            utf8Content
        );
        expect(files[0]?.content).toBe(utf8Content);
    });

    it('includes optional FoxalDB-NOTES.md only when the backend supplied it', () => {
        const withNotes = buildDjangoExportZip([
            { path: 'README.md', content: '# Shop' },
            { path: 'FoxalDB-NOTES.md', content: 'note' },
            { path: 'foxaldb_models/models.py', content: 'class User:' },
        ]);
        expect(Object.keys(unzipSync(withNotes))).toContain('FoxalDB-NOTES.md');

        const withoutNotes = unzipSync(buildDjangoExportZip(sampleFiles));
        expect(Object.keys(withoutNotes)).not.toContain('FoxalDB-NOTES.md');
        expect(Object.keys(withoutNotes)).toHaveLength(sampleFiles.length);
    });

    it('uses deterministic entry order for identical backend files', () => {
        const first = Object.keys(unzipSync(buildDjangoExportZip(sampleFiles)));
        const second = Object.keys(
            unzipSync(buildDjangoExportZip(sampleFiles))
        );

        expect(first).toEqual(second);
        expect(first).toEqual(sampleFiles.map((file) => file.path));
    });

    it('uses deterministic ZIP metadata and bytes for identical backend files', () => {
        const first = buildDjangoExportZip(sampleFiles);
        const second = buildDjangoExportZip(sampleFiles);

        expect(Array.from(first)).toEqual(Array.from(second));
    });

    it('does not add frontend-generated files', () => {
        const zipBytes = buildDjangoExportZip(sampleFiles);
        const unzipped = unzipSync(zipBytes);

        expect(Object.keys(unzipped)).toHaveLength(sampleFiles.length);
        expect(Object.keys(unzipped)).not.toContain('settings.py');
        expect(Object.keys(unzipped)).not.toContain('manage.py');
        expect(Object.keys(unzipped)).not.toContain('requirements.txt');
    });

    it('rejects ../ traversal paths without normalizing them', () => {
        expect(isUnsafeZipPath('../evil.py')).toBe(true);
        expect(isUnsafeZipPath('foxaldb_models/../evil.py')).toBe(true);

        try {
            buildDjangoExportZip([{ path: '../evil.py', content: 'bad' }]);
            expect.fail('expected unsafe path to throw');
        } catch (error) {
            expect(error).toBeInstanceOf(DjangoExportZipError);
            expect((error as DjangoExportZipError).code).toBe('unsafe_path');
            expect((error as DjangoExportZipError).path).toBe('../evil.py');
        }
    });

    it('rejects absolute Unix paths', () => {
        expect(isUnsafeZipPath('/tmp/evil.py')).toBe(true);
        expect(() =>
            buildDjangoExportZip([{ path: '/etc/passwd', content: 'bad' }])
        ).toThrowError(/unsafe/i);
    });

    it('rejects Windows drive paths', () => {
        expect(isUnsafeZipPath('C:\\Windows\\evil.py')).toBe(true);
        expect(isUnsafeZipPath('D:/tmp/evil.py')).toBe(true);
        expect(() =>
            buildDjangoExportZip([
                { path: 'C:\\Windows\\evil.py', content: 'bad' },
            ])
        ).toThrow(DjangoExportZipError);
    });

    it('rejects backslash traversal', () => {
        expect(isUnsafeZipPath('foxaldb_models\\..\\evil.py')).toBe(true);
        expect(() =>
            buildDjangoExportZip([
                { path: 'foxaldb_models\\..\\evil.py', content: 'bad' },
            ])
        ).toThrow(DjangoExportZipError);
    });

    it('rejects empty paths', () => {
        expect(isUnsafeZipPath('')).toBe(true);
        expect(isUnsafeZipPath('   ')).toBe(true);
        expect(() =>
            buildDjangoExportZip([{ path: '', content: 'bad' }])
        ).toThrow(DjangoExportZipError);
    });

    it('rejects paths with NUL or other control characters', () => {
        expect(isUnsafeZipPath('foxaldb_models/models\u0000.py')).toBe(true);
        expect(() =>
            buildDjangoExportZip([
                { path: 'foxaldb_models/models\u0000.py', content: 'bad' },
            ])
        ).toThrow(DjangoExportZipError);
    });

    it('rejects duplicate paths instead of silently overwriting', () => {
        try {
            buildDjangoExportZip([
                { path: 'foxaldb_models/models.py', content: 'first' },
                { path: 'foxaldb_models/models.py', content: 'second' },
            ]);
            expect.fail('expected duplicate path to throw');
        } catch (error) {
            expect(error).toBeInstanceOf(DjangoExportZipError);
            expect((error as DjangoExportZipError).code).toBe('duplicate_path');
            expect((error as DjangoExportZipError).path).toBe(
                'foxaldb_models/models.py'
            );
        }
    });

    it('fails safely when there are zero files', () => {
        try {
            buildDjangoExportZip([]);
            expect.fail('expected empty files to throw');
        } catch (error) {
            expect(error).toBeInstanceOf(DjangoExportZipError);
            expect((error as DjangoExportZipError).code).toBe('empty_files');
        }
    });

    it('uses the backend filename when it is a valid archive name', () => {
        expect(resolveDjangoExportFilename('shop-database-django.zip')).toBe(
            'shop-database-django.zip'
        );
    });

    it('falls back when the backend filename is missing or unsafe', () => {
        expect(resolveDjangoExportFilename(undefined)).toBe(
            DJANGO_EXPORT_FALLBACK_FILENAME
        );
        expect(resolveDjangoExportFilename('../evil.zip')).toBe(
            DJANGO_EXPORT_FALLBACK_FILENAME
        );
        expect(resolveDjangoExportFilename('/tmp/evil.zip')).toBe(
            DJANGO_EXPORT_FALLBACK_FILENAME
        );
        expect(resolveDjangoExportFilename('foo/bar.zip')).toBe(
            DJANGO_EXPORT_FALLBACK_FILENAME
        );
        expect(resolveDjangoExportFilename('')).toBe(
            DJANGO_EXPORT_FALLBACK_FILENAME
        );
        expect(DJANGO_EXPORT_FALLBACK_FILENAME).toBe('diagram-django.zip');
    });

    it('has no filesystem access', () => {
        const source = readFileSync(
            path.join(process.cwd(), 'src/lib/export/django-export-zip.ts'),
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
            path.join(process.cwd(), 'src/lib/export/django-export-zip.ts'),
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
