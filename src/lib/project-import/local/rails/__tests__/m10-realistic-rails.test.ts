import { describe, expect, it } from 'vitest';
import { parseRailsSchema } from '../rails-schema-parser';
import { parseRailsProject } from '../rails-project-parser';
import { DatabaseType } from '@/lib/domain/database-type';
import { QA_RAILS_SCHEMA } from './fixtures/m10-realistic-fixtures';

describe('M10.1 realistic Rails schema.rb', () => {
    it('parses exact QA schema with tables, indexes, and foreign key', () => {
        const document = parseRailsSchema(QA_RAILS_SCHEMA);

        expect(document.tables).toHaveLength(2);
        expect(document.foreignKeys).toHaveLength(1);
        expect(document.foreignKeys[0]).toMatchObject({
            fromTable: 'posts',
            toTable: 'users',
            column: 'user_id',
            onDelete: 'cascade',
        });
    });

    it('parses realistic schema when file uses carriage-return line endings', () => {
        const document = parseRailsSchema(QA_RAILS_SCHEMA.replace(/\n/g, '\r'));

        expect(document.tables).toHaveLength(2);
        expect(document.foreignKeys).toHaveLength(1);
    });

    it('imports realistic schema through project bundle path', async () => {
        const result = await parseRailsProject({
            candidate: {
                framework: 'rails',
                rootPath: '',
                relevantFiles: ['db/schema.rb'],
                score: 20,
                confidence: 'high',
                evidence: [],
                parserLocation: 'local',
            },
            bundle: {
                framework: 'rails',
                rootPath: '',
                files: [
                    {
                        relativePath: 'db/schema.rb',
                        content: QA_RAILS_SCHEMA,
                    },
                ],
            },
            targetDatabaseType: DatabaseType.POSTGRESQL,
        });

        expect(
            result.diagram.tables?.map((table) => table.name).sort()
        ).toEqual(['posts', 'users']);
        expect(result.diagram.relationships?.length).toBe(1);
    });
});
