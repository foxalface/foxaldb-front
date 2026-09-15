import type { RailsExportNoteMessages } from './types';

export const railsExportNoteMessages: RailsExportNoteMessages = {
    view_skipped: 'Pogled «{{path}}» je preskočen.',
    schema_ignored_sqlite:
        'SQLite ne koristi shemu «{{schema}}»; tablica «{{path}}» izvozi se bez kvalifikatora sheme.',
    mysql_catalog_omitted:
        'MySQL katalog «{{catalog}}» je izostavljen; Rails koristi povezanu bazu podataka i nekvalificirana imena tablica.',
    mysql_multiple_catalogs_ignored:
        'MySQL izvoz izostavlja {{count}} kataloga i emitira nekvalificirana imena tablica jer fizička imena ostaju jedinstvena.',
    mariadb_catalog_omitted:
        'MariaDB katalog «{{catalog}}» je izostavljen; Rails koristi povezanu bazu podataka i nekvalificirana imena tablica.',
    mariadb_multiple_catalogs_ignored:
        'MariaDB izvoz izostavlja {{count}} kataloga i emitira nekvalificirana imena tablica jer fizička imena ostaju jedinstvena.',
    composite_fk_unsupported:
        'Složeni strani ključ «{{path}}» nije izvezen; Rails V1 emitira samo sigurne strane ključeve s jednim stupcem.',
    keyless_relationship_skipped:
        'Odnos «{{path}}» je preskočen jer glavna tablica ne može podržati semantiku stranog ključa.',
    many_to_many_skipped:
        'Odnos više-prema-više «{{path}}» je preskočen; iz oznake se ne može izvesti jedna strana stranog ključa.',
    keyless_model:
        'Tablica «{{path}}» nema primarni ključ. Model postavlja self.primary_key = nil; Active Record perzistencija može biti ograničena.',
    one_to_one_degraded_non_unique_fk:
        'Odnos jedan-prema-jedan na «{{path}}» izvozi se kao has_many jer strani ključ nije jedinstven.',
    many_to_many_through_skipped:
        'has_many :through nije generiran za spojnu tablicu «{{path}}» jer su imena asocijacija bila dvosmislena.',
    model_name_adjusted:
        'Klasa modela za tablicu «{{path}}» dodijeljena je kao {{className}}.',
    model_name_collision:
        'Klasa modela {{className}} za tablicu «{{path}}» dodijeljena je kako bi se izbjegla duplicirana konstanta.',
    on_update_omitted:
        'ON UPDATE «{{action}}» nije predstavljen u Rails 8.1 schema.rb add_foreign_key za «{{path}}».',
    set_null_omitted: {
        delete: 'ON DELETE SET NULL izostavljen je na «{{path}}» jer stupac stranog ključa nije nullable.',
        update: 'ON UPDATE SET NULL izostavljen je na «{{path}}» jer stupac stranog ključa nije nullable.',
    },
    association_name_adjusted: {
        belongs_to:
            'belongs_to na «{{path}}» dodijeljen je kao {{associationName}} kako bi se izbjegao sukob imena.',
        inverse:
            'Inverzna asocijacija na «{{path}}» dodijeljena je kao {{associationName}} kako bi se izbjegao sukob imena.',
    },
    relationship_skipped: {
        table_not_exported:
            'Odnos «{{path}}» je preskočen jer tablica nije izvezena.',
        unresolved_field_ids:
            'Odnos «{{path}}» je preskočen jer se ID-ovi polja stranog ključa nisu mogli razriješiti.',
        referenced_column_not_exported:
            'Odnos «{{path}}» je preskočen jer referencirani stupac nije izvezen.',
    },
    index_omitted: {
        unsupported_type:
            'Indeks «{{path}}» je izostavljen jer tip «{{indexType}}» nije izvezen u Rails schema.rb.',
        missing_field:
            'Indeks «{{path}}» je izostavljen jer referencirano polje nedostaje.',
        field_not_exported:
            'Indeks «{{path}}» je izostavljen jer referencirano polje nije izvezeno.',
    },
    comment_omitted: {
        table: 'Komentar tablice na «{{path}}» je izostavljen jer SQLite ne pohranjuje komentare.',
        column: 'Komentar stupca na «{{path}}» je izostavljen jer SQLite ne pohranjuje komentare.',
    },
    check_omitted: {
        table: 'Prazno CHECK ograničenje na «{{path}}» je izostavljeno.',
        column: 'Prazna CHECK provjera na «{{path}}» je izostavljena.',
    },
    set_degraded: {
        sqlite_as_string:
            'SET polje na «{{path}}» izvozi se kao string za SQLite.',
        mysql_family_as_string:
            'SET polje na «{{path}}» izvozi se kao string; izvorni SET DSL se ne emitira.',
    },
    enum_degraded: {
        sqlite_as_string:
            'Enum polje na «{{path}}» izvozi se kao string za SQLite.',
        pg_type_values_missing:
            'PostgreSQL enum «{{path}}» nije deklariran jer kanonske vrijednosti nedostaju.',
        pg_field_values_missing:
            'Polje «{{path}}» PostgreSQL enum izvezeno je kao string jer kanonske enum vrijednosti nedostaju.',
        pg_field_named_values_missing:
            'Polje «{{path}}» PostgreSQL enum «{{enumName}}» izvezeno je kao string jer enum vrijednosti nedostaju.',
        mysql_family_as_string:
            'Enum polje na «{{path}}» izvozi se kao string; izvorni enum/set DSL se ne emitira.',
    },
    type_omitted: {
        array: 'Polje niza na «{{path}}» nije predstavljeno u Rails schema.rb.',
        spatial:
            'Prostorno polje na «{{path}}» nije predstavljeno u Rails schema.rb.',
        unsupported:
            'Polje na «{{path}}» je izostavljeno jer se njegov tip ne može predstaviti.',
        unimplemented_database:
            'Mapiranje tipova nije implementirano za tip baze podataka «{{databaseType}}».',
    },
    type_degraded: {
        serial_no_sequence:
            'Serial polje koje nije primarni ključ na «{{path}}» izvozi se kao običan integer bez sekvence.',
        jsonb_as_json: 'Polje «{{path}}» jsonb izvozi se kao json.',
        uuid_as_string: 'Polje «{{path}}» uuid izvozi se kao string(36).',
        null_as_text:
            'Polje «{{path}}» s null razredom pohrane izvozi se kao text.',
        money_as_decimal: 'Polje «{{path}}» money izvozi se kao decimal.',
        year_as_integer: 'Polje «{{path}}» year izvozi se kao integer.',
        bit_as_boolean: 'Polje «{{path}}» bit izvozi se kao boolean.',
        type_as_string:
            'Polje «{{path}}» tipa «{{sourceType}}» izvozi se kao {{mappedHelper}}.',
    },
    default_omitted: {
        lambda_expression:
            'Zadana vrijednost na «{{path}}» je izostavljena (SQL izraz koji izgleda kao lambda: {{expression}}).',
        sql_expression:
            'Zadana vrijednost na «{{path}}» je izostavljena (nepodržani SQL izraz: {{expression}}).',
        unclear:
            'Zadana vrijednost na «{{path}}» je izostavljena (nejasna zadana vrijednost: {{expression}}).',
        current_timestamp_non_datetime:
            'Zadana vrijednost na «{{path}}» je izostavljena (CURRENT_TIMESTAMP na polju koje nije datetime).',
        uuid_function_non_pg:
            'Zadana vrijednost na «{{path}}» je izostavljena (UUID funkcija kao zadana vrijednost na UUID polju koje nije PostgreSQL).',
        boolean_on_non_boolean:
            'Zadana vrijednost na «{{path}}» je izostavljena (boolean zadana vrijednost na polju koje nije boolean).',
        numeric_on_non_numeric:
            'Zadana vrijednost na «{{path}}» je izostavljena (numerička zadana vrijednost na polju koje nije numeričko).',
        unsupported_type:
            'Zadana vrijednost na «{{path}}» je izostavljena (nepodržani tip zadane vrijednosti).',
    },
};
