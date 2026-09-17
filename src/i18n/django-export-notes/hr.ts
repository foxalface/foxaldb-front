import type { DjangoExportNoteMessages } from './types';

export const djangoExportNoteMessages: DjangoExportNoteMessages = {
    view_skipped: 'Pogled «{{path}}» preskočen.',
    keyless_table_skipped:
        'Tablica "{{path}}" je preskočena jer se ne može sigurno prikazati kao SQL samo za bazu bez izmišljanja primarnog ključa.',
    keyless_table_sql_created:
        'Fizička tablica "{{path}}" stvara se SQL-om samo za bazu jer Django ne može modelirati tablicu bez primarnog ključa bez mijenjanja sheme.',
    keyless_model_omitted:
        'Za "{{path}}" se ne generira Django ORM model jer Django zahtijeva primarni ključ.',
    schema_ignored_sqlite:
        'SQLite ne koristi shemu «{{schema}}»; tablica «{{path}}» izvoze se bez kvalifikatora sheme.',
    mysql_catalog_omitted:
        'MySQL katalog «{{catalog}}» izostavljen; Django koristi povezanu bazu podataka i nekvalificirana imena tablica.',
    mysql_multiple_catalogs_ignored:
        'MySQL izvoz izostavlja {{count}} kataloga i emitira nekvalificirana imena tablica jer fizička imena ostaju jedinstvena.',
    mariadb_catalog_omitted:
        'MariaDB katalog «{{catalog}}» izostavljen; Django koristi povezanu bazu podataka i nekvalificirana imena tablica.',
    mariadb_multiple_catalogs_ignored:
        'MariaDB izvoz izostavlja {{count}} kataloga i emitira nekvalificirana imena tablica jer fizička imena ostaju jedinstvena.',
    postgres_schema_qualified_db_table:
        'PostgreSQL tablica «{{path}}» izvoze se sa db_table kvalificiranim shemom «{{schema}}».',
    composite_fk_unsupported:
        'Složeni strani ključ «{{path}}» nije izvezen; stupci članovi ostaju skalarni.',
    many_to_many_skipped:
        'Odnos više-prema-više «{{path}}» preskočen; iz same oznake ne izmišlja se spojna tablica.',
    one_to_one_degraded_non_unique_fk:
        'Odnos jedan-prema-jednom na «{{path}}» izvoze se kao ForeignKey jer strani ključ nije jedinstven.',
    model_name_adjusted:
        'Klasa modela za tablicu «{{path}}» dodijeljena je kao {{className}}.',
    model_name_collision:
        'Klasa modela «{{className}}» za tablicu «{{path}}» dodijeljena je kako bi se izbjeglo duplicirano ime klase.',
    field_name_adjusted:
        'Polje «{{path}}» izvoze se kao Python atribut {{attributeName}} s db_column «{{dbColumn}}».',
    related_name_adjusted:
        'related_name na «{{path}}» dodijeljen je kao {{relatedName}} kako bi se izbjegao sukob obrnutog pristupa.',
    composite_primary_key:
        'Tablica «{{path}}» izvoze se s Django 6.1 CompositePrimaryKey koristeći atribute {{attributes}}.',
    on_update_omitted:
        'ON UPDATE «{{action}}» na «{{path}}» izostavljen; ForeignKey nema ekvivalent ON UPDATE u bazi podataka.',
    on_delete_restrict_degraded:
        'ON DELETE RESTRICT na «{{path}}» izvoze se kao models.DO_NOTHING; Django RESTRICT/PROTECT semantika kolektora se ne koristi.',
    set_null_omitted: {
        delete: 'ON DELETE SET NULL izostavljen na «{{path}}» jer strani ključ nije nullable; koristi se models.DO_NOTHING.',
    },
    many_to_many_through_skipped: {
        extra_columns:
            'Praktični ManyToManyField nije generiran za spojnu tablicu «{{path}}» jer postoje dodatni stupci podataka.',
        ambiguous:
            'Praktični ManyToManyField nije generiran za spojnu tablicu «{{path}}» jer je krajnji model dvosmislen.',
    },
    relationship_skipped: {
        table_not_exported:
            'Odnos «{{path}}» preskočen jer tablica nije izvezena.',
        field_not_exported:
            'Odnos «{{path}}» preskočen jer referencirano polje nije izvezeno.',
        already_relational:
            'Odnos «{{path}}» preskočen jer vlasničko polje već je odnos.',
        primary_key_fk:
            'Odnos «{{path}}» preskočen jer vlasnički stupac dio je primarnog ključa.',
        unsupported_target_field:
            'Odnos «{{path}}» preskočen jer ciljno polje nije jedinstveni Django cilj.',
        keyless_target:
            'Veza "{{path}}" je preskočena jer cilja tablicu bez ključa koja nema Django model.',
    },
    index_omitted: {
        unsupported_type:
            'Indeks «{{path}}» izostavljen jer tip «{{indexType}}» ne izvoze se kao models.Index.',
        field_not_exported:
            'Indeks «{{path}}» izostavljen jer referencirano polje nije izvezeno.',
        unsafe_name:
            'Indeks «{{path}}» izostavljen jer se njegovo eksplicitno ime ne može sigurno predstaviti u Django.',
    },
    index_name_adjusted: {
        unsafe_name:
            'Naziv indeksa «{{originalName}}» prilagođen je u «{{allocatedName}}» kako bi zadovoljio Django pravila imenovanja.',
        name_collision:
            'Naziv indeksa «{{originalName}}» prilagođen je u «{{allocatedName}}» kako bi se izbjegao duplicirani Django naziv indeksa.',
    },
    constraint_name_adjusted: {
        unsafe_name:
            'Naziv jedinstvenog ograničenja «{{originalName}}» prilagođen je u «{{allocatedName}}» kako bi zadovoljio Django pravila imenovanja.',
        name_collision:
            'Naziv jedinstvenog ograničenja «{{originalName}}» prilagođen je u «{{allocatedName}}» kako bi se izbjegao duplicirani Django naziv ograničenja.',
    },
    comment_omitted: {
        table: 'Komentar tablice na «{{path}}» izostavljen jer SQLite ne pohranjuje komentare.',
        column: 'Komentar stupca na «{{path}}» izostavljen jer SQLite ne pohranjuje komentare.',
    },
    check_omitted: {
        table: 'CHECK ograničenje na «{{path}}» izostavljeno jer proizvoljni SQL ne može se pretvoriti u Django 6.1 izraz.',
        column: 'CHECK na «{{path}}» izostavljen jer proizvoljni SQL ne može se pretvoriti u Django 6.1 izraz.',
    },
    set_degraded: {
        set_as_text:
            'SET polja «{{path}}» izvoze se kao znakovno polje; izvorni SET tipovi se ne generiraju.',
    },
    enum_degraded: {
        enum_as_text:
            'enum polja «{{path}}» izvoze se kao znakovno polje; Django TextChoices se ne generiraju.',
    },
    type_omitted: {
        array: 'Polje niza na «{{path}}» izostavljeno je iz Django izvoza.',
        spatial:
            'Prostorčno polje na «{{path}}» izostavljeno je iz Django izvoza.',
        tsvector:
            'Polje tsvector na «{{path}}» izostavljeno je iz Django izvoza.',
        xml: 'XML polje na «{{path}}» izostavljeno je iz Django izvoza.',
        unsupported:
            'Polje «{{path}}» izostavljeno jer se njegov tip ne može predstaviti.',
        unimplemented_database:
            'Mapiranje tipova nije implementirano za tip baze podataka «{{databaseType}}».',
        decimal_precision_required:
            'Decimal polje na «{{path}}» izostavljeno jer MySQL/MariaDB DecimalField zahtijeva max_digits i decimal_places.',
    },
    type_degraded: {
        varchar_without_max_length:
            'Znakovni tip polja «{{path}}» izvoze se kao {{mappedField}} jer nedostaje max_length.',
    },
    default_omitted: {
        unsupported_type:
            'Zadana vrijednost na «{{path}}» izostavljena (nepodržani tip zadane vrijednosti).',
        current_timestamp_non_datetime:
            'Zadana vrijednost na «{{path}}» izostavljena (CURRENT_TIMESTAMP na polju koje nije datetime).',
        uuid_function_non_pg:
            'Zadana vrijednost na «{{path}}» izostavljena (UUID funkcija na UUID polju koje nije PostgreSQL).',
        sql_expression:
            'Zadana vrijednost na «{{path}}» izostavljena (nepodržani SQL izraz: {{expression}}).',
        unclear:
            'Zadana vrijednost na «{{path}}» izostavljena (nejasna zadana vrijednost: {{expression}}).',
        boolean_on_non_boolean:
            'Zadana vrijednost na «{{path}}» izostavljena (boolean zadana vrijednost na polju koje nije boolean).',
        numeric_on_non_numeric:
            'Zadana vrijednost na «{{path}}» izostavljena (numerička zadana vrijednost na polju koje nije numeričko).',
    },
};
