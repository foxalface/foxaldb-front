import { describe, expect, it } from 'vitest';
import {
    normalizeColumnName,
    normalizeTableName,
} from '../normalize-identifier';

describe('normalizeIdentifier', () => {
    it.each([
        ['table_B', 'table_b'],
        ['table__B', 'table_b'],
        ['TableName', 'table_name'],
        ['__weird__', 'weird'],
    ])('normalizes table name %s to %s', (input, expected) => {
        expect(normalizeTableName(input)).toBe(expected);
    });

    it.each([
        ['ID', 'id'],
        ['user_ID', 'user_id'],
    ])('normalizes column name %s to %s', (input, expected) => {
        expect(normalizeColumnName(input)).toBe(expected);
    });

    it('falls back to unnamed for empty table names', () => {
        expect(normalizeTableName('___')).toBe('unnamed');
    });

    it('falls back to column for empty column names', () => {
        expect(normalizeColumnName('___')).toBe('column');
    });
});
