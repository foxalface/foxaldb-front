import { describe, expect, it } from 'vitest';
import { DatabaseType } from '../database-type';
import {
    listDiagramSchemaOptions,
    tablePassesAreaConstraint,
    tablePassesSchemaConstraint,
} from '../editor-filter-eligibility';

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
        expect(
            tablePassesSchemaConstraint({ schema: null }, ['public'], undefined)
        ).toBe(false);
    });

    it('treats an empty area or schema selection as no constraint and ORs selections', () => {
        expect(tablePassesAreaConstraint(null, [])).toBe(true);
        expect(tablePassesAreaConstraint('area-a', ['area-a', 'area-b'])).toBe(
            true
        );
        expect(tablePassesAreaConstraint(null, ['area-a'])).toBe(false);
        expect(tablePassesAreaConstraint('area-c', ['area-a'])).toBe(false);

        expect(
            tablePassesSchemaConstraint({ schema: 'public' }, [], 'public')
        ).toBe(true);
        expect(
            tablePassesSchemaConstraint(
                { schema: null },
                ['public', 'billing'],
                'public'
            )
        ).toBe(true);
        expect(
            tablePassesSchemaConstraint(
                { schema: 'other' },
                ['public'],
                'public'
            )
        ).toBe(false);
    });
});
