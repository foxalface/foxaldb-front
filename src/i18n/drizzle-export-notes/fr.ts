import type { DrizzleExportNoteMessages } from './types';

export const drizzleExportNoteMessages: DrizzleExportNoteMessages = {
    view_skipped: 'Vue « {{path}} » ignorée.',
    keyless_table_skipped:
        'Table « {{path}} » ignorée, car elle n’a aucune colonne représentable de façon sûre.',
    keyless_table:
        'La table « {{path}} » n’a pas de clé primaire et est exportée comme table Drizzle native, sans inventer d’identifiant.',
    schema_ignored_sqlite:
        'SQLite n’utilise pas le schéma « {{schema}} » ; la table « {{path}} » est exportée sans qualificateur de schéma.',
    mysql_catalog_omitted:
        'Le catalogue MySQL « {{catalog}} » est omis ; Drizzle utilise des noms de tables non qualifiés et une seule connexion à la base.',
    mysql_multiple_catalogs_ignored:
        'L’export MySQL omet {{count}} catalogues et émet des noms de tables non qualifiés, car les noms physiques restent uniques.',
    mariadb_catalog_omitted:
        'Le catalogue MariaDB « {{catalog}} » est omis ; Drizzle utilise des noms de tables non qualifiés et une seule connexion à la base.',
    mariadb_multiple_catalogs_ignored:
        'L’export MariaDB omet {{count}} catalogues et émet des noms de tables non qualifiés, car les noms physiques restent uniques.',
    mariadb_mysql_dialect_adapted:
        'MariaDB est exporté avec les API MySQL de Drizzle (dialecte « {{dialect}} »). Drizzle 0.45 n’a pas de dialecte MariaDB de première classe.',
    postgres_schema_qualified:
        'Le schéma PostgreSQL « {{schema}} » est exporté avec pgSchema().',
    uuid_as_text:
        'Le champ UUID « {{path}} » est exporté en texte, car cette base n’a pas de type UUID natif dans Drizzle 0.45.',
    increment_omitted:
        'L’auto-incrément sur « {{path}} » a été omis, car il ne peut pas être représenté de façon sûre.',
    set_null_omitted:
        'ON DELETE SET NULL a été omis sur « {{path}} », car une colonne de clé étrangère est NOT NULL.',
    sqlite_boolean_integer:
        'Le champ booléen « {{path}} » est exporté en integer({ mode: "boolean" }), car SQLite n’a pas de type booléen natif.',
    sqlite_json_text:
        'Le champ JSON « {{path}} » est exporté en text({ mode: "json" }), car SQLite stocke le JSON en TEXT.',
    table_name_adjusted: {
        table: 'La table « {{path}} » est exportée comme constante TypeScript {{tsName}}. Le nom physique de la table est conservé.',
        pgEnum: 'L’enum PostgreSQL « {{path}} » est exporté comme constante TypeScript {{tsName}}. Le nom physique de l’enum est conservé.',
        pgSchema:
            'Le schéma PostgreSQL « {{path}} » est exporté comme constante TypeScript {{tsName}}.',
    },
    table_name_collision:
        'La constante de table « {{tsName}} » pour « {{path}} » a été attribuée afin d’éviter un identifiant TypeScript en double.',
    column_name_adjusted:
        'La colonne « {{path}} » est exportée comme propriété TypeScript {{tsName}}. Le nom physique de la colonne est conservé.',
    relationship_skipped: {
        composite_fk_unresolved_members:
            'La clé étrangère composite « {{path}} » a été ignorée, car les listes de colonnes source et cible n’étaient pas toutes deux présentes.',
        composite_fk_arity_mismatch:
            'La clé étrangère composite « {{path}} » a été ignorée, car le nombre de colonnes source et cible diffère.',
        label_only:
            'La relation plusieurs-à-plusieurs « {{path}} » a été ignorée, car aucune table de jointure physique n’est identifiée à partir du libellé.',
        table_not_exported:
            'La relation « {{path}} » a été ignorée, car une table référencée n’a pas été exportée.',
        unresolved_member:
            'La relation « {{path}} » a été ignorée, car un champ référencé n’a pas été exporté.',
    },
    index_omitted: {
        unsupported_method:
            'L’index « {{path}} » a été omis, car le type « {{indexType}} » n’est pas exporté.',
        field_not_exported:
            'L’index « {{path}} » a été omis, car un champ référencé n’a pas été exporté.',
    },
    comment_omitted: {
        table: 'Le commentaire de table sur « {{path}} » est omis, car Drizzle 0.45 n’a pas d’API de commentaires structurés utilisée par cet exportateur.',
        column: 'Le commentaire de colonne sur « {{path}} » est omis, car Drizzle 0.45 n’a pas d’API de commentaires structurés utilisée par cet exportateur.',
    },
    check_omitted: {
        table: 'La contrainte CHECK sur « {{path}} » est omise, car le SQL brut n’est pas injecté dans le TypeScript généré.',
        column: 'Le CHECK sur « {{path}} » est omis, car le SQL brut n’est pas injecté dans le TypeScript généré.',
    },
    set_degraded: {
        set_as_text:
            'Le SET du champ « {{path}} » est exporté en texte ; les types SET natifs ne sont pas générés.',
    },
    enum_degraded: {
        ts_enum_only:
            'L’enum du champ « {{path}} » est exporté en text({ enum: [...] }) ; SQLite n’a pas de contrainte d’enum physique.',
        unsupported_enum:
            'L’enum du champ « {{path}} » est exporté en texte, car il ne peut pas être représenté comme enum Drizzle natif.',
        unknown_values:
            'L’enum du champ « {{path}} » est exporté en texte, car les valeurs d’enum sont manquantes.',
    },
    type_omitted: {
        array: 'Le champ tableau sur « {{path}} » est omis de l’export Drizzle.',
        unsupported:
            'Le champ sur « {{path}} » a été omis, car son type ne peut pas être représenté.',
        unimplemented_database:
            'Le mapping de types n’est pas implémenté pour le type de base « {{databaseType}} ».',
    },
    type_degraded: {
        binary_as_bytea:
            'Le type binaire du champ « {{path}} » est exporté en bytea().',
    },
    default_omitted: {
        unsupported_type:
            'La valeur par défaut sur « {{path}} » a été omise (type de défaut non pris en charge).',
        current_timestamp_non_datetime:
            'La valeur par défaut sur « {{path}} » a été omise (CURRENT_TIMESTAMP sur un champ non datetime).',
        sql_expression:
            'La valeur par défaut sur « {{path}} » a été omise (expression SQL non prise en charge : {{expression}}).',
        unclear:
            'La valeur par défaut sur « {{path}} » a été omise (défaut ambigu : {{expression}}).',
        boolean_on_non_boolean:
            'La valeur par défaut sur « {{path}} » a été omise (défaut booléen sur un champ non booléen).',
        numeric_on_non_numeric:
            'La valeur par défaut sur « {{path}} » a été omise (défaut numérique sur un champ non numérique).',
    },
};
