import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { unzipSync, strFromU8 } from 'fflate';
import type { RailsExportFile } from '@/lib/api/rails-export-types';
import {
    buildRailsExportZip,
    isUnsafeZipPath,
    RailsExportZipError,
    resolveRailsExportFilename,
} from '../rails-export-zip';
import { RAILS_EXPORT_FALLBACK_FILENAME } from '../rails-export-constants';

const sampleFiles: RailsExportFile[] = [
    { path: 'README.md', content: '# Shop' },
    {
        path: 'app/models/user.rb',
        content: 'class User < ApplicationRecord; end',
    },
    {
        path: 'db/migrate/20240101120001_create_users.rb',
        content: 'class CreateUsers < ActiveRecord::Migration[8.1]; end',
    },
    { path: 'db/schema.rb', content: 'ActiveRecord::Schema[8.1].define {}' },
];

describe('rails export zip helper', () => {
    it('converts each backend file into exactly one ZIP entry', () => {
        const zipBytes = buildRailsExportZip(sampleFiles);
        const unzipped = unzipSync(zipBytes);

        expect(Object.keys(unzipped)).toEqual([
            'README.md',
            'app/models/user.rb',
            'db/migrate/20240101120001_create_users.rb',
            'db/schema.rb',
        ]);
    });

    it('preserves nested paths and UTF-8 content without mutating source text', () => {
        const utf8Content = 'café — 日本語 — naïve';
        const files: RailsExportFile[] = [
            { path: 'app/models/café.rb', content: utf8Content },
        ];

        const zipBytes = buildRailsExportZip(files);
        const unzipped = unzipSync(zipBytes);

        expect(strFromU8(unzipped['app/models/café.rb']!)).toBe(utf8Content);
        expect(files[0]?.content).toBe(utf8Content);
    });

    it('does not add frontend-generated files such as FoxalDB-NOTES.md', () => {
        const zipBytes = buildRailsExportZip(sampleFiles);
        const unzipped = unzipSync(zipBytes);

        expect(Object.keys(unzipped)).toHaveLength(sampleFiles.length);
        expect(Object.keys(unzipped)).not.toContain('FoxalDB-NOTES.md');
        expect(Object.keys(unzipped)).not.toContain('NOTES.md');
    });

    it('uses deterministic entry order for identical backend files', () => {
        const first = Object.keys(unzipSync(buildRailsExportZip(sampleFiles)));
        const second = Object.keys(unzipSync(buildRailsExportZip(sampleFiles)));

        expect(first).toEqual(second);
        expect(first).toEqual(sampleFiles.map((file) => file.path));
    });

    it('uses deterministic ZIP metadata and bytes for identical backend files', () => {
        const first = buildRailsExportZip(sampleFiles);
        const second = buildRailsExportZip(sampleFiles);

        expect(Array.from(first)).toEqual(Array.from(second));
    });

    it('rejects ../ traversal paths without normalizing them', () => {
        expect(isUnsafeZipPath('../evil.rb')).toBe(true);
        expect(isUnsafeZipPath('app/../evil.rb')).toBe(true);

        try {
            buildRailsExportZip([{ path: '../evil.rb', content: 'bad' }]);
            expect.fail('expected unsafe path to throw');
        } catch (error) {
            expect(error).toBeInstanceOf(RailsExportZipError);
            expect((error as RailsExportZipError).code).toBe('unsafe_path');
            expect((error as RailsExportZipError).path).toBe('../evil.rb');
        }
    });

    it('rejects absolute Unix paths', () => {
        expect(isUnsafeZipPath('/tmp/evil.rb')).toBe(true);
        expect(() =>
            buildRailsExportZip([{ path: '/etc/passwd', content: 'bad' }])
        ).toThrowError(/unsafe/i);
    });

    it('rejects Windows drive paths', () => {
        expect(isUnsafeZipPath('C:\\Windows\\evil.rb')).toBe(true);
        expect(isUnsafeZipPath('D:/tmp/evil.rb')).toBe(true);
        expect(() =>
            buildRailsExportZip([
                { path: 'C:\\Windows\\evil.rb', content: 'bad' },
            ])
        ).toThrow(RailsExportZipError);
    });

    it('rejects backslash traversal', () => {
        expect(isUnsafeZipPath('app\\..\\evil.rb')).toBe(true);
        expect(() =>
            buildRailsExportZip([{ path: 'app\\..\\evil.rb', content: 'bad' }])
        ).toThrow(RailsExportZipError);
    });

    it('rejects empty paths', () => {
        expect(isUnsafeZipPath('')).toBe(true);
        expect(isUnsafeZipPath('   ')).toBe(true);
        expect(() =>
            buildRailsExportZip([{ path: '', content: 'bad' }])
        ).toThrow(RailsExportZipError);
    });

    it('rejects paths with NUL or other control characters', () => {
        expect(isUnsafeZipPath('app/models/user\u0000.rb')).toBe(true);
        expect(() =>
            buildRailsExportZip([
                { path: 'app/models/user\u0000.rb', content: 'bad' },
            ])
        ).toThrow(RailsExportZipError);
    });

    it('rejects duplicate paths instead of silently overwriting', () => {
        try {
            buildRailsExportZip([
                { path: 'app/models/user.rb', content: 'first' },
                { path: 'app/models/user.rb', content: 'second' },
            ]);
            expect.fail('expected duplicate path to throw');
        } catch (error) {
            expect(error).toBeInstanceOf(RailsExportZipError);
            expect((error as RailsExportZipError).code).toBe('duplicate_path');
            expect((error as RailsExportZipError).path).toBe(
                'app/models/user.rb'
            );
        }
    });

    it('fails safely when there are zero files', () => {
        try {
            buildRailsExportZip([]);
            expect.fail('expected empty files to throw');
        } catch (error) {
            expect(error).toBeInstanceOf(RailsExportZipError);
            expect((error as RailsExportZipError).code).toBe('empty_files');
        }
    });

    it('uses the backend filename when it is a valid archive name', () => {
        expect(resolveRailsExportFilename('shop-database-rails.zip')).toBe(
            'shop-database-rails.zip'
        );
    });

    it('falls back when the backend filename is missing or unsafe', () => {
        expect(resolveRailsExportFilename(undefined)).toBe(
            RAILS_EXPORT_FALLBACK_FILENAME
        );
        expect(resolveRailsExportFilename('../evil.zip')).toBe(
            RAILS_EXPORT_FALLBACK_FILENAME
        );
        expect(resolveRailsExportFilename('/tmp/evil.zip')).toBe(
            RAILS_EXPORT_FALLBACK_FILENAME
        );
        expect(resolveRailsExportFilename('foo/bar.zip')).toBe(
            RAILS_EXPORT_FALLBACK_FILENAME
        );
        expect(resolveRailsExportFilename('')).toBe(
            RAILS_EXPORT_FALLBACK_FILENAME
        );
        expect(RAILS_EXPORT_FALLBACK_FILENAME).toBe('diagram-rails.zip');
    });

    it('has no filesystem access', () => {
        const source = readFileSync(
            path.join(process.cwd(), 'src/lib/export/rails-export-zip.ts'),
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
            path.join(process.cwd(), 'src/lib/export/rails-export-zip.ts'),
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
        expect(packageJson.dependencies['jszip']).toBeUndefined();
        expect(packageJson.dependencies['adm-zip']).toBeUndefined();
        expect(packageJson.devDependencies?.jszip).toBeUndefined();
    });
});
