export enum CreateDiagramDialogStep {
    SELECT_DATABASE = 'SELECT_DATABASE',
    CHOOSE_INTENT = 'CHOOSE_INTENT',
    IMPORT_DATABASE = 'IMPORT_DATABASE',
    IMPORT_FROM_DATABASE = 'IMPORT_FROM_DATABASE',
    SELECT_TABLES = 'SELECT_TABLES',
}

export type SelectTablesOrigin = 'schema' | 'from_database';
