import { describe, expect, it } from 'vitest';
import {
    dbmlSample,
    diagramJsonSample,
    postgresDistinctiveSql,
} from '@/lib/import/__tests__/fixtures/import-samples';
import { inferSchemaSourceEditorLanguage } from '../infer-schema-source-editor-language';

describe('inferSchemaSourceEditorLanguage', () => {
    it('returns plaintext for empty content without a file', () => {
        expect(inferSchemaSourceEditorLanguage('', null)).toBe('plaintext');
    });

    it('infers SQL from schema text', () => {
        expect(
            inferSchemaSourceEditorLanguage(postgresDistinctiveSql, null)
        ).toBe('sql');
    });

    it('infers DBML from schema text', () => {
        expect(inferSchemaSourceEditorLanguage(dbmlSample, null)).toBe('dbml');
    });

    it('infers JSON from diagram export text', () => {
        expect(inferSchemaSourceEditorLanguage(diagramJsonSample, null)).toBe(
            'json'
        );
    });

    it('uses file extension when content is empty', () => {
        expect(
            inferSchemaSourceEditorLanguage('', 'migrations/schema.sql')
        ).toBe('sql');
        expect(inferSchemaSourceEditorLanguage('', 'model.dbml')).toBe('dbml');
    });
});
