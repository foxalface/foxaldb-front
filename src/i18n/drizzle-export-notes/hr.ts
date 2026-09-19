import type { DrizzleExportNoteMessages } from './types';

export const drizzleExportNoteMessages: DrizzleExportNoteMessages = {
    view_skipped: 'Pogled «{{path}}» preskočen.',
    keyless_table_skipped:
        'Tablica «{{path}}» preskočena jer nema stupaca koji se mogu sigurno prikazati.',
    keyless_table:
        'Tablica «{{path}}» nema primarni ključ i izvozi se kao izvorna Drizzle tablica bez izmišljanja id-a.',
    schema_ignored_sqlite:
        'SQLite ne koristi shemu «{{schema}}»; tablica «{{path}}» izvozi se bez kvalifikatora sheme.',
    mysql_catalog_omitted:
        'MySQL katalog «{{catalog}}» je izostavljen; Drizzle koristi nekvalificirana imena tablica i jednu vezu s bazom.',
    mysql_multiple_catalogs_ignored:
        'MySQL izvoz izostavlja {{count}} kataloga i ispisuje nekvalificirana imena tablica jer fizička imena ostaju jedinstvena.',
    mariadb_catalog_omitted:
        'MariaDB katalog «{{catalog}}» je izostavljen; Drizzle koristi nekvalificirana imena tablica i jednu vezu s bazom.',
    mariadb_multiple_catalogs_ignored:
        'MariaDB izvoz izostavlja {{count}} kataloga i ispisuje nekvalificirana imena tablica jer fizička imena ostaju jedinstvena.',
    mariadb_mysql_dialect_adapted:
        'MariaDB se izvozi pomoću Drizzle MySQL API-ja (dijalekt «{{dialect}}»). Drizzle 0.45 nema prvoklasni MariaDB dijalekt.',
    postgres_schema_qualified:
        'PostgreSQL shema «{{schema}}» izvozi se s pgSchema().',
    uuid_as_text:
        'UUID polje «{{path}}» izvozi se kao tekst jer ova baza u Drizzle 0.45 nema izvorni UUID tip.',
    increment_omitted:
        'Automatsko povećanje na «{{path}}» izostavljeno je jer se ne može sigurno prikazati.',
    set_null_omitted:
        'ON DELETE SET NULL izostavljen je na «{{path}}» jer je stupac vanjskog ključa NOT NULL.',
    sqlite_boolean_integer:
        'Boolean polje «{{path}}» izvozi se kao integer({ mode: "boolean" }) jer SQLite nema izvorni boolean tip.',
    sqlite_json_text:
        'JSON polje «{{path}}» izvozi se kao text({ mode: "json" }) jer SQLite JSON pohranjuje kao TEXT.',
    table_name_adjusted: {
        table: 'Tablica «{{path}}» izvozi se kao TypeScript konstanta {{tsName}}. Fizičko ime tablice je sačuvano.',
        pgEnum: 'PostgreSQL enum «{{path}}» izvozi se kao TypeScript konstanta {{tsName}}. Fizičko ime enuma je sačuvano.',
        pgSchema:
            'PostgreSQL shema «{{path}}» izvozi se kao TypeScript konstanta {{tsName}}.',
    },
    table_name_collision:
        'Konstanta tablice «{{tsName}}» za «{{path}}» dodijeljena je kako bi se izbjegao duplicirani TypeScript identifikator.',
    column_name_adjusted:
        'Stupac «{{path}}» izvozi se kao TypeScript svojstvo {{tsName}}. Fizičko ime stupca je sačuvano.',
    relationship_skipped: {
        composite_fk_unresolved_members:
            'Sastavljeni vanjski ključ «{{path}}» preskočen je jer popisi izvornih i ciljnih stupaca nisu bili oba prisutna.',
        composite_fk_arity_mismatch:
            'Sastavljeni vanjski ključ «{{path}}» preskočen je jer se broj izvornih i ciljnih stupaca razlikuje.',
        label_only:
            'Veza više-prema-više «{{path}}» preskočena je jer se iz oznake ne može odrediti fizička spojna tablica.',
        table_not_exported:
            'Veza «{{path}}» preskočena je jer referencirana tablica nije izvezena.',
        unresolved_member:
            'Veza «{{path}}» preskočena je jer referencirano polje nije izvezeno.',
    },
    index_omitted: {
        unsupported_method:
            'Indeks «{{path}}» izostavljen je jer se tip «{{indexType}}» ne izvozi.',
        field_not_exported:
            'Indeks «{{path}}» izostavljen je jer referencirano polje nije izvezeno.',
    },
    comment_omitted: {
        table: 'Komentar tablice na «{{path}}» izostavljen je jer Drizzle 0.45 nema strukturirani API komentara koji ovaj izvoznik koristi.',
        column: 'Komentar stupca na «{{path}}» izostavljen je jer Drizzle 0.45 nema strukturirani API komentara koji ovaj izvoznik koristi.',
    },
    check_omitted: {
        table: 'CHECK ograničenje na «{{path}}» izostavljeno je jer se sirovi SQL ne umeće u generirani TypeScript.',
        column: 'CHECK na «{{path}}» izostavljen je jer se sirovi SQL ne umeće u generirani TypeScript.',
    },
    set_degraded: {
        set_as_text:
            'SET polja «{{path}}» izvozi se kao tekst; izvorni SET tipovi se ne generiraju.',
    },
    enum_degraded: {
        ts_enum_only:
            'Enum polja «{{path}}» izvozi se kao text({ enum: [...] }); SQLite nema fizičko enum ograničenje.',
        unsupported_enum:
            'Enum polja «{{path}}» izvozi se kao tekst jer se ne može prikazati kao izvorni Drizzle enum.',
        unknown_values:
            'Enum polja «{{path}}» izvozi se kao tekst jer nedostaju enum vrijednosti.',
    },
    type_omitted: {
        array: 'Polje niza na «{{path}}» izostavljeno je iz Drizzle izvoza.',
        unsupported:
            'Polje na «{{path}}» izostavljeno je jer se njegov tip ne može prikazati.',
        unimplemented_database:
            'Mapiranje tipova nije implementirano za tip baze «{{databaseType}}».',
    },
    type_degraded: {
        binary_as_bytea: 'Binarni tip polja «{{path}}» izvozi se kao bytea().',
    },
    default_omitted: {
        unsupported_type:
            'Zadana vrijednost na «{{path}}» izostavljena je (nepodržani tip zadane vrijednosti).',
        current_timestamp_non_datetime:
            'Zadana vrijednost na «{{path}}» izostavljena je (CURRENT_TIMESTAMP na polju koje nije datetime).',
        sql_expression:
            'Zadana vrijednost na «{{path}}» izostavljena je (nepodržani SQL izraz: {{expression}}).',
        unclear:
            'Zadana vrijednost na «{{path}}» izostavljena je (nejasna zadana vrijednost: {{expression}}).',
        boolean_on_non_boolean:
            'Zadana vrijednost na «{{path}}» izostavljena je (boolean zadana vrijednost na polju koje nije boolean).',
        numeric_on_non_numeric:
            'Zadana vrijednost na «{{path}}» izostavljena je (numerička zadana vrijednost na polju koje nije numeričko).',
    },
};
