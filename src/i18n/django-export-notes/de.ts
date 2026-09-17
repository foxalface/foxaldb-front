import type { DjangoExportNoteMessages } from './types';

export const djangoExportNoteMessages: DjangoExportNoteMessages = {
    view_skipped: 'View „{{path}}“ übersprungen.',
    keyless_table_skipped:
        'Tabelle „{{path}}“ übersprungen, weil sie nicht als sicheres datenbankseitiges SQL ohne erfundenen Primärschlüssel dargestellt werden kann.',
    keyless_table_sql_created:
        'Die physische Tabelle „{{path}}“ wird durch datenbankseitiges SQL erzeugt, weil Django eine Tabelle ohne Primärschlüssel nicht ohne Schemaänderung modellieren kann.',
    keyless_model_omitted:
        'Für „{{path}}“ wird kein Django-ORM-Modell erzeugt, weil Django einen Primärschlüssel verlangt.',
    schema_ignored_sqlite:
        'SQLite verwendet das Schema „{{schema}}“ nicht; Tabelle „{{path}}“ wird ohne Schemaqualifizierer exportiert.',
    mysql_catalog_omitted:
        'MySQL-Katalog „{{catalog}}“ wird weggelassen; Django verwendet die verbundene Datenbank und unqualifizierte Tabellennamen.',
    mysql_multiple_catalogs_ignored:
        'Der MySQL-Export lässt {{count}} Kataloge weg und erzeugt unqualifizierte Tabellennamen, weil die physischen Namen eindeutig bleiben.',
    mariadb_catalog_omitted:
        'MariaDB-Katalog „{{catalog}}“ wird weggelassen; Django verwendet die verbundene Datenbank und unqualifizierte Tabellennamen.',
    mariadb_multiple_catalogs_ignored:
        'Der MariaDB-Export lässt {{count}} Kataloge weg und erzeugt unqualifizierte Tabellennamen, weil die physischen Namen eindeutig bleiben.',
    postgres_schema_qualified_db_table:
        'PostgreSQL-Tabelle „{{path}}“ wird mit schemaqualifiziertem db_table für Schema „{{schema}}“ exportiert.',
    composite_fk_unsupported:
        'Zusammengesetzter Fremdschlüssel „{{path}}“ wird nicht exportiert; Mitgliedsspalten bleiben skalar.',
    many_to_many_skipped:
        'Many-to-many-Beziehung „{{path}}“ wurde übersprungen; aus einer bloßen Bezeichnung wird keine Join-Tabelle erfunden.',
    one_to_one_degraded_non_unique_fk:
        'One-to-one-Beziehung auf „{{path}}“ wird als ForeignKey exportiert, weil der Fremdschlüssel nicht eindeutig ist.',
    model_name_adjusted:
        'Modellklasse für Tabelle „{{path}}“ wurde als {{className}} vergeben.',
    model_name_collision:
        'Modellklasse „{{className}}“ für Tabelle „{{path}}“ wurde vergeben, um einen doppelten Klassennamen zu vermeiden.',
    field_name_adjusted:
        'Feld „{{path}}“ wird als Python-Attribut {{attributeName}} mit db_column „{{dbColumn}}“ exportiert.',
    related_name_adjusted:
        'related_name auf „{{path}}“ wurde als {{relatedName}} vergeben, um eine Kollision des Reverse-Accessors zu vermeiden.',
    composite_primary_key:
        'Tabelle „{{path}}“ wird mit Django-6.1-CompositePrimaryKey und den Attributen {{attributes}} exportiert.',
    on_update_omitted:
        'ON UPDATE „{{action}}“ auf „{{path}}“ entfällt; ForeignKey hat kein Datenbank-ON-UPDATE-Äquivalent.',
    on_delete_restrict_degraded:
        'ON DELETE RESTRICT auf „{{path}}“ wird als models.DO_NOTHING exportiert; Django-RESTRICT/PROTECT-Collector-Semantik wird nicht verwendet.',
    set_null_omitted: {
        delete: 'ON DELETE SET NULL auf „{{path}}“ entfiel, weil der Fremdschlüssel nicht nullable ist; es wird models.DO_NOTHING verwendet.',
    },
    many_to_many_through_skipped: {
        extra_columns:
            'Convenience-ManyToManyField für Join-Tabelle „{{path}}“ wurde nicht erzeugt, weil zusätzliche Datenspalten vorhanden sind.',
        ambiguous:
            'Convenience-ManyToManyField für Join-Tabelle „{{path}}“ wurde nicht erzeugt, weil ein Endpunktmodell mehrdeutig ist.',
    },
    relationship_skipped: {
        table_not_exported:
            'Beziehung „{{path}}“ wurde übersprungen, weil eine Tabelle nicht exportiert wurde.',
        field_not_exported:
            'Beziehung „{{path}}“ wurde übersprungen, weil ein referenziertes Feld nicht exportiert wurde.',
        already_relational:
            'Beziehung „{{path}}“ wurde übersprungen, weil das besitzende Feld bereits eine Beziehung ist.',
        primary_key_fk:
            'Beziehung „{{path}}“ wurde übersprungen, weil die besitzende Spalte Teil des Primärschlüssels ist.',
        unsupported_target_field:
            'Beziehung „{{path}}“ wurde übersprungen, weil das Zielfeld kein eindeutiges Django-Ziel ist.',
        keyless_target:
            'Beziehung „{{path}}“ übersprungen, weil sie auf eine schlüssellose Tabelle ohne Django-Modell zeigt.',
    },
    index_omitted: {
        unsupported_type:
            'Index „{{path}}“ entfiel, weil Typ „{{indexType}}“ nicht als models.Index exportiert wird.',
        field_not_exported:
            'Index „{{path}}“ entfiel, weil ein referenziertes Feld nicht exportiert wurde.',
        unsafe_name:
            'Index „{{path}}“ entfiel, weil sein expliziter Name in Django nicht sicher darstellbar ist.',
    },
    index_name_adjusted: {
        unsafe_name:
            'Der Indexname „{{originalName}}“ wurde zu „{{allocatedName}}“ angepasst, um Djangos Namensregeln zu erfüllen.',
        name_collision:
            'Der Indexname „{{originalName}}“ wurde zu „{{allocatedName}}“ angepasst, um einen doppelten Django-Indexnamen zu vermeiden.',
    },
    constraint_name_adjusted: {
        unsafe_name:
            'Der Unique-Constraint-Name „{{originalName}}“ wurde zu „{{allocatedName}}“ angepasst, um Djangos Namensregeln zu erfüllen.',
        name_collision:
            'Der Unique-Constraint-Name „{{originalName}}“ wurde zu „{{allocatedName}}“ angepasst, um einen doppelten Django-Constraint-Namen zu vermeiden.',
    },
    comment_omitted: {
        table: 'Tabellenkommentar auf „{{path}}“ entfällt, weil SQLite Kommentare nicht speichert.',
        column: 'Spaltenkommentar auf „{{path}}“ entfällt, weil SQLite Kommentare nicht speichert.',
    },
    check_omitted: {
        table: 'CHECK-Constraint auf „{{path}}“ entfiel, weil beliebige SQL nicht in einen Django-6.1-Ausdruck umgewandelt werden kann.',
        column: 'CHECK auf „{{path}}“ entfiel, weil beliebige SQL nicht in einen Django-6.1-Ausdruck umgewandelt werden kann.',
    },
    set_degraded: {
        set_as_text:
            'SET des Felds „{{path}}“ wird als Zeichenfeld exportiert; native SET-Typen werden nicht erzeugt.',
    },
    enum_degraded: {
        enum_as_text:
            'Enum des Felds „{{path}}“ wird als Zeichenfeld exportiert; Django-TextChoices werden nicht erzeugt.',
    },
    type_omitted: {
        array: 'Array-Feld auf „{{path}}“ wird aus dem Django-Export weggelassen.',
        spatial:
            'Spatial-Feld auf „{{path}}“ wird aus dem Django-Export weggelassen.',
        tsvector:
            'tsvector-Feld auf „{{path}}“ wird aus dem Django-Export weggelassen.',
        xml: 'XML-Feld auf „{{path}}“ wird aus dem Django-Export weggelassen.',
        unsupported:
            'Feld „{{path}}“ entfiel, weil sein Typ nicht darstellbar ist.',
        unimplemented_database:
            'Typzuordnung ist für Datenbanktyp „{{databaseType}}“ nicht implementiert.',
        decimal_precision_required:
            'Decimal-Feld auf „{{path}}“ entfiel, weil MySQL/MariaDB-DecimalField max_digits und decimal_places erfordert.',
    },
    type_degraded: {
        varchar_without_max_length:
            'Zeichentyp von Feld „{{path}}“ wird als {{mappedField}} exportiert, weil max_length fehlt.',
    },
    default_omitted: {
        unsupported_type:
            'Standardwert auf „{{path}}“ entfiel (nicht unterstützter Standardtyp).',
        current_timestamp_non_datetime:
            'Standardwert auf „{{path}}“ entfiel (CURRENT_TIMESTAMP auf einem Nicht-Datetime-Feld).',
        uuid_function_non_pg:
            'Standardwert auf „{{path}}“ entfiel (UUID-Funktion außerhalb eines PostgreSQL-UUID-Felds).',
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
