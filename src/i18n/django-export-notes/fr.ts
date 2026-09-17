import type { DjangoExportNoteMessages } from './types';

export const djangoExportNoteMessages: DjangoExportNoteMessages = {
    view_skipped: 'Vue « {{path}} » ignorée.',
    keyless_table_skipped:
        'Table « {{path}} » ignorée, car elle ne peut pas être représentée en SQL de base de données uniquement sans inventer de clé primaire.',
    keyless_table_sql_created:
        'La table physique « {{path}} » est créée par du SQL de base de données uniquement, car Django ne peut pas modéliser une table sans clé primaire sans modifier son schéma.',
    keyless_model_omitted:
        'Aucun modèle ORM Django n’est généré pour « {{path}} », car Django exige une clé primaire.',
    schema_ignored_sqlite:
        'SQLite n’utilise pas le schéma « {{schema}} » ; la table « {{path}} » est exportée sans qualificateur de schéma.',
    mysql_catalog_omitted:
        'Le catalogue MySQL « {{catalog}} » est omis ; Django utilise la base de données définie par la connexion et des noms de tables non qualifiés.',
    mysql_multiple_catalogs_ignored:
        'L’export MySQL omet {{count}} catalogues et émet des noms de tables non qualifiés, car les noms physiques restent uniques.',
    mariadb_catalog_omitted:
        'Le catalogue MariaDB « {{catalog}} » est omis ; Django utilise la base de données définie par la connexion et des noms de tables non qualifiés.',
    mariadb_multiple_catalogs_ignored:
        'L’export MariaDB omet {{count}} catalogues et émet des noms de tables non qualifiés, car les noms physiques restent uniques.',
    postgres_schema_qualified_db_table:
        'La table PostgreSQL « {{path}} » est exportée avec un db_table qualifié par le schéma « {{schema}} ».',
    composite_fk_unsupported:
        'La clé étrangère composite « {{path}} » n’est pas exportée ; les colonnes membres restent scalaires.',
    many_to_many_skipped:
        'La relation plusieurs-à-plusieurs « {{path}} » a été ignorée ; aucune table de jointure n’est inventée à partir d’un libellé.',
    one_to_one_degraded_non_unique_fk:
        'La relation un-à-un sur « {{path}} » est exportée en ForeignKey, car la clé étrangère n’est pas unique.',
    model_name_adjusted:
        'La classe de modèle de la table « {{path}} » a été nommée {{className}}.',
    model_name_collision:
        'La classe de modèle {{className}} pour la table « {{path}} » a été attribuée pour éviter un nom de classe en double.',
    field_name_adjusted:
        'Le champ « {{path}} » est exporté comme attribut Python {{attributeName}} avec db_column « {{dbColumn}} ».',
    related_name_adjusted:
        'related_name sur « {{path}} » a été attribué comme {{relatedName}} pour éviter un conflit d’accesseur inverse.',
    composite_primary_key:
        'La table « {{path}} » est exportée avec CompositePrimaryKey de Django 6.1 en utilisant les attributs {{attributes}}.',
    on_update_omitted:
        'ON UPDATE « {{action}} » sur « {{path}} » est omis ; ForeignKey n’a pas d’équivalent ON UPDATE en base.',
    on_delete_restrict_degraded:
        'ON DELETE RESTRICT sur « {{path}} » est exporté en models.DO_NOTHING ; les sémantiques collecteur RESTRICT/PROTECT de Django ne sont pas utilisées.',
    set_null_omitted: {
        delete: 'ON DELETE SET NULL a été omis sur « {{path}} », car la clé étrangère n’est pas nullable ; models.DO_NOTHING est utilisé.',
    },
    many_to_many_through_skipped: {
        extra_columns:
            'Le ManyToManyField de commodité n’a pas été généré pour la table de jointure « {{path}} », car des colonnes de données supplémentaires sont présentes.',
        ambiguous:
            'Le ManyToManyField de commodité n’a pas été généré pour la table de jointure « {{path}} », car un modèle d’extrémité est ambigu.',
    },
    relationship_skipped: {
        table_not_exported:
            'La relation « {{path}} » a été ignorée, car une table n’a pas été exportée.',
        field_not_exported:
            'La relation « {{path}} » a été ignorée, car un champ référencé n’a pas été exporté.',
        already_relational:
            'La relation « {{path}} » a été ignorée, car le champ propriétaire est déjà une relation.',
        primary_key_fk:
            'La relation « {{path}} » a été ignorée, car la colonne propriétaire fait partie de la clé primaire.',
        unsupported_target_field:
            'La relation « {{path}} » a été ignorée, car le champ cible n’est pas une cible Django unique.',
        keyless_target:
            'La relation « {{path}} » a été ignorée, car elle cible une table sans clé qui n’a pas de modèle Django.',
    },
    index_omitted: {
        unsupported_type:
            'L’index « {{path}} » a été omis, car le type « {{indexType}} » n’est pas exporté en models.Index.',
        field_not_exported:
            'L’index « {{path}} » a été omis, car un champ référencé n’a pas été exporté.',
        unsafe_name:
            'L’index « {{path}} » a été omis, car son nom explicite n’est pas représentable de façon sûre dans Django.',
    },
    index_name_adjusted: {
        unsafe_name:
            'Le nom d’index « {{originalName}} » a été adapté en « {{allocatedName}} » pour respecter les contraintes de nommage Django.',
        name_collision:
            'Le nom d’index « {{originalName}} » a été adapté en « {{allocatedName}} » pour éviter un nom d’index Django en double.',
    },
    constraint_name_adjusted: {
        unsafe_name:
            'Le nom de contrainte unique « {{originalName}} » a été adapté en « {{allocatedName}} » pour respecter les contraintes de nommage Django.',
        name_collision:
            'Le nom de contrainte unique « {{originalName}} » a été adapté en « {{allocatedName}} » pour éviter un nom de contrainte Django en double.',
    },
    comment_omitted: {
        table: 'Le commentaire de table sur « {{path}} » est omis, car SQLite ne conserve pas les commentaires.',
        column: 'Le commentaire de colonne sur « {{path}} » est omis, car SQLite ne conserve pas les commentaires.',
    },
    check_omitted: {
        table: 'La contrainte CHECK sur « {{path}} » a été omise, car le SQL arbitraire ne peut pas être converti en expression Django 6.1.',
        column: 'Le CHECK sur « {{path}} » a été omis, car le SQL arbitraire ne peut pas être converti en expression Django 6.1.',
    },
    set_degraded: {
        set_as_text:
            'Le SET du champ « {{path}} » est exporté comme champ caractère ; les types SET natifs ne sont pas générés.',
    },
    enum_degraded: {
        enum_as_text:
            'L’enum du champ « {{path}} » est exporté comme champ caractère ; les TextChoices Django ne sont pas générés.',
    },
    type_omitted: {
        array: 'Le champ tableau sur « {{path}} » est omis de l’export Django.',
        spatial:
            'Le champ spatial sur « {{path}} » est omis de l’export Django.',
        tsvector:
            'Le champ tsvector sur « {{path}} » est omis de l’export Django.',
        xml: 'Le champ XML sur « {{path}} » est omis de l’export Django.',
        unsupported:
            'Le champ « {{path}} » a été omis, car son type ne peut pas être représenté.',
        unimplemented_database:
            'Le mapping de types n’est pas implémenté pour le type de base « {{databaseType}} ».',
        decimal_precision_required:
            'Le champ decimal sur « {{path}} » a été omis, car DecimalField MySQL/MariaDB exige max_digits et decimal_places.',
    },
    type_degraded: {
        varchar_without_max_length:
            'Le type caractère du champ « {{path}} » est exporté en {{mappedField}}, car max_length est absent.',
    },
    default_omitted: {
        unsupported_type:
            'La valeur par défaut sur « {{path}} » a été omise (type de défaut non pris en charge).',
        current_timestamp_non_datetime:
            'La valeur par défaut sur « {{path}} » a été omise (CURRENT_TIMESTAMP sur un champ non datetime).',
        uuid_function_non_pg:
            'La valeur par défaut sur « {{path}} » a été omise (fonction UUID hors champ UUID PostgreSQL).',
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
