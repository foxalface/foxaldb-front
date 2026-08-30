export type PrismaTopLevelBlockKind =
    | 'generator'
    | 'datasource'
    | 'model'
    | 'enum'
    | 'type'
    | 'unknown';

export interface PrismaSchemaDocument {
    datasourceProvider?: string;
    models: PrismaModelBlock[];
    enums: PrismaEnumBlock[];
    unsupportedBlocks: string[];
}

export interface PrismaModelBlock {
    name: string;
    mapName?: string;
    fields: PrismaFieldDefinition[];
    blockAttributes: PrismaAttribute[];
    documentation?: string;
}

export interface PrismaEnumBlock {
    name: string;
    values: PrismaEnumValue[];
    mapName?: string;
    documentation?: string;
}

export interface PrismaEnumValue {
    name: string;
    mapValue?: string;
}

export interface PrismaFieldDefinition {
    name: string;
    typeName: string;
    kind: 'scalar' | 'enum' | 'object' | 'unsupported';
    optional: boolean;
    list: boolean;
    attributes: PrismaAttribute[];
    documentation?: string;
}

export interface PrismaAttribute {
    name: string;
    args: PrismaAttributeArg[];
}

export interface PrismaAttributeArg {
    name?: string;
    value: PrismaValue;
}

export type PrismaValue =
    | string
    | number
    | boolean
    | PrismaValue[]
    | { [key: string]: PrismaValue };

export interface PrismaRelationSpec {
    modelName: string;
    fieldName: string;
    relationFieldName: string;
    fields: string[];
    references: string[];
    onDelete?: string;
    onUpdate?: string;
}
