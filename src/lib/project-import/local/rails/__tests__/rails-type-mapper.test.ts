import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import { mapRailsColumnType } from '../rails-type-mapper';

describe('mapRailsColumnType', () => {
    it.each([
        [DatabaseType.POSTGRESQL, 'string', 'varchar'],
        [DatabaseType.POSTGRESQL, 'boolean', 'boolean'],
        [DatabaseType.POSTGRESQL, 'jsonb', 'jsonb'],
        [DatabaseType.SQL_SERVER, 'boolean', 'bit'],
        [DatabaseType.MYSQL, 'datetime', 'datetime'],
        [DatabaseType.SQLITE, 'binary', 'blob'],
    ])('maps %s %s to %s', (databaseType, railsType, expectedTypeId) => {
        expect(mapRailsColumnType(railsType, databaseType).id).toBe(
            expectedTypeId
        );
    });
});
