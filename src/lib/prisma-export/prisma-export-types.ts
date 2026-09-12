export type PrismaExportNoteCode =
    | 'view_skipped'
    | 'schema_namespace_unsupported'
    | 'unsupported_field_omitted'
    | 'unsupported_default_omitted'
    | 'unsupported_index_omitted'
    | 'relation_skipped'
    | 'relation_degraded'
    | 'composite_fk_unsupported'
    | 'many_to_many_label_only'
    | 'set_null_omitted'
    | 'enum_skipped'
    | 'composite_type_skipped';

export interface PrismaExportNote {
    code: PrismaExportNoteCode;
    message: string;
    path?: string;
}

export type PrismaExportErrorCode =
    | 'unsupported_database'
    | 'empty_diagram'
    | 'invalid_primary_key'
    | 'unsupported_structural_field'
    | 'invalid_enum';

export interface PrismaExportError {
    code: PrismaExportErrorCode;
    message: string;
    path?: string;
}

export interface PrismaExportSuccess {
    success: true;
    schema: string;
    notes: PrismaExportNote[];
}

export interface PrismaExportFailure {
    success: false;
    error: PrismaExportError;
}

export type PrismaExportResult = PrismaExportSuccess | PrismaExportFailure;
