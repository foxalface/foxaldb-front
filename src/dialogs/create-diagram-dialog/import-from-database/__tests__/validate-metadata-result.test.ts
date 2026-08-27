import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import { metadataJsonSample } from '@/lib/import/__tests__/fixtures/import-samples';
import {
    repairMetadataResult,
    validateMetadataResult,
} from '../validate-metadata-result';
import { SSMS_TRUNCATION_LENGTH } from '../constants';

describe('validateMetadataResult', () => {
    it('accepts valid metadata JSON', () => {
        const result = validateMetadataResult(metadataJsonSample, {
            databaseType: DatabaseType.POSTGRESQL,
            repairAttempts: 0,
        });

        expect(result.state).toBe('valid');
        expect(result.canContinue).toBe(true);
        expect(result.normalizedContent).toBe(metadataJsonSample.trim());
    });

    it('flags truncated SQL Server results', () => {
        const truncated = 'x'.repeat(SSMS_TRUNCATION_LENGTH);
        const result = validateMetadataResult(truncated, {
            databaseType: DatabaseType.SQL_SERVER,
            repairAttempts: 0,
        });

        expect(result.state).toBe('truncated');
        expect(result.canContinue).toBe(false);
    });

    it('marks malformed JSON as repairable before attempts are exhausted', () => {
        const result = validateMetadataResult('{ invalid json }', {
            databaseType: DatabaseType.POSTGRESQL,
            repairAttempts: 0,
        });

        expect(result.state).toBe('repairable');
        expect(result.canContinue).toBe(false);
    });

    it('marks malformed JSON as invalid after repair attempts', () => {
        const result = validateMetadataResult('{ invalid json }', {
            databaseType: DatabaseType.POSTGRESQL,
            repairAttempts: 1,
        });

        expect(result.state).toBe('invalid');
    });
});

describe('repairMetadataResult', () => {
    it('returns null when repair cannot produce valid metadata', () => {
        expect(repairMetadataResult('{ definitely not metadata }')).toBeNull();
    });
});
