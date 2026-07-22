import type { LanguageMetadata, LanguageTranslation } from '../types';

export const pt_BR: LanguageTranslation = {
    translation: {
        editor_sidebar: {
            new_diagram: 'Novo',
            browse: 'Abrir',
            tables: 'Tabelas',
            refs: 'Refs',
            dependencies: 'Dependências',
            custom_types: 'Tipos Personalizados',
            comments: 'Discussões',
            visuals: 'Visuais',
        },
        menu: {
            actions: {
                actions: 'Ações',
                new: 'Novo...',
                browse: 'Todos os bancos de dados...',
                save: 'Salvar',
                import: 'Importar Banco de Dados',
                export: 'Export',
                export_laravel_migrations: 'Laravel migrations',
                import_laravel_migrations: 'Import Laravel migrations',
                compare_laravel_migrations: 'Sync from Laravel migrations',
                export_sql: 'Exportar SQL',
                export_as: 'Exportar como',
                delete_diagram: 'Excluir',
            },
            edit: {
                edit: 'Editar',
                undo: 'Desfazer',
                redo: 'Refazer',
                clear: 'Limpar',
            },
            view: {
                view: 'Visualizar',
                show_sidebar: 'Mostrar Barra Lateral',
                hide_sidebar: 'Ocultar Barra Lateral',
                hide_cardinality: 'Ocultar Cardinalidade',
                show_cardinality: 'Mostrar Cardinalidade',
                hide_field_attributes: 'Ocultar Atributos de Campo',
                show_field_attributes: 'Mostrar Atributos de Campo',
                zoom_on_scroll: 'Zoom ao Rolar',
                show_views: 'Visualizações do Banco de Dados',
                theme: 'Tema',
                show_dependencies: 'Mostrar Dependências',
                hide_dependencies: 'Ocultar Dependências',
                // TODO: Translate
                show_minimap: 'Show Mini Map',
                hide_minimap: 'Hide Mini Map',
            },
            // TODO: Translate
            backup: {
                backup: 'Backup',
                export_diagram: 'Exportar Diagrama',
                restore_diagram: 'Restaurar Diagrama',
            },
            help: {
                help: 'Ajuda',
                docs_website: 'Documentação',
                join_discord: 'Junte-se a nós no Discord',
            },
        },

        delete_diagram_alert: {
            title: 'Excluir Diagrama',
            description:
                'Esta ação não pode ser desfeita. Isso excluirá permanentemente o diagrama.',
            cancel: 'Cancelar',
            delete: 'Excluir',
        },

        clear_diagram_alert: {
            title: 'Limpar Diagrama',
            description:
                'Esta ação não pode ser desfeita. Isso excluirá permanentemente todos os dados do diagrama.',
            cancel: 'Cancelar',
            clear: 'Limpar',
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
            title: 'Organizar Diagrama Automaticamente',
            description:
                'Esta ação reorganizará todas as tabelas no diagrama. Deseja continuar?',
            reorder: 'Organizar Automaticamente',
            cancel: 'Cancelar',
        },

        copy_to_clipboard_toast: {
            unsupported: {
                title: 'Falha na cópia',
                description: 'Área de transferência não suportada',
            },
            failed: {
                title: 'Falha na cópia',
                description: 'Algo deu errado. Por favor, tente novamente.',
            },
        },

        theme: {
            system: 'Sistema',
            light: 'Claro',
            dark: 'Escuro',
        },

        zoom: {
            on: 'Ativado',
            off: 'Desativado',
        },

        last_saved: 'Última vez salvo',
        saved: 'Salvo',
        loading_diagram: 'Carregando diagrama...',
        deselect_all: 'Desmarcar Todos',
        select_all: 'Selecionar Todos',
        clear: 'Limpar',
        show_more: 'Mostrar Mais',
        show_less: 'Mostrar Menos',
        copy_to_clipboard: 'Copiar para a Área de Transferência',
        copied: 'Copiado!',

        side_panel: {
            view_all_options: 'Ver todas as Opções...',
            tables_section: {
                tables: 'Tabelas',
                add_table: 'Adicionar Tabela',
                add_view: 'Adicionar Visualização',
                filter: 'Filtrar',
                collapse: 'Colapsar Todas',
                // TODO: Translate
                clear: 'Clear Filter',
                no_results: 'No tables found matching your filter.',
                // TODO: Translate
                show_list: 'Show Table List',
                show_dbml: 'Show DBML Editor',
                all_hidden: 'Todas as tabelas estão ocultas',
                show_all: 'Mostrar tudo',

                table: {
                    fields: 'Campos',
                    nullable: 'Permite Nulo?',
                    primary_key: 'Chave Primária',
                    indexes: 'Índices',
                    check_constraints: 'Restrições de verificação',
                    comments: 'Comentários',
                    no_comments: 'Sem comentários',
                    add_field: 'Adicionar Campo',
                    add_index: 'Adicionar Índice',
                    add_check: 'Adicionar verificação',
                    index_select_fields: 'Selecionar campos',
                    no_types_found: 'Nenhum tipo encontrado',
                    field_name: 'Nome',
                    field_type: 'Tipo',
                    field_actions: {
                        title: 'Atributos do Campo',
                        open_discussion: 'Abrir discussão',
                        unique: 'Único',
                        auto_increment: 'Incremento Automático',
                        comments: 'Comentários',
                        no_comments: 'Sem comentários',
                        delete_field: 'Excluir Campo',
                        // TODO: Translate
                        default_value: 'Default Value',
                        no_default: 'No default',
                        // TODO: Translate
                        character_length: 'Max Length',
                        precision: 'Precisão',
                        scale: 'Escala',
                    },
                    index_actions: {
                        title: 'Atributos do Índice',
                        name: 'Nome',
                        unique: 'Único',
                        index_type: 'Tipo de Índice',
                        delete_index: 'Excluir Índice',
                    },
                    check_constraint_actions: {
                        title: 'Restrição de verificação',
                        expression: 'Expressão',
                        delete: 'Excluir restrição',
                    },
                    table_actions: {
                        title: 'Ações da Tabela',
                        open_discussion: 'Abrir discussão',
                        change_schema: 'Alterar Esquema',
                        add_field: 'Adicionar Campo',
                        add_index: 'Adicionar Índice',
                        duplicate_table: 'Duplicate Table', // TODO: Translate
                        delete_table: 'Excluir Tabela',
                    },
                },
                empty_state: {
                    title: 'Sem tabelas',
                    description: 'Crie uma tabela para começar',
                },
            },
            refs_section: {
                refs: 'Refs',
                filter: 'Filtrar',
                collapse: 'Colapsar Todas',
                add_relationship: 'Adicionar Relacionamento',
                relationships: 'Relacionamentos',
                dependencies: 'Dependências',
                relationship: {
                    relationship: 'Relacionamento',
                    primary: 'Tabela Primária',
                    foreign: 'Tabela Relacionada',
                    cardinality: 'Cardinalidade',
                    on_delete: 'On delete',
                    on_update: 'On update',
                    delete_relationship: 'Excluir',
                    switch_tables: 'Trocar Tabelas',
                    referential_action: {
                        none: 'No action',
                        cascade: 'Cascade',
                        set_null: 'Set null',
                        restrict: 'Restrict',
                    },
                    relationship_actions: {
                        title: 'Ações',
                        open_discussion: 'Abrir discussão',
                        delete_relationship: 'Excluir',
                    },
                },
                dependency: {
                    dependency: 'Dependência',
                    table: 'Tabela',
                    dependent_table: 'Visualização Dependente',
                    delete_dependency: 'Excluir',
                    dependency_actions: {
                        title: 'Ações',
                        delete_dependency: 'Excluir',
                    },
                },
                empty_state: {
                    title: 'Sem relacionamentos',
                    description: 'Crie um relacionamento para começar',
                },
            },

            areas_section: {
                areas: 'Áreas',
                add_area: 'Adicionar Área',
                filter: 'Filtrar',
                clear: 'Limpar Filtro',
                no_results:
                    'Nenhuma área encontrada correspondente ao seu filtro.',

                area: {
                    area_actions: {
                        title: 'Ações da Área',
                        edit_name: 'Editar Nome',
                        delete_area: 'Excluir Área',
                    },
                },
                empty_state: {
                    title: 'Sem áreas',
                    description: 'Crie uma área para começar',
                },
            },

            visuals_section: {
                visuals: 'Visuais',
                tabs: {
                    areas: 'Áreas',
                    notes: 'Notas',
                },
            },

            notes_section: {
                filter: 'Filtrar',
                add_note: 'Adicionar Nota',
                no_results: 'Nenhuma nota encontrada',
                clear: 'Limpar Filtro',
                empty_state: {
                    title: 'Sem Notas',
                    description:
                        'Crie uma nota para adicionar anotações de texto na tela',
                },
                note: {
                    empty_note: 'Nota vazia',
                    note_actions: {
                        title: 'Ações de Nota',
                        edit_content: 'Editar Conteúdo',
                        delete_note: 'Excluir Nota',
                    },
                },
            },

            custom_types_section: {
                custom_types: 'Tipos Personalizados',
                filter: 'Filtrar',
                clear: 'Limpar Filtro',
                no_results:
                    'Nenhum tipo personalizado encontrado correspondente ao seu filtro.',
                new_type: 'Novo Tipo',
                empty_state: {
                    title: 'Sem tipos personalizados',
                    description:
                        'Os tipos personalizados aparecerão aqui quando estiverem disponíveis no seu banco de dados',
                },
                custom_type: {
                    kind: 'Tipo',
                    enum_values: 'Valores Enum',
                    composite_fields: 'Campos',
                    no_fields: 'Nenhum campo definido',
                    no_values: 'Nenhum valor de enum definido',
                    field_name_placeholder: 'Nome do campo',
                    field_type_placeholder: 'Selecionar tipo',
                    add_field: 'Adicionar Campo',
                    no_fields_tooltip:
                        'Nenhum campo definido para este tipo personalizado',
                    custom_type_actions: {
                        title: 'Ações',
                        highlight_fields: 'Destacar Campos',
                        delete_custom_type: 'Excluir',
                        clear_field_highlight: 'Remover Destaque',
                    },
                    delete_custom_type: 'Excluir Tipo',
                },
            },
            comments_section: {
                title: 'Discussões',
                loading: 'Carregando discussões…',
                inactive: {
                    title: 'Discussões indisponíveis',
                    description:
                        'As discussões estão disponíveis apenas em diagramas na nuvem autenticados.',
                },
                empty: {
                    title: 'Nenhuma discussão ainda',
                    description:
                        'As conversas sobre este diagrama aparecerão aqui.',
                    diagram_title: 'Ainda não há mensagens do diagrama',
                    diagram_description:
                        'As mensagens sobre o diagrama como um todo aparecerão aqui.',
                    target_title: 'Ainda não há mensagens para a seleção atual',
                    target_description:
                        'As mensagens sobre a seleção atual aparecerão aqui.',
                },
                errors: {
                    load_title: 'Não foi possível carregar as discussões',
                    load_description:
                        'Algo deu errado ao carregar as discussões. Tente novamente.',
                },
                retry: 'Tentar novamente',
                deleted_user: 'Usuário excluído',
                targets: {
                    diagram: 'Discussão do diagrama',
                    table: 'Discussão da tabela',
                    field: 'Discussão do campo',
                    relationship: 'Discussão do relacionamento',
                    unknown: 'Discussão',
                },
                views: {
                    all: 'Todas',
                    diagram: 'Diagrama',
                    current_target: 'Atual',
                },
                target_header: {
                    diagram: 'Discussão do diagrama',
                    table: 'Tabela {{name}}',
                    field: '{{table}}.{{field}}',
                    relationship: '{{name}}',
                    relationship_endpoints: '{{source}} → {{target}}',
                    missing_table: 'Tabela excluída',
                    missing_field: 'Campo excluído',
                    missing_relationship: 'Relacionamento excluído',
                },
                composer: {
                    label: 'Mensagem',
                    placeholder: 'Escreva uma mensagem de discussão…',
                    submit: 'Publicar',
                    submitting: 'Publicando…',
                    cancel: 'Cancelar',
                    form_aria_label: 'Nova mensagem de discussão',
                    counter_aria_label:
                        '{{count}} de {{max}} caracteres usados',
                    errors: {
                        empty: 'Digite uma mensagem para publicar.',
                        too_long:
                            'As mensagens não podem ter mais de 2000 caracteres.',
                        create_failed:
                            'Não foi possível publicar a mensagem. Tente novamente.',
                    },
                },
                item_actions: {
                    title: 'Ações do comentário',
                    edit: 'Editar',
                },
                edit: {
                    label: 'Mensagem',
                    form_aria_label: 'Editar mensagem da discussão',
                    save: 'Salvar',
                    saving: 'Salvando…',
                    cancel: 'Cancelar',
                    counter_aria_label:
                        '{{count}} de {{max}} caracteres usados',
                    errors: {
                        empty: 'Digite uma mensagem para salvar.',
                        too_long:
                            'As mensagens não podem exceder 2000 caracteres.',
                        update_failed:
                            'Não foi possível atualizar a mensagem. Tente novamente.',
                    },
                    remote_updated_warning:
                        'Esta mensagem foi atualizada em outro lugar. Salvar substituirá essas alterações.',
                },
            },
        },

        toolbar: {
            zoom_in: 'Aumentar Zoom',
            zoom_out: 'Diminuir Zoom',
            save: 'Salvar',
            show_all: 'Mostrar Tudo',
            undo: 'Desfazer',
            redo: 'Refazer',
            reorder_diagram: 'Organizar Diagrama Automaticamente',
            // TODO: Translate
            clear_custom_type_highlight: 'Clear highlight for "{{typeName}}"',
            custom_type_highlight_tooltip:
                'Highlighting "{{typeName}}" - Click to clear',
            highlight_overlapping_tables: 'Destacar Tabelas Sobrepostas',
            filter: 'Filtrar Tabelas',
        },

        new_diagram_dialog: {
            database_selection: {
                title: 'Qual é o seu Banco de Dados?',
                description:
                    'Cada banco de dados possui recursos e capacidades únicas.',
                check_examples_long: 'Ver Exemplos',
                check_examples_short: 'Exemplos',
            },

            import_database: {
                title: 'Importe seu Banco de Dados',
                database_edition: 'Edição do Banco de Dados:',
                step_1: 'Execute este script no seu banco de dados:',
                step_2: 'Cole o resultado do script aqui →',
                script_results_placeholder: 'Resultados do script aqui...',
                ssms_instructions: {
                    button_text: 'Instruções do SSMS',
                    title: 'Instruções',
                    step_1: 'Vá para Ferramentas > Opções > Resultados da Consulta > SQL Server.',
                    step_2: 'Se estiver usando "Resultados para Grade," altere o Máximo de Caracteres para Dados Não-XML (definido para 9999999).',
                },
                instructions_link: 'Precisa de ajuda? Veja como',
                check_script_result: 'Verificar Resultado do Script',
            },

            cancel: 'Cancelar',
            back: 'Voltar',
            // TODO: Translate
            import_from_file: 'Import from File',
            empty_diagram: 'Banco de dados vazio',
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
            title: 'Abrir Banco de Dados',
            description: 'Selecione um diagrama para abrir da lista abaixo.',
            table_columns: {
                name: 'Nome',
                created_at: 'Criado em',
                last_modified: 'Última Modificação',
                tables_count: 'Tabelas',
            },
            cancel: 'Cancelar',
            open: 'Abrir',
            new_database: 'Novo Banco de Dados',

            diagram_actions: {
                open: 'Abrir',
                duplicate: 'Duplicar',
                delete: 'Excluir',
            },
        },

        export_sql_dialog: {
            title: 'Exportar SQL',
            description:
                'Exporte o esquema do seu diagrama para o script {{databaseType}}',
            close: 'Fechar',
            loading: {
                text: 'A IA está gerando SQL para {{databaseType}}...',
                description: 'Isso pode levar até 30 segundos.',
            },
            error: {
                message:
                    'Erro ao gerar o script SQL. Tente novamente mais tarde ou <0>entre em contato conosco</0>.',
                description:
                    'Sinta-se à vontade para usar seu OPENAI_TOKEN, veja o manual <0>aqui</0>.',
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
            title: 'Criar Relacionamento',
            primary_table: 'Tabela Primária',
            primary_field: 'Campo Primário',
            referenced_table: 'Tabela Referenciada',
            referenced_field: 'Campo Referenciado',
            primary_table_placeholder: 'Selecionar tabela',
            primary_field_placeholder: 'Selecionar campo',
            referenced_table_placeholder: 'Selecionar tabela',
            referenced_field_placeholder: 'Selecionar campo',
            no_tables_found: 'Nenhuma tabela encontrada',
            no_fields_found: 'Nenhum campo encontrado',
            create: 'Criar',
            cancel: 'Cancelar',
        },

        import_database_dialog: {
            title: 'Importar para o Diagrama Atual',
            override_alert: {
                title: 'Importar Banco de Dados',
                content: {
                    alert: 'A importação deste diagrama afetará tabelas e relacionamentos existentes.',
                    new_tables:
                        '<bold>{{newTablesNumber}}</bold> novas tabelas serão adicionadas.',
                    new_relationships:
                        '<bold>{{newRelationshipsNumber}}</bold> novos relacionamentos serão criados.',
                    tables_override:
                        '<bold>{{tablesOverrideNumber}}</bold> tabelas serão sobrescritas.',
                    proceed: 'Você deseja continuar?',
                },
                import: 'Importar',
                cancel: 'Cancelar',
            },
        },

        export_image_dialog: {
            title: 'Exportar Imagem',
            description: 'Escolha o fator de escala para exportação:',
            scale_1x: '1x (Baixa Qualidade)',
            scale_2x: '2x (Qualidade Normal)',
            scale_4x: '4x (Melhor Qualidade)',
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
            title: 'Selecionar Esquema',
            description:
                'Múltiplos esquemas estão sendo exibidos. Selecione um para a nova tabela.',
            cancel: 'Cancelar',
            confirm: 'Confirmar',
        },

        update_table_schema_dialog: {
            title: 'Alterar Esquema',
            description: 'Atualizar o esquema da tabela "{{tableName}}"',
            cancel: 'Cancelar',
            confirm: 'Alterar',
        },

        create_table_schema_dialog: {
            title: 'Criar Novo Esquema',
            description:
                'Ainda não existem esquemas. Crie seu primeiro esquema para organizar suas tabelas.',
            create: 'Criar',
            cancel: 'Cancelar',
        },

        star_us_dialog: {
            title: 'Ajude-nos a melhorar!',
            description:
                'Gostaria de nos avaliar com uma estrela no GitHub? É apenas um clique!',
            close: 'Agora não',
            confirm: 'Claro!',
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
            one_to_one: 'Um para Um',
            one_to_many: 'Um para Muitos',
            many_to_one: 'Muitos para Um',
            many_to_many: 'Muitos para Muitos',
        },

        canvas_context_menu: {
            new_table: 'Nova Tabela',
            new_view: 'Nova Visualização',
            new_relationship: 'Novo Relacionamento',
            new_area: 'Nova Área',
            new_note: 'Nova Nota',
        },

        table_node_context_menu: {
            edit_table: 'Editar Tabela',
            duplicate_table: 'Duplicate Table', // TODO: Translate
            delete_table: 'Excluir Tabela',
            add_relationship: 'Add Relationship', // TODO: Translate
            move_to_area: 'Mover para Área',
            no_area: 'Sem Área',
        },

        canvas: {
            all_tables_hidden: 'Todas as tabelas estão ocultas',
            show_all_tables: 'Mostrar tudo',
        },

        canvas_filter: {
            title: 'Filtrar Tabelas',
            search_placeholder: 'Pesquisar tabelas...',
            group_by_schema: 'Agrupar por Esquema',
            group_by_area: 'Agrupar por Área',
            no_tables_found: 'Nenhuma tabela encontrada',
            empty_diagram_description: 'Crie uma tabela para começar',
            no_tables_description: 'Tente ajustar sua pesquisa ou filtro',
            clear_filter: 'Limpar filtro',
        },

        // TODO: Add translations
        snap_to_grid_tooltip: 'Snap to Grid (Hold {{key}})',

        editing_conflict: {
            one: '{{name}} também está editando isto.',
            two: '{{name1}} e {{name2}} também estão editando isto.',
            many: '{{name}} e mais {{count}} também estão editando isto.',
            fallback_name: 'Colaborador',
            last_writer_wins:
                'As alterações não estão bloqueadas. A última edição salva prevalece.',
        },

        tool_tips: {
            double_click_to_edit: 'Duplo clique para editar',
        },

        language_select: {
            change_language: 'Idioma',
        },

        on: 'Ligado',
        off: 'Desligado',
    },
};

export const pt_BRMetadata: LanguageMetadata = {
    name: 'Portuguese',
    nativeName: 'Português',
    code: 'pt_BR',
};
