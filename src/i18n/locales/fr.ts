import type { LanguageMetadata, LanguageTranslation } from '../types';

export const fr: LanguageTranslation = {
    translation: {
        editor_sidebar: {
            new_diagram: 'Nouveau',
            browse: 'Ouvrir',
            tables: 'Tables',
            refs: 'Refs',
            dependencies: 'Dépendances',
            custom_types: 'Types Personnalisés',
            conversations: 'Conversations',
            conversations_unread_aria:
                '{{count}} messages non lus dans les conversations',
            visuals: 'Visuels',
            activities: 'Activité',
            share: 'Partage',
        },
        menu: {
            actions: {
                actions: 'Actions',
                new: 'Nouveau...',
                browse: 'Toutes les bases de données...',
                save: 'Enregistrer',
                import: 'Importer Base de Données',
                export: 'Export',
                export_laravel_migrations: 'Laravel migrations',
                import_laravel_migrations: 'Import Laravel migrations',
                compare_laravel_migrations: 'Sync from Laravel migrations',
                export_sql: 'Exporter SQL',
                export_as: 'Exporter en tant que',
                delete_diagram: 'Supprimer',
            },
            edit: {
                edit: 'Édition',
                undo: 'Annuler',
                redo: 'Rétablir',
                clear: 'Effacer',
            },
            view: {
                view: 'Affichage',
                show_sidebar: 'Afficher la Barre Latérale',
                hide_sidebar: 'Cacher la Barre Latérale',
                hide_cardinality: 'Cacher la Cardinalité',
                show_cardinality: 'Afficher la Cardinalité',
                hide_field_attributes: 'Masquer les Attributs de Champ',
                show_field_attributes: 'Afficher les Attributs de Champ',
                zoom_on_scroll: 'Zoom sur le Défilement',
                show_views: 'Vues de Base de Données',
                theme: 'Thème',
                show_dependencies: 'Afficher les Dépendances',
                hide_dependencies: 'Masquer les Dépendances',
                show_minimap: 'Afficher la Mini Carte',
                hide_minimap: 'Masquer la Mini Carte',
            },
            backup: {
                backup: 'Sauvegarde',
                export_diagram: 'Exporter le diagramme',
                restore_diagram: 'Restaurer le diagramme',
            },
            help: {
                help: 'Aide',
                docs_website: 'Documentation',
                join_discord: 'Rejoignez-nous sur Discord',
            },
        },

        delete_diagram_alert: {
            title: 'Choisissez votre base de données',
            description:
                'Sélectionnez le système de base de données pour votre nouveau diagramme.',
            cancel: 'Annuler',
            delete: 'Supprimer',
        },

        clear_diagram_alert: {
            title: 'Effacer le Diagramme',
            description:
                'Cette action est irréversible. Cela supprimera définitivement toutes les données dans le diagramme.',
            cancel: 'Annuler',
            clear: 'Effacer',
        },

        diagram_access: {
            removed: {
                title: 'Choisissez votre base de données',
                description:
                    'Sélectionnez le système de base de données pour votre nouveau diagramme.',
            },
            role_changed_viewer: {
                title: 'View-only access',
                description:
                    'Your role on this diagram was changed to viewer. Editing is now disabled.',
            },
            role_changed_editor: {
                title: 'Edit access granted',
                description:
                    'Your role on this diagram was changed to editor. You can edit again.',
            },
        },

        reorder_diagram_alert: {
            title: 'Organiser Automatiquement le Diagramme',
            description:
                'Cette action réorganisera toutes les tables dans le diagramme. Voulez-vous continuer ?',
            reorder: 'Organiser Automatiquement',
            cancel: 'Annuler',
        },

        copy_to_clipboard_toast: {
            unsupported: {
                title: 'Échec de la copie',
                description: 'Presse-papiers non pris en charge',
            },
            failed: {
                title: 'Échec de la copie',
                description: 'Quelque chose a mal tourné. Veuillez réessayer.',
            },
        },

        theme: {
            system: 'Système',
            light: 'Clair',
            dark: 'Sombre',
        },

        zoom: {
            on: 'Activé',
            off: 'Désactivé',
        },

        last_saved: 'Dernière sauvegarde',
        saved: 'Enregistré',
        loading_diagram: 'Chargement du diagramme...',
        deselect_all: 'Tout désélectionner',
        select_all: 'Tout sélectionner',
        delete: 'Supprimer',
        clear: 'Effacer',
        show_more: 'Afficher Plus',
        show_less: 'Afficher Moins',
        copy_to_clipboard: 'Copier dans le presse-papiers',
        copied: 'Copié !',

        side_panel: {
            view_all_options: 'Voir toutes les Options...',
            tables_section: {
                tables: 'Tables',
                add_table: 'Ajouter une Table',
                add_view: 'Ajouter une Vue',
                filter: 'Filtrer',
                collapse: 'Réduire Tout',
                clear: 'Effacer le Filtre',
                no_results:
                    'Aucune table trouvée correspondant à votre filtre.',
                show_list: 'Afficher la Liste des Tableaux',
                show_dbml: "Afficher l'éditeur DBML",
                all_hidden: 'Toutes les tables sont masquées',
                show_all: 'Tout afficher',

                table: {
                    fields: 'Champs',
                    nullable: 'Nullable?',
                    primary_key: 'Clé Primaire',
                    indexes: 'Index',
                    check_constraints: 'Contraintes de vérification',
                    comments: 'Commentaires',
                    no_comments: 'Pas de commentaires',
                    add_field: 'Ajouter un Champ',
                    add_index: 'Ajouter un Index',
                    add_check: 'Ajouter une vérification',
                    index_select_fields: 'Sélectionner des champs',
                    no_types_found: 'Aucun type trouvé',
                    field_name: 'Nom',
                    field_type: 'Type',
                    field_actions: {
                        title: 'Attributs du Champ',
                        open_discussion: 'Ouvrir la conversation',
                        unique: 'Unique',
                        auto_increment: 'Auto-incrément',
                        comments: 'Commentaires',
                        no_comments: 'Pas de commentaires',
                        delete_field: 'Supprimer le Champ',
                        // TODO: Translate
                        default_value: 'Default Value',
                        no_default: 'No default',
                        // TODO: Translate
                        character_length: 'Max Length',
                        precision: 'Précision',
                        scale: 'Échelle',
                    },
                    index_actions: {
                        title: "Attributs de l'Index",
                        name: 'Nom',
                        unique: 'Unique',
                        index_type: "Type d'index",
                        delete_index: "Supprimer l'Index",
                    },
                    check_constraint_actions: {
                        title: 'Contrainte de vérification',
                        expression: 'Expression',
                        delete: 'Supprimer la contrainte',
                    },
                    table_actions: {
                        title: 'Actions de la Table',
                        open_discussion: 'Ouvrir la conversation',
                        add_field: 'Ajouter un Champ',
                        add_index: 'Ajouter un Index',
                        duplicate_table: 'Dupliquer la table',
                        delete_table: 'Supprimer la Table',
                        change_schema: 'Changer le Schéma',
                    },
                },
                empty_state: {
                    title: 'Aucune table',
                    description: 'Créez une table pour commencer',
                },
            },
            refs_section: {
                refs: 'Refs',
                filter: 'Filtrer',
                clear: 'Effacer le filtre',
                no_results:
                    'Aucune référence trouvée correspondant à votre filtre.',
                collapse: 'Réduire Tout',
                add_relationship: 'Ajouter une Relation',
                relationships: 'Relations',
                dependencies: 'Dépendances',
                relationship: {
                    relationship: 'Relation',
                    primary: 'Table Principale',
                    foreign: 'Table Liée',
                    cardinality: 'Cardinalité',
                    on_delete: 'On delete',
                    on_update: 'On update',
                    delete_relationship: 'Supprimer',
                    switch_tables: 'Inverser les tables',
                    referential_action: {
                        none: 'No action',
                        cascade: 'Cascade',
                        set_null: 'Set null',
                        restrict: 'Restrict',
                    },
                    relationship_actions: {
                        title: 'Actions',
                        open_discussion: 'Ouvrir la conversation',
                        delete_relationship: 'Supprimer',
                    },
                },
                dependency: {
                    dependency: 'Dépendance',
                    table: 'Table',
                    dependent_table: 'Vue Dépendante',
                    delete_dependency: 'Supprimer',
                    dependency_actions: {
                        title: 'Actions',
                        delete_dependency: 'Supprimer',
                    },
                },
                empty_state: {
                    title: 'Aucune relation',
                    description: 'Créez une relation pour commencer',
                },
            },

            areas_section: {
                areas: 'Zones',
                add_area: 'Ajouter une Zone',
                filter: 'Filtrer',
                clear: 'Effacer le Filtre',
                no_results: 'Aucune zone trouvée correspondant à votre filtre.',

                area: {
                    area_actions: {
                        title: 'Actions de la Zone',
                        edit_name: 'Modifier le Nom',
                        delete_area: 'Supprimer la Zone',
                    },
                },
                empty_state: {
                    title: 'Aucune zone',
                    description: 'Créez une zone pour commencer',
                },
            },

            visuals_section: {
                visuals: 'Visuels',
                tabs: {
                    areas: 'Zones',
                    notes: 'Notes',
                },
            },

            notes_section: {
                filter: 'Filtrer',
                add_note: 'Ajouter une Note',
                no_results: 'Aucune note trouvée',
                clear: 'Effacer le Filtre',
                empty_state: {
                    title: 'Pas de Notes',
                    description:
                        'Créez une note pour ajouter des annotations de texte sur le canevas',
                },
                note: {
                    empty_note: 'Note vide',
                    note_actions: {
                        title: 'Actions de Note',
                        edit_content: 'Modifier le Contenu',
                        delete_note: 'Supprimer la Note',
                    },
                },
            },

            custom_types_section: {
                custom_types: 'Types Personnalisés',
                filter: 'Filtrer',
                clear: 'Effacer le Filtre',
                no_results:
                    'Aucun type personnalisé trouvé correspondant à votre filtre.',
                new_type: 'Nouveau Type',
                empty_state: {
                    title: 'Aucun type personnalisé',
                    description:
                        "Les types personnalisés apparaîtront ici lorsqu'ils seront disponibles dans votre base de données",
                },
                custom_type: {
                    kind: 'Type',
                    enum_values: 'Valeurs Enum',
                    composite_fields: 'Champs',
                    no_fields: 'Aucun champ défini',
                    no_values: "Aucune valeur d'énumération définie",
                    field_name_placeholder: 'Nom du champ',
                    field_type_placeholder: 'Sélectionner le type',
                    add_field: 'Ajouter un Champ',
                    no_fields_tooltip:
                        'Aucun champ défini pour ce type personnalisé',
                    custom_type_actions: {
                        title: 'Actions',
                        highlight_fields: 'Surligner les Champs',
                        delete_custom_type: 'Supprimer',
                        clear_field_highlight: 'Effacer le Surlignage',
                    },
                    delete_custom_type: 'Supprimer le Type',
                },
            },
            conversations_section: {
                title: 'Conversations',
                tabs_label: 'Listes de conversations',
                tabs: {
                    active: 'Actives',
                    archives: 'Archivées',
                },
                loading: 'Chargement des conversations…',
                filter: 'Filtrer',
                clear: 'Effacer le filtre',
                no_results_title: 'Aucun résultat',
                no_results_description:
                    'Aucune conversation correspondant à votre filtre.',

                type_filter: {
                    trigger: 'Type',
                    label: 'Filtrer par type',
                    trigger_aria: 'Filtrer par type de conversation',
                },
                loading_more: 'Chargement supplémentaire…',
                load_more: 'Charger plus',
                retry: 'Réessayer',
                dismiss: 'Fermer',
                read_only: 'Lecture seule',
                deleted_user: 'Utilisateur supprimé',
                unread: {
                    badge_aria: '{{count}} messages non lus',
                },
                inactive: {
                    title: 'Conversations indisponibles',
                    description:
                        'Les conversations sont disponibles uniquement sur les diagrammes cloud authentifiés.',
                },
                empty: {
                    active_title: 'Aucune conversation',
                    active_description: 'Créer une conversation pour commencer',
                    archives_title: 'Aucune conversation archivée',
                    archives_description:
                        'Les conversations archivées apparaîtront ici lorsque vous fermerez un fil.',
                },
                errors: {
                    load_title: 'Impossible de charger les conversations',
                    load_description:
                        'Une erreur s’est produite lors du chargement des conversations. Veuillez réessayer.',
                },
                mutation_errors: {
                    generic:
                        'Impossible de mettre à jour la conversation. Veuillez réessayer.',
                },
                target_entry: {
                    open: 'Ouvrir la conversation',
                    start: 'Démarrer une conversation',
                    pending: 'Démarrage de la conversation…',
                    diagram_name: 'Diagramme',
                    open_aria: 'Ouvrir la conversation pour {{name}}',
                    start_aria: 'Démarrer une conversation pour {{name}}',
                    open_tooltip: 'Ouvrir la conversation pour {{name}}',
                    start_tooltip: 'Démarrer une conversation pour {{name}}',
                    pending_tooltip:
                        'Démarrage de la conversation pour {{name}}…',
                    action_tooltip: 'Conversation',
                    unavailable_description:
                        'Vous ne pouvez pas démarrer de conversations sur ce diagramme.',
                    errors: {
                        validation:
                            'Cette cible n’est pas valide pour une conversation.',
                        forbidden:
                            'Vous n’avez pas l’autorisation de démarrer cette conversation.',
                        not_found:
                            'Cette cible n’est plus disponible sur le diagramme.',
                        conflict:
                            'Cette conversation n’a pas pu être démarrée. Veuillez réessayer.',
                        generic:
                            'Impossible d’ouvrir cette conversation. Veuillez réessayer.',
                    },
                },
                actions: {
                    archive: 'Archiver',
                    archiving: 'Archivage…',
                    reopen: 'Rouvrir',
                    reopening: 'Réouverture…',
                    archive_aria: 'Archiver la conversation pour {{target}}',
                    reopen_aria: 'Rouvrir la conversation pour {{target}}',
                },
                summary: {
                    message_count: '{{count}} messages',
                    no_messages: 'Aucun message pour l’instant',
                    last_activity: 'Dernière activité',
                    open_aria: 'Ouvrir la conversation pour {{target}}',
                    focus_target_aria: 'Afficher {{target}} sur le diagramme',
                    author_tooltip: 'Dernier message de {{name}}',
                    author_missing_tooltip: 'Aucune information sur l’auteur',
                    actions: {
                        menu_aria: 'Options de la conversation',
                        open: 'Ouvrir',
                        delete: 'Supprimer',
                    },
                    delete_dialog: {
                        title: 'Supprimer la conversation ?',
                        description:
                            'Cette action supprimera définitivement cette conversation et tous ses messages.',
                        cancel: 'Annuler',
                        confirm: 'Supprimer',
                        deleting: 'Suppression…',
                        errors: {
                            delete_failed:
                                'Impossible de supprimer cette conversation. Veuillez réessayer.',
                            forbidden:
                                'Vous n’avez pas la permission de supprimer cette conversation.',
                            not_found:
                                'Cette conversation n’est plus disponible.',
                        },
                    },
                },
                detail: {
                    back: 'Retour',
                    back_aria: 'Retour à la liste des conversations',
                    loading: 'Chargement des messages…',
                    loading_more: 'Chargement des messages plus anciens…',
                    load_older: 'Charger les messages plus anciens',
                    new_messages_badge_one: '1 nouveau message',
                    new_messages_badge_other: '{{count}} nouveaux messages',
                    new_messages_badge_label_one: 'nouveau message',
                    new_messages_badge_label_other: 'nouveaux messages',
                    new_messages_badge_aria_one: 'Aller au nouveau message',
                    new_messages_badge_aria_other:
                        'Aller aux {{count}} nouveaux messages',
                    empty: {
                        title: 'Aucun message',
                        description:
                            'Cette conversation ne contient aucun message.',
                    },
                    errors: {
                        load_title: 'Impossible de charger les messages',
                        load_description:
                            'Une erreur s’est produite lors du chargement des messages. Veuillez réessayer.',
                    },
                    archive_banner: {
                        title: 'Conversation archivée',
                        description:
                            'Cette conversation est en lecture seule. Les messages ne peuvent pas être ajoutés, modifiés ou supprimés.',
                    },
                    metadata: {
                        status_label: 'Statut',
                        status_active: 'Active',
                        status_archived: 'Archivée',
                        message_count_label: 'Nombre de messages',
                        message_count: '{{count}} messages',
                    },
                    message: {
                        edited: '(modifié)',
                        edited_aria: 'Message modifié',
                        day_separator: {
                            today: "Aujourd'hui",
                            yesterday: 'Hier',
                        },
                        actions: {
                            title: 'Actions du message',
                            edit: 'Modifier',
                            delete: 'Supprimer',
                        },
                        reactions: {
                            add_aria: 'Ajouter une réaction',
                            add_tooltip: 'Ajouter une réaction',
                            picker_loading: 'Chargement du sélecteur d’emoji…',
                            picker_aria_label: 'Sélecteur d’emoji',
                            picker_search_placeholder: 'Rechercher un emoji…',
                            picker_empty: 'Aucun emoji trouvé.',
                            chip_aria: 'Réaction {{emoji}}, {{count}}',
                            preview_and_others_one: 'et {{count}} autre',
                            preview_and_others_other: 'et {{count}} autres',
                            errors: {
                                generic:
                                    'Impossible de mettre à jour la réaction. Veuillez réessayer.',
                                forbidden:
                                    'Vous n’êtes pas autorisé à réagir à ce message.',
                                archived:
                                    'Cette conversation est archivée et les réactions sont en lecture seule.',
                                not_found: 'Ce message n’est plus disponible.',
                                invalid_emoji: 'Cet emoji n’est pas valide.',
                            },
                        },
                    },
                    composer: {
                        label: 'Message',
                        placeholder: 'Écrire un message…',
                        submit: 'Envoyer',
                        submitting: 'Envoi…',
                        form_aria_label: 'Nouveau message de conversation',
                        keyboard_hint:
                            'Appuyez sur Entrée pour envoyer. Maj+Entrée ajoute une nouvelle ligne.',
                        counter_aria_label:
                            '{{count}} sur {{max}} caractères utilisés',
                        errors: {
                            empty: 'Saisissez un message à envoyer.',
                            too_long:
                                'Les messages ne peuvent pas dépasser 2000 caractères.',
                            create_failed:
                                'Impossible d’envoyer le message. Veuillez réessayer.',
                        },
                    },
                    edit: {
                        label: 'Message',
                        form_aria_label: 'Modifier le message de conversation',
                        save: 'Enregistrer',
                        saving: 'Enregistrement…',
                        cancel: 'Annuler',
                        counter_aria_label:
                            '{{count}} sur {{max}} caractères utilisés',
                        errors: {
                            empty: 'Saisissez un message à enregistrer.',
                            too_long:
                                'Les messages ne peuvent pas dépasser 2000 caractères.',
                            update_failed:
                                'Impossible de mettre à jour le message. Veuillez réessayer.',
                        },
                    },
                    delete_dialog: {
                        title: 'Supprimer le message',
                        description:
                            'Voulez-vous vraiment supprimer ce message ? Cette action est irréversible.',
                        cancel: 'Annuler',
                        confirm: 'Supprimer',
                        deleting: 'Suppression…',
                        errors: {
                            delete_failed:
                                'Impossible de supprimer ce message. Veuillez réessayer.',
                        },
                    },
                    mutation_errors: {
                        forbidden:
                            'Vous n’avez pas la permission de modifier ce message.',
                        archived:
                            'Cette conversation est archivée et en lecture seule.',
                        not_found:
                            'Cette conversation ou ce message n’est plus disponible.',
                    },
                },

                targets: {
                    diagram: 'Diagramme',
                    table: 'Table',
                    field: 'Champ',
                    relationship: 'Relation',
                    unknown: 'Conversation',
                },
                target_labels: {
                    diagram: 'Diagramme',
                    field: '{{table}}.{{field}}',
                    relationship_endpoints: '{{source}} → {{target}}',
                    missing_table: 'Table supprimée',
                    missing_field: 'Champ supprimé',
                    missing_relationship: 'Relation supprimée',
                    unknown: 'Conversation',
                },
            },
            activities_section: {
                title: 'Activité',
                filter: 'Filtrer',
                clear: 'Effacer le filtre',
                no_results: 'Aucune activité ne correspond à votre filtre.',
                loading: 'Chargement de l’activité…',
                retry: 'Réessayer',
                type_filter: {
                    trigger: 'Type',
                    label: 'Filtrer par type',
                    trigger_aria: 'Filtrer par type d’activité',
                },
                types: {
                    diagram: 'Diagramme',
                    table: 'Table',
                    field: 'Champ',
                    relationship: 'Relation',
                    note: 'Note',
                    area: 'Zone',
                    dependency: 'Dépendance',
                },
                you: 'Vous',
                unknown_user: 'Quelqu’un',
                empty_state: {
                    title: 'Aucune activité pour le moment',
                    description:
                        'Commencez à modifier le diagramme pour voir les changements récents.',
                },
                errors: {
                    load_failed: 'Impossible de charger l’activité.',
                },
                actions: {
                    add_tables: '{{user}} a ajouté la table {{table}}',
                    remove_tables: '{{user}} a supprimé une table',
                    add_field: '{{user}} a ajouté le champ {{field}}',
                    remove_field: '{{user}} a supprimé un champ',
                    update_field: '{{user}} a mis à jour le champ {{field}}',
                    add_relationships: '{{user}} a ajouté une relation',
                    remove_relationships: '{{user}} a supprimé une relation',
                    update_relationship: '{{user}} a mis à jour une relation',
                    add_notes: '{{user}} a ajouté une note',
                    remove_notes: '{{user}} a supprimé une note',
                    add_areas: '{{user}} a ajouté une zone',
                    remove_areas: '{{user}} a supprimé une zone',
                    add_dependencies: '{{user}} a ajouté une dépendance',
                    remove_dependencies: '{{user}} a supprimé une dépendance',
                    fallback: '{{user}} a mis à jour le diagramme',
                },
            },
            share_section: {
                title: 'Partage',
                tabs_label: 'Options de partage',
                tabs: {
                    collaborators: 'Collaborateurs',
                    public_link: 'Lien public',
                },
                collaborators: {
                    description:
                        'Invitez des collaborateurs avec un accès éditeur ou lecteur. Ils doivent déjà avoir un compte FoxalDB.',
                    filter: 'Filtrer',
                    clear: 'Effacer le filtre',
                    no_results_title: 'Aucun résultat',
                    no_results_description:
                        'Aucun collaborateur ne correspond à votre filtre.',
                    role_filter: {
                        trigger: 'Rôle',
                        label: 'Filtrer par rôle',
                        trigger_aria: 'Filtrer par rôle de collaborateur',
                    },
                },
                public_link: {
                    title: 'Lien public',
                    description:
                        'Partagez une copie en lecture seule de votre diagramme avec toute personne disposant du lien.',
                    coming_soon: 'Bientôt disponible.',
                },
                loading: 'Chargement des collaborateurs…',
                retry: 'Réessayer',
                errors: {
                    load_failed: 'Impossible de charger les collaborateurs.',
                },
                member_actions: {
                    title: 'Actions du collaborateur',
                    trigger_aria: 'Actions du collaborateur',
                    role: 'Rôle',
                    remove: 'Retirer le collaborateur',
                },
            },
        },

        toolbar: {
            zoom_in: 'Zoom Avant',
            zoom_out: 'Zoom Arrière',
            save: 'Enregistrer',
            show_all: 'Afficher Tout',
            undo: 'Annuler',
            redo: 'Rétablir',
            reorder_diagram: 'Organiser Automatiquement le Diagramme',
            // TODO: Translate
            clear_custom_type_highlight: 'Clear highlight for "{{typeName}}"',
            custom_type_highlight_tooltip:
                'Highlighting "{{typeName}}" - Click to clear',
            highlight_overlapping_tables: 'Surligner les tables chevauchées',
            filter: 'Filtrer les Tables',
        },

        new_diagram_dialog: {
            database_selection: {
                title: 'Choisissez votre base de données',
                description:
                    'Sélectionnez le système de base de données pour votre nouveau diagramme.',
                search_placeholder: 'Rechercher un SGBD…',
                search_no_results: 'Aucun SGBD correspond à votre recherche.',
                clear_search: 'Effacer la recherche',
                primary_group: 'Bases de données principales',
                other_group: 'Autres bases de données',
                check_examples_long: 'Voir les Exemples',
                check_examples_short: 'Exemples',
            },

            choose_intent: {
                title: 'Que souhaitez-vous faire ?',
                description: 'Créez un nouveau diagramme pour {{database}}.',
                create_empty: 'Créer un diagramme vide',
                create_empty_description:
                    'Partez de zéro en ajoutant vos propres tables.',
                import: 'Importer',
                import_description:
                    'Depuis un fichier, du texte collé ou votre base de données.',
                back: 'Retour',
            },

            choose_import_method: {
                title: 'Comment souhaitez-vous importer ?',
                description:
                    'Choisissez une source pour votre diagramme {{database}}.',
                from_file: 'Fichier ou texte collé',
                from_file_description: 'SQL, DBML ou JSON de diagramme.',
                from_database: 'Base de données existante',
                from_database_description:
                    'Exécutez une requête dans votre base et collez le résultat.',
                back: 'Retour',
            },

            import_from_database: {
                title: 'Importer depuis une base existante',
                description:
                    "Utilisez cette option lorsque vous n'avez pas de fichier SQL ou DBML. Exécutez la requête dans votre base, puis collez le résultat ci-dessous.",
                database_edition: 'Édition de la base',
                edition_regular: 'Standard',
                run_query: 'Exécutez cette requête dans votre base',
                client_sql: 'SQL',
                paste_result: 'Collez le résultat',
                paste_result_placeholder:
                    'Collez le résultat de la requête ici…',
                check_result: 'Vérifier le résultat',
                valid_result: 'Le résultat semble valide.',
                invalid_result:
                    'Le résultat n’a pas pu être validé. Vérifiez le contenu et réessayez.',
                truncated_result:
                    'Le résultat semble tronqué. Ajustez les paramètres de votre client SQL et relancez la requête.',
                waiting_for_result:
                    'Collez le résultat de la requête pour continuer.',
                unsupported_database:
                    "L'extraction de schéma n'est pas disponible pour ce type de base.",
                import_failed:
                    "Le schéma n'a pas pu être importé. Vérifiez le résultat et réessayez.",
                back: 'Retour',
                import: 'Importer',
            },

            import_schema: {
                title: 'Collez votre schéma',
                textarea_label: 'Contenu du schéma',
                textarea_placeholder:
                    'Collez du SQL, du DBML ou des métadonnées JSON ici…',
                auto_detect_hint: 'Nous détecterons le format automatiquement.',
                or_divider: 'OU',
                choose_file: 'Choisir un fichier',
                change_file_aria: 'Changer de fichier, actuellement {{name}}',
                selected_file: 'Fichier sélectionné : {{name}}',
                back: 'Retour',
                import: 'Importer',
                mismatch: {
                    title: 'Ce schéma ressemble à {{detected}}, mais vous avez sélectionné {{selected}}.',
                    description:
                        'Passez au type de base détecté ou revenez en arrière pour en choisir un autre.',
                    switch: 'Passer à {{database}}',
                    go_back: 'Retour',
                },
                ambiguous: {
                    title: 'Choisissez le SGBD source',
                    confidence_explanation:
                        "Les pourcentages indiquent l'indice de correspondance du dialecte SQL pour chaque SGBD.",
                    description:
                        "Nous n'avons pas pu identifier automatiquement le dialecte SQL. Indiquez de quel SGBD provient ce schéma.",
                    choose_source: 'Choisir le SGBD source',
                    confidence_badge: '{{percent}} %',
                    candidate_with_confidence:
                        '{{database}} ({{percent}} % de confiance)',
                    candidate_recommended:
                        '{{database}} ({{percent}} % de confiance, détection automatique)',
                    recommended_tooltip: 'SGBD détecté automatiquement',
                    recommended_aria:
                        '{{database}}, SGBD détecté automatiquement',
                    candidate: '{{database}}',
                },
                diagram_json: {
                    detection: {
                        success: 'Prêt à importer ce diagramme.',
                        mismatch_title: 'Erreur de correspondance',
                        mismatch_description:
                            'Le fichier indique {{detected}}, mais vous aviez sélectionné {{selected}}.',
                        unsupported_existing:
                            'Le JSON de diagramme restaure un diagramme complet et ne peut pas être fusionné dans le diagramme actuel. Exportez ou créez un nouveau diagramme.',
                    },
                    ambiguous: {
                        title: 'Choisissez le SGBD du diagramme',
                        description:
                            "Sélectionnez l'option à appliquer pour cet import.",
                        choose_source: 'Choisir le SGBD du diagramme',
                        candidate: '{{database}}',
                        candidate_with_confidence:
                            '{{database}} ({{percent}} %)',
                        candidate_recommended:
                            '{{database}} (fichier, recommandé)',
                        confidence_badge: '{{percent}} %',
                        recommended_tooltip: 'SGBD indiqué dans le fichier',
                        recommended_aria:
                            '{{database}}, SGBD indiqué dans le fichier',
                    },
                },
                detection: {
                    dialect: '{{database}} détecté',
                    dbml: 'DBML détecté',
                    metadata_json: 'Métadonnées JSON détectées',
                    diagram_json: 'JSON de diagramme détecté',
                    sql_ambiguous_title: 'SQL détecté',
                    sql_ambiguous_description:
                        "Le SGBD n'a pas pu être identifié automatiquement.",
                    clickhouse_unsupported: 'SQL ClickHouse détecté',
                    unsupported: 'Format non pris en charge',
                },
                errors: {
                    unreadable_file:
                        'Impossible de lire le fichier sélectionné.',
                    malformed_json: "Le contenu JSON n'a pas pu être analysé.",
                    unsupported:
                        "Ce format n'est pas pris en charge pour l'import de schéma.",
                    diagram_json:
                        "Le JSON de diagramme peut être importé via l'option de fichier de diagramme.",
                    clickhouse_unsupported:
                        "L'import DDL SQL n'est pas pris en charge pour ClickHouse. Utilisez DBML ou importez depuis une base existante.",
                    file_too_large: 'Le fichier sélectionné dépasse 5 Mo.',
                    import_failed:
                        "Le schéma n'a pas pu être importé. Vérifiez le contenu et réessayez.",
                    invalid_diagram_json:
                        "Le JSON de diagramme n'est pas valide. Vérifiez le fichier et réessayez.",
                },
            },

            import_database: {
                ssms_instructions: {
                    button_text: 'Instructions SSMS',
                    title: 'Instructions',
                    step_1: 'Allez dans Outils > Options > Résultats des Requêtes > SQL Server.',
                    step_2: 'Si vous utilisez "Résultats en Grille", changez le nombre maximum de caractères récupérés pour les données non-XML (définir à 9999999).',
                },
            },

            cancel: 'Annuler',
            back: 'Retour',
            import_from_file: "Importer à partir d'un fichier",
            empty_diagram: 'Base de données vide',
            continue: 'Continuer',
            import: 'Importer',
        },

        share_diagram_dialog: {
            title: 'Partager le diagramme',
            description:
                'Invitez des collaborateurs avec un accès éditeur ou lecteur. Ils doivent déjà avoir un compte FoxalDB.',
            share_button: 'Partager',
            empty_members: 'Aucun collaborateur pour l’instant.',
            remove: 'Supprimer',
            roles: {
                owner: 'Propriétaire',
                editor: 'Éditeur',
                viewer: 'Lecteur',
            },
            add_member: {
                title: 'Ajouter un collaborateur',
                email_label: 'E-mail',
                email_placeholder: 'Adresse e-mail',
                add: 'Ajouter',
                adding: 'Ajout en cours…',
                cancel: 'Annuler',
            },
            errors: {
                load_failed: 'Impossible de charger les collaborateurs.',
                add_failed: 'Impossible d’ajouter le collaborateur.',
            },
        },

        diagram_role: {
            owner: 'Propriétaire',
            editor: 'Éditeur',
            viewer: 'Lecteur',
        },

        editor_role: {
            view_only: 'View only',
        },

        open_diagram_dialog: {
            title: 'Ouvrir Base de Données',
            description:
                'Sélectionnez un diagramme à ouvrir dans la liste ci-dessous.',
            table_columns: {
                name: 'Nom',
                created_at: 'Créé le',
                last_modified: 'Dernière modification',
                tables_count: 'Tables',
            },
            cancel: 'Annuler',
            open: 'Ouvrir',
            new_database: 'Nouvelle Base de Données',

            diagram_actions: {
                open: 'Ouvrir',
                duplicate: 'Dupliquer',
                delete: 'Supprimer',
            },
        },

        export_sql_dialog: {
            title: 'Exporter SQL',
            description:
                'Exportez le schéma de votre diagramme en script {{databaseType}}',
            close: 'Fermer',
            loading: {
                text: "L'IA génère un SQL pour {{databaseType}}...",
                description: "Cela devrait prendre jusqu'à 30 secondes.",
            },
            error: {
                message:
                    'Erreur lors de la génération du script SQL. Veuillez réessayer plus tard ou <0>contactez-nous</0>.',
                description:
                    "N'hésitez pas à utiliser votre OPENAI_TOKEN, voir le manuel <0>ici</0>.",
            },
        },

        export_image_dialog: {
            title: "Exporter l'image",
            description:
                "Choisissez le facteur d'échelle pour l'image exportée.",
            scale_1x: '1x (Basse qualité)',
            scale_2x: '2x (Qualité normale)',
            scale_4x: '4x (Meilleure qualité)',
            cancel: 'Annuler',
            export: 'Exporter',
            // TODO: Translate
            advanced_options: 'Advanced Options',
            pattern: 'Include background pattern',
            pattern_description:
                'Sélectionnez le système de base de données pour votre nouveau diagramme.',
            transparent: 'Transparent background',
            transparent_description: 'Remove background color from image.',
        },

        new_table_schema_dialog: {
            title: 'Sélectionner un Schéma',
            description:
                'Plusieurs schémas sont actuellement affichés. Sélectionnez-en un pour la nouvelle table.',
            cancel: 'Annuler',
            confirm: 'Confirmer',
        },

        update_table_schema_dialog: {
            title: 'Modifier le Schéma',
            description: 'Mettre à jour le schéma de la table "{{tableName}}"',
            cancel: 'Annuler',
            confirm: 'Modifier',
        },
        create_table_schema_dialog: {
            title: 'Créer un Nouveau Schéma',
            description:
                "Aucun schéma n'existe encore. Créez votre premier schéma pour organiser vos tables.",
            create: 'Créer',
            cancel: 'Annuler',
        },

        export_laravel_migrations_dialog: {
            title: 'Export Laravel migrations',
            laravel_version: 'Laravel version',
            include_table_indexes: 'Include table indexes',
            include_table_indexes_description:
                'Export explicit table index definitions. Field-level unique constraints are always included.',
            include_foreign_keys: 'Include foreign keys',
            include_foreign_keys_description:
                'Export separate foreign key migration files.',
            export: 'Export',
            exporting: 'Exporting...',
            cancel: 'Cancel',
            errors: {
                export_failed: 'Could not export Laravel migrations.',
            },
        },

        import_laravel_migrations_dialog: {
            title: 'Import Laravel migrations',
            description:
                'Upload a ZIP archive of Laravel migration files to preview the parsed schema snapshot.',
            upload: 'Upload',
            uploading: 'Uploading...',
            close: 'Close',
            upload_another: 'Upload another',
            no_file_selected: 'No file selected.',
            errors: {
                upload_failed: 'Could not import Laravel migrations.',
                file_required: 'Please select a ZIP file to upload.',
                file_too_large: 'File must be 5 MB or smaller.',
            },
            summary: {
                tables: 'Tables',
                columns: 'Columns',
                indexes: 'Indexes',
                foreign_keys: 'Foreign keys',
                warnings: 'Warnings',
            },
            tables: {
                title: 'Tables',
                columns_count: '{{count}} columns',
                indexes_count: '{{count}} indexes',
            },
            foreign_keys: {
                title: 'Foreign keys',
            },
            warnings: {
                title: 'Warnings',
                none: 'No warnings.',
            },
            source_files: {
                title: 'Source files',
            },
        },

        compare_laravel_migrations_dialog: {
            title: 'Sync from Laravel migrations',
            description:
                'Compare the open diagram with a Laravel migration archive.',
            archive_label: 'Laravel migrations archive',
            compare: 'Compare',
            comparing: 'Comparing...',
            close: 'Close',
            compare_another: 'Compare another',
            no_archive_selected: 'No archive selected.',
            include_table_indexes: 'Include table indexes',
            include_table_indexes_description:
                'Include explicit table index definitions. Field-level unique constraints are always included.',
            include_foreign_keys: 'Include foreign keys',
            include_foreign_keys_description:
                'Include separate foreign key migration definitions.',
            errors: {
                compare_failed: 'Could not compare Laravel migrations.',
                archive_required:
                    'Please select a Laravel migrations archive ZIP file.',
                file_too_large: 'File must be 5 MB or smaller.',
            },
            summary: {
                added_tables: 'Added tables',
                removed_tables: 'Removed tables',
                changed_tables: 'Changed tables',
                added_foreign_keys: 'Added foreign keys',
                removed_foreign_keys: 'Removed foreign keys',
                changed_foreign_keys: 'Changed foreign keys',
                warnings: 'Warnings',
            },
            sections: {
                added_tables: 'Added tables',
                removed_tables: 'Removed tables',
                changed_tables: 'Changed tables',
                added_foreign_keys: 'Added foreign keys',
                removed_foreign_keys: 'Removed foreign keys',
                changed_foreign_keys: 'Changed foreign keys',
                warnings: 'Warnings',
            },
            tables: {
                columns_count: '{{count}} columns',
                indexes_count: '{{count}} indexes',
            },
            changed_tables: {
                added_columns: 'Added columns',
                removed_columns: 'Removed columns',
                changed_columns: 'Changed columns',
                added_indexes: 'Added indexes',
                removed_indexes: 'Removed indexes',
                changed_indexes: 'Changed indexes',
            },
            changed_foreign_keys: {
                before: 'Before',
            },
            attribute_change: {
                arrow: '→',
            },
            warnings: {
                none: 'No warnings.',
            },
            apply: {
                apply: 'Apply changes',
                applying: 'Applying...',
                apply_success: 'Changes applied successfully.',
                apply_failed: 'Could not apply migration changes.',
                apply_blocked: 'Fix validation issues before applying changes.',
                ready_to_apply: 'Ready to apply',
                validation_issues: 'Validation issues',
                added_tables: 'Added tables',
                removed_tables: 'Removed tables',
                changed_tables: 'Changed tables',
            },
        },
        create_relationship_dialog: {
            title: 'Créer une Relation',
            primary_table: 'Table Principale',
            primary_field: 'Champ Principal',
            referenced_table: 'Table Référencée',
            referenced_field: 'Champ Référencé',
            primary_table_placeholder: 'Sélectionner une table',
            primary_field_placeholder: 'Sélectionner un champ',
            referenced_table_placeholder: 'Sélectionner une table',
            referenced_field_placeholder: 'Sélectionner un champ',
            no_tables_found: 'Aucune table trouvée',
            no_fields_found: 'Aucun champ trouvé',
            create: 'Créer',
            cancel: 'Annuler',
        },

        import_database_dialog: {
            title: 'Importer dans le Diagramme Actuel',
            import_schema: {
                title: 'Importer un schéma',
                import: 'Importer',
                cancel: 'Annuler',
                mismatch: {
                    title: 'Ce schéma ressemble à {{detected}}, mais ce diagramme est {{selected}}.',
                    description:
                        "L'import entre bases de données différentes n'est pas encore pris en charge.",
                    cancel: 'Annuler',
                },
                ambiguous: {
                    description:
                        "Nous n'avons pas pu identifier automatiquement le dialecte SQL. Indiquez comment interpréter ce schéma pour le diagramme {{selected}} actuel.",
                },
            },
            override_alert: {
                title: 'Importer Base de Données',
                content: {
                    alert: "L'importation de ce diagramme affectera les tables et relations existantes.",
                    new_tables:
                        '<bold>{{newTablesNumber}}</bold> nouvelles tables seront ajoutées.',
                    new_relationships:
                        '<bold>{{newRelationshipsNumber}}</bold> nouvelles relations seront créées.',
                    tables_override:
                        '<bold>{{tablesOverrideNumber}}</bold> tables seront écrasées.',
                    proceed: 'Voulez-vous continuer ?',
                },
                import: 'Importer',
                cancel: 'Annuler',
            },
        },
        export_diagram_dialog: {
            title: 'Exporter le Diagramme',
            description: "Sélectionner le format d'exportation :",
            format_json: 'JSON',
            cancel: 'Annuler',
            export: 'Exporter',
            error: {
                title: "Erreur lors de l'exportation du diagramme",
                description:
                    "Une erreur s'est produite. Besoin d'aide ? support@chartdb.io",
            },
        },
        import_diagram_dialog: {
            title: 'Importer un diagramme',
            description: 'Coller le diagramme au format JSON ci-dessous :',
            cancel: 'Annuler',
            import: 'Exporter',
            error: {
                title: "Erreur lors de l'exportation du diagramme",
                description:
                    "Le diagramme JSON n'est pas valide. Veuillez vérifier le JSON et réessayer. Besoin d'aide ? support@chartdb.io",
            },
        },
        import_dbml_dialog: {
            example_title: "Exemple d'importation DBML",
            title: 'Import DBML',
            description:
                'Importer un schéma de base de données à partir du format DBML.',
            import: 'Importer',
            cancel: 'Annuler',
            skip_and_empty: 'Passer et vider',
            show_example: 'Afficher un exemple',
            error: {
                title: 'Erreur',
                description:
                    "Erreur d'analyse du DBML. Veuillez vérifier la syntaxe.",
            },
        },
        relationship_type: {
            one_to_one: 'Un à Un',
            one_to_many: 'Un à Plusieurs',
            many_to_one: 'Plusieurs à Un',
            many_to_many: 'Plusieurs à Plusieurs',
        },

        canvas_context_menu: {
            new_table: 'Nouvelle Table',
            new_view: 'Nouvelle Vue',
            new_relationship: 'Nouvelle Relation',
            new_area: 'Nouvelle Zone',
            new_note: 'Nouvelle Note',
        },

        table_node_context_menu: {
            edit_table: 'Éditer la Table',
            duplicate_table: 'Dupliquer la table',
            delete_table: 'Supprimer la Table',
            add_relationship: 'Ajouter une Relation',
            move_to_area: 'Déplacer vers une Zone',
            no_area: 'Aucune Zone',
        },

        canvas: {
            all_tables_hidden: 'Toutes les tables sont masquées',
            show_all_tables: 'Tout afficher',
        },

        canvas_filter: {
            title: 'Filtrer les Tables',
            search_placeholder: 'Rechercher des tables...',
            group_by_schema: 'Grouper par Schéma',
            group_by_area: 'Grouper par Zone',
            no_tables_found: 'Aucune table trouvée',
            empty_diagram_description: 'Créez une table pour commencer',
            no_tables_description:
                'Essayez de modifier votre recherche ou filtre',
            clear_filter: 'Effacer le filtre',
        },

        snap_to_grid_tooltip:
            'Aligner sur la grille (maintenir la touche {{key}})',

        editing_conflict: {
            one: '{{name}} est également en train de modifier ceci.',
            two: '{{name1}} et {{name2}} sont également en train de modifier ceci.',
            many: '{{name}} et {{count}} autres sont également en train de modifier ceci.',
            fallback_name: 'Collaborateur',
            last_writer_wins:
                "Les modifications ne sont pas verrouillées. La dernière modification enregistrée l'emporte.",
        },

        tool_tips: {
            double_click_to_edit: 'Double-cliquez pour modifier',
        },

        auth: {
            dialog: {
                account_title: 'Compte',
                login_title: 'Se connecter à FoxalDB',
                register_title: 'Créer un compte FoxalDB',
                account_description: 'Gérez votre session actuelle.',
                login_description:
                    'Connectez-vous pour enregistrer plus de diagrammes et les synchroniser.',
                register_description:
                    'Créez un compte pour enregistrer plus de diagrammes.',
                checking_session: 'Vérification de la session...',
                continue_without_account: 'Continuer sans compte',
            },
            login: {
                title: 'Connexion',
                email_label: 'E-mail',
                password_label: 'Mot de passe',
                submit: 'Se connecter',
                submitting: 'Connexion...',
                switch_to_register: "S'inscrire",
                no_account: 'Pas de compte ?',
            },
            register: {
                title: 'Inscription',
                first_name_label: 'Prénom',
                last_name_label: 'Nom',
                email_label: 'E-mail',
                password_label: 'Mot de passe',
                password_confirmation_label: 'Confirmer le mot de passe',
                submit: 'Créer un compte',
                submitting: 'Création du compte...',
                switch_to_login: 'Se connecter',
                already_have_account: 'Vous avez déjà un compte ?',
            },
            account: {
                signed_in_as: 'Connecté en tant que',
                logout: 'Déconnexion',
                back_to_editor: "Retour à l'éditeur",
            },
            settings: {
                title: 'Paramètres utilisateur',
                description:
                    'Modifiez vos informations personnelles et votre mot de passe.',
                change_password_heading: 'Changer le mot de passe',
                current_password_label: 'Mot de passe actuel',
                new_password_label: 'Nouveau mot de passe',
                password_confirmation_label:
                    'Confirmer le nouveau mot de passe',
                first_name_label: 'Prénom',
                last_name_label: 'Nom',
                email_label: 'Adresse e-mail',
                submit: 'Enregistrer',
                submitting: 'Enregistrement...',
                success_title: 'Profil mis à jour',
                success_description: 'Votre profil a été enregistré.',
            },
            nav: {
                sign_in: 'Se connecter',
                logout: 'Déconnexion',
                loading: '...',
                user_menu: 'Compte',
                settings: 'Paramètres',
                change_language: 'Langue',
            },
            pages: {
                login_title: 'FoxalDB — Connexion',
                register_title: 'FoxalDB — Inscription',
                checking_session: 'Vérification de la session…',
            },
            errors: {
                first_name_required: 'Le prénom est obligatoire.',
                last_name_required: 'Le nom est obligatoire.',
                generic: 'Une erreur est survenue.',
            },
        },

        guest_migration_dialog: {
            title: 'Importer le diagramme local ?',
            description:
                'Vous avez un diagramme enregistré sur cet appareil. Importez-le dans votre compte pour y accéder partout.',
            import: 'Importer dans le compte',
            continue_without_import: 'Continuer sans importer',
        },

        guest_migration_errors: {
            import_failed:
                "Impossible d'importer votre diagramme local. Votre copie locale a été conservée.",
            activation_failed:
                "Le diagramme a été créé mais n'a pas pu être ouvert. Votre copie locale a été conservée.",
            cleanup_failed:
                "Votre diagramme a été importé mais la copie locale n'a pas pu être supprimée. Vous pouvez la supprimer manuellement.",
            check_failed: 'Impossible de lire votre diagramme local.',
        },

        language_select: {
            change_language: 'Langue',
        },

        on: 'Activé',
        off: 'Désactivé',
    },
};

export const frMetadata: LanguageMetadata = {
    name: 'French (France)',
    nativeName: 'Français (France)',
    code: 'fr',
    countryCode: 'fr',
};
