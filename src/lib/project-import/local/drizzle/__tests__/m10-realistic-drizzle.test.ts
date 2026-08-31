import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import { sqlImportToDiagram } from '@/lib/data/sql-import';
import { parseDrizzleProject } from '../drizzle-project-parser';
import { QA_DRIZZLE_SQL } from '../../rails/__tests__/fixtures/m10-realistic-fixtures';

describe('M10.1 realistic Drizzle SQL migrations', () => {
    it('imports two CREATE TABLE statements from one SQL document', async () => {
        const diagram = await sqlImportToDiagram({
            sqlContent: QA_DRIZZLE_SQL,
            sourceDatabaseType: DatabaseType.MYSQL,
            targetDatabaseType: DatabaseType.MYSQL,
        });

        expect(diagram.tables?.map((table) => table.name).sort()).toEqual([
            'posts',
            'users',
        ]);
        expect(diagram.relationships?.length).toBe(1);
        expect(diagram.relationships?.[0]?.onDelete).toBe('cascade');
    });

    it('imports three CREATE TABLE statements sequentially', async () => {
        const sql = `${QA_DRIZZLE_SQL}\n\nCREATE TABLE \`comments\` (\n  \`id\` bigint NOT NULL AUTO_INCREMENT,\n  \`post_id\` bigint NOT NULL,\n  PRIMARY KEY (\`id\`)\n);`;

        const diagram = await sqlImportToDiagram({
            sqlContent: sql,
            sourceDatabaseType: DatabaseType.MYSQL,
            targetDatabaseType: DatabaseType.MYSQL,
        });

        expect(diagram.tables?.map((table) => table.name).sort()).toEqual([
            'comments',
            'posts',
            'users',
        ]);
    });

    it('imports realistic SQL when migration file uses carriage-return line endings', async () => {
        const diagram = await sqlImportToDiagram({
            sqlContent: QA_DRIZZLE_SQL.replace(/\n/g, '\r'),
            sourceDatabaseType: DatabaseType.MYSQL,
            targetDatabaseType: DatabaseType.MYSQL,
        });

        expect(diagram.tables?.map((table) => table.name).sort()).toEqual([
            'posts',
            'users',
        ]);
    });

    it('imports realistic Drizzle project bundle paths', async () => {
        const result = await parseDrizzleProject({
            candidate: {
                framework: 'drizzle',
                rootPath: '',
                relevantFiles: [
                    'drizzle/0000_initial.sql',
                    'drizzle/meta/_journal.json',
                    'drizzle.config.ts',
                ],
                score: 20,
                confidence: 'high',
                evidence: [],
                parserLocation: 'local',
            },
            bundle: {
                framework: 'drizzle',
                rootPath: '',
                files: [
                    {
                        relativePath: 'drizzle/0000_initial.sql',
                        content: QA_DRIZZLE_SQL,
                    },
                    {
                        relativePath: 'drizzle/meta/_journal.json',
                        content: JSON.stringify({
                            version: '7',
                            dialect: 'mysql',
                            entries: [
                                {
                                    idx: 0,
                                    version: '5',
                                    when: 1,
                                    tag: '0000_initial',
                                    breakpoints: true,
                                },
                            ],
                        }),
                    },
                    {
                        relativePath: 'drizzle.config.ts',
                        content: "export default { dialect: 'mysql' };",
                    },
                ],
            },
            targetDatabaseType: DatabaseType.MYSQL,
        });

        expect(
            result.diagram.tables?.map((table) => table.name).sort()
        ).toEqual(['posts', 'users']);
    });
});
