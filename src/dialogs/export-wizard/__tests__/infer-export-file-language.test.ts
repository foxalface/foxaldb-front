import { describe, expect, it } from 'vitest';
import {
    inferExportFileLanguage,
    isMarkdownExportFile,
} from '../infer-export-file-language';

describe('isMarkdownExportFile', () => {
    it('detects markdown extensions', () => {
        expect(isMarkdownExportFile('README.md')).toBe(true);
        expect(isMarkdownExportFile('FoxalDB-NOTES.markdown')).toBe(true);
        expect(isMarkdownExportFile('app/models/user.rb')).toBe(false);
    });
});

describe('inferExportFileLanguage', () => {
    it('maps known extensions to Monaco languages', () => {
        expect(inferExportFileLanguage('schema.sql')).toBe('sql');
        expect(inferExportFileLanguage('diagram.json')).toBe('json');
        expect(inferExportFileLanguage('schema.prisma')).toBe('prisma');
        expect(inferExportFileLanguage('schema.dbml')).toBe('dbml');
        expect(inferExportFileLanguage('setup.sh')).toBe('shell');
    });

    it('maps framework source files to Monaco languages', () => {
        expect(inferExportFileLanguage('app/models/user.rb')).toBe('ruby');
        expect(inferExportFileLanguage('models/user.py')).toBe('python');
        expect(inferExportFileLanguage('Entities/User.cs')).toBe('csharp');
        expect(inferExportFileLanguage('schema.ts')).toBe('typescript');
        expect(inferExportFileLanguage('schema/index.tsx')).toBe('typescript');
        expect(inferExportFileLanguage('App.csproj')).toBe('xml');
        expect(inferExportFileLanguage('config/database.yml')).toBe('yaml');
    });

    it('falls back to plaintext for unknown extensions', () => {
        expect(inferExportFileLanguage('README.txt')).toBe('plaintext');
    });
});
