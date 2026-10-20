import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import {
    findSemanticField,
    findSemanticTable,
    postsToUsersFk,
    semanticFromSqlFixture,
} from './semantic-golden-helpers';

describe('M11.2 SQL semantic goldens', () => {
    describe('PostgreSQL', () => {
        it('imports postgres-baseline.sql with expected semantics', async () => {
            const semantic = await semanticFromSqlFixture(
                'postgres-baseline.sql',
                DatabaseType.POSTGRESQL
            );

            expect(semantic.databaseType).toBe(DatabaseType.POSTGRESQL);

            const publicUsers = findSemanticTable(semantic, 'users', 'public');
            const auditUsers = findSemanticTable(semantic, 'users', 'audit');
            expect(publicUsers).toBeDefined();
            expect(auditUsers).toBeDefined();

            const email = findSemanticField(publicUsers, 'email');
            expect(email?.nullable).toBe(false);
            expect(email?.unique).toBe(true);
            expect(email?.characterMaximumLength).toBe('255');
            const activeUsers = findSemanticTable(
                semantic,
                'active_users',
                'public'
            );
            expect(activeUsers?.isView).toBe(true);

            const fk = postsToUsersFk(semantic);
            expect(fk).toBeDefined();
            expect(fk?.deleteAction).toBe('cascade');
            expect(fk?.updateAction).toBe('restrict');

            const selfRef = semantic.relationships.find(
                (relationship) =>
                    relationship.referencing.table === 'categories' &&
                    relationship.referenced.table === 'categories'
            );
            expect(selfRef).toBeDefined();

            expect(semantic.customTypes.length).toBeGreaterThanOrEqual(1);
            expect(
                semantic.customTypes.some(
                    (customType) => customType.name === 'mood'
                )
            ).toBe(true);
        });
    });

    describe('CockroachDB', () => {
        it('imports cockroachdb-baseline.sql via PostgreSQL-compatible parser', async () => {
            const semantic = await semanticFromSqlFixture(
                'cockroachdb-baseline.sql',
                DatabaseType.COCKROACHDB
            );

            expect(semantic.databaseType).toBe(DatabaseType.COCKROACHDB);
            expect(
                findSemanticTable(semantic, 'users', 'public')
            ).toBeDefined();
            expect(postsToUsersFk(semantic)).toBeDefined();
        });
    });

    describe('MySQL', () => {
        it('imports mysql-baseline.sql with schema omitted and FK semantics', async () => {
            const semantic = await semanticFromSqlFixture(
                'mysql-baseline.sql',
                DatabaseType.MYSQL
            );

            expect(semantic.databaseType).toBe(DatabaseType.MYSQL);

            const users = findSemanticTable(semantic, 'users');
            expect(users?.schema === '' || users?.schema === undefined).toBe(
                true
            );

            const id = findSemanticField(users, 'id');
            expect(id?.primaryKey).toBe(true);
            expect(id?.increment).toBe(true);

            const email = findSemanticField(users, 'email');
            expect(email?.characterMaximumLength).toBe('255');

            const status = findSemanticField(users, 'status');
            expect(status?.default).toBeTruthy();

            const projects = findSemanticTable(semantic, 'projects');
            const compositeUnique = projects?.indexes?.find(
                (index) => index.name === 'uq_projects_org_key' && index.unique
            );
            expect(compositeUnique?.fieldNames).toEqual([
                'org_id',
                'project_key',
            ]);
            expect(findSemanticField(projects, 'org_id')?.unique).toBe(false);

            const activeUsers = findSemanticTable(semantic, 'active_users');
            expect(activeUsers?.isView).toBe(true);

            const fk = postsToUsersFk(semantic);
            expect(fk?.deleteAction).toBe('cascade');
        });
    });

    describe('MariaDB', () => {
        it('imports mariadb-baseline.sql as mariadb with composite unique index', async () => {
            const semantic = await semanticFromSqlFixture(
                'mariadb-baseline.sql',
                DatabaseType.MARIADB
            );

            expect(semantic.databaseType).toBe(DatabaseType.MARIADB);
            expect(
                findSemanticTable(semantic, 'users')?.schema === '' ||
                    findSemanticTable(semantic, 'users')?.schema === undefined
            ).toBe(true);
            expect(postsToUsersFk(semantic)).toBeDefined();

            const projects = findSemanticTable(semantic, 'projects');
            expect(
                projects?.indexes?.some(
                    (index) =>
                        index.name === 'uq_projects_org_key' &&
                        index.unique &&
                        index.fieldNames.join(',') === 'org_id,project_key'
                )
            ).toBe(true);
        });
    });

    describe('SQLite', () => {
        it('imports sqlite-baseline.sql without schema', async () => {
            const semantic = await semanticFromSqlFixture(
                'sqlite-baseline.sql',
                DatabaseType.SQLITE
            );

            expect(semantic.databaseType).toBe(DatabaseType.SQLITE);
            const users = findSemanticTable(semantic, 'users');
            expect(users?.schema === '' || users?.schema === undefined).toBe(
                true
            );

            const id = findSemanticField(users, 'id');
            expect(id?.primaryKey).toBe(true);
            expect(id?.increment).toBe(true);

            expect(postsToUsersFk(semantic)?.deleteAction).toBe('cascade');
        });
    });

    describe('SQL Server', () => {
        it('imports sqlserver-baseline.sql with dbo schema', async () => {
            const semantic = await semanticFromSqlFixture(
                'sqlserver-baseline.sql',
                DatabaseType.SQL_SERVER
            );

            expect(semantic.databaseType).toBe(DatabaseType.SQL_SERVER);
            const users = findSemanticTable(semantic, 'users', 'dbo');
            expect(users).toBeDefined();

            const id = findSemanticField(users, 'id');
            expect(id?.increment).toBe(true);
            expect(id?.primaryKey).toBe(true);

            const email = findSemanticField(users, 'email');
            expect(email?.characterMaximumLength).toBe('255');

            expect(
                findSemanticTable(semantic, 'active_users', 'dbo')?.isView
            ).toBe(true);
            expect(postsToUsersFk(semantic)).toBeDefined();
        });
    });

    describe('Oracle', () => {
        it('imports oracle-baseline.sql with NUMBER metadata and FK', async () => {
            const semantic = await semanticFromSqlFixture(
                'oracle-baseline.sql',
                DatabaseType.ORACLE
            );

            expect(semantic.databaseType).toBe(DatabaseType.ORACLE);

            const departments = findSemanticTable(semantic, 'departments');
            const budget = findSemanticField(departments, 'budget');
            expect(budget?.precision).toBe(12);
            expect(budget?.scale).toBe(2);

            const employees = findSemanticTable(semantic, 'employees');
            const departmentId = findSemanticField(employees, 'department_id');

            const fk = semantic.relationships.find(
                (relationship) =>
                    relationship.referencing.field === 'department_id' &&
                    relationship.referenced.table === 'departments'
            );
            expect(fk).toBeDefined();
            expect(departmentId?.nullable).toBe(true);
        });
    });

    describe('PostgreSQL dump', () => {
        it('imports postgres-dump-baseline.sql as postgres_dump semantics', async () => {
            const semantic = await semanticFromSqlFixture(
                'postgres-dump-baseline.sql',
                DatabaseType.POSTGRESQL
            );

            expect(
                findSemanticTable(semantic, 'users', 'public')
            ).toBeDefined();
            expect(postsToUsersFk(semantic)?.deleteAction).toBe('cascade');
        });
    });
});
