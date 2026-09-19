import type { LanguageMetadata, LanguageTranslation } from '../types';
import { railsExportNoteMessages } from '../rails-export-notes/fr';
import { djangoExportNoteMessages } from '../django-export-notes/fr';
import { drizzleExportNoteMessages } from '../drizzle-export-notes/fr';

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
            title: 'Supprimer le diagramme',
            description:
                'Cette action est irréversible. Cela supprimera définitivement le diagramme.',
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
                title: 'Accès retiré',
                description: "Vous n'avez plus accès à ce diagramme.",
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
                title: 'Choisissez votre SGBD',
                description:
                    'Sélectionnez le système de base de données pour votre nouveau diagramme.',
                search_placeholder: 'Rechercher un SGBD…',
                search_no_results: 'Aucun SGBD correspond à votre recherche.',
                clear_search: 'Effacer la recherche',
                primary_group: 'Bases de données principales',
                other_group: 'Autres bases de données',
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
                from_file_description:
                    'SQL, DBML, JSON ou archive de projet (.zip).',
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
                choose_file_or_project: 'Choisir un fichier ou un projet',
                supported_formats_hint:
                    'Pris en charge : SQL, DBML, JSON, archive de projet (.zip)',
                privacy_info: {
                    link_label: 'Plus d’informations…',
                    title: 'Confidentialité et formats pris en charge',
                    intro: 'Avant de choisir un fichier, voici comment FoxalDB traite vos données lors de l’import.',
                    highlights: {
                        no_execution:
                            'L’import repose sur une analyse statique — votre code n’est jamais exécuté.',
                        no_full_upload:
                            'L’archive complète du projet n’est jamais envoyée au serveur.',
                        filtered_files:
                            'Seuls les fichiers utiles au schéma sont conservés ; .env, vendor/, node_modules/ et tests/ sont exclus.',
                    },
                    simple_formats_title: 'SQL, DBML et JSON',
                    simple_formats_description:
                        'Traités entièrement dans votre navigateur. Taille maximale : {{sizeMb}} Mo.',
                    project_archives_title: 'Archives de projet (.zip)',
                    project_archives_description:
                        'L’archive est ouverte localement et seuls les fichiers utiles au schéma sont extraits. Taille maximale : {{sizeMb}} Mo.',
                    excluded_paths:
                        'Jamais inclus : .env, vendor/, node_modules/, tests/ et autres fichiers non liés au schéma.',
                    table: {
                        framework: 'Framework',
                        files: 'Fichiers analysés',
                        processing: 'Traitement',
                        processing_local: 'Navigateur uniquement',
                        processing_remote: 'Serveur (connexion requise)',
                    },
                    frameworks: {
                        laravel: {
                            files: 'database/migrations/*.php',
                        },
                        prisma: {
                            files: 'prisma/schema.prisma',
                        },
                        rails: {
                            files: 'db/schema.rb',
                        },
                        drizzle: {
                            files: 'drizzle/**/*.sql',
                        },
                        entity_framework_core: {
                            files: '*ModelSnapshot.cs',
                        },
                        django: {
                            files: '*/migrations/*.py',
                        },
                    },
                    back: 'Retour',
                },
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
                    multiple_dbms_title: 'Plusieurs SGBD détectés',
                    confidence_explanation:
                        "Les pourcentages indiquent l'indice de correspondance du dialecte SQL pour chaque SGBD.",
                    selection_help_percentages:
                        "Les pourcentages indiquent l'indice de correspondance du dialecte SQL pour chaque SGBD.",
                    selection_help_recommended:
                        "L'étoile marque le SGBD recommandé.",
                    selection_help_aria:
                        'Aide sur les pourcentages et la recommandation',
                    description:
                        "Nous n'avons pas pu identifier automatiquement le dialecte SQL. Indiquez de quel SGBD provient ce schéma.",
                    choose_source: 'Choisir le SGBD source',
                    confidence_badge: '{{percent}} %',
                    candidate_with_confidence:
                        '{{database}} ({{percent}} % de confiance)',
                    candidate_recommended:
                        '{{database}} ({{percent}} % de confiance, détection automatique)',
                    recommended_tooltip: 'SGBD recommandé',
                    recommended_aria: '{{database}}, SGBD recommandé',
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
                        selection_help_percentages:
                            "Les pourcentages indiquent l'indice de correspondance pour chaque SGBD.",
                        selection_help_recommended:
                            "L'étoile marque le SGBD indiqué dans le fichier.",
                        selection_help_aria:
                            'Aide sur les pourcentages et la recommandation',
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
                project: {
                    frameworks: {
                        laravel: 'Laravel',
                        prisma: 'Prisma',
                        drizzle: 'Drizzle',
                        rails: 'Rails',
                        entity_framework_core: 'Entity Framework Core',
                        django: 'Django',
                    },
                    analyzing_project: "Analyse de l'archive du projet…",
                    detected: 'Projet {{framework}} détecté',
                    migrations_found_one: '{{count}} migration trouvée',
                    migrations_found_other: '{{count}} migrations trouvées',
                    schema_files_found_one:
                        '{{count}} fichier de schéma trouvé',
                    schema_files_found_other:
                        '{{count}} fichiers de schéma trouvés',
                    model_snapshots_found_one:
                        '{{count}} snapshot de modèle trouvé',
                    model_snapshots_found_other:
                        '{{count}} snapshots de modèle trouvés',
                    sql_migrations_found_one: '{{count}} migration SQL trouvée',
                    sql_migrations_found_other:
                        '{{count}} migrations SQL trouvées',
                    migrations_button_one: '{{count}} migration',
                    migrations_button_other: '{{count}} migrations',
                    schema_files_button_one: '{{count}} fichier de schéma',
                    schema_files_button_other: '{{count}} fichiers de schéma',
                    model_snapshots_button_one: '{{count}} snapshot de modèle',
                    model_snapshots_button_other:
                        '{{count}} snapshots de modèle',
                    sql_migrations_button_one: '{{count}} migration',
                    sql_migrations_button_other: '{{count}} migrations',
                    multiple_projects_title:
                        'Plusieurs schémas de base de données détectés',
                    multiple_projects_description:
                        'Cette archive contient plusieurs projets de base de données pris en charge. Choisissez celui à importer.',
                    multiple_database_groups_title:
                        'Plusieurs schémas de base de données détectés',
                    multiple_database_groups_description:
                        'Ce projet contient plusieurs schémas de base de données. Choisissez celui à importer.',
                    choose_database_group:
                        'Choisir le schéma de base de données',
                    group_recommended_aria: '{{label}} recommandé',
                    group_recommended_tooltip: 'Schéma recommandé',
                    choose_project: 'Choisir le projet',
                    unsupported_project:
                        'Archive de projet non prise en charge',
                    unsupported_project_description:
                        'Aucun projet de base de données pris en charge (Laravel, Prisma, Drizzle, Rails, Entity Framework Core ou Django) n’a été trouvé dans cette archive.',
                    project_root: 'Racine du projet : {{path}}',
                    sign_in_to_import_framework:
                        'Connectez-vous pour importer des projets {{framework}} lorsque l’import sera disponible.',
                    remote_processing_notice:
                        'Lorsque l’import sera disponible, seuls les fichiers pertinents du schéma seront traités.',
                    remote_processing_scope:
                        'L’archive complète et le code source non pertinent ne sont jamais envoyés.',
                    remote_processing_security:
                        'L’analyse est statique et n’exécute pas le code importé.',
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
                    archive_too_large:
                        'L’archive de projet sélectionnée dépasse 50 Mo.',
                    archive_invalid:
                        'Le fichier sélectionné n’est pas une archive de projet valide.',
                    unsupported_file_extension:
                        'Seuls les fichiers .sql, .dbml, .json et les archives de projet .zip sont pris en charge.',
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

        export_wizard: {
            title: 'Exporter',
            description: 'Choisissez un format pour exporter votre diagramme.',
            back: 'Retour',
            sql: {
                target_step: {
                    title: 'Exporter SQL',
                    description:
                        'Choisissez une base de données cible pour votre diagramme {{database}}.',
                    source_label: 'Base source : {{database}}',
                    same_dialect_description: 'Exporter en DDL {{database}}',
                    cross_dialect_description:
                        'Convertir de {{source}} vers {{target}}',
                },
                unsupported_source: {
                    title: "L'export SQL n'est pas disponible pour {{database}}",
                    description:
                        "L'export SQL déterministe n'est pas pris en charge pour ce type de base de données dans FoxalDB.",
                },
                preview_step: {
                    title: 'Aperçu SQL',
                    description: 'Vérifiez le script {{database}} généré.',
                    target_label: 'Cible : {{database}}',
                    generating: 'Génération du SQL {{database}}...',
                    download: 'Télécharger le SQL',
                    error: 'Impossible de générer le SQL. Veuillez réessayer.',
                    empty: "Aucun SQL n'a été généré pour le diagramme actuel.",
                },
            },
            sections: {
                database: 'Base de données',
                framework: 'Framework',
                portable: 'Portable / Schéma',
                visual: 'Visuel',
            },
            targets: {
                sql: {
                    title: 'SQL',
                    description:
                        'Script DDL de la base pour le diagramme actuel',
                    description_generic: 'Script DDL de base de données',
                },
                dbml: {
                    title: 'DBML',
                    description: 'Fichier de schéma DBML portable',
                    coming_soon:
                        'Export de fichier bientôt disponible. Consultez et copiez le DBML dans le panneau latéral.',
                },
                framework: {
                    coming_soon: 'Prévu pour une future étape d’export.',
                },
                diagram_json: {
                    title: 'Diagramme JSON',
                    description: 'Fichier de diagramme FoxalDB portable',
                },
                laravel: {
                    title: 'Migrations Laravel',
                    description: 'Archive ZIP de migrations Laravel',
                },
                prisma: {
                    title: 'Prisma',
                    description: 'Export de schéma Prisma',
                },
                ef_core: {
                    title: 'EF Core',
                    description: 'Export Entity Framework Core',
                },
                rails: {
                    title: 'Rails',
                    description: 'Export de schéma Ruby on Rails',
                },
                django: {
                    title: 'Django',
                    description:
                        'Export d’application Django 6.1 prête à intégrer',
                },
                drizzle: {
                    title: 'Drizzle',
                    description: 'Export de paquet de schéma Drizzle 0.45',
                },
                png: {
                    title: 'PNG',
                    description: 'Image raster',
                },
                jpg: {
                    title: 'JPG',
                    description: 'Image raster',
                },
                svg: {
                    title: 'SVG',
                    description: 'Instantané SVG du diagramme',
                },
            },
            dbml: {
                preview_step: {
                    description: 'Vérifiez le schéma DBML généré.',
                    generating: 'Génération du DBML...',
                    download: 'Télécharger le DBML',
                    error: 'Impossible de générer le DBML. Veuillez réessayer.',
                    empty: "Aucun DBML n'a été généré pour le diagramme actuel.",
                },
            },
            json: {
                download_step: {
                    description: 'Exportez une copie portable de ce diagramme.',
                    explanation:
                        'Le diagramme complet est exporté. Importer ce fichier crée un nouveau diagramme ; il n’écrase pas le diagramme actuel.',
                    filename_label: 'Nom du fichier : {{filename}}',
                    download: 'Télécharger le JSON',
                },
            },
            visual: {
                options_step: {
                    description:
                        'Choisissez comment exporter cette image {{format}}.',
                    explanation:
                        'Exportez une image du diagramme actuellement affiché.',
                    filename_label: 'Nom du fichier : {{filename}}',
                    extent_label: 'Zone d’export',
                    extent_diagram: 'Diagramme complet',
                    extent_diagram_description:
                        'Inclure tout le diagramme actuellement affiché, y compris les tables hors de la vue actuelle.',
                    extent_viewport: 'Vue actuelle',
                    extent_viewport_description:
                        'Exporter uniquement ce qui est actuellement visible sur le canevas.',
                    scale_label: 'Échelle',
                    scale_1x: '1x',
                    scale_2x: '2x',
                    scale_4x: '4x',
                    pattern: 'Inclure le motif d’arrière-plan',
                    pattern_description:
                        'Ajouter un léger motif de grille à l’arrière-plan.',
                    transparent: 'Arrière-plan transparent',
                    transparent_description:
                        'Exporter le PNG sans couleur d’arrière-plan unie.',
                    svg_limitation:
                        'Ce SVG est un instantané du diagramme destiné au navigateur. Ce n’est pas un fichier vectoriel pleinement éditable.',
                    export: 'Exporter',
                    generating: 'Génération de l’image...',
                    error: 'Impossible d’exporter l’image. Veuillez réessayer.',
                    error_canvas:
                        'Impossible de trouver le canevas du diagramme à exporter.',
                    error_too_large:
                        'Ce diagramme est trop grand pour être exporté en {{scale}}. Réduisez l’échelle ou exportez la vue actuelle.',
                    error_empty: 'Il n’y a rien à exporter sur le canevas.',
                },
            },
            prisma: {
                unsupported_database:
                    "L'export Prisma n'est pas disponible pour le type de base de données actuel.",
                version_step: {
                    title: 'Version Prisma',
                    description:
                        'Choisissez la version majeure de Prisma pour votre export schema.prisma.',
                    prisma_7: 'Prisma 7',
                    prisma_7_recommended: 'Recommandé',
                    prisma_6: 'Prisma 6',
                    continue: 'Continuer',
                },
                preview_step: {
                    description: 'Vérifiez le schéma Prisma généré.',
                    generating: 'Génération du schéma Prisma...',
                    download: 'Télécharger schema.prisma',
                    generation_error:
                        'Impossible de générer le schéma Prisma. Veuillez réessayer.',
                    empty: "Aucun schéma Prisma n'a été généré pour le diagramme actuel.",
                    limitations: 'Limitations',
                    errors: {
                        unsupported_database:
                            "L'export Prisma n'est pas pris en charge pour ce type de base de données.",
                        empty_diagram:
                            "Le diagramme n'a pas de tables exportables.",
                        invalid_primary_key:
                            'Une table a une configuration de clé primaire invalide.',
                        unsupported_structural_field:
                            'Une clé primaire ou étrangère utilise un type de champ non pris en charge.',
                        invalid_enum:
                            "Une définition d'énumération n'a pas pu être exportée.",
                    },
                    notes: {
                        view_skipped:
                            'Les vues de base de données ne sont pas exportées vers les schémas Prisma.',
                        schema_namespace_unsupported:
                            'Les schémas/espaces de noms de tables ne sont pas mappés dans cet export.',
                        unsupported_field_omitted:
                            'Certains champs non pris en charge ont été omis.',
                        unsupported_default_omitted:
                            'Certaines valeurs par défaut non prises en charge ont été omises.',
                        unsupported_index_omitted:
                            'Certains index ont été omis.',
                        relation_skipped:
                            "Une relation n'a pas pu être exportée.",
                        relation_degraded:
                            'Une relation a été exportée avec une fidélité réduite.',
                        composite_fk_unsupported:
                            'Les clés étrangères composites ne sont pas prises en charge.',
                        many_to_many_label_only:
                            'Les relations plusieurs-à-plusieurs sans table de jointure sont exportées en libellé uniquement.',
                        set_null_omitted:
                            'ON DELETE SET NULL a été omis lorsque non pris en charge.',
                        enum_skipped:
                            "Une énumération n'a pas pu être exportée.",
                        composite_type_skipped:
                            "Un type composite n'a pas pu être exporté.",
                    },
                    notes_grouped: {
                        schema_namespace_unsupported:
                            'Les schémas/namespaces de table ne sont pas mappés dans cet export. ({{count}} tables)',
                        relation_skipped:
                            "Certaines relations n'ont pas pu être exportées. ({{count}})",
                        relation_degraded:
                            'Certaines relations ont été exportées avec une fidélité réduite. ({{count}})',
                        composite_fk_unsupported:
                            'Les clés étrangères composites ne sont pas prises en charge. ({{count}})',
                        many_to_many_label_only:
                            'Les relations plusieurs-à-plusieurs sans table de jointure sont exportées en libellé uniquement. ({{count}})',
                        set_null_omitted:
                            'ON DELETE SET NULL a été omis lorsque non pris en charge. ({{count}})',
                        view_skipped:
                            'Les vues de base de données ne sont pas exportées vers les schémas Prisma. ({{count}})',
                        unsupported_field_omitted:
                            'Certains champs non pris en charge ont été omis. ({{count}})',
                        unsupported_default_omitted:
                            'Certaines valeurs par défaut non prises en charge ont été omises. ({{count}})',
                        unsupported_index_omitted:
                            'Certains index ont été omis. ({{count}})',
                        enum_skipped:
                            "Certaines énumérations n'ont pas pu être exportées. ({{count}})",
                        composite_type_skipped:
                            "Certains types composites n'ont pas pu être exportés. ({{count}})",
                        with_count: '{{message}} ({{count}})',
                    },
                },
            },
            ef_core: {
                unsupported_database:
                    "L'export EF Core n'est pas disponible pour le type de base de données actuel.",
                options_step: {
                    description:
                        'Configurez l’export du projet modèle EF Core.',
                    explanation:
                        'Exportez un projet modèle EF Core 10 (.NET 10). Le fournisseur de base de données est déduit du diagramme actuel. Les migrations ne sont pas générées ; vous pourrez les créer localement à partir du projet exporté.',
                    ef_core_10: 'EF Core 10 (.NET 10)',
                    provider_label: 'Fournisseur : {{provider}}',
                    migrations_not_generated:
                        'Cet export n’inclut pas de migrations. Utilisez le projet généré pour créer des migrations localement avec l’interface CLI d’EF Core.',
                    namespace: 'Espace de noms',
                    namespace_placeholder: 'Acme.Catalog',
                    namespace_help:
                        'Espace de noms C# racine du projet généré. Laissez vide pour laisser le serveur en choisir un à partir du nom du diagramme.',
                    db_context: 'DbContext',
                    db_context_placeholder: 'CatalogDbContext',
                    db_context_help:
                        'Nom de la classe DbContext. Laissez vide pour utiliser AppDbContext.',
                    export: 'Exporter',
                    generating: 'Génération du projet EF Core…',
                    error_rate_limited:
                        'Trop de demandes d’export. Veuillez patienter un instant puis réessayer.',
                    error_unexpected:
                        'Impossible d’exporter le projet EF Core. Veuillez réessayer.',
                    error_semantic: 'Le projet EF Core n’a pas pu être généré.',
                    error_unauthenticated:
                        'Vous devez être connecté pour exporter des projets EF Core.',
                },
                result_step: {
                    description: 'Vérifiez le projet EF Core généré.',
                    success: 'Projet EF Core généré.',
                    ef_core_10: 'EF Core 10 (.NET 10)',
                    provider_label: 'Fournisseur : {{provider}}',
                    generated_files: 'Fichiers générés ({{count}})',
                    notes: 'Remarques',
                    download_zip: 'Télécharger le ZIP',
                    error_unsafe_path:
                        'L’export contient un chemin de fichier non sûr et n’a pas été téléchargé.',
                    error_empty_files: 'L’export n’incluait aucun fichier.',
                },
            },
            rails: {
                unsupported_database:
                    'L’export Rails n’est pas disponible pour le type de base de données actuel.',
                result_step: {
                    description: 'Vérifiez le paquet Rails 8.1 généré.',
                    explanation:
                        'Cet export est une base du schéma actuel pour Rails 8.1, et non un historique de migrations reconstitué. Appliquez-le à une application Rails nouvelle ou existante comme indiqué dans le README généré.',
                    rails_8_1: 'Rails 8.1',
                    provider_label: 'Fournisseur : {{provider}}',
                    generating: 'Génération du paquet Rails…',
                    success: 'Paquet Rails 8.1 généré.',
                    generated_files: 'Fichiers générés ({{count}})',
                    notes_heading: 'Remarques',
                    notes: railsExportNoteMessages,
                    download_zip: 'Télécharger le ZIP',
                    retry: 'Réessayer',
                    error_semantic: 'Le paquet Rails n’a pas pu être généré.',
                    error_unauthenticated:
                        'Vous devez être connecté pour exporter des paquets Rails.',
                    error_invalid_request:
                        'Le diagramme n’a pas pu être exporté. Il est peut-être invalide ou trop volumineux.',
                    error_rate_limited:
                        'Trop de demandes d’export. Veuillez patienter un instant puis réessayer.',
                    error_unexpected:
                        'Impossible d’exporter le paquet Rails. Veuillez réessayer.',
                    error_unsafe_path:
                        'L’export contient un chemin de fichier non sûr et n’a pas été téléchargé.',
                    error_empty_files: 'L’export n’incluait aucun fichier.',
                    error_invalid_package:
                        'Le paquet généré est invalide et n’a pas été téléchargé.',
                },
            },
            django: {
                unsupported_database:
                    'L’export Django prend actuellement en charge PostgreSQL, MySQL, MariaDB et SQLite.',
                result_step: {
                    description: 'Vérifiez le paquet Django 6.1 généré.',
                    explanation:
                        'Cet export produit une application Django prête à intégrer à un projet existant (`foxaldb_models`). Le fichier 0001_initial.py est une migration initiale représentant l’état actuel du schéma ; il ne reconstitue pas l’historique des migrations Django. Cet export n’a pas été validé à l’exécution contre Django 6.1.',
                    django_version: 'Django {{version}}',
                    provider_label: 'Fournisseur : {{provider}}',
                    package_type:
                        'Paquet : application Django prête à intégrer (`foxaldb_models`)',
                    generating: 'Génération du paquet Django…',
                    success: 'Paquet Django 6.1 généré.',
                    generated_files: 'Fichiers générés ({{count}})',
                    notes_heading: 'Remarques',
                    warnings_heading: 'Avertissements ({{count}})',
                    adaptations_heading: 'Adaptations techniques ({{count}})',
                    path_label: 'Chemin : {{path}}',
                    notes: djangoExportNoteMessages,
                    download_zip: 'Télécharger le ZIP',
                    retry: 'Réessayer',
                    error_semantic: 'Le paquet Django n’a pas pu être généré.',
                    error_unauthenticated:
                        'Vous devez être connecté pour exporter des paquets Django.',
                    error_invalid_request:
                        'Le diagramme n’a pas pu être exporté. Il est peut-être invalide ou trop volumineux.',
                    error_rate_limited:
                        'Trop de demandes d’export. Veuillez patienter un instant puis réessayer.',
                    error_unexpected:
                        'L’export Django a échoué sur le serveur. Veuillez réessayer.',
                    error_network:
                        'Impossible de joindre le serveur. Vérifiez votre connexion puis réessayez.',
                    error_unsafe_path:
                        'L’export contient un chemin de fichier non sûr et n’a pas été téléchargé.',
                    error_empty_files: 'L’export n’incluait aucun fichier.',
                    error_invalid_package:
                        'Le paquet généré est invalide et n’a pas été téléchargé.',
                    errors: {
                        unsupported_database:
                            'L’export Django n’est pas disponible pour ce type de base de données.',
                        empty_diagram:
                            'Le diagramme n’a aucune table exportable.',
                        unsupported_structural_field:
                            'Un champ de clé primaire sur « {{path}} » ne peut pas être représenté dans Django.',
                        mysql_catalog_collision:
                            'Les catalogues MySQL entrent en collision après suppression du catalogue pour « {{path}} ».',
                        mariadb_catalog_collision:
                            'Les catalogues MariaDB entrent en collision après suppression du catalogue pour « {{path}} ».',
                    },
                },
            },
            drizzle: {
                unsupported_database:
                    'L’export Drizzle prend actuellement en charge PostgreSQL, MySQL, MariaDB et SQLite.',
                result_step: {
                    description: 'Vérifiez le paquet Drizzle 0.45 généré.',
                    explanation:
                        'Cet export est un paquet de schéma Drizzle. schema.ts est la source de vérité. drizzle.config.ts est sans identifiants (dialecte, chemin du schéma et répertoire de sortie uniquement). L’historique des migrations SQL n’est pas reconstitué. La validation drizzle-kit à l’exécution n’a pas été effectuée.',
                    drizzle_version:
                        'drizzle-orm {{orm}} / drizzle-kit {{kit}}',
                    provider_label: 'Fournisseur : {{provider}}',
                    package_type:
                        'Paquet : schéma Drizzle (schema.ts + drizzle.config.ts)',
                    generating: 'Génération du paquet Drizzle…',
                    success: 'Paquet Drizzle généré.',
                    generated_files: 'Fichiers générés ({{count}})',
                    notes_heading: 'Remarques',
                    warnings_heading: 'Avertissements ({{count}})',
                    adaptations_heading: 'Adaptations techniques ({{count}})',
                    path_label: 'Chemin : {{path}}',
                    unknown_note:
                        'Une note d’export supplémentaire a été renvoyée et n’a pas pu être localisée.',
                    notes: drizzleExportNoteMessages,
                    download_zip: 'Télécharger le ZIP',
                    retry: 'Réessayer',
                    error_semantic: 'Le paquet Drizzle n’a pas pu être généré.',
                    error_unauthenticated:
                        'Vous devez être connecté pour exporter des paquets Drizzle.',
                    error_invalid_request:
                        'Le diagramme n’a pas pu être exporté. Il est peut-être invalide ou trop volumineux.',
                    error_rate_limited:
                        'Trop de demandes d’export. Veuillez patienter un instant puis réessayer.',
                    error_unexpected:
                        'L’export Drizzle a échoué sur le serveur. Veuillez réessayer.',
                    error_network:
                        'Impossible de joindre le serveur. Vérifiez votre connexion puis réessayez.',
                    error_unsafe_path:
                        'L’export contient un chemin de fichier non sûr et n’a pas été téléchargé.',
                    error_empty_files: 'L’export n’incluait aucun fichier.',
                    error_invalid_package:
                        'Le paquet généré est invalide et n’a pas été téléchargé.',
                    errors: {
                        unsupported_database:
                            'L’export Drizzle n’est pas disponible pour ce type de base de données.',
                        empty_diagram:
                            'Le diagramme n’a aucune table exportable.',
                        unsupported_structural_field:
                            'Un champ de clé primaire ou structurel sur « {{path}} » ne peut pas être représenté dans Drizzle.',
                        mysql_catalog_collision:
                            'Plusieurs catalogues MySQL contiennent la même table physique « {{path}} » et ne peuvent pas être aplatis de façon sûre en un seul schéma Drizzle MySQL.',
                        mariadb_catalog_collision:
                            'Plusieurs catalogues MariaDB contiennent la même table physique « {{path}} » et ne peuvent pas être aplatis de façon sûre en un seul schéma Drizzle MariaDB.',
                    },
                },
            },
            laravel: {
                options_step: {
                    description:
                        'Choisissez comment exporter les migrations Laravel.',
                    explanation:
                        'Générez une archive ZIP de fichiers de migration Laravel à partir du diagramme actuel.',
                    filename_label: 'Nom du fichier : {{filename}}',
                    laravel_version: 'Version de Laravel',
                    include_indexes: 'Inclure les index de table',
                    include_indexes_description:
                        'Exporter les définitions d’index explicites. Les contraintes d’unicité au niveau des champs sont toujours incluses.',
                    include_foreign_keys: 'Inclure les clés étrangères',
                    include_foreign_keys_description:
                        'Exporter des fichiers de migration distincts pour les clés étrangères.',
                    export: 'Exporter',
                    generating: 'Génération des migrations Laravel...',
                    error: 'Impossible d’exporter les migrations Laravel. Veuillez réessayer.',
                    error_unauthenticated:
                        'Vous devez être connecté pour exporter les migrations Laravel.',
                    error_forbidden:
                        'Vous n’avez pas l’autorisation d’exporter ce diagramme.',
                    error_not_found: 'Ce diagramme est introuvable.',
                    error_empty: 'Ce diagramme n’a aucune table exportable.',
                    error_invalid:
                        'Le diagramme n’a pas pu être exporté. Vérifiez le schéma et réessayez.',
                    error_network:
                        'Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.',
                },
            },
        },

        export_dialog: {
            title: 'Exporter',
            description: 'Choisissez un format pour exporter votre diagramme.',
            schema_code_section: 'Schéma / Code',
            visual_section: 'Visuel',
            sql: {
                title: 'SQL',
                description: 'Script DDL de la base pour le diagramme actuel',
                description_generic: 'Script DDL de base de données',
            },
            dbml: {
                title: 'DBML',
                coming_soon:
                    'Export de fichier bientôt disponible. Consultez et copiez le DBML dans le panneau latéral.',
            },
            diagram_json: {
                title: 'Diagramme JSON',
                description: 'Fichier de diagramme FoxalDB portable',
            },
            laravel_migrations: {
                title: 'Migrations Laravel',
                description: 'Archive ZIP de migrations Laravel',
            },
            png: {
                title: 'PNG',
                description: 'Image raster',
            },
            jpg: {
                title: 'JPG',
                description: 'Image raster',
            },
            svg: {
                title: 'SVG',
                description: 'Image vectorielle',
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
                description: "Une erreur s'est produite. Veuillez réessayer.",
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
