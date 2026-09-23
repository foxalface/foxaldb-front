import type { LanguageMetadata } from '../types';
import { railsExportNoteMessages } from '../rails-export-notes/en';
import { djangoExportNoteMessages } from '../django-export-notes/en';
import { drizzleExportNoteMessages } from '../drizzle-export-notes/en';

export const en = {
    translation: {
        editor_sidebar: {
            new_diagram: 'New',
            browse: 'Open',
            tables: 'Tables',
            refs: 'Refs',
            dependencies: 'Dependencies',
            custom_types: 'Custom Types',
            conversations: 'Conversations',
            conversations_unread_aria:
                '{{count}} unread messages in conversations',
            visuals: 'Visuals',
            activities: 'Activity',
            share: 'Share',
        },
        menu: {
            actions: {
                actions: 'Actions',
                new: 'New...',
                browse: 'All Databases...',
                save: 'Save',
                import: 'Import',
                export: 'Export...',
                export_laravel_migrations: 'Laravel migrations',
                import_laravel_migrations: 'Import Laravel migrations',
                compare_laravel_migrations: 'Sync from Laravel migrations',
                export_sql: 'Export SQL',
                export_as: 'Export as',
                delete_diagram: 'Delete',
            },
            edit: {
                edit: 'Edit',
                undo: 'Undo',
                redo: 'Redo',
                clear: 'Clear',
            },
            view: {
                view: 'View',
                show_sidebar: 'Show Sidebar',
                hide_sidebar: 'Hide Sidebar',
                hide_cardinality: 'Hide Cardinality',
                show_cardinality: 'Show Cardinality',
                hide_field_attributes: 'Hide Field Attributes',
                show_field_attributes: 'Show Field Attributes',
                zoom_on_scroll: 'Zoom on Scroll',
                show_views: 'Database Views',
                theme: 'Theme',
                show_dependencies: 'Show Dependencies',
                hide_dependencies: 'Hide Dependencies',
                show_minimap: 'Show Mini Map',
                hide_minimap: 'Hide Mini Map',
            },
            backup: {
                backup: 'Backup',
                export_diagram: 'Export Diagram',
                restore_diagram: 'Restore Diagram',
            },
            help: {
                help: 'Help',
                docs_website: 'Docs',
                join_discord: 'Join us on Discord',
            },
        },

        delete_diagram_alert: {
            title: 'Delete Diagram',
            description:
                'This action cannot be undone. This will permanently delete the diagram.',
            cancel: 'Cancel',
            delete: 'Delete',
        },

        clear_diagram_alert: {
            title: 'Clear Diagram',
            description:
                'This action cannot be undone. This will permanently delete all the data in the diagram.',
            cancel: 'Cancel',
            clear: 'Clear',
        },

        diagram_access: {
            removed: {
                title: 'Access removed',
                description: 'You no longer have access to this diagram.',
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
            title: 'Auto Arrange Diagram',
            description:
                'This action will rearrange all tables in the diagram. Do you want to continue?',
            reorder: 'Auto Arrange',
            cancel: 'Cancel',
        },

        copy_to_clipboard_toast: {
            unsupported: {
                title: 'Copy failed',
                description: 'Clipboard not supported.',
            },
            failed: {
                title: 'Copy failed',
                description: 'Something went wrong. Please try again.',
            },
        },

        theme: {
            system: 'System',
            light: 'Light',
            dark: 'Dark',
        },

        zoom: {
            on: 'On',
            off: 'Off',
        },

        last_saved: 'Last saved',
        saved: 'Saved',
        loading_diagram: 'Loading diagram...',
        deselect_all: 'Deselect All',
        select_all: 'Select All',
        delete: 'Delete',
        clear: 'Clear',
        show_more: 'Show More',
        show_less: 'Show Less',
        copy_to_clipboard: 'Copy to Clipboard',
        copied: 'Copied!',

        side_panel: {
            view_all_options: 'View all Options...',
            tables_section: {
                tables: 'Tables',
                add_table: 'Add Table',
                add_view: 'Add View',
                filter: 'Filter',
                collapse: 'Collapse All',
                clear: 'Clear Filter',
                no_results: 'No tables found matching your filter.',
                show_list: 'Show Table List',
                show_dbml: 'Show DBML Editor',
                all_hidden: 'All tables are hidden',
                show_all: 'Show all',

                table: {
                    fields: 'Fields',
                    nullable: 'Nullable?',
                    primary_key: 'Primary Key',
                    indexes: 'Indexes',
                    check_constraints: 'Check Constraints',
                    comments: 'Comments',
                    no_comments: 'No comments',
                    add_field: 'Add Field',
                    add_index: 'Add Index',
                    add_check: 'Add Check',
                    index_select_fields: 'Select fields',
                    no_types_found: 'No types found',
                    field_name: 'Name',
                    field_type: 'Type',
                    field_actions: {
                        title: 'Field Attributes',
                        open_discussion: 'Open conversation',
                        unique: 'Unique',
                        auto_increment: 'Auto Increment',
                        character_length: 'Max Length',
                        precision: 'Precision',
                        scale: 'Scale',
                        comments: 'Comments',
                        no_comments: 'No comments',
                        default_value: 'Default Value',
                        no_default: 'No default',
                        delete_field: 'Delete Field',
                    },
                    index_actions: {
                        title: 'Index Attributes',
                        name: 'Name',
                        unique: 'Unique',
                        index_type: 'Index Type',
                        delete_index: 'Delete Index',
                    },
                    check_constraint_actions: {
                        title: 'Check Constraint',
                        expression: 'Expression',
                        delete: 'Delete Check Constraint',
                    },
                    table_actions: {
                        title: 'Table Actions',
                        open_discussion: 'Open conversation',
                        change_schema: 'Change Schema',
                        add_field: 'Add Field',
                        add_index: 'Add Index',
                        duplicate_table: 'Duplicate Table',
                        delete_table: 'Delete Table',
                    },
                },
                empty_state: {
                    title: 'No tables',
                    description: 'Create a table to get started',
                },
            },
            refs_section: {
                refs: 'Refs',
                filter: 'Filter',
                clear: 'Clear Filter',
                no_results: 'No refs found matching your filter.',
                collapse: 'Collapse All',
                add_relationship: 'Add Relationship',
                relationships: 'Relationships',
                dependencies: 'Dependencies',
                relationship: {
                    relationship: 'Relationship',
                    primary: 'Primary Table',
                    foreign: 'Related Table',
                    cardinality: 'Cardinality',
                    on_delete: 'On delete',
                    on_update: 'On update',
                    delete_relationship: 'Delete',
                    switch_tables: 'Switch Tables',
                    referential_action: {
                        none: 'No action',
                        cascade: 'Cascade',
                        set_null: 'Set null',
                        restrict: 'Restrict',
                    },
                    relationship_actions: {
                        title: 'Actions',
                        open_discussion: 'Open conversation',
                        delete_relationship: 'Delete',
                    },
                },
                dependency: {
                    dependency: 'Dependency',
                    table: 'Table',
                    dependent_table: 'Dependent View',
                    delete_dependency: 'Delete',
                    dependency_actions: {
                        title: 'Actions',
                        delete_dependency: 'Delete',
                    },
                },
                empty_state: {
                    title: 'No relationships',
                    description: 'Create a relationship to get started',
                },
            },

            areas_section: {
                areas: 'Areas',
                add_area: 'Add Area',
                filter: 'Filter',
                clear: 'Clear Filter',
                no_results: 'No areas found matching your filter.',

                area: {
                    area_actions: {
                        title: 'Area Actions',
                        edit_name: 'Edit Name',
                        delete_area: 'Delete Area',
                    },
                },
                empty_state: {
                    title: 'No areas',
                    description: 'Create an area to get started',
                },
            },

            visuals_section: {
                visuals: 'Visuals',
                tabs: {
                    areas: 'Areas',
                    notes: 'Notes',
                },
            },

            notes_section: {
                filter: 'Filter',
                add_note: 'Add Note',
                no_results: 'No notes found',
                clear: 'Clear Filter',
                empty_state: {
                    title: 'No Notes',
                    description:
                        'Create a note to add text annotations on the canvas',
                },
                note: {
                    empty_note: 'Empty note',
                    note_actions: {
                        title: 'Note Actions',
                        edit_content: 'Edit Content',
                        delete_note: 'Delete Note',
                    },
                },
            },

            custom_types_section: {
                custom_types: 'Custom Types',
                filter: 'Filter',
                clear: 'Clear Filter',
                no_results: 'No custom types found matching your filter.',
                new_type: 'New Type',
                empty_state: {
                    title: 'No custom types',
                    description:
                        'Custom types will appear here when they are available in your database',
                },
                custom_type: {
                    kind: 'Kind',
                    enum_values: 'Enum Values',
                    composite_fields: 'Fields',
                    no_fields: 'No fields defined',
                    no_values: 'No enum values defined',
                    field_name_placeholder: 'Field name',
                    field_type_placeholder: 'Select type',
                    add_field: 'Add Field',
                    no_fields_tooltip: 'No fields defined for this custom type',
                    custom_type_actions: {
                        title: 'Actions',
                        highlight_fields: 'Highlight Fields',
                        clear_field_highlight: 'Clear Highlight',
                        delete_custom_type: 'Delete',
                    },
                    delete_custom_type: 'Delete Type',
                },
            },
            conversations_section: {
                title: 'Conversations',
                tabs_label: 'Conversation lists',
                tabs: {
                    active: 'Active',
                    archives: 'Archived',
                },
                loading: 'Loading conversations…',
                filter: 'Filter',
                clear: 'Clear Filter',
                no_results_title: 'No results',
                no_results_description:
                    'No conversations found matching your filter.',
                type_filter: {
                    trigger: 'Type',
                    label: 'Filter by type',
                    trigger_aria: 'Filter by conversation type',
                },
                loading_more: 'Loading more…',
                load_more: 'Load more',
                retry: 'Retry',
                dismiss: 'Dismiss',
                read_only: 'Read-only',
                deleted_user: 'Deleted user',
                unread: {
                    badge_aria: '{{count}} unread messages',
                },
                inactive: {
                    title: 'Conversations unavailable',
                    description:
                        'Conversations are only available on authenticated cloud diagrams.',
                },
                empty: {
                    active_title: 'No conversation',
                    active_description: 'Create a conversation to get started',
                    archives_title: 'No archived conversations',
                    archives_description:
                        'Archived conversations will appear here when you close a thread.',
                },
                errors: {
                    load_title: 'Could not load conversations',
                    load_description:
                        'Something went wrong while loading conversations. Please try again.',
                },
                mutation_errors: {
                    generic:
                        'Could not update the conversation. Please try again.',
                },
                target_entry: {
                    open: 'Open conversation',
                    start: 'Start conversation',
                    pending: 'Starting conversation…',
                    diagram_name: 'Diagram',
                    open_aria: 'Open conversation for {{name}}',
                    start_aria: 'Start conversation for {{name}}',
                    open_tooltip: 'Open conversation for {{name}}',
                    start_tooltip: 'Start conversation for {{name}}',
                    pending_tooltip: 'Starting conversation for {{name}}…',
                    action_tooltip: 'Conversation',
                    unavailable_description:
                        'You cannot start conversations on this diagram.',
                    errors: {
                        validation:
                            'This target is not valid for a conversation.',
                        forbidden:
                            'You do not have permission to start this conversation.',
                        not_found:
                            'This target is no longer available on the diagram.',
                        conflict:
                            'This conversation could not be started right now. Please try again.',
                        generic:
                            'Could not open this conversation. Please try again.',
                    },
                },
                actions: {
                    archive: 'Archive',
                    archiving: 'Archiving…',
                    reopen: 'Reopen',
                    reopening: 'Reopening…',
                    archive_aria: 'Archive conversation for {{target}}',
                    reopen_aria: 'Reopen conversation for {{target}}',
                },
                summary: {
                    message_count: '{{count}} messages',
                    no_messages: 'No messages yet',
                    last_activity: 'Last activity',
                    open_aria: 'Open conversation for {{target}}',
                    focus_target_aria: 'Show {{target}} on diagram',
                    author_tooltip: 'Last message by {{name}}',
                    author_missing_tooltip: 'No author information',
                    actions: {
                        menu_aria: 'Conversation options',
                        open: 'Open',
                        delete: 'Delete',
                    },
                    delete_dialog: {
                        title: 'Delete conversation?',
                        description:
                            'This will permanently delete this conversation and all of its messages.',
                        cancel: 'Cancel',
                        confirm: 'Delete',
                        deleting: 'Deleting…',
                        errors: {
                            delete_failed:
                                'Could not delete this conversation. Please try again.',
                            forbidden:
                                'You do not have permission to delete this conversation.',
                            not_found:
                                'This conversation is no longer available.',
                        },
                    },
                },
                detail: {
                    back: 'Back',
                    back_aria: 'Back to conversation list',
                    loading: 'Loading messages…',
                    loading_more: 'Loading older messages…',
                    load_older: 'Load older messages',
                    new_messages_badge_one: '1 new message',
                    new_messages_badge_other: '{{count}} new messages',
                    new_messages_badge_label_one: 'new message',
                    new_messages_badge_label_other: 'new messages',
                    new_messages_badge_aria_one: 'Scroll to 1 new message',
                    new_messages_badge_aria_other:
                        'Scroll to {{count}} new messages',
                    empty: {
                        title: 'No messages',
                        description:
                            'This conversation does not have any messages.',
                    },
                    errors: {
                        load_title: 'Could not load messages',
                        load_description:
                            'Something went wrong while loading messages. Please try again.',
                    },
                    archive_banner: {
                        title: 'Archived conversation',
                        description:
                            'This conversation is read-only. Messages cannot be added, edited, or deleted.',
                    },
                    metadata: {
                        status_label: 'Status',
                        status_active: 'Active',
                        status_archived: 'Archived',
                        message_count_label: 'Message count',
                        message_count: '{{count}} messages',
                    },
                    message: {
                        edited: '(edited)',
                        edited_aria: 'Message was edited',
                        day_separator: {
                            today: 'Today',
                            yesterday: 'Yesterday',
                        },
                        actions: {
                            title: 'Message actions',
                            edit: 'Edit',
                            delete: 'Delete',
                        },
                        reactions: {
                            add_aria: 'Add reaction',
                            add_tooltip: 'Add reaction',
                            picker_loading: 'Loading emoji picker…',
                            picker_aria_label: 'Emoji picker',
                            picker_search_placeholder: 'Search emoji…',
                            picker_empty: 'No emoji found.',
                            chip_aria: '{{emoji}} reaction, {{count}}',
                            preview_and_others_one: 'and {{count}} other',
                            preview_and_others_other: 'and {{count}} others',
                            errors: {
                                generic:
                                    'Could not update the reaction. Please try again.',
                                forbidden:
                                    'You are not allowed to react to this message.',
                                archived:
                                    'This conversation is archived and reactions are read-only.',
                                not_found:
                                    'This message is no longer available.',
                                invalid_emoji: 'This emoji is not valid.',
                            },
                        },
                    },
                    composer: {
                        label: 'Message',
                        placeholder: 'Write a message…',
                        submit: 'Send',
                        submitting: 'Sending…',
                        form_aria_label: 'New conversation message',
                        keyboard_hint:
                            'Press Enter to send. Shift+Enter adds a new line.',
                        counter_aria_label:
                            '{{count}} of {{max}} characters used',
                        errors: {
                            empty: 'Enter a message to send.',
                            too_long: 'Messages cannot exceed 2000 characters.',
                            create_failed:
                                'Could not send the message. Please try again.',
                        },
                    },
                    edit: {
                        label: 'Message',
                        form_aria_label: 'Edit conversation message',
                        save: 'Save',
                        saving: 'Saving…',
                        cancel: 'Cancel',
                        counter_aria_label:
                            '{{count}} of {{max}} characters used',
                        errors: {
                            empty: 'Enter a message to save.',
                            too_long: 'Messages cannot exceed 2000 characters.',
                            update_failed:
                                'Could not update the message. Please try again.',
                        },
                    },
                    delete_dialog: {
                        title: 'Delete message',
                        description:
                            'Are you sure you want to delete this message? This action cannot be undone.',
                        cancel: 'Cancel',
                        confirm: 'Delete',
                        deleting: 'Deleting…',
                        errors: {
                            delete_failed:
                                'Unable to delete this message. Please try again.',
                        },
                    },
                    mutation_errors: {
                        forbidden:
                            'You do not have permission to change this message.',
                        archived:
                            'This conversation is archived and read-only.',
                        not_found:
                            'This conversation or message is no longer available.',
                    },
                },
                targets: {
                    diagram: 'Diagram',
                    table: 'Table',
                    field: 'Field',
                    relationship: 'Relationship',
                    unknown: 'Conversation',
                },
                target_labels: {
                    diagram: 'Diagram',
                    field: '{{table}}.{{field}}',
                    relationship_endpoints: '{{source}} → {{target}}',
                    missing_table: 'Deleted table',
                    missing_field: 'Deleted field',
                    missing_relationship: 'Deleted relationship',
                    unknown: 'Conversation',
                },
            },
            activities_section: {
                title: 'Activity',
                filter: 'Filter',
                clear: 'Clear Filter',
                no_results: 'No activity found matching your filter.',
                loading: 'Loading activity…',
                retry: 'Retry',
                type_filter: {
                    trigger: 'Type',
                    label: 'Filter by type',
                    trigger_aria: 'Filter by activity type',
                },
                types: {
                    diagram: 'Diagram',
                    table: 'Table',
                    field: 'Field',
                    relationship: 'Relationship',
                    note: 'Note',
                    area: 'Area',
                    dependency: 'Dependency',
                },
                you: 'You',
                unknown_user: 'Someone',
                empty_state: {
                    title: 'No activity yet',
                    description: 'Start editing to see recent changes.',
                },
                errors: {
                    load_failed: 'Could not load activity.',
                },
                actions: {
                    add_tables: '{{user}} added table {{table}}',
                    remove_tables: '{{user}} removed a table',
                    add_field: '{{user}} added field {{field}}',
                    remove_field: '{{user}} removed a field',
                    update_field: '{{user}} updated field {{field}}',
                    add_relationships: '{{user}} added a relationship',
                    remove_relationships: '{{user}} removed a relationship',
                    update_relationship: '{{user}} updated a relationship',
                    add_notes: '{{user}} added a note',
                    remove_notes: '{{user}} removed a note',
                    add_areas: '{{user}} added an area',
                    remove_areas: '{{user}} removed an area',
                    add_dependencies: '{{user}} added a dependency',
                    remove_dependencies: '{{user}} removed a dependency',
                    fallback: '{{user}} updated the diagram',
                },
            },
            share_section: {
                title: 'Share',
                tabs_label: 'Share options',
                tabs: {
                    collaborators: 'Collaborators',
                    public_link: 'Public link',
                },
                collaborators: {
                    description:
                        'Invite collaborators with editor or viewer access. They must already have a FoxalDB account.',
                    filter: 'Filter',
                    clear: 'Clear filter',
                    no_results_title: 'No results',
                    no_results_description:
                        'No collaborators found matching your filter.',
                    role_filter: {
                        trigger: 'Role',
                        label: 'Filter by role',
                        trigger_aria: 'Filter by collaborator role',
                    },
                },
                public_link: {
                    title: 'Public link',
                    description:
                        'Share a read-only snapshot of your diagram with anyone who has the link.',
                    coming_soon: 'Coming soon.',
                },
                loading: 'Loading collaborators…',
                retry: 'Retry',
                errors: {
                    load_failed: 'Could not load collaborators.',
                },
                member_actions: {
                    title: 'Collaborator actions',
                    trigger_aria: 'Collaborator actions',
                    role: 'Role',
                    remove: 'Remove collaborator',
                },
            },
        },

        toolbar: {
            zoom_in: 'Zoom In',
            zoom_out: 'Zoom Out',
            save: 'Save',
            show_all: 'Show All',
            undo: 'Undo',
            redo: 'Redo',
            reorder_diagram: 'Auto Arrange Diagram',
            highlight_overlapping_tables: 'Highlight Overlapping Tables',
            clear_custom_type_highlight: 'Clear highlight for "{{typeName}}"',
            custom_type_highlight_tooltip:
                'Highlighting "{{typeName}}" - Click to clear',
            filter: 'Filter Tables',
        },

        new_diagram_dialog: {
            database_selection: {
                title: 'Choose your DBMS',
                description: 'Select the database system for your new diagram.',
                search_placeholder: 'Search database systems...',
                search_no_results: 'No database systems match your search.',
                clear_search: 'Clear search',
                primary_group: 'Primary databases',
                other_group: 'Other databases',
            },

            choose_intent: {
                title: 'What would you like to do?',
                description: 'Create a new diagram for {{database}}.',
                create_empty: 'Create an empty diagram',
                create_empty_description:
                    'Start from scratch with tables you add yourself.',
                import: 'Import',
                import_description:
                    'From a file, pasted text, or your database.',
                back: 'Back',
            },

            choose_import_method: {
                title: 'How do you want to import?',
                description: 'Choose a source for your {{database}} diagram.',
                from_file: 'File or pasted text',
                from_file_description:
                    'SQL, DBML, JSON, or project archive (.zip).',
                from_database: 'Existing database',
                from_database_description:
                    'Run a query in your database and paste the result.',
                back: 'Back',
            },

            import_from_database: {
                title: 'Import from an existing database',
                description:
                    "Use this when you don't have a SQL or DBML schema file. Run the query in your database, then paste the result below.",
                database_edition: 'Database edition',
                edition_regular: 'Regular',
                run_query: 'Run this query in your database',
                client_sql: 'SQL',
                paste_result: 'Paste the result',
                paste_result_placeholder: 'Paste the query result here…',
                check_result: 'Check result',
                valid_result: 'Result looks valid.',
                invalid_result:
                    'The result could not be validated. Check the content and try again.',
                truncated_result:
                    'The result may be truncated. Adjust your SQL client settings and run the query again.',
                waiting_for_result: 'Paste the query result to continue.',
                unsupported_database:
                    'Schema extraction is not available for this database type.',
                import_failed:
                    'The database schema could not be imported. Check the result and try again.',
                back: 'Back',
                import: 'Import',
            },

            import_schema: {
                title: 'Paste your schema',
                textarea_label: 'Schema content',
                textarea_placeholder: 'Paste SQL, DBML, or JSON metadata here…',
                auto_detect_hint: "We'll detect the format automatically.",
                or_divider: 'OR',
                choose_file: 'Choose a file',
                choose_file_or_project: 'Choose a file or project',
                supported_formats_hint:
                    'Supported: SQL, DBML, JSON, project archive (.zip)',
                privacy_info: {
                    link_label: 'More information…',
                    title: 'Privacy and supported formats',
                    intro: 'Before you choose a file, here is how FoxalDB handles your data during import.',
                    highlights: {
                        no_execution:
                            'Imports use static analysis only — your code is never executed.',
                        no_full_upload:
                            'Full project archives are never uploaded to the server.',
                        filtered_files:
                            'Only schema-relevant files are kept; .env, vendor/, node_modules/, and tests/ are excluded.',
                    },
                    simple_formats_title: 'SQL, DBML, and JSON',
                    simple_formats_description:
                        'Processed entirely in your browser. Maximum file size: {{sizeMb}} MB.',
                    project_archives_title: 'Project archives (.zip)',
                    project_archives_description:
                        'The archive is opened locally and only schema-relevant files are extracted. Maximum archive size: {{sizeMb}} MB.',
                    excluded_paths:
                        'Never included: .env, vendor/, node_modules/, tests/, and other unrelated source files.',
                    table: {
                        framework: 'Framework',
                        files: 'Files analyzed',
                        processing: 'Processing',
                        processing_local: 'Browser only',
                        processing_remote: 'Server (sign-in required)',
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
                    back: 'Back',
                },
                change_file_aria: 'Change file, currently {{name}}',
                selected_file: 'Selected file: {{name}}',
                back: 'Back',
                import: 'Import',
                mismatch: {
                    title: 'This schema looks like {{detected}}, but you selected {{selected}}.',
                    description:
                        'Switch to the detected database type or go back to choose a different one.',
                    switch: 'Switch to {{database}}',
                    go_back: 'Go back',
                },
                ambiguous: {
                    title: 'Choose the source DBMS',
                    multiple_dbms_title: 'Multiple DBMS detected',
                    confidence_explanation:
                        'Percentages indicate the dialect match score for each DBMS.',
                    selection_help_percentages:
                        'Percentages indicate the SQL dialect match score for each DBMS.',
                    selection_help_recommended:
                        'The star marks the recommended DBMS.',
                    selection_help_aria:
                        'Help about percentages and recommendation',
                    description:
                        'We could not identify the SQL dialect automatically. Confirm which DBMS this schema came from.',
                    choose_source: 'Choose source DBMS',
                    confidence_badge: '{{percent}}%',
                    candidate_with_confidence:
                        '{{database}} ({{percent}}% confidence)',
                    candidate_recommended:
                        '{{database}} ({{percent}}% confidence, automatically detected)',
                    recommended_tooltip: 'Recommended DBMS',
                    recommended_aria: '{{database}}, recommended DBMS',
                    candidate: '{{database}}',
                },
                diagram_json: {
                    detection: {
                        success: 'Ready to import this diagram.',
                        mismatch_title: 'DBMS mismatch',
                        mismatch_description:
                            'The file indicates {{detected}}, but you selected {{selected}}.',
                        unsupported_existing:
                            'Diagram JSON restores a full diagram and cannot be merged into the current one. Export or create a new diagram instead.',
                    },
                    ambiguous: {
                        title: 'Choose the diagram DBMS',
                        description:
                            'Select which option to apply for this import.',
                        selection_help_percentages:
                            'Percentages indicate the match score for each DBMS.',
                        selection_help_recommended:
                            'The star marks the DBMS from the diagram file.',
                        selection_help_aria:
                            'Help about percentages and recommendation',
                        choose_source: 'Choose diagram DBMS',
                        candidate: '{{database}}',
                        candidate_with_confidence:
                            '{{database}} ({{percent}}%)',
                        candidate_recommended:
                            '{{database}} (from file, recommended)',
                        confidence_badge: '{{percent}}%',
                        recommended_tooltip: 'DBMS from the diagram file',
                        recommended_aria:
                            '{{database}}, DBMS from the diagram file',
                    },
                },
                detection: {
                    dialect: '{{database}} detected',
                    dbml: 'DBML detected',
                    metadata_json: 'Metadata JSON detected',
                    diagram_json: 'Diagram JSON detected',
                    sql_ambiguous_title: 'SQL detected',
                    sql_ambiguous_description:
                        'The DBMS could not be identified automatically.',
                    unsupported: 'Unsupported format',
                    clickhouse_unsupported: 'ClickHouse SQL detected',
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
                    analyzing_project: 'Analyzing project archive…',
                    detected: '{{framework}} project detected',
                    migrations_found_one: '{{count}} migration found',
                    migrations_found_other: '{{count}} migrations found',
                    schema_files_found_one: '{{count}} schema file found',
                    schema_files_found_other: '{{count}} schema files found',
                    model_snapshots_found_one: '{{count}} model snapshot found',
                    model_snapshots_found_other:
                        '{{count}} model snapshots found',
                    sql_migrations_found_one: '{{count}} SQL migration found',
                    sql_migrations_found_other:
                        '{{count}} SQL migrations found',
                    migrations_button_one: '{{count}} migration',
                    migrations_button_other: '{{count}} migrations',
                    schema_files_button_one: '{{count}} schema file',
                    schema_files_button_other: '{{count}} schema files',
                    model_snapshots_button_one: '{{count}} model snapshot',
                    model_snapshots_button_other: '{{count}} model snapshots',
                    sql_migrations_button_one: '{{count}} migration',
                    sql_migrations_button_other: '{{count}} migrations',
                    multiple_projects_title:
                        'Multiple database schemas detected',
                    multiple_projects_description:
                        'This archive contains more than one supported database project. Choose which one to import.',
                    multiple_database_groups_title:
                        'Several database schemas detected',
                    multiple_database_groups_description:
                        'This project contains multiple database schemas. Choose which one to import.',
                    choose_database_group: 'Choose database schema',
                    group_recommended_aria: '{{label}} recommended',
                    group_recommended_tooltip: 'Recommended schema',
                    choose_project: 'Choose project',
                    unsupported_project: 'Unsupported project archive',
                    unsupported_project_description:
                        'We could not find a supported Laravel, Prisma, Drizzle, Rails, Entity Framework Core, or Django database project in this archive.',
                    project_root: 'Project root: {{path}}',
                    sign_in_to_import_framework:
                        'Sign in to import {{framework}} projects when import becomes available.',
                    remote_processing_notice:
                        'When import is available, only schema-relevant files from this project will be processed.',
                    remote_processing_scope:
                        'The full archive and unrelated source files are never uploaded.',
                    remote_processing_security:
                        'Analysis is static and does not execute uploaded code.',
                },
                errors: {
                    unreadable_file: 'Could not read the selected file.',
                    malformed_json: 'The JSON content could not be parsed.',
                    unsupported:
                        'This format is not supported for schema import.',
                    diagram_json:
                        'Diagram JSON can be imported from the diagram file option instead.',
                    clickhouse_unsupported:
                        'SQL DDL import is not supported for ClickHouse. Use DBML or import from an existing database instead.',
                    file_too_large: 'The selected file is larger than 5 MB.',
                    archive_too_large:
                        'The selected project archive is larger than 50 MB.',
                    archive_invalid:
                        'The selected file is not a valid project archive.',
                    unsupported_file_extension:
                        'Only .sql, .dbml, .json, and .zip project archives are supported.',
                    import_failed:
                        'The schema could not be imported. Check the content and try again.',
                    invalid_diagram_json:
                        'The diagram JSON is invalid. Check the file and try again.',
                },
            },

            import_database: {
                ssms_instructions: {
                    button_text: 'SSMS Instructions',
                    title: 'Instructions',
                    step_1: 'Go to Tools > Options > Query Results > SQL Server.',
                    step_2: 'If you\'re using "Results to Grid," change the Maximum Characters Retrieved for Non-XML data (set to 9999999).',
                },
            },

            cancel: 'Cancel',
            import_from_file: 'Import from File',
            back: 'Back',
            empty_diagram: 'Empty database',
            continue: 'Continue',
            import: 'Import',
        },

        share_diagram_dialog: {
            title: 'Share diagram',
            description:
                'Invite collaborators with editor or viewer access. They must already have a FoxalDB account.',
            share_button: 'Share',
            empty_members: 'No collaborators yet.',
            remove: 'Remove',
            roles: {
                owner: 'Owner',
                editor: 'Editor',
                viewer: 'Viewer',
            },
            add_member: {
                title: 'Add collaborator',
                email_label: 'Email',
                email_placeholder: 'Email address',
                add: 'Add',
                adding: 'Adding...',
                cancel: 'Cancel',
            },
            errors: {
                load_failed: 'Could not load collaborators.',
                add_failed: 'Could not add collaborator.',
            },
        },

        diagram_role: {
            owner: 'Owner',
            editor: 'Editor',
            viewer: 'Viewer',
        },

        editor_role: {
            view_only: 'View only',
        },

        open_diagram_dialog: {
            title: 'Open Database',
            description: 'Select a diagram to open from the list below.',
            table_columns: {
                name: 'Name',
                created_at: 'Created at',
                last_modified: 'Last modified',
                tables_count: 'Tables',
            },
            cancel: 'Cancel',
            open: 'Open',
            new_database: 'New Database',

            diagram_actions: {
                open: 'Open',
                duplicate: 'Duplicate',
                delete: 'Delete',
            },
        },

        export_wizard: {
            title: 'Export',
            description: 'Choose a format to export your diagram.',
            back: 'Back',
            export: 'Export',
            sections: {
                database: 'Database',
                framework: 'Framework',
                portable: 'Schema',
                visual: 'Visual',
            },
            targets: {
                unsupported_framework:
                    "Export {{framework}} incompatible with the diagram's database",
                sql: {
                    title: 'SQL',
                    description: 'Database DDL script for the current diagram',
                    description_generic: 'Database DDL script',
                },
                dbml: {
                    title: 'DBML',
                    description: 'Portable DBML schema file',
                    coming_soon:
                        'File export coming soon. View and copy DBML in the sidebar.',
                },
                framework: {
                    coming_soon: 'Planned for a future Export milestone.',
                },
                diagram_json: {
                    title: 'JSON',
                    description: 'Portable FoxalDB diagram file',
                },
                laravel: {
                    title: 'Laravel',
                    description: 'Laravel migration ZIP archive',
                },
                prisma: {
                    title: 'Prisma',
                    description: 'Prisma schema export',
                },
                ef_core: {
                    title: 'EF Core',
                    description: 'Entity Framework Core export',
                },
                rails: {
                    title: 'Rails',
                    description: 'Ruby on Rails schema export',
                },
                django: {
                    title: 'Django',
                    description: 'Django 6.1 drop-in app export',
                },
                drizzle: {
                    title: 'Drizzle',
                    description: 'Drizzle 0.45 schema package export',
                },
                png: {
                    title: 'PNG',
                    description: 'Raster image',
                },
                jpg: {
                    title: 'JPG',
                    description: 'Raster image',
                },
                svg: {
                    title: 'SVG',
                    description: 'SVG snapshot of the diagram',
                },
            },
            sql: {
                target_step: {
                    title: 'Export SQL',
                    description:
                        'Choose an export target for your {{database}} diagram.',
                    source_label: 'Source database: {{database}}',
                    same_dialect_description: 'Export as {{database}} DDL',
                    cross_dialect_description:
                        'Convert from {{source}} to {{target}}',
                },
                unsupported_source: {
                    title: 'SQL export is not available for {{database}}',
                    description:
                        'Deterministic SQL export is not supported for this database type in FoxalDB.',
                },
                preview_step: {
                    title: 'SQL preview',
                    description: 'Review the generated {{database}} script.',
                    target_label: 'Target: {{database}}',
                    generating: 'Generating {{database}} SQL...',
                    download: 'Download SQL',
                    error: 'Could not generate SQL. Please try again.',
                    empty: 'No SQL was generated for the current diagram.',
                },
            },
            dbml: {
                preview_step: {
                    description: 'Review the generated DBML schema.',
                    generating: 'Generating DBML...',
                    download: 'Download DBML',
                    error: 'Could not generate DBML. Please try again.',
                    empty: 'No DBML was generated for the current diagram.',
                },
            },
            json: {
                download_step: {
                    description: 'Export a portable copy of this diagram.',
                    explanation:
                        'The full diagram is exported. Importing this file creates a new diagram; it does not overwrite the current one.',
                    filename_label: 'Filename: {{filename}}',
                    download: 'Download JSON',
                },
            },
            visual: {
                options_step: {
                    description: 'Choose how to export this {{format}} image.',
                    explanation:
                        'Export a picture of the currently rendered diagram.',
                    filename_label: 'Filename: {{filename}}',
                    extent_label: 'Export area',
                    extent_diagram: 'Complete diagram',
                    extent_diagram_description:
                        'Include the whole currently rendered diagram, including tables outside the current view.',
                    extent_viewport: 'Current view',
                    extent_viewport_description:
                        'Export only what is currently shown on the canvas.',
                    scale_label: 'Scale',
                    scale_description:
                        'Multiply the export resolution.\n2x doubles the width and height in pixels.',
                    scale_1x: '1x',
                    scale_2x: '2x',
                    scale_4x: '4x',
                    pattern: 'Include background pattern',
                    pattern_description:
                        'Add a subtle grid pattern to the background.',
                    transparent: 'Transparent background',
                    transparent_description:
                        'Export PNG without a solid background color.',
                    svg_limitation:
                        'This SVG is a snapshot of the diagram for use in a browser.\nIt is not a fully editable vector file.',
                    svg_limitation_aria: 'About SVG export limitations',
                    export: 'Export',
                    generating: 'Generating image...',
                    error: 'Could not export the image. Please try again.',
                    error_canvas:
                        'Could not find the diagram canvas to export.',
                    error_too_large:
                        'This diagram is too large to export at {{scale}}. Lower the scale or export the current view.',
                    error_empty: 'There is nothing to export on the canvas.',
                },
            },
            prisma: {
                unsupported_database:
                    'Prisma export is not available for the current database type.',
                version_step: {
                    title: 'Prisma version',
                    description:
                        'Choose the Prisma major version for your schema.prisma export.',
                    prisma_7: 'Prisma 7',
                    prisma_7_recommended: 'Recommended',
                    prisma_6: 'Prisma 6',
                    continue: 'Continue',
                },
                preview_step: {
                    description: 'Review the generated Prisma schema.',
                    generating: 'Generating Prisma schema...',
                    download: 'Download schema.prisma',
                    generation_error:
                        'Could not generate Prisma schema. Please try again.',
                    empty: 'No Prisma schema was generated for the current diagram.',
                    limitations: 'Limitations',
                    errors: {
                        unsupported_database:
                            'Prisma export is not supported for this database type.',
                        empty_diagram: 'The diagram has no exportable tables.',
                        invalid_primary_key:
                            'A table has an invalid primary key configuration.',
                        unsupported_structural_field:
                            'A primary key or foreign key uses an unsupported field type.',
                        invalid_enum:
                            'An enum definition could not be exported.',
                    },
                    notes: {
                        view_skipped:
                            'Database views are not exported to Prisma schemas.',
                        schema_namespace_unsupported:
                            'Table schemas/namespaces are not mapped in this export.',
                        unsupported_field_omitted:
                            'Some unsupported fields were omitted.',
                        unsupported_default_omitted:
                            'Some unsupported default values were omitted.',
                        unsupported_index_omitted: 'Some indexes were omitted.',
                        relation_skipped:
                            'A relationship could not be exported.',
                        relation_degraded:
                            'A relationship was exported with reduced fidelity.',
                        composite_fk_unsupported:
                            'Composite foreign keys are not supported.',
                        many_to_many_label_only:
                            'Many-to-many relationships without a join table are exported as label-only.',
                        set_null_omitted:
                            'ON DELETE SET NULL was omitted where unsupported.',
                        enum_skipped: 'An enum could not be exported.',
                        composite_type_skipped:
                            'A composite type could not be exported.',
                    },
                    notes_grouped: {
                        schema_namespace_unsupported:
                            'Table schemas/namespaces are not mapped in this export. ({{count}} tables)',
                        relation_skipped:
                            'Some relationships could not be exported. ({{count}})',
                        relation_degraded:
                            'Some relationships were exported with reduced fidelity. ({{count}})',
                        composite_fk_unsupported:
                            'Composite foreign keys are not supported. ({{count}})',
                        many_to_many_label_only:
                            'Many-to-many relationships without a join table are exported as label-only. ({{count}})',
                        set_null_omitted:
                            'ON DELETE SET NULL was omitted where unsupported. ({{count}})',
                        view_skipped:
                            'Database views are not exported to Prisma schemas. ({{count}})',
                        unsupported_field_omitted:
                            'Some unsupported fields were omitted. ({{count}})',
                        unsupported_default_omitted:
                            'Some unsupported default values were omitted. ({{count}})',
                        unsupported_index_omitted:
                            'Some indexes were omitted. ({{count}})',
                        enum_skipped:
                            'Some enums could not be exported. ({{count}})',
                        composite_type_skipped:
                            'Some composite types could not be exported. ({{count}})',
                        with_count: '{{message}} ({{count}})',
                    },
                },
            },
            ef_core: {
                unsupported_database:
                    'EF Core export is not available for the current database type.',
                options_step: {
                    description: 'Configure the EF Core model project export.',
                    explanation:
                        'Export an EF Core 10 (.NET 10) model project. The database provider is inferred from the current diagram. Migrations are not generated; you can create them locally from the exported project.',
                    ef_core_10: 'EF Core 10 (.NET 10)',
                    provider_label: 'Provider: {{provider}}',
                    migrations_not_generated:
                        'This export does not include migrations. Use the generated project to create migrations locally with the EF Core CLI.',
                    namespace: 'Namespace',
                    namespace_placeholder: 'Acme.Catalog',
                    namespace_help:
                        'Root C# namespace for the generated project. Leave blank to let the server choose one from the diagram name.',
                    db_context: 'DbContext',
                    db_context_placeholder: 'CatalogDbContext',
                    db_context_help:
                        'DbContext class name. Leave blank to use AppDbContext.',
                    export: 'Export',
                    generating: 'Generating EF Core project...',
                    error_rate_limited:
                        'Too many export requests. Please wait a moment and try again.',
                    error_unexpected:
                        'Could not export the EF Core project. Please try again.',
                    error_semantic:
                        'The EF Core project could not be generated.',
                    error_unauthenticated:
                        'You need to be signed in to export EF Core projects.',
                },
                result_step: {
                    description: 'Review the generated EF Core project.',
                    success: 'EF Core project generated.',
                    ef_core_10: 'EF Core 10 (.NET 10)',
                    provider_label: 'Provider: {{provider}}',
                    generated_files: 'Generated files ({{count}})',
                    notes: 'Notes',
                    download_zip: 'Download ZIP',
                    error_unsafe_path:
                        'The export contains an unsafe file path and was not downloaded.',
                    error_empty_files: 'The export did not include any files.',
                },
            },
            rails: {
                unsupported_database:
                    'Rails export is not available for the current database type.',
                result_step: {
                    description: 'Review the generated Rails 8.1 package.',
                    explanation:
                        'This export is a current-schema baseline for Rails 8.1, not a reconstructed migration history. Apply it to a new or existing Rails app as documented in the generated README.',
                    rails_8_1: 'Rails 8.1',
                    provider_label: 'Provider: {{provider}}',
                    generating: 'Generating Rails package...',
                    success: 'Rails 8.1 package generated.',
                    generated_files: 'Generated files ({{count}})',
                    notes_heading: 'Notes',
                    notes: railsExportNoteMessages,
                    download_zip: 'Download ZIP',
                    retry: 'Retry',
                    error_semantic: 'The Rails package could not be generated.',
                    error_unauthenticated:
                        'You need to be signed in to export Rails packages.',
                    error_invalid_request:
                        'The diagram could not be exported. It may be invalid or too large.',
                    error_rate_limited:
                        'Too many export requests. Please wait a moment and try again.',
                    error_unexpected:
                        'Could not export the Rails package. Please try again.',
                    error_unsafe_path:
                        'The export contains an unsafe file path and was not downloaded.',
                    error_empty_files: 'The export did not include any files.',
                    error_invalid_package:
                        'The generated package is invalid and was not downloaded.',
                },
            },
            django: {
                unsupported_database:
                    'Django export currently supports PostgreSQL, MySQL, MariaDB, and SQLite.',
                result_step: {
                    description: 'Review the generated Django 6.1 package.',
                    explanation:
                        'This export is a drop-in Django app (`foxaldb_models`). 0001_initial.py is a current-schema baseline, not reconstructed Django migration history. Runtime validation against Django 6.1 has not been performed.',
                    django_version: 'Django {{version}}',
                    provider_label: 'Provider: {{provider}}',
                    package_type:
                        'Package: drop-in Django app (`foxaldb_models`)',
                    generating: 'Generating Django package...',
                    success: 'Django 6.1 package generated.',
                    generated_files: 'Generated files ({{count}})',
                    notes_heading: 'Notes',
                    warnings_heading: 'Warnings ({{count}})',
                    adaptations_heading: 'Technical adaptations ({{count}})',
                    path_label: 'Path: {{path}}',
                    notes: djangoExportNoteMessages,
                    download_zip: 'Download ZIP',
                    retry: 'Retry',
                    error_semantic:
                        'The Django package could not be generated.',
                    error_unauthenticated:
                        'You need to be signed in to export Django packages.',
                    error_invalid_request:
                        'The diagram could not be exported. It may be invalid or too large.',
                    error_rate_limited:
                        'Too many export requests. Please wait a moment and try again.',
                    error_unexpected:
                        'Django export failed on the server. Please try again.',
                    error_network:
                        'Unable to reach the server. Check your connection and try again.',
                    error_unsafe_path:
                        'The export contains an unsafe file path and was not downloaded.',
                    error_empty_files: 'The export did not include any files.',
                    error_invalid_package:
                        'The generated package is invalid and was not downloaded.',
                    errors: {
                        unsupported_database:
                            'Django export is not available for this database type.',
                        empty_diagram: 'The diagram has no exportable tables.',
                        unsupported_structural_field:
                            'A primary-key field on "{{path}}" cannot be represented in Django.',
                        mysql_catalog_collision:
                            'MySQL catalogs collide after catalog removal for "{{path}}".',
                        mariadb_catalog_collision:
                            'MariaDB catalogs collide after catalog removal for "{{path}}".',
                    },
                },
            },
            drizzle: {
                unsupported_database:
                    'Drizzle export currently supports PostgreSQL, MySQL, MariaDB, and SQLite.',
                result_step: {
                    description: 'Review the generated Drizzle 0.45 package.',
                    explanation:
                        'This export is a Drizzle schema package. schema.ts is the source of truth. drizzle.config.ts is credential-free (dialect, schema path, and output directory only). SQL migration history is not reconstructed. Runtime drizzle-kit validation has not been performed.',
                    drizzle_version:
                        'drizzle-orm {{orm}} / drizzle-kit {{kit}}',
                    provider_label: 'Provider: {{provider}}',
                    package_type:
                        'Package: Drizzle schema (schema.ts + drizzle.config.ts)',
                    generating: 'Generating Drizzle package...',
                    success: 'Drizzle package generated.',
                    generated_files: 'Generated files ({{count}})',
                    notes_heading: 'Notes',
                    warnings_heading: 'Warnings ({{count}})',
                    adaptations_heading: 'Technical adaptations ({{count}})',
                    path_label: 'Path: {{path}}',
                    unknown_note:
                        'An additional export note was returned and could not be localized.',
                    notes: drizzleExportNoteMessages,
                    download_zip: 'Download ZIP',
                    retry: 'Retry',
                    error_semantic:
                        'The Drizzle package could not be generated.',
                    error_unauthenticated:
                        'You need to be signed in to export Drizzle packages.',
                    error_invalid_request:
                        'The diagram could not be exported. It may be invalid or too large.',
                    error_rate_limited:
                        'Too many export requests. Please wait a moment and try again.',
                    error_unexpected:
                        'Drizzle export failed on the server. Please try again.',
                    error_network:
                        'Unable to reach the server. Check your connection and try again.',
                    error_unsafe_path:
                        'The export contains an unsafe file path and was not downloaded.',
                    error_empty_files: 'The export did not include any files.',
                    error_invalid_package:
                        'The generated package is invalid and was not downloaded.',
                    errors: {
                        unsupported_database:
                            'Drizzle export is not available for this database type.',
                        empty_diagram: 'The diagram has no exportable tables.',
                        unsupported_structural_field:
                            'A primary-key or structural field on "{{path}}" cannot be represented in Drizzle.',
                        mysql_catalog_collision:
                            'Multiple MySQL catalogs contain the same physical table "{{path}}" and cannot safely be flattened into one Drizzle MySQL schema.',
                        mariadb_catalog_collision:
                            'Multiple MariaDB catalogs contain the same physical table "{{path}}" and cannot safely be flattened into one Drizzle MariaDB schema.',
                    },
                },
            },
            laravel: {
                options_step: {
                    description: 'Choose how to export Laravel migrations.',
                    explanation:
                        'Generate a ZIP of Laravel migration files from the current diagram.',
                    filename_label: 'Filename: {{filename}}',
                    laravel_version: 'Laravel version',
                    include_indexes: 'Include table indexes',
                    include_indexes_description:
                        'Export explicit table index definitions. Field-level unique constraints are always included.',
                    include_foreign_keys: 'Include foreign keys',
                    include_foreign_keys_description:
                        'Export separate foreign key migration files.',
                    export: 'Export',
                    generating: 'Generating Laravel migrations...',
                    error: 'Could not export Laravel migrations. Please try again.',
                    error_unauthenticated:
                        'You need to be signed in to export Laravel migrations.',
                    error_forbidden:
                        'You do not have permission to export this diagram.',
                    error_not_found: 'This diagram could not be found.',
                    error_empty: 'This diagram has no exportable tables.',
                    error_invalid:
                        'The diagram could not be exported. Check the schema and try again.',
                    error_network:
                        'Could not reach the server. Check your connection and try again.',
                },
            },
        },

        export_dialog: {
            title: 'Export',
            description: 'Choose a format to export your diagram.',
            schema_code_section: 'Schema / Code',
            visual_section: 'Visual',
            sql: {
                title: 'SQL',
                description: 'Database DDL script for the current diagram',
                description_generic: 'Database DDL script',
            },
            dbml: {
                title: 'DBML',
                coming_soon:
                    'File export coming soon. View and copy DBML in the sidebar.',
            },
            diagram_json: {
                title: 'Diagram JSON',
                description: 'Portable FoxalDB diagram file',
            },
            laravel_migrations: {
                title: 'Laravel migrations',
                description: 'Laravel migration ZIP archive',
            },
            png: {
                title: 'PNG',
                description: 'Raster image',
            },
            jpg: {
                title: 'JPG',
                description: 'Raster image',
            },
            svg: {
                title: 'SVG',
                description: 'Vector image',
            },
        },

        export_sql_dialog: {
            title: 'Export SQL',
            description:
                'Export your diagram schema to {{databaseType}} script',
            close: 'Close',
            loading: {
                text: 'AI is generating SQL for {{databaseType}}...',
                description: 'This should take up to 30 seconds.',
            },
            error: {
                message:
                    'Error generating SQL script. Please try again later or <0>contact us</0>.',
                description:
                    'Feel free to use your OPENAI_TOKEN, see the manual <0>here</0>.',
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
            title: 'Create Relationship',
            primary_table: 'Primary Table',
            primary_field: 'Primary Field',
            referenced_table: 'Referenced Table',
            referenced_field: 'Referenced Field',
            primary_table_placeholder: 'Select table',
            primary_field_placeholder: 'Select field',
            referenced_table_placeholder: 'Select table',
            referenced_field_placeholder: 'Select field',
            no_tables_found: 'No tables found',
            no_fields_found: 'No fields found',
            create: 'Create',
            cancel: 'Cancel',
        },

        import_database_dialog: {
            title: 'Import to Current Diagram',
            import_schema: {
                title: 'Import schema',
                import: 'Import',
                cancel: 'Cancel',
                mismatch: {
                    title: 'This schema looks like {{detected}}, but this diagram is {{selected}}.',
                    description: 'Cross-database import is not supported yet.',
                    cancel: 'Cancel',
                },
                ambiguous: {
                    description:
                        'We could not identify the SQL dialect automatically. Confirm how to interpret this schema for the current {{selected}} diagram.',
                },
            },
            override_alert: {
                title: 'Import Database',
                content: {
                    alert: 'Importing this diagram will affect existing tables and relationships.',
                    new_tables:
                        '<bold>{{newTablesNumber}}</bold> new tables will be added.',
                    new_relationships:
                        '<bold>{{newRelationshipsNumber}}</bold> new relationships will be created.',
                    tables_override:
                        '<bold>{{tablesOverrideNumber}}</bold> tables will be overwritten.',
                    proceed: 'Do you want to proceed?',
                },
                import: 'Import',
                cancel: 'Cancel',
            },
        },

        new_table_schema_dialog: {
            title: 'Select Schema',
            description:
                'Multiple schemas are currently displayed. Select one for the new table.',
            cancel: 'Cancel',
            confirm: 'Confirm',
        },

        update_table_schema_dialog: {
            title: 'Change Schema',
            description: 'Update table "{{tableName}}" schema',
            cancel: 'Cancel',
            confirm: 'Change',
        },

        create_table_schema_dialog: {
            title: 'Create New Schema',
            description:
                'No schemas exist yet. Create your first schema to organize your tables.',
            create: 'Create',
            cancel: 'Cancel',
        },
        export_diagram_dialog: {
            title: 'Export Diagram',
            description: 'Choose the format for export:',
            format_json: 'JSON',
            cancel: 'Cancel',
            export: 'Export',
            error: {
                title: 'Error exporting diagram',
                description: 'Something went wrong. Please try again.',
            },
        },

        import_diagram_dialog: {
            title: 'Import Diagram',
            description: 'Import a diagram from a JSON file.',
            cancel: 'Cancel',
            import: 'Import',
            error: {
                title: 'Error importing diagram',
                description:
                    'The diagram JSON is invalid. Please check the JSON and try again. Need help? support@chartdb.io',
            },
        },

        import_dbml_dialog: {
            example_title: 'Import Example DBML',
            title: 'Import DBML',
            description: 'Import a database schema from DBML format.',
            import: 'Import',
            cancel: 'Cancel',
            skip_and_empty: 'Skip & Empty',
            show_example: 'Show Example',
            error: {
                title: 'Error importing DBML',
                description: 'Failed to parse DBML. Please check the syntax.',
            },
        },
        relationship_type: {
            one_to_one: 'One to One',
            one_to_many: 'One to Many',
            many_to_one: 'Many to One',
            many_to_many: 'Many to Many',
        },

        canvas_context_menu: {
            new_table: 'New Table',
            new_view: 'New View',
            new_relationship: 'New Relationship',
            new_area: 'New Area',
            new_note: 'New Note',
        },

        table_node_context_menu: {
            edit_table: 'Edit Table',
            duplicate_table: 'Duplicate Table',
            delete_table: 'Delete Table',
            add_relationship: 'Add Relationship',
            move_to_area: 'Move to Area',
            no_area: 'No Area',
        },

        canvas: {
            all_tables_hidden: 'All tables are hidden',
            show_all_tables: 'Show all',
        },

        canvas_filter: {
            title: 'Filter Tables',
            search_placeholder: 'Search tables...',
            group_by_schema: 'Group by Schema',
            group_by_area: 'Group by Area',
            no_tables_found: 'No tables found',
            empty_diagram_description: 'Create a table to get started',
            no_tables_description: 'Try adjusting your search or filter',
            clear_filter: 'Clear filter',
        },

        snap_to_grid_tooltip: 'Snap to Grid (Hold {{key}})',

        editing_conflict: {
            one: '{{name}} is also editing this.',
            two: '{{name1}} and {{name2}} are also editing this.',
            many: '{{name}} and {{count}} others are also editing this.',
            fallback_name: 'Collaborator',
            last_writer_wins:
                "Changes aren't locked. The last saved edit wins.",
        },

        tool_tips: {
            double_click_to_edit: 'Double-click to edit',
        },

        auth: {
            dialog: {
                account_title: 'Account',
                login_title: 'Sign in to FoxalDB',
                register_title: 'Create a FoxalDB account',
                account_description: 'Manage your current session.',
                login_description:
                    'Sign in to save more diagrams and keep them synced.',
                register_description:
                    'Create an account to save more diagrams.',
                checking_session: 'Checking session...',
                continue_without_account: 'Continue without an account',
            },
            login: {
                title: 'Log in',
                email_label: 'Email',
                password_label: 'Password',
                submit: 'Sign in',
                submitting: 'Signing in...',
                switch_to_register: 'Register',
                no_account: 'No account?',
            },
            register: {
                title: 'Register',
                first_name_label: 'First name',
                last_name_label: 'Last name',
                email_label: 'Email',
                password_label: 'Password',
                password_confirmation_label: 'Confirm password',
                submit: 'Create account',
                submitting: 'Creating account...',
                switch_to_login: 'Log in',
                already_have_account: 'Already have an account?',
            },
            account: {
                signed_in_as: 'Signed in as',
                logout: 'Logout',
                back_to_editor: 'Back to editor',
            },
            settings: {
                title: 'User settings',
                description: 'Update your personal information and password.',
                change_password_heading: 'Change password',
                current_password_label: 'Current password',
                new_password_label: 'New password',
                password_confirmation_label: 'Confirm new password',
                first_name_label: 'First name',
                last_name_label: 'Last name',
                email_label: 'Email',
                submit: 'Save changes',
                submitting: 'Saving...',
                success_title: 'Profile updated',
                success_description: 'Your profile has been saved.',
            },
            nav: {
                sign_in: 'Sign in',
                logout: 'Logout',
                loading: '...',
                user_menu: 'Account',
                settings: 'Settings',
                change_language: 'Language',
            },
            pages: {
                login_title: 'FoxalDB — Log in',
                register_title: 'FoxalDB — Register',
                checking_session: 'Checking session…',
            },
            errors: {
                first_name_required: 'First name is required.',
                last_name_required: 'Last name is required.',
                generic: 'Something went wrong.',
            },
        },

        guest_migration_dialog: {
            title: 'Import local diagram?',
            description:
                'You have a diagram saved on this device. Import it into your account to access it from anywhere.',
            import: 'Import to account',
            continue_without_import: 'Continue without importing',
        },

        guest_migration_errors: {
            import_failed:
                'Could not import your local diagram. Your local copy was preserved.',
            activation_failed:
                'The diagram was created but could not be opened. Your local copy was preserved.',
            cleanup_failed:
                'Your diagram was imported but the local copy could not be removed. You can delete it manually.',
            check_failed: 'Could not read your local diagram.',
        },

        dbml: {
            ref_format: {
                label: 'Reference style',
                inline: 'Inline refs',
                standard: 'Standard refs',
                show_inline: 'Show inline refs',
                show_standard: 'Show standard refs',
                hint: 'Choose how relationships are written in the exported DBML.',
            },
        },

        language_select: {
            change_language: 'Language',
        },

        on: 'On',
        off: 'Off',
    },
};

export const enMetadata: LanguageMetadata = {
    name: 'English (US)',
    nativeName: 'English (US)',
    code: 'en',
    countryCode: 'us',
};
