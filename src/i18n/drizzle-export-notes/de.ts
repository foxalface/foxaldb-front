import type { DrizzleExportNoteMessages } from './types';

export const drizzleExportNoteMessages: DrizzleExportNoteMessages = {
    view_skipped: 'View „{{path}}“ übersprungen.',
    keyless_table_skipped:
        'Tabelle „{{path}}“ übersprungen, weil sie keine sicher darstellbaren Spalten hat.',
    keyless_table:
        'Tabelle „{{path}}“ hat keinen Primärschlüssel und wird als native Drizzle-Tabelle exportiert, ohne eine id zu erfinden.',
    schema_ignored_sqlite:
        'SQLite verwendet das Schema „{{schema}}“ nicht; Tabelle „{{path}}“ wird ohne Schemaqualifizierer exportiert.',
    mysql_catalog_omitted:
        'MySQL-Katalog „{{catalog}}“ wird weggelassen; Drizzle verwendet unqualifizierte Tabellennamen und eine einzige Datenbankverbindung.',
    mysql_multiple_catalogs_ignored:
        'Der MySQL-Export lässt {{count}} Kataloge weg und erzeugt unqualifizierte Tabellennamen, weil die physischen Namen eindeutig bleiben.',
    mariadb_catalog_omitted:
        'MariaDB-Katalog „{{catalog}}“ wird weggelassen; Drizzle verwendet unqualifizierte Tabellennamen und eine einzige Datenbankverbindung.',
    mariadb_multiple_catalogs_ignored:
        'Der MariaDB-Export lässt {{count}} Kataloge weg und erzeugt unqualifizierte Tabellennamen, weil die physischen Namen eindeutig bleiben.',
    mariadb_mysql_dialect_adapted:
        'MariaDB wird mit den MySQL-APIs von Drizzle exportiert (Dialekt „{{dialect}}“). Drizzle 0.45 hat keinen erstklassigen MariaDB-Dialekt.',
    postgres_schema_qualified:
        'PostgreSQL-Schema „{{schema}}“ wird mit pgSchema() exportiert.',
    uuid_as_text:
        'UUID-Feld „{{path}}“ wird als Text exportiert, weil diese Datenbank in Drizzle 0.45 keinen nativen UUID-Typ hat.',
    increment_omitted:
        'Auto-Increment auf „{{path}}“ entfiel, weil es nicht sicher dargestellt werden kann.',
    set_null_omitted:
        'ON DELETE SET NULL auf „{{path}}“ entfiel, weil eine Fremdschlüsselspalte NOT NULL ist.',
    sqlite_boolean_integer:
        'Boolean-Feld „{{path}}“ wird als integer({ mode: "boolean" }) exportiert, weil SQLite keinen nativen Boolean-Typ hat.',
    sqlite_json_text:
        'JSON-Feld „{{path}}“ wird als text({ mode: "json" }) exportiert, weil SQLite JSON als TEXT speichert.',
    table_name_adjusted: {
        table: 'Tabelle „{{path}}“ wird als TypeScript-Konstante {{tsName}} exportiert. Der physische Tabellenname bleibt erhalten.',
        pgEnum: 'PostgreSQL-Enum „{{path}}“ wird als TypeScript-Konstante {{tsName}} exportiert. Der physische Enum-Name bleibt erhalten.',
        pgSchema:
            'PostgreSQL-Schema „{{path}}“ wird als TypeScript-Konstante {{tsName}} exportiert.',
    },
    table_name_collision:
        'Tabellenkonstante „{{tsName}}“ für „{{path}}“ wurde vergeben, um einen doppelten TypeScript-Bezeichner zu vermeiden.',
    column_name_adjusted:
        'Spalte „{{path}}“ wird als TypeScript-Eigenschaft {{tsName}} exportiert. Der physische Spaltenname bleibt erhalten.',
    relationship_skipped: {
        composite_fk_unresolved_members:
            'Zusammengesetzter Fremdschlüssel „{{path}}“ wurde übersprungen, weil Quell- und Zielspaltenlisten nicht beide vorhanden waren.',
        composite_fk_arity_mismatch:
            'Zusammengesetzter Fremdschlüssel „{{path}}“ wurde übersprungen, weil die Anzahl der Quell- und Zielspalten abweicht.',
        label_only:
            'Many-to-many-Beziehung „{{path}}“ wurde übersprungen, weil aus der Bezeichnung keine physische Join-Tabelle erkennbar ist.',
        table_not_exported:
            'Beziehung „{{path}}“ wurde übersprungen, weil eine referenzierte Tabelle nicht exportiert wurde.',
        unresolved_member:
            'Beziehung „{{path}}“ wurde übersprungen, weil ein referenziertes Feld nicht exportiert wurde.',
    },
    index_omitted: {
        unsupported_method:
            'Index „{{path}}“ entfiel, weil Typ „{{indexType}}“ nicht exportiert wird.',
        field_not_exported:
            'Index „{{path}}“ entfiel, weil ein referenziertes Feld nicht exportiert wurde.',
    },
    comment_omitted: {
        table: 'Tabellenkommentar auf „{{path}}“ entfällt, weil Drizzle 0.45 keine strukturierte Kommentar-API hat, die dieser Exporter verwendet.',
        column: 'Spaltenkommentar auf „{{path}}“ entfällt, weil Drizzle 0.45 keine strukturierte Kommentar-API hat, die dieser Exporter verwendet.',
    },
    check_omitted: {
        table: 'CHECK-Constraint auf „{{path}}“ entfällt, weil Roh-SQL nicht in den erzeugten TypeScript-Code eingefügt wird.',
        column: 'CHECK auf „{{path}}“ entfällt, weil Roh-SQL nicht in den erzeugten TypeScript-Code eingefügt wird.',
    },
    set_degraded: {
        set_as_text:
            'SET des Felds „{{path}}“ wird als Text exportiert; native SET-Typen werden nicht erzeugt.',
    },
    enum_degraded: {
        ts_enum_only:
            'Enum des Felds „{{path}}“ wird als text({ enum: [...] }) exportiert; SQLite hat keine physische Enum-Constraint.',
        unsupported_enum:
            'Enum des Felds „{{path}}“ wird als Text exportiert, weil es nicht als natives Drizzle-Enum darstellbar ist.',
        unknown_values:
            'Enum des Felds „{{path}}“ wird als Text exportiert, weil Enum-Werte fehlen.',
    },
    type_omitted: {
        array: 'Array-Feld auf „{{path}}“ wird aus dem Drizzle-Export weggelassen.',
        unsupported:
            'Feld auf „{{path}}“ entfiel, weil sein Typ nicht darstellbar ist.',
        unimplemented_database:
            'Typzuordnung ist für Datenbanktyp „{{databaseType}}“ nicht implementiert.',
    },
    type_degraded: {
        binary_as_bytea:
            'Binärtyp des Felds „{{path}}“ wird als bytea() exportiert.',
    },
    default_omitted: {
        unsupported_type:
            'Standardwert auf „{{path}}“ entfiel (nicht unterstützter Standardtyp).',
        current_timestamp_non_datetime:
            'Standardwert auf „{{path}}“ entfiel (CURRENT_TIMESTAMP auf einem Nicht-Datetime-Feld).',
        sql_expression:
            'Standardwert auf „{{path}}“ entfiel (nicht unterstützter SQL-Ausdruck: {{expression}}).',
        unclear:
            'Standardwert auf „{{path}}“ entfiel (unklarer Standard: {{expression}}).',
        boolean_on_non_boolean:
            'Standardwert auf „{{path}}“ entfiel (boolescher Standard auf einem Nicht-Boolean-Feld).',
        numeric_on_non_numeric:
            'Standardwert auf „{{path}}“ entfiel (numerischer Standard auf einem Nicht-Zahlenfeld).',
    },
};
