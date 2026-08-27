import type { DatabaseType } from '@/lib/domain/database-type';

export type ImportFormat =
    | 'dbml'
    | 'sql'
    | 'postgres_dump'
    | 'metadata_json'
    | 'diagram_json'
    | 'unsupported';

export type DetectionConfidence = 'high' | 'ambiguous' | 'unsupported';

export type DialectEvidenceCode =
    | 'pg_dump_marker'
    | 'pg_copy_from_stdin'
    | 'pg_dump_comment'
    | 'pg_alter_table_only'
    | 'pg_create_extension'
    | 'pg_serial'
    | 'pg_bigserial'
    | 'pg_jsonb'
    | 'pg_return_setof'
    | 'pg_with_oids'
    | 'mysql_auto_increment'
    | 'mysql_engine_innodb'
    | 'mysql_definer'
    | 'mysql_dump_marker'
    | 'mysql_charset'
    | 'mysql_backtick_identifiers'
    | 'mariadb_dump_marker'
    | 'sqlserver_ansi_nulls'
    | 'sqlserver_quoted_identifier'
    | 'sqlserver_identity'
    | 'sqlserver_uniqueidentifier'
    | 'sqlserver_bracket_schema'
    | 'sqlserver_nvarchar'
    | 'sqlserver_datetime2'
    | 'sqlite_pragma'
    | 'sqlite_autoincrement'
    | 'sqlite_sequence'
    | 'oracle_varchar2'
    | 'oracle_number'
    | 'oracle_sysdate'
    | 'oracle_tablespace'
    | 'oracle_clob'
    | 'cockroach_dump_marker'
    | 'cockroach_crdb_internal'
    | 'clickhouse_merge_tree'
    | 'clickhouse_engine'
    | 'generic_ddl'
    | 'double_quote_identifiers'
    | 'selected_target_hint';

export type DialectEvidenceSubject = DatabaseType | 'clickhouse';

export interface DialectEvidence {
    databaseType: DialectEvidenceSubject;
    code: DialectEvidenceCode;
    weight: number;
}

export interface FormatDetectionResult {
    format: ImportFormat;
    confidence: DetectionConfidence;
}

export interface DialectDetectionResult {
    scores: Partial<Record<DatabaseType, number>>;
    top: DatabaseType | null;
    confidence: DetectionConfidence;
    candidates: DatabaseType[];
    evidence: DialectEvidence[];
    /** False when the best-matching dialect has no SQL DDL importer in this repo. */
    ddlImportSupported: boolean;
}

export interface DetectSqlDialectOptions {
    /** Step-1 selected DBMS; applied only as a weak tie-breaker hint. */
    selectedDatabaseType?: DatabaseType;
}
