import type { RailsExportNoteMessages } from './types';

export const railsExportNoteMessages: RailsExportNoteMessages = {
    view_skipped: 'View "{{path}}" übersprungen.',
    schema_ignored_sqlite:
        'SQLite verwendet kein Schema "{{schema}}"; Tabelle "{{path}}" wird ohne Schema-Qualifizierung exportiert.',
    mysql_catalog_omitted:
        'MySQL-Katalog "{{catalog}}" wird weggelassen; Rails verwendet die verbundene Datenbank und nicht qualifizierte Tabellennamen.',
    mysql_multiple_catalogs_ignored:
        'Der MySQL-Export lässt {{count}} Kataloge weg und gibt nicht qualifizierte Tabellennamen aus, da die physischen Namen eindeutig bleiben.',
    mariadb_catalog_omitted:
        'MariaDB-Katalog "{{catalog}}" wird weggelassen; Rails verwendet die verbundene Datenbank und nicht qualifizierte Tabellennamen.',
    mariadb_multiple_catalogs_ignored:
        'Der MariaDB-Export lässt {{count}} Kataloge weg und gibt nicht qualifizierte Tabellennamen aus, da die physischen Namen eindeutig bleiben.',
    composite_fk_unsupported:
        'Zusammengesetzter Fremdschlüssel "{{path}}" wird nicht exportiert; Rails V1 gibt nur sichere einsprachige Fremdschlüssel aus.',
    keyless_relationship_skipped:
        'Beziehung "{{path}}" wurde übersprungen, da die Haupttabelle keine Fremdschlüssel-Semantik unterstützt.',
    many_to_many_skipped:
        'n:m-Beziehung "{{path}}" wurde übersprungen; keine einzelne Fremdschlüsselseite konnte aus der Bezeichnung abgeleitet werden.',
    keyless_model:
        'Tabelle "{{path}}" hat keinen Primärschlüssel. Das Modell setzt self.primary_key = nil; die Active Record-Persistenz kann eingeschränkt sein.',
    one_to_one_degraded_non_unique_fk:
        '1:1-Beziehung auf "{{path}}" wird als has_many exportiert, da der Fremdschlüssel nicht eindeutig ist.',
    many_to_many_through_skipped:
        'has_many :through wurde für Verknüpfungstabelle "{{path}}" nicht erzeugt, da die Assoziationsnamen mehrdeutig waren.',
    model_name_adjusted:
        'Modellklasse für Tabelle "{{path}}" wurde als {{className}} zugewiesen.',
    model_name_collision:
        'Modellklasse "{{className}}" für Tabelle "{{path}}" wurde zugewiesen, um eine doppelte Konstante zu vermeiden.',
    on_update_omitted:
        'ON UPDATE "{{action}}" wird in Rails 8.1 schema.rb add_foreign_key für "{{path}}" nicht abgebildet.',
    set_null_omitted: {
        delete: 'ON DELETE SET NULL wurde für "{{path}}" weggelassen, da die Fremdschlüsselspalte nicht nullable ist.',
        update: 'ON UPDATE SET NULL wurde für "{{path}}" weggelassen, da die Fremdschlüsselspalte nicht nullable ist.',
    },
    association_name_adjusted: {
        belongs_to:
            'belongs_to auf "{{path}}" wurde als {{associationName}} zugewiesen, um einen Namenskonflikt zu vermeiden.',
        inverse:
            'Inverse Assoziation auf "{{path}}" wurde als {{associationName}} zugewiesen, um einen Namenskonflikt zu vermeiden.',
    },
    relationship_skipped: {
        table_not_exported:
            'Beziehung "{{path}}" wurde übersprungen, da eine Tabelle nicht exportiert wurde.',
        unresolved_field_ids:
            'Beziehung "{{path}}" wurde übersprungen, da Fremdschlüssel-Feld-IDs nicht aufgelöst werden konnten.',
        referenced_column_not_exported:
            'Beziehung "{{path}}" wurde übersprungen, da eine referenzierte Spalte nicht exportiert wurde.',
    },
    index_omitted: {
        unsupported_type:
            'Index "{{path}}" wurde weggelassen, da der Typ "{{indexType}}" in Rails schema.rb nicht exportiert wird.',
        missing_field:
            'Index "{{path}}" wurde weggelassen, da ein referenziertes Feld fehlt.',
        field_not_exported:
            'Index "{{path}}" wurde weggelassen, da ein referenziertes Feld nicht exportiert wurde.',
    },
    comment_omitted: {
        table: 'Tabellenkommentar zu "{{path}}" wird weggelassen, da SQLite keine Kommentare speichert.',
        column: 'Spaltenkommentar zu "{{path}}" wird weggelassen, da SQLite keine Kommentare speichert.',
    },
    check_omitted: {
        table: 'Leere Check-Constraint auf "{{path}}" wurde weggelassen.',
        column: 'Leere Check-Constraint auf "{{path}}" wurde weggelassen.',
    },
    set_degraded: {
        sqlite_as_string:
            'Feld-Set auf "{{path}}" wird für SQLite als string exportiert.',
        mysql_family_as_string:
            'Feld-Set auf "{{path}}" wird als string exportiert; natives SET-DSL wird nicht ausgegeben.',
    },
    enum_degraded: {
        sqlite_as_string:
            'Feld-enum auf "{{path}}" wird für SQLite als string exportiert.',
        pg_type_values_missing:
            'PostgreSQL-enum "{{path}}" wurde nicht deklariert, da kanonische Werte fehlen.',
        pg_field_values_missing:
            'Feld "{{path}}" PostgreSQL-enum wurde als string exportiert, da kanonische enum-Werte fehlen.',
        pg_field_named_values_missing:
            'Feld "{{path}}" PostgreSQL-enum "{{enumName}}" wurde als string exportiert, da enum-Werte fehlen.',
        mysql_family_as_string:
            'Feld-enum auf "{{path}}" wird als string exportiert; natives enum/set-DSL wird nicht ausgegeben.',
    },
    type_omitted: {
        array: 'Array-Feld auf "{{path}}" wird in Rails schema.rb nicht abgebildet.',
        spatial:
            'Spatial-Feld auf "{{path}}" wird in Rails schema.rb nicht abgebildet.',
        unsupported:
            'Feld auf "{{path}}" wurde weggelassen, da sein Typ nicht abgebildet werden kann.',
        unimplemented_database:
            'Typzuordnung ist für Datenbanktyp "{{databaseType}}" nicht implementiert.',
    },
    type_degraded: {
        serial_no_sequence:
            'Nicht-Primärschlüssel-serial-Feld auf "{{path}}" wird als gewöhnlicher integer ohne Sequenz exportiert.',
        jsonb_as_json: 'Feld "{{path}}" jsonb wird als json exportiert.',
        uuid_as_string: 'Feld "{{path}}" uuid wird als string(36) exportiert.',
        null_as_text:
            'Feld "{{path}}" null-Speicherklasse wird als text exportiert.',
        money_as_decimal: 'Feld "{{path}}" money wird als decimal exportiert.',
        year_as_integer: 'Feld "{{path}}" year wird als integer exportiert.',
        bit_as_boolean: 'Feld "{{path}}" bit wird als boolean exportiert.',
        type_as_string:
            'Feld "{{path}}" Typ "{{sourceType}}" wird als {{mappedHelper}} exportiert.',
    },
    default_omitted: {
        lambda_expression:
            'Default auf "{{path}}" wurde weggelassen (lambda-ähnlicher SQL-Ausdruck: {{expression}}).',
        sql_expression:
            'Default auf "{{path}}" wurde weggelassen (nicht unterstützter SQL-Ausdruck: {{expression}}).',
        unclear:
            'Default auf "{{path}}" wurde weggelassen (unklarer Default: {{expression}}).',
        current_timestamp_non_datetime:
            'Default auf "{{path}}" wurde weggelassen (CURRENT_TIMESTAMP auf Nicht-Datetime-Feld).',
        uuid_function_non_pg:
            'Default auf "{{path}}" wurde weggelassen (UUID-Funktions-Default auf Nicht-PostgreSQL-UUID-Feld).',
        boolean_on_non_boolean:
            'Default auf "{{path}}" wurde weggelassen (boolean-Default auf Nicht-boolean-Feld).',
        numeric_on_non_numeric:
            'Default auf "{{path}}" wurde weggelassen (numerischer Default auf Nicht-numerischem Feld).',
        unsupported_type:
            'Default auf "{{path}}" wurde weggelassen (nicht unterstützter Default-Typ).',
    },
};
