export type ColumnSource =
    | 'column'
    | 'timestamps'
    | 'soft_deletes'
    | 'remember_token';

export type ForeignKeyOnDelete = 'cascade' | 'set_null' | 'restrict' | null;

export type ForeignKeyOnUpdate = 'cascade' | 'restrict' | null;

export interface ColumnSnapshot {
    name: string;
    type: string;
    nullable: boolean;
    unique: boolean;
    primary: boolean;
    autoIncrement: boolean;
    length: number | null;
    precision: number | null;
    scale: number | null;
    default: unknown;
    source: ColumnSource;
    enumValues: string[] | null;
}

export interface IndexSnapshot {
    name: string | null;
    columns: string[];
    unique: boolean;
    primary: boolean;
}

export interface TableSnapshot {
    name: string;
    columns: ColumnSnapshot[];
    indexes: IndexSnapshot[];
}

export interface ForeignKeySnapshot {
    localTable: string;
    localColumn: string;
    referencedTable: string;
    referencedColumn: string;
    constraintName: string | null;
    onDelete: ForeignKeyOnDelete;
    onUpdate: ForeignKeyOnUpdate;
}

export interface ImportWarning {
    message: string;
    relativePath: string | null;
}

export interface LaravelMigrationSchemaSnapshot {
    tables: TableSnapshot[];
    foreignKeys: ForeignKeySnapshot[];
    warnings: ImportWarning[];
    sourceFiles: string[];
}
