import { describe, expect, it } from 'vitest';
import { DatabaseType } from '../database-type';
import { listDiagramSchemaOptions } from '../editor-filter-eligibility';

describe('editor filter eligibility', () => {
    it('lists schemas with the legacy schema id and the default schema', () => {
        expect(
            listDiagramSchemaOptions(
                [
                    { schema: 'Billing' },
                    { schema: null },
                    { schema: 'billing' },
                    {},
                ],
                DatabaseType.POSTGRESQL
            )
        ).toEqual([
            { id: 'billing', name: 'Billing' },
            { id: 'public', name: 'public' },
        ]);
    });

    it('does not invent a schema when the database has no default and the table has none', () => {
        expect(
            listDiagramSchemaOptions([{ schema: null }, {}], DatabaseType.MYSQL)
        ).toEqual([]);
    });
});
