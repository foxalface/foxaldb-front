export interface RailsColumnOptions {
    null?: boolean;
    default?: string | number | boolean | null;
    limit?: number;
    precision?: number;
    scale?: number;
    comment?: string;
    collation?: string;
    primaryKey?: boolean;
    foreignKey?: boolean | string;
}

export interface RailsColumnDefinition {
    name: string;
    type: string;
    options: RailsColumnOptions;
}

export interface RailsTableOptions {
    id?: boolean;
    primaryKey?: string;
    force?: string | boolean;
    comment?: string;
}

export interface RailsTableDefinition {
    name: string;
    options: RailsTableOptions;
    columns: RailsColumnDefinition[];
    inlineIndexes: RailsIndexDefinition[];
}

export interface RailsIndexDefinition {
    tableName: string;
    columns: string[];
    unique: boolean;
    name?: string;
}

export interface RailsForeignKeyDefinition {
    fromTable: string;
    toTable: string;
    column?: string;
    primaryKey?: string;
    onDelete?: string;
    onUpdate?: string;
    name?: string;
}

export interface RailsSchemaDocument {
    version?: string;
    tables: RailsTableDefinition[];
    indexes: RailsIndexDefinition[];
    foreignKeys: RailsForeignKeyDefinition[];
}
