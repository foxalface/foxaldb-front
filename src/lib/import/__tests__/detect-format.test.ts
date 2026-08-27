import { describe, expect, it } from 'vitest';
import { detectImportFormat } from '../detect-format';
import {
    dbmlSample,
    diagramJsonSample,
    genericAmbiguousSql,
    malformedContent,
    metadataJsonSample,
    ordinaryJsonSample,
    postgresDumpSql,
    postgresDistinctiveSql,
    randomText,
} from './fixtures/import-samples';

describe('detectImportFormat', () => {
    it('recognizes DBML', () => {
        const result = detectImportFormat(dbmlSample);
        expect(result).toEqual({ format: 'dbml', confidence: 'high' });
    });

    it('recognizes generic SQL', () => {
        const result = detectImportFormat(genericAmbiguousSql);
        expect(result).toEqual({ format: 'sql', confidence: 'high' });
    });

    it('recognizes PostgreSQL dump as the more specific subtype', () => {
        const result = detectImportFormat(postgresDumpSql);
        expect(result).toEqual({
            format: 'postgres_dump',
            confidence: 'high',
        });
    });

    it('recognizes distinctive PostgreSQL SQL as generic sql format', () => {
        const result = detectImportFormat(postgresDistinctiveSql);
        expect(result).toEqual({ format: 'sql', confidence: 'high' });
    });

    it('recognizes metadata JSON structurally', () => {
        const result = detectImportFormat(metadataJsonSample);
        expect(result).toEqual({
            format: 'metadata_json',
            confidence: 'high',
        });
    });

    it('does not classify ordinary arbitrary JSON as metadata JSON', () => {
        const result = detectImportFormat(ordinaryJsonSample);
        expect(result).toEqual({
            format: 'unsupported',
            confidence: 'unsupported',
        });
    });

    it('detects diagram JSON only when structurally valid enough', () => {
        const result = detectImportFormat(diagramJsonSample);
        expect(result).toEqual({
            format: 'diagram_json',
            confidence: 'high',
        });
    });

    it('classifies random text as unsupported', () => {
        const result = detectImportFormat(randomText);
        expect(result).toEqual({
            format: 'unsupported',
            confidence: 'unsupported',
        });
    });

    it('classifies empty content as unsupported', () => {
        expect(detectImportFormat('')).toEqual({
            format: 'unsupported',
            confidence: 'unsupported',
        });
    });

    it('classifies whitespace-only content as unsupported', () => {
        expect(detectImportFormat('   \n\t  ')).toEqual({
            format: 'unsupported',
            confidence: 'unsupported',
        });
    });

    it('classifies malformed content as unsupported', () => {
        const result = detectImportFormat(malformedContent);
        expect(result).toEqual({
            format: 'unsupported',
            confidence: 'unsupported',
        });
    });

    it('returns deterministic results on repeated calls', () => {
        const first = detectImportFormat(postgresDumpSql);
        const second = detectImportFormat(postgresDumpSql);
        expect(first).toEqual(second);
    });

    it('prioritizes DBML over SQL when both patterns exist', () => {
        const content = `CREATE TABLE test (id int);
${dbmlSample}`;
        const result = detectImportFormat(content);
        expect(result.format).toBe('dbml');
    });

    it('prioritizes metadata JSON over SQL DDL keywords inside JSON', () => {
        const result = detectImportFormat(metadataJsonSample);
        expect(result.format).toBe('metadata_json');
    });
});
