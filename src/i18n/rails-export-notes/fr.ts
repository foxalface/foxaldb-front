import type { RailsExportNoteMessages } from './types';

export const railsExportNoteMessages: RailsExportNoteMessages = {
    view_skipped: 'Vue « {{path}} » ignorée.',
    schema_ignored_sqlite:
        'SQLite n’utilise pas le schéma « {{schema}} » ; la table « {{path}} » est exportée sans qualificateur de schéma.',
    mysql_catalog_omitted:
        'Le catalogue MySQL « {{catalog}} » est omis ; Rails utilise la base de données définie par la connexion et des noms de tables non qualifiés.',
    mysql_multiple_catalogs_ignored:
        'L’export MySQL omet {{count}} catalogues et émet des noms de tables non qualifiés, car les noms physiques restent uniques.',
    mariadb_catalog_omitted:
        'Le catalogue MariaDB « {{catalog}} » est omis ; Rails utilise la base de données définie par la connexion et des noms de tables non qualifiés.',
    mariadb_multiple_catalogs_ignored:
        'L’export MariaDB omet {{count}} catalogues et émet des noms de tables non qualifiés, car les noms physiques restent uniques.',
    composite_fk_unsupported:
        'La clé étrangère composite « {{path}} » n’est pas exportée ; Rails V1 n’émet que des clés étrangères mono-colonne sûres.',
    keyless_relationship_skipped:
        'La relation « {{path}} » a été ignorée, car la table principale ne peut pas prendre en charge la sémantique de clé étrangère.',
    many_to_many_skipped:
        'La relation plusieurs-à-plusieurs « {{path}} » a été ignorée ; aucun côté de clé étrangère unique n’a pu être déduit du libellé.',
    keyless_model:
        'La table « {{path}} » n’a pas de clé primaire. Le modèle définit self.primary_key = nil ; la persistance Active Record peut être limitée.',
    one_to_one_degraded_non_unique_fk:
        'La relation un-à-un sur « {{path}} » est exportée en has_many, car la clé étrangère n’est pas unique.',
    many_to_many_through_skipped:
        'L’association has_many :through n’a pas été générée pour la table de jointure « {{path}} », car les noms d’associations étaient ambigus.',
    model_name_adjusted:
        'La classe de modèle de la table « {{path}} » a été nommée {{className}}.',
    model_name_collision:
        'La classe de modèle {{className}} pour la table « {{path}} » a été attribuée pour éviter une constante en double.',
    on_update_omitted:
        'ON UPDATE « {{action}} » n’est pas représenté dans schema.rb add_foreign_key de Rails 8.1 pour « {{path}} ».',
    set_null_omitted: {
        delete: 'ON DELETE SET NULL a été omis sur « {{path}} », car la colonne de clé étrangère n’est pas nullable.',
        update: 'ON UPDATE SET NULL a été omis sur « {{path}} », car la colonne de clé étrangère n’est pas nullable.',
    },
    association_name_adjusted: {
        belongs_to:
            'belongs_to sur « {{path}} » a été attribué comme {{associationName}} pour éviter un conflit de nom.',
        inverse:
            'L’association inverse sur « {{path}} » a été attribuée comme {{associationName}} pour éviter un conflit de nom.',
    },
    relationship_skipped: {
        table_not_exported:
            'La relation « {{path}} » a été ignorée, car une table n’a pas été exportée.',
        unresolved_field_ids:
            'La relation « {{path}} » a été ignorée, car les identifiants de champs de clé étrangère n’ont pas pu être résolus.',
        referenced_column_not_exported:
            'La relation « {{path}} » a été ignorée, car une colonne référencée n’a pas été exportée.',
    },
    index_omitted: {
        unsupported_type:
            'L’index « {{path}} » a été omis, car le type « {{indexType}} » n’est pas exporté dans schema.rb Rails.',
        missing_field:
            'L’index « {{path}} » a été omis, car un champ référencé est manquant.',
        field_not_exported:
            'L’index « {{path}} » a été omis, car un champ référencé n’a pas été exporté.',
    },
    comment_omitted: {
        table: 'Le commentaire de table sur « {{path}} » est omis, car SQLite ne conserve pas les commentaires.',
        column: 'Le commentaire de colonne sur « {{path}} » est omis, car SQLite ne conserve pas les commentaires.',
    },
    check_omitted: {
        table: 'La contrainte CHECK vide sur « {{path}} » a été omise.',
        column: 'La contrainte CHECK vide sur « {{path}} » a été omise.',
    },
    set_degraded: {
        sqlite_as_string:
            'Le champ SET sur « {{path}} » est exporté en string pour SQLite.',
        mysql_family_as_string:
            'Le champ SET sur « {{path}} » est exporté en string ; le DSL SET natif n’est pas émis.',
    },
    enum_degraded: {
        sqlite_as_string:
            'Le champ enum sur « {{path}} » est exporté en string pour SQLite.',
        pg_type_values_missing:
            'L’enum PostgreSQL « {{path}} » n’a pas été déclaré, car les valeurs canoniques sont manquantes.',
        pg_field_values_missing:
            'Le champ « {{path}} » enum PostgreSQL a été exporté en string, car les valeurs enum canoniques sont manquantes.',
        pg_field_named_values_missing:
            'Le champ « {{path}} » enum PostgreSQL « {{enumName}} » a été exporté en string, car les valeurs enum sont manquantes.',
        mysql_family_as_string:
            'Le champ enum sur « {{path}} » est exporté en string ; le DSL enum/set natif n’est pas émis.',
    },
    type_omitted: {
        array: 'Le champ tableau sur « {{path}} » n’est pas représenté dans schema.rb Rails.',
        spatial:
            'Le champ spatial sur « {{path}} » n’est pas représenté dans schema.rb Rails.',
        unsupported:
            'Le champ sur « {{path}} » a été omis, car son type ne peut pas être représenté.',
        unimplemented_database:
            'Le mapping de type n’est pas implémenté pour le type de base de données « {{databaseType}} ».',
    },
    type_degraded: {
        serial_no_sequence:
            'Le champ serial non clé primaire sur « {{path}} » est exporté comme un entier ordinaire sans séquence.',
        jsonb_as_json: 'Le champ « {{path}} » jsonb est exporté en json.',
        uuid_as_string: 'Le champ « {{path}} » uuid est exporté en string(36).',
        null_as_text:
            'Le champ « {{path}} » de classe de stockage null est exporté en text.',
        money_as_decimal: 'Le champ « {{path}} » money est exporté en decimal.',
        year_as_integer: 'Le champ « {{path}} » year est exporté en integer.',
        bit_as_boolean: 'Le champ « {{path}} » bit est exporté en boolean.',
        type_as_string:
            'Le champ « {{path}} » de type « {{sourceType}} » est exporté en {{mappedHelper}}.',
    },
    default_omitted: {
        lambda_expression:
            'La valeur par défaut sur « {{path}} » a été omise (expression SQL de type lambda : {{expression}}).',
        sql_expression:
            'La valeur par défaut sur « {{path}} » a été omise (expression SQL non prise en charge : {{expression}}).',
        unclear:
            'La valeur par défaut sur « {{path}} » a été omise (valeur par défaut ambiguë : {{expression}}).',
        current_timestamp_non_datetime:
            'La valeur par défaut sur « {{path}} » a été omise (CURRENT_TIMESTAMP sur un champ non datetime).',
        uuid_function_non_pg:
            'La valeur par défaut sur « {{path}} » a été omise (fonction UUID par défaut sur un champ UUID non PostgreSQL).',
        boolean_on_non_boolean:
            'La valeur par défaut sur « {{path}} » a été omise (valeur booléenne par défaut sur un champ non booléen).',
        numeric_on_non_numeric:
            'La valeur par défaut sur « {{path}} » a été omise (valeur numérique par défaut sur un champ non numérique).',
        unsupported_type:
            'La valeur par défaut sur « {{path}} » a été omise (type de valeur par défaut non pris en charge).',
    },
};
