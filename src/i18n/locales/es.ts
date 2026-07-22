import type { LanguageMetadata, LanguageTranslation } from '../types';

export const es: LanguageTranslation = {
    translation: {
        editor_sidebar: {
            new_diagram: 'Nuevo',
            browse: 'Abrir',
            tables: 'Tablas',
            refs: 'Refs',
            dependencies: 'Dependencias',
            custom_types: 'Tipos Personalizados',
            comments: 'Discusiones',
            visuals: 'Visuales',
        },
        menu: {
            actions: {
                actions: 'Acciones',
                new: 'Nuevo...',
                browse: 'Todas las bases de datos...',
                save: 'Guardar',
                import: 'Importar Base de Datos',
                export: 'Export',
                export_laravel_migrations: 'Laravel migrations',
                import_laravel_migrations: 'Import Laravel migrations',
                compare_laravel_migrations: 'Sync from Laravel migrations',
                export_sql: 'Exportar SQL',
                export_as: 'Exportar como',
                delete_diagram: 'Eliminar',
            },
            edit: {
                edit: 'Editar',
                undo: 'Deshacer',
                redo: 'Rehacer',
                clear: 'Limpiar',
            },
            view: {
                view: 'Ver',
                hide_cardinality: 'Ocultar Cardinalidad',
                show_cardinality: 'Mostrar Cardinalidad',
                show_field_attributes: 'Mostrar Atributos de Campo',
                hide_field_attributes: 'Ocultar Atributos de Campo',
                show_sidebar: 'Mostrar Barra Lateral',
                hide_sidebar: 'Ocultar Barra Lateral',
                zoom_on_scroll: 'Zoom al Desplazarse',
                show_views: 'Vistas de Base de Datos',
                theme: 'Tema',
                show_dependencies: 'Mostrar dependencias',
                hide_dependencies: 'Ocultar dependencias',
                // TODO: Translate
                show_minimap: 'Show Mini Map',
                hide_minimap: 'Hide Mini Map',
            },
            backup: {
                backup: 'Respaldo',
                export_diagram: 'Exportar Diagrama',
                restore_diagram: 'Restaurar Diagrama',
            },
            help: {
                help: 'Ayuda',
                docs_website: 'Documentación',
                join_discord: 'Únete a nosotros en Discord',
            },
        },

        delete_diagram_alert: {
            title: 'Eliminar Diagrama',
            description:
                'Esta acción no se puede deshacer. Esto eliminará permanentemente el diagrama.',
            cancel: 'Cancelar',
            delete: 'Eliminar',
        },

        clear_diagram_alert: {
            title: 'Limpiar Diagrama',
            description:
                'Esta acción no se puede deshacer. Esto eliminará permanentemente todos los datos en el diagrama.',
            cancel: 'Cancelar',
            clear: 'Limpiar',
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
            title: 'Organizar Diagrama Automáticamente',
            description:
                'Esta acción reorganizará todas las tablas en el diagrama. ¿Deseas continuar?',
            reorder: 'Organizar Automáticamente',
            cancel: 'Cancelar',
        },

        copy_to_clipboard_toast: {
            unsupported: {
                title: 'Copia fallida',
                description: 'Portapapeles no soportado',
            },
            failed: {
                title: 'Copia fallida',
                description: 'Algo salió mal. Por favor, inténtelo de nuevo.',
            },
        },

        theme: {
            system: 'Sistema',
            light: 'Claro',
            dark: 'Oscuro',
        },

        zoom: {
            on: 'Encendido',
            off: 'Apagado',
        },

        last_saved: 'Último guardado',
        saved: 'Guardado',
        loading_diagram: 'Cargando diagrama...',
        deselect_all: 'Deseleccionar todo',
        select_all: 'Seleccionar todo',
        clear: 'Limpiar',
        show_more: 'Mostrar más',
        show_less: 'Mostrar menos',
        copy_to_clipboard: 'Copy to Clipboard',
        copied: 'Copied!',

        side_panel: {
            view_all_options: 'Ver todas las opciones...',
            tables_section: {
                tables: 'Tablas',
                add_table: 'Agregar Tabla',
                add_view: 'Agregar Vista',
                filter: 'Filtrar',
                collapse: 'Colapsar Todo',
                // TODO: Translate
                clear: 'Clear Filter',
                no_results: 'No tables found matching your filter.',
                // TODO: Translate
                show_list: 'Show Table List',
                show_dbml: 'Show DBML Editor',
                all_hidden: 'Todas las tablas están ocultas',
                show_all: 'Mostrar todo',

                table: {
                    fields: 'Campos',
                    nullable: '¿Opcional?',
                    primary_key: 'Clave Primaria',
                    indexes: 'Índices',
                    check_constraints: 'Restricciones de verificación',
                    comments: 'Comentarios',
                    no_comments: 'Sin comentarios',
                    add_field: 'Agregar Campo',
                    add_index: 'Agregar Índice',
                    add_check: 'Agregar verificación',
                    index_select_fields: 'Seleccionar campos',
                    field_name: 'Nombre',
                    field_type: 'Tipo',
                    no_types_found: 'No se encontraron tipos',
                    field_actions: {
                        title: 'Atributos del Campo',
                        open_discussion: 'Abrir discusión',
                        unique: 'Único',
                        auto_increment: 'Autoincremento',
                        comments: 'Comentarios',
                        no_comments: 'Sin comentarios',
                        delete_field: 'Eliminar Campo',
                        // TODO: Translate
                        default_value: 'Default Value',
                        no_default: 'No default',
                        // TODO: Translate
                        character_length: 'Max Length',
                        precision: 'Precisión',
                        scale: 'Escala',
                    },
                    index_actions: {
                        title: 'Atributos del Índice',
                        name: 'Nombre',
                        unique: 'Único',
                        index_type: 'Tipo de Índice',
                        delete_index: 'Eliminar Índice',
                    },
                    check_constraint_actions: {
                        title: 'Restricción de verificación',
                        expression: 'Expresión',
                        delete: 'Eliminar restricción',
                    },
                    table_actions: {
                        title: 'Acciones de la Tabla',
                        open_discussion: 'Abrir discusión',
                        change_schema: 'Cambiar Esquema',
                        add_field: 'Agregar Campo',
                        add_index: 'Agregar Índice',
                        duplicate_table: 'Duplicate Table', // TODO: Translate
                        delete_table: 'Eliminar Tabla',
                    },
                },
                empty_state: {
                    title: 'No hay tablas',
                    description: 'Crea una tabla para comenzar',
                },
            },
            refs_section: {
                refs: 'Refs',
                filter: 'Filtrar',
                collapse: 'Colapsar Todo',
                add_relationship: 'Agregar Relación',
                relationships: 'Relaciones',
                dependencies: 'Dependencias',
                relationship: {
                    relationship: 'Relación',
                    primary: 'Tabla Primaria',
                    foreign: 'Tabla Relacionada',
                    cardinality: 'Cardinalidad',
                    on_delete: 'On delete',
                    on_update: 'On update',
                    delete_relationship: 'Eliminar',
                    switch_tables: 'Intercambiar tablas',
                    referential_action: {
                        none: 'No action',
                        cascade: 'Cascade',
                        set_null: 'Set null',
                        restrict: 'Restrict',
                    },
                    relationship_actions: {
                        title: 'Acciones',
                        open_discussion: 'Abrir discusión',
                        delete_relationship: 'Eliminar',
                    },
                },
                dependency: {
                    dependency: 'Dependencia',
                    table: 'Tabla',
                    dependent_table: 'Vista Dependiente',
                    delete_dependency: 'Eliminar',
                    dependency_actions: {
                        title: 'Acciones',
                        delete_dependency: 'Eliminar',
                    },
                },
                empty_state: {
                    title: 'Sin relaciones',
                    description: 'Crea una relación para comenzar',
                },
            },

            areas_section: {
                areas: 'Áreas',
                add_area: 'Agregar Área',
                filter: 'Filtrar',
                clear: 'Limpiar Filtro',
                no_results:
                    'No se encontraron áreas que coincidan con tu filtro.',

                area: {
                    area_actions: {
                        title: 'Acciones del Área',
                        edit_name: 'Editar Nombre',
                        delete_area: 'Eliminar Área',
                    },
                },
                empty_state: {
                    title: 'Sin áreas',
                    description: 'Crea un área para comenzar',
                },
            },

            visuals_section: {
                visuals: 'Visuales',
                tabs: {
                    areas: 'Áreas',
                    notes: 'Notas',
                },
            },

            notes_section: {
                filter: 'Filtrar',
                add_note: 'Agregar Nota',
                no_results: 'No se encontraron notas',
                clear: 'Limpiar Filtro',
                empty_state: {
                    title: 'Sin Notas',
                    description:
                        'Crea una nota para agregar anotaciones de texto en el lienzo',
                },
                note: {
                    empty_note: 'Nota vacía',
                    note_actions: {
                        title: 'Acciones de Nota',
                        edit_content: 'Editar Contenido',
                        delete_note: 'Eliminar Nota',
                    },
                },
            },

            custom_types_section: {
                custom_types: 'Tipos Personalizados',
                filter: 'Filtrar',
                clear: 'Limpiar Filtro',
                no_results:
                    'No se encontraron tipos personalizados que coincidan con tu filtro.',
                new_type: 'Nuevo Tipo',
                empty_state: {
                    title: 'Sin tipos personalizados',
                    description:
                        'Los tipos personalizados aparecerán aquí cuando estén disponibles en tu base de datos',
                },
                custom_type: {
                    kind: 'Tipo',
                    enum_values: 'Valores Enum',
                    composite_fields: 'Campos',
                    no_fields: 'Sin campos definidos',
                    no_values: 'No hay valores de enum definidos',
                    field_name_placeholder: 'Nombre del campo',
                    field_type_placeholder: 'Seleccionar tipo',
                    add_field: 'Agregar Campo',
                    no_fields_tooltip:
                        'Sin campos definidos para este tipo personalizado',
                    custom_type_actions: {
                        title: 'Acciones',
                        highlight_fields: 'Resaltar Campos',
                        delete_custom_type: 'Eliminar',
                        clear_field_highlight: 'Quitar Resaltado',
                    },
                    delete_custom_type: 'Eliminar Tipo',
                },
            },
            comments_section: {
                title: 'Discusiones',
                loading: 'Cargando discusiones…',
                inactive: {
                    title: 'Discusiones no disponibles',
                    description:
                        'Las discusiones solo están disponibles en diagramas en la nube autenticados.',
                },
                empty: {
                    title: 'Aún no hay discusiones',
                    description:
                        'Las conversaciones sobre este diagrama aparecerán aquí.',
                    diagram_title: 'Aún no hay mensajes del diagrama',
                    diagram_description:
                        'Los mensajes sobre el diagrama en conjunto aparecerán aquí.',
                    target_title:
                        'Aún no hay mensajes para la selección actual',
                    target_description:
                        'Los mensajes sobre la selección actual aparecerán aquí.',
                },
                errors: {
                    load_title: 'No se pudieron cargar las discusiones',
                    load_description:
                        'Algo salió mal al cargar las discusiones. Inténtalo de nuevo.',
                },
                retry: 'Reintentar',
                deleted_user: 'Usuario eliminado',
                targets: {
                    diagram: 'Discusión del diagrama',
                    table: 'Discusión de la tabla',
                    field: 'Discusión del campo',
                    relationship: 'Discusión de la relación',
                    unknown: 'Discusión',
                },
                views: {
                    all: 'Todas',
                    diagram: 'Diagrama',
                    current_target: 'Actual',
                },
                target_header: {
                    diagram: 'Discusión del diagrama',
                    table: 'Tabla {{name}}',
                    field: '{{table}}.{{field}}',
                    relationship: '{{name}}',
                    relationship_endpoints: '{{source}} → {{target}}',
                    missing_table: 'Tabla eliminada',
                    missing_field: 'Campo eliminado',
                    missing_relationship: 'Relación eliminada',
                },
                composer: {
                    label: 'Mensaje',
                    placeholder: 'Escribe un mensaje de discusión…',
                    submit: 'Publicar',
                    submitting: 'Publicando…',
                    cancel: 'Cancelar',
                    form_aria_label: 'Nuevo mensaje de discusión',
                    counter_aria_label:
                        '{{count}} de {{max}} caracteres usados',
                    errors: {
                        empty: 'Escribe un mensaje para publicar.',
                        too_long:
                            'Los mensajes no pueden superar los 2000 caracteres.',
                        create_failed:
                            'No se pudo publicar el mensaje. Inténtalo de nuevo.',
                    },
                },
                item_actions: {
                    title: 'Acciones del comentario',
                    edit: 'Editar',
                },
                edit: {
                    label: 'Mensaje',
                    form_aria_label: 'Editar mensaje de discusión',
                    save: 'Guardar',
                    saving: 'Guardando…',
                    cancel: 'Cancelar',
                    counter_aria_label:
                        '{{count}} de {{max}} caracteres usados',
                    errors: {
                        empty: 'Introduce un mensaje para guardar.',
                        too_long:
                            'Los mensajes no pueden superar los 2000 caracteres.',
                        update_failed:
                            'No se pudo actualizar el mensaje. Inténtalo de nuevo.',
                    },
                    remote_updated_warning:
                        'Este mensaje se actualizó en otro lugar. Guardar sobrescribirá esos cambios.',
                },
            },
        },

        toolbar: {
            zoom_in: 'Acercar',
            zoom_out: 'Alejar',
            save: 'Guardar',
            show_all: 'Mostrar Todo',
            undo: 'Deshacer',
            redo: 'Rehacer',
            reorder_diagram: 'Organizar Diagrama Automáticamente',
            // TODO: Translate
            clear_custom_type_highlight: 'Clear highlight for "{{typeName}}"',
            custom_type_highlight_tooltip:
                'Highlighting "{{typeName}}" - Click to clear',
            highlight_overlapping_tables: 'Resaltar tablas superpuestas',
            filter: 'Filtrar Tablas',
        },

        new_diagram_dialog: {
            database_selection: {
                title: '¿Cuál es tu Base de Datos?',
                description:
                    'Cada base de datos tiene sus propias características y capacidades únicas.',
                check_examples_long: 'Ver Ejemplos',
                check_examples_short: 'Ejemplos',
            },

            import_database: {
                title: 'Importa tu Base de Datos',
                database_edition: 'Edición de Base de Datos:',
                step_1: 'Ejecuta este script en tu base de datos:',
                step_2: 'Pega el resultado del script aquí →',
                script_results_placeholder: 'Resultados del script aquí...',
                ssms_instructions: {
                    button_text: 'Instrucciones SSMS',
                    title: 'Instrucciones',
                    step_1: 'Ve a Herramientas > Opciones > Resultados de Consulta > SQL Server.',
                    step_2: 'Si estás usando "Resultados en Cuadrícula", cambia el Máximo de Caracteres Recuperados para Datos No XML (configúralo en 9999999).',
                },
                instructions_link: '¿Necesitas ayuda? mira cómo',
                check_script_result: 'Revisa el resultado del script',
            },

            cancel: 'Cancelar',
            back: 'Atrás',
            // TODO: Translate
            import_from_file: 'Import from File',
            empty_diagram: 'Base de datos vacía',
            continue: 'Continuar',
            import: 'Importar',
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
                email_placeholder: 'Email address',
                add: 'Add',
                adding: 'Adding...',
            },
            errors: {
                load_failed: 'Could not load collaborators.',
                add_failed: 'Could not add collaborator.',
            },
        },

        editor_role: {
            view_only: 'View only',
        },

        activity_feed_dialog: {
            title: 'Activity',
            description: 'Recent changes to this diagram.',
            activity_button: 'Activity',
            empty: 'No activity yet.',
            empty_hint: 'Start editing to see recent changes.',
            you: 'You',
            unknown_user: 'Someone',
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

        open_diagram_dialog: {
            title: 'Abrir Base de Datos',
            description:
                'Selecciona un diagrama para abrir de la lista a continuación.',
            table_columns: {
                name: 'Nombre',
                created_at: 'Creado en',
                last_modified: 'Última modificación',
                tables_count: 'Tablas',
            },
            cancel: 'Cancelar',
            open: 'Abrir',
            new_database: 'Nueva Base de Datos',

            diagram_actions: {
                open: 'Abrir',
                duplicate: 'Duplicar',
                delete: 'Eliminar',
            },
        },

        export_sql_dialog: {
            title: 'Exportar SQL',
            description:
                'Exporta el esquema de tu diagrama a un script {{databaseType}}',
            close: 'Cerrar',
            loading: {
                text: 'La IA está generando SQL para {{databaseType}}...',
                description: 'Esto debería tomar hasta 30 segundos.',
            },
            error: {
                message:
                    'Error al generar el script SQL. Por favor, intenta nuevamente más tarde o <0>contáctanos</0>.',
                description:
                    'Siéntete libre de usar tu OPENAI_TOKEN, consulta el manual <0>aquí</0>.',
            },
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
            cancel: 'Cancelar',
            create: 'Crear',
            no_fields_found: 'No se encontraron campos',
            no_tables_found: 'No se encontraron tablas',
            primary_field: 'Campo Primario',
            primary_table: 'Tabla Primaria',
            primary_table_placeholder: 'Seleccionar tabla',
            primary_field_placeholder: 'Seleccionar campo',
            referenced_field: 'Campo Referenciado',
            referenced_field_placeholder: 'Seleccionar campo',
            referenced_table: 'Tabla Referenciada',
            referenced_table_placeholder: 'Seleccionar tabla',
            title: 'Crear Relación',
        },

        import_database_dialog: {
            title: 'Importar a Diagrama Actual',
            override_alert: {
                title: 'Importar Base de Datos',
                content: {
                    alert: 'Importar este diagrama afectará las tablas y relaciones existentes.',
                    new_tables:
                        '<bold>{{newTablesNumber}}</bold> nuevas tablas se agregarán.',
                    new_relationships:
                        '<bold>{{newRelationshipsNumber}}</bold> nuevas relaciones se crearán.',
                    tables_override:
                        '<bold>{{tablesOverrideNumber}}</bold> tablas se sobrescribirán.',
                    proceed: '¿Deseas continuar?',
                },
                import: 'Importar',
                cancel: 'Cancelar',
            },
        },

        export_image_dialog: {
            title: 'Exportar imagen',
            description: 'Escoge el factor de escalamiento para exportar:',
            scale_1x: '1x (Baja calidad)',
            scale_2x: '2x (Calidad normal)',
            scale_4x: '4x (Mejor calidad)',
            cancel: 'Cancelar',
            export: 'Exportar',
            // TODO: Translate
            advanced_options: 'Advanced Options',
            pattern: 'Include background pattern',
            pattern_description: 'Add subtle grid pattern to background.',
            transparent: 'Transparent background',
            transparent_description: 'Remove background color from image.',
        },

        new_table_schema_dialog: {
            title: 'Seleccionar Esquema',
            description:
                'Actualmente se muestran múltiples esquemas. Selecciona uno para la nueva tabla.',
            cancel: 'Cancelar',
            confirm: 'Confirmar',
        },

        update_table_schema_dialog: {
            title: 'Cambiar Esquema',
            description: 'Actualizar esquema de la tabla "{{tableName}}"',
            cancel: 'Cancelar',
            confirm: 'Cambiar',
        },
        create_table_schema_dialog: {
            title: 'Crear Nuevo Esquema',
            description:
                'Aún no existen esquemas. Crea tu primer esquema para organizar tus tablas.',
            create: 'Crear',
            cancel: 'Cancelar',
        },

        star_us_dialog: {
            title: '¡Ayúdanos a mejorar!',
            description:
                '¿Te gusta ChartDB? Por favor, danos una estrella en GitHub.',
            close: 'Ahora no',
            confirm: '¡Claro!',
        },

        // TODO: Translate
        export_diagram_dialog: {
            title: 'Export Diagram',
            description: 'Choose the format for export:',
            format_json: 'JSON',
            cancel: 'Cancel',
            export: 'Export',
            error: {
                title: 'Error exporting diagram',
                description:
                    'Something went wrong. Need help? support@chartdb.io',
            },
        },
        // TODO: Translate
        import_diagram_dialog: {
            title: 'Import Diagram',
            description: 'Paste the diagram JSON below:',
            cancel: 'Cancel',
            import: 'Import',
            error: {
                title: 'Error importing diagram',
                description:
                    'The diagram JSON is invalid. Please check the JSON and try again. Need help? support@chartdb.io',
            },
        },
        // TODO: Translate
        import_dbml_dialog: {
            example_title: 'Import Example DBML',
            title: 'Import DBML',
            description: 'Import a database schema from DBML format.',
            import: 'Import',
            cancel: 'Cancel',
            skip_and_empty: 'Skip & Empty',
            show_example: 'Show Example',
            error: {
                title: 'Error',
                description: 'Failed to parse DBML. Please check the syntax.',
            },
        },
        relationship_type: {
            one_to_one: 'Uno a Uno',
            one_to_many: 'Uno a Muchos',
            many_to_one: 'Muchos a Uno',
            many_to_many: 'Muchos a Muchos',
        },

        canvas_context_menu: {
            new_table: 'Nueva Tabla',
            new_view: 'Nueva Vista',
            new_relationship: 'Nueva Relación',
            new_area: 'Nueva Área',
            new_note: 'Nueva Nota',
        },

        table_node_context_menu: {
            edit_table: 'Editar Tabla',
            duplicate_table: 'Duplicate Table', // TODO: Translate
            delete_table: 'Eliminar Tabla',
            add_relationship: 'Add Relationship', // TODO: Translate
            move_to_area: 'Mover a Área',
            no_area: 'Sin Área',
        },

        canvas: {
            all_tables_hidden: 'Todas las tablas están ocultas',
            show_all_tables: 'Mostrar todo',
        },

        canvas_filter: {
            title: 'Filtrar Tablas',
            search_placeholder: 'Buscar tablas...',
            group_by_schema: 'Agrupar por Esquema',
            group_by_area: 'Agrupar por Área',
            no_tables_found: 'No se encontraron tablas',
            empty_diagram_description: 'Crea una tabla para comenzar',
            no_tables_description: 'Intenta ajustar tu búsqueda o filtro',
            clear_filter: 'Limpiar filtro',
        },

        // TODO: Add translations
        snap_to_grid_tooltip: 'Snap to Grid (Hold {{key}})',

        editing_conflict: {
            one: '{{name}} también está editando esto.',
            two: '{{name1}} y {{name2}} también están editando esto.',
            many: '{{name}} y {{count}} más también están editando esto.',
            fallback_name: 'Colaborador',
            last_writer_wins:
                'Los cambios no están bloqueados. Se impone la última edición guardada.',
        },

        tool_tips: {
            double_click_to_edit: 'Doble clic para editar',
        },

        language_select: {
            change_language: 'Idioma',
        },

        on: 'Encendido',
        off: 'Apagado',
    },
};

export const esMetadata: LanguageMetadata = {
    name: 'Spanish',
    nativeName: 'Español',
    code: 'es',
};
