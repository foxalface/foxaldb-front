import { describe, expect, it } from 'vitest';
import {
    REFERENTIAL_ACTION_NONE,
    buildRelationshipReferentialActions,
    buildRelationshipReferentialActionsFromDefinition,
    extractConstraintScopedSqlFragment,
    extractSqlReferentialActionPhrases,
    fromOnDeleteSelectValue,
    fromOnUpdateSelectValue,
    isSingleForeignKeySqlDefinition,
    mapParserReferentialOnActions,
    mapSqlOnDeleteAction,
    mapSqlOnUpdateAction,
    parseSqlReferentialActionsFromDefinition,
    resolveSqlReferentialActionPhrases,
    toOnDeleteSelectValue,
    toOnUpdateSelectValue,
} from '../foreign-key-referential-action';

describe('foreign-key-referential-action', () => {
    it('maps onDelete actions to and from select values', () => {
        expect(toOnDeleteSelectValue(undefined)).toBe(REFERENTIAL_ACTION_NONE);
        expect(toOnDeleteSelectValue(null)).toBe(REFERENTIAL_ACTION_NONE);
        expect(toOnDeleteSelectValue('set_null')).toBe('set_null');

        expect(fromOnDeleteSelectValue(REFERENTIAL_ACTION_NONE)).toBeNull();
        expect(fromOnDeleteSelectValue('cascade')).toBe('cascade');
        expect(fromOnDeleteSelectValue('set_null')).toBe('set_null');
        expect(fromOnDeleteSelectValue('restrict')).toBe('restrict');
        expect(fromOnDeleteSelectValue('invalid')).toBeNull();
    });

    it('maps onUpdate actions to and from select values', () => {
        expect(toOnUpdateSelectValue(undefined)).toBe(REFERENTIAL_ACTION_NONE);
        expect(toOnUpdateSelectValue(null)).toBe(REFERENTIAL_ACTION_NONE);
        expect(toOnUpdateSelectValue('restrict')).toBe('restrict');

        expect(fromOnUpdateSelectValue(REFERENTIAL_ACTION_NONE)).toBeNull();
        expect(fromOnUpdateSelectValue('cascade')).toBe('cascade');
        expect(fromOnUpdateSelectValue('restrict')).toBe('restrict');
        expect(fromOnUpdateSelectValue('set_null')).toBeNull();
    });

    it('maps SQL ON DELETE actions to DBRelationship values', () => {
        expect(mapSqlOnDeleteAction('CASCADE')).toBe('cascade');
        expect(mapSqlOnDeleteAction('SET NULL')).toBe('set_null');
        expect(mapSqlOnDeleteAction('SET_NULL')).toBe('set_null');
        expect(mapSqlOnDeleteAction('RESTRICT')).toBe('restrict');
        expect(mapSqlOnDeleteAction('NO ACTION')).toBeNull();
        expect(mapSqlOnDeleteAction('NO_ACTION')).toBeNull();
        expect(mapSqlOnDeleteAction('SET DEFAULT')).toBeNull();
        expect(mapSqlOnDeleteAction(undefined)).toBeNull();
    });

    it('maps SQL ON UPDATE actions to DBRelationship values', () => {
        expect(mapSqlOnUpdateAction('CASCADE')).toBe('cascade');
        expect(mapSqlOnUpdateAction('RESTRICT')).toBe('restrict');
        expect(mapSqlOnUpdateAction('SET NULL')).toBeNull();
        expect(mapSqlOnUpdateAction('NO ACTION')).toBeNull();
        expect(mapSqlOnUpdateAction('SET DEFAULT')).toBeNull();
    });

    it('parses referential actions from fk definitions in either clause order', () => {
        expect(
            parseSqlReferentialActionsFromDefinition(
                'FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE RESTRICT'
            )
        ).toEqual({
            onDelete: 'cascade',
            onUpdate: 'restrict',
        });

        expect(
            parseSqlReferentialActionsFromDefinition(
                'FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE RESTRICT)'
            )
        ).toEqual({
            onDelete: 'cascade',
            onUpdate: 'restrict',
        });

        expect(
            extractSqlReferentialActionPhrases(
                'FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE RESTRICT'
            )
        ).toEqual({
            deleteAction: 'CASCADE',
            updateAction: 'RESTRICT',
        });

        expect(
            parseSqlReferentialActionsFromDefinition(
                'FOREIGN KEY (user_id) REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE SET NULL'
            )
        ).toEqual({
            onDelete: 'set_null',
            onUpdate: 'cascade',
        });
    });

    it('supplements missing parser actions from SQL definition text', () => {
        expect(
            resolveSqlReferentialActionPhrases(
                'FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE RESTRICT',
                'CASCADE',
                undefined
            )
        ).toEqual({
            deleteAction: 'CASCADE',
            updateAction: 'RESTRICT',
        });
    });

    it('builds relationship referential action fields omitting unsupported values', () => {
        expect(
            buildRelationshipReferentialActions('CASCADE', 'RESTRICT')
        ).toEqual({
            onDelete: 'cascade',
            onUpdate: 'restrict',
        });

        expect(
            buildRelationshipReferentialActions('SET DEFAULT', null)
        ).toEqual({});

        expect(
            buildRelationshipReferentialActionsFromDefinition(
                'FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT'
            )
        ).toEqual({
            onDelete: 'restrict',
        });
    });

    it('supplements missing parser actions when building relationship fields from SQL text', () => {
        expect(
            buildRelationshipReferentialActions(
                'CASCADE',
                undefined,
                'FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE RESTRICT'
            )
        ).toEqual({
            onDelete: 'cascade',
            onUpdate: 'restrict',
        });
    });

    it('treats a single-FK SQL fragment as a valid action fallback', () => {
        expect(
            isSingleForeignKeySqlDefinition(
                'FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL'
            )
        ).toBe(true);

        expect(
            isSingleForeignKeySqlDefinition(
                'ALTER TABLE ONLY playlists ADD CONSTRAINT fk_playlists_user_id FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL;'
            )
        ).toBe(true);
    });

    it('rejects multi-FK CREATE TABLE SQL as an action fallback', () => {
        const createTableSql = `
CREATE TABLE projects (
    id BIGINT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    owner_id BIGINT,
    CONSTRAINT projects_org_fk
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT projects_owner_id_fk
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
);
        `;

        expect(isSingleForeignKeySqlDefinition(createTableSql)).toBe(false);

        expect(
            buildRelationshipReferentialActions(
                undefined,
                undefined,
                createTableSql
            )
        ).toEqual({});

        expect(
            buildRelationshipReferentialActions(
                'SET NULL',
                undefined,
                createTableSql
            )
        ).toEqual({
            onDelete: 'set_null',
        });
    });

    it('maps node-sql-parser on_action entries into SQL action phrases', () => {
        expect(
            mapParserReferentialOnActions([
                {
                    type: 'on delete',
                    value: { type: 'origin', value: 'set null' },
                },
                {
                    type: 'on update',
                    value: { type: 'origin', value: 'cascade' },
                },
            ])
        ).toEqual({
            deleteAction: 'set null',
            updateAction: 'cascade',
        });

        expect(mapParserReferentialOnActions([])).toEqual({});
        expect(mapParserReferentialOnActions(undefined)).toEqual({});
    });

    it('extracts a constraint-scoped SQL fragment after a FK match', () => {
        const sql =
            'FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL, FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE';
        const match =
            /FOREIGN\s+KEY\s*\(\s*owner_id\s*\)\s*REFERENCES\s+users\s*\(\s*id\s*\)/i.exec(
                sql
            );

        expect(match).not.toBeNull();
        expect(
            extractConstraintScopedSqlFragment(
                sql,
                match?.index ?? 0,
                match?.[0].length ?? 0
            )
        ).toBe(
            'FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL'
        );
    });
});
