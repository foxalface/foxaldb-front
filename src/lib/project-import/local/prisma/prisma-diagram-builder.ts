import { defaultTableColor } from '@/lib/colors';
import type { DataType } from '@/lib/data/data-types/data-types';
import { DatabaseType } from '@/lib/domain/database-type';
import type { Diagram } from '@/lib/domain/diagram';
import type { DBField } from '@/lib/domain/db-field';
import type { DBIndex } from '@/lib/domain/db-index';
import type { DBRelationship } from '@/lib/domain/db-relationship';
import type { DBTable } from '@/lib/domain/db-table';
import { buildRelationshipReferentialActions } from '@/lib/domain/foreign-key-referential-action';
import {
    DBCustomTypeKind,
    type DBCustomType,
} from '@/lib/domain/db-custom-type';
import { generateDiagramId } from '@/lib/utils';
import type {
    PrismaAttribute,
    PrismaFieldDefinition,
    PrismaModelBlock,
    PrismaRelationSpec,
    PrismaSchemaDocument,
} from './prisma-ast';
import {
    mapEnumFieldType,
    mapPrismaScalarToDataType,
    parseNativeDbAttribute,
} from './prisma-type-mapper';
import type { ProjectImportDiagnostic } from '../../project-execution-types';

export interface PrismaDiagramBuildResult {
    diagram: Diagram;
    diagnostics: ProjectImportDiagnostic[];
}

const stableId = (namespace: string, ...parts: string[]): string => {
    const input = [namespace, ...parts].join('\0');
    const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
    let hash = 2166136261;

    for (let index = 0; index < input.length; index += 1) {
        hash ^= input.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }

    let value = hash >>> 0;
    let id = '';

    for (let index = 0; index < 25; index += 1) {
        id += alphabet[value % 36];
        value = Math.imul(hash, 16777619) ^ (value >>> 7);
    }

    return id;
};

export const getPhysicalTableName = (model: PrismaModelBlock): string =>
    model.mapName ?? model.name;

export const getPhysicalFieldName = (field: PrismaFieldDefinition): string => {
    const mapAttribute = field.attributes.find(
        (attribute) => attribute.name === '@map'
    );
    const mapped = readSingleStringArg(mapAttribute);

    return mapped ?? field.name;
};

const readSingleStringArg = (
    attribute?: PrismaAttribute
): string | undefined => {
    const value = attribute?.args[0]?.value;

    return typeof value === 'string' ? value : undefined;
};

const readStringArrayArg = (
    attribute: PrismaAttribute,
    argName: string
): string[] => {
    const named = attribute.args.find((arg) => arg.name === argName);

    if (!named || !Array.isArray(named.value)) {
        return [];
    }

    return named.value.filter(
        (entry): entry is string => typeof entry === 'string'
    );
};

const readNamedStringArg = (
    attribute: PrismaAttribute,
    argName: string
): string | undefined => {
    const named = attribute.args.find((arg) => arg.name === argName);
    const value = named?.value;

    return typeof value === 'string' ? value : undefined;
};

const addDiagnostic = (
    diagnostics: ProjectImportDiagnostic[],
    severity: ProjectImportDiagnostic['severity'],
    code: string,
    message: string,
    path?: string
): void => {
    diagnostics.push({ severity, code, message, ...(path ? { path } : {}) });
};

export const buildDiagramFromPrismaSchema = (
    document: PrismaSchemaDocument,
    targetDatabaseType: DatabaseType,
    rootPath: string
): PrismaDiagramBuildResult => {
    const diagnostics: ProjectImportDiagnostic[] = [];

    if (
        document.datasourceProvider &&
        !providersAreCompatible(document.datasourceProvider, targetDatabaseType)
    ) {
        addDiagnostic(
            diagnostics,
            'warning',
            'prisma_datasource_mismatch',
            `Datasource provider "${document.datasourceProvider}" differs from selected target database.`,
            'schema.prisma'
        );
    }

    const customTypes: DBCustomType[] = document.enums.map((enumBlock) => ({
        id: stableId('enum', enumBlock.name),
        name: enumBlock.name,
        kind: DBCustomTypeKind.enum,
        values: enumBlock.values.map((value) => value.mapValue ?? value.name),
        order: null,
        schema: null,
    }));

    const modelByName = new Map(
        document.models.map((model) => [model.name, model])
    );
    const relationSpecs: PrismaRelationSpec[] = [];
    const tables: DBTable[] = [];

    document.models.forEach((model, modelIndex) => {
        const tableName = getPhysicalTableName(model);
        const fields: DBField[] = [];

        model.fields.forEach((field) => {
            if (field.kind === 'object' || field.list) {
                const relationAttribute = field.attributes.find(
                    (attribute) => attribute.name === '@relation'
                );

                if (relationAttribute) {
                    relationSpecs.push({
                        modelName: model.name,
                        fieldName: field.name,
                        relationFieldName: field.name,
                        fields: readStringArrayArg(relationAttribute, 'fields'),
                        references: readStringArrayArg(
                            relationAttribute,
                            'references'
                        ),
                        onDelete: readNamedStringArg(
                            relationAttribute,
                            'onDelete'
                        ),
                        onUpdate: readNamedStringArg(
                            relationAttribute,
                            'onUpdate'
                        ),
                    });
                } else if (field.kind === 'object') {
                    addDiagnostic(
                        diagnostics,
                        'warning',
                        'prisma_implicit_relation_ignored',
                        `Implicit relation "${model.name}.${field.name}" was omitted.`,
                        `model ${model.name}`
                    );
                }

                return;
            }

            if (field.kind === 'unsupported') {
                addDiagnostic(
                    diagnostics,
                    'warning',
                    'prisma_unsupported_construct',
                    `Unsupported field type on "${model.name}.${field.name}".`,
                    `model ${model.name}`
                );
                return;
            }

            const physicalName = getPhysicalFieldName(field);
            const nativeAttribute = field.attributes.find((attribute) =>
                attribute.name.startsWith('@db.')
            );
            const nativeType = parseNativeDbAttribute(nativeAttribute);

            if (nativeAttribute && !nativeType) {
                addDiagnostic(
                    diagnostics,
                    'warning',
                    'prisma_unsupported_native_type',
                    `Unsupported native type on "${model.name}.${field.name}".`,
                    `model ${model.name}`
                );
            }

            let dataType: DataType;
            let length: string | undefined;
            let precision: number | undefined;
            let scale: number | undefined;

            if (field.kind === 'enum') {
                dataType = mapEnumFieldType(field.typeName, targetDatabaseType);
            } else {
                const mapped = mapPrismaScalarToDataType(
                    field.typeName,
                    targetDatabaseType,
                    nativeType
                );
                dataType = mapped.dataType;
                length = mapped.length;
                precision = mapped.precision;
                scale = mapped.scale;
            }

            const defaultAttribute = field.attributes.find(
                (attribute) => attribute.name === '@default'
            );
            const defaultValue = parseDefaultValue(
                defaultAttribute,
                diagnostics,
                model.name,
                field.name
            );

            fields.push({
                id: stableId('field', tableName, physicalName),
                name: physicalName,
                type: dataType,
                primaryKey: field.attributes.some(
                    (attribute) => attribute.name === '@id'
                ),
                unique: field.attributes.some(
                    (attribute) => attribute.name === '@unique'
                ),
                nullable: field.optional,
                increment: isAutoIncrementDefault(defaultAttribute),
                createdAt: 0,
                ...(length ? { characterMaximumLength: length } : {}),
                ...(precision !== undefined ? { precision } : {}),
                ...(scale !== undefined ? { scale } : {}),
                ...(defaultValue ? { default: defaultValue } : {}),
                ...(field.documentation
                    ? { comments: field.documentation }
                    : {}),
            });
        });

        applyCompositePrimaryKey(model, fields);
        const indexes = buildIndexes(model, fields, tableName);

        tables.push({
            id: stableId('table', tableName),
            name: tableName,
            schema: null,
            x: 100 + (modelIndex % 4) * 320,
            y: 100 + Math.floor(modelIndex / 4) * 280,
            fields,
            indexes,
            color: defaultTableColor,
            isView: false,
            createdAt: 0,
            ...(model.documentation ? { comments: model.documentation } : {}),
        });
    });

    const relationships = buildRelationships(
        relationSpecs,
        modelByName,
        tables,
        diagnostics
    );

    for (const unsupported of document.unsupportedBlocks) {
        addDiagnostic(
            diagnostics,
            'warning',
            'prisma_composite_type_ignored',
            `Unsupported construct "${unsupported}" was ignored.`,
            'schema.prisma'
        );
    }

    return {
        diagram: {
            id: generateDiagramId(),
            name: buildDiagramName(rootPath),
            databaseType: targetDatabaseType,
            tables,
            relationships,
            customTypes,
            dependencies: [],
            areas: [],
            notes: [],
            createdAt: new Date(0),
            updatedAt: new Date(0),
        },
        diagnostics,
    };
};

const buildRelationships = (
    relationSpecs: PrismaRelationSpec[],
    modelByName: Map<string, PrismaModelBlock>,
    tables: DBTable[],
    diagnostics: ProjectImportDiagnostic[]
): DBRelationship[] => {
    const relationships: DBRelationship[] = [];
    const tableByName = new Map(tables.map((table) => [table.name, table]));

    relationSpecs.forEach((spec) => {
        const sourceModel = modelByName.get(spec.modelName);

        if (!sourceModel) {
            return;
        }

        const sourceTableName = getPhysicalTableName(sourceModel);
        const sourceTable = tableByName.get(sourceTableName);

        if (!sourceTable) {
            return;
        }

        const relationField = sourceModel.fields.find(
            (field) => field.name === spec.relationFieldName
        );
        const targetModel = modelByName.get(relationField?.typeName ?? '');

        if (!targetModel) {
            addDiagnostic(
                diagnostics,
                'warning',
                'prisma_unresolved_relation',
                `Could not resolve relation target for "${spec.modelName}.${spec.relationFieldName}".`,
                `model ${spec.modelName}`
            );
            return;
        }

        const targetTableName = getPhysicalTableName(targetModel);
        const targetTable = tableByName.get(targetTableName);

        if (!targetTable) {
            addDiagnostic(
                diagnostics,
                'warning',
                'prisma_unresolved_relation',
                `Could not resolve relation table for "${spec.modelName}.${spec.relationFieldName}".`,
                `model ${spec.modelName}`
            );
            return;
        }

        if (spec.fields.length === 0 || spec.references.length === 0) {
            addDiagnostic(
                diagnostics,
                'warning',
                'prisma_implicit_relation_ignored',
                `Relation "${spec.modelName}.${spec.relationFieldName}" has no scalar fields.`,
                `model ${spec.modelName}`
            );
            return;
        }

        spec.fields.forEach((sourceFieldName, index) => {
            const targetFieldName = spec.references[index];
            const sourceModelField = sourceModel.fields.find(
                (field) => field.name === sourceFieldName
            );
            const targetModelField = targetModel.fields.find(
                (field) => field.name === targetFieldName
            );

            if (!sourceModelField || !targetModelField) {
                addDiagnostic(
                    diagnostics,
                    'warning',
                    'prisma_unresolved_field',
                    `Could not resolve relation fields for "${spec.modelName}.${spec.relationFieldName}".`,
                    `model ${spec.modelName}`
                );
                return;
            }

            const sourcePhysical = getPhysicalFieldName(sourceModelField);
            const targetPhysical = getPhysicalFieldName(targetModelField);
            const sourceFieldId = stableId(
                'field',
                sourceTableName,
                sourcePhysical
            );
            const targetFieldId = stableId(
                'field',
                targetTableName,
                targetPhysical
            );

            relationships.push({
                id: stableId(
                    'relationship',
                    sourceTableName,
                    sourcePhysical,
                    targetTableName,
                    targetPhysical
                ),
                name: `${sourceTableName}_${sourcePhysical}_fk`,
                sourceTableId: sourceTable.id,
                targetTableId: targetTable.id,
                sourceFieldId,
                targetFieldId,
                sourceCardinality: 'many',
                targetCardinality: 'one',
                createdAt: 0,
                ...buildRelationshipReferentialActions(
                    spec.onDelete,
                    spec.onUpdate
                ),
            });
        });
    });

    return relationships;
};

const applyCompositePrimaryKey = (
    model: PrismaModelBlock,
    fields: DBField[]
): void => {
    const compositePk = model.blockAttributes.find(
        (attribute) => attribute.name === '@@id'
    );

    if (!compositePk) {
        return;
    }

    readCompositeFieldNames(compositePk).forEach((fieldName) => {
        const modelField = model.fields.find(
            (field) => field.name === fieldName
        );
        const physicalName = modelField
            ? getPhysicalFieldName(modelField)
            : fieldName;
        const field = fields.find((entry) => entry.name === physicalName);

        if (field) {
            field.primaryKey = true;
        }
    });
};

const buildIndexes = (
    model: PrismaModelBlock,
    fields: DBField[],
    tableName: string
): DBIndex[] => {
    const indexes: DBIndex[] = [];
    const fieldByPhysicalName = new Map(
        fields.map((field) => [field.name, field])
    );
    const pkFields = fields.filter((field) => field.primaryKey);

    if (pkFields.length > 0) {
        indexes.push({
            id: stableId('index', tableName, 'pk'),
            name: '',
            unique: true,
            fieldIds: pkFields.map((field) => field.id),
            isPrimaryKey: true,
            createdAt: 0,
        });
    }

    model.blockAttributes.forEach((attribute, attributeIndex) => {
        if (attribute.name === '@@unique') {
            const fieldIds = resolveFieldIds(
                model,
                readCompositeFieldNames(attribute),
                fieldByPhysicalName
            );

            if (fieldIds.length > 0) {
                indexes.push({
                    id: stableId(
                        'index',
                        tableName,
                        `unique-${attributeIndex}`
                    ),
                    name: readNamedStringArg(attribute, 'name') ?? '',
                    unique: true,
                    fieldIds,
                    createdAt: 0,
                });
            }
        }

        if (attribute.name === '@@index') {
            const fieldIds = resolveFieldIds(
                model,
                readCompositeFieldNames(attribute),
                fieldByPhysicalName
            );

            if (fieldIds.length > 0) {
                indexes.push({
                    id: stableId('index', tableName, `index-${attributeIndex}`),
                    name: readNamedStringArg(attribute, 'name') ?? '',
                    unique: false,
                    fieldIds,
                    createdAt: 0,
                });
            }
        }
    });

    fields
        .filter((field) => field.unique && !field.primaryKey)
        .forEach((field) => {
            indexes.push({
                id: stableId('index', tableName, `field-unique-${field.name}`),
                name: '',
                unique: true,
                fieldIds: [field.id],
                createdAt: 0,
            });
        });

    return indexes;
};

const readCompositeFieldNames = (attribute: PrismaAttribute): string[] => {
    const positional = attribute.args.find((arg) => Array.isArray(arg.value));

    if (positional && Array.isArray(positional.value)) {
        return positional.value.filter(
            (entry): entry is string => typeof entry === 'string'
        );
    }

    const named = attribute.args.find((arg) => arg.name === 'fields');

    if (named && Array.isArray(named.value)) {
        return named.value.filter(
            (entry): entry is string => typeof entry === 'string'
        );
    }

    return [];
};

const resolveFieldIds = (
    model: PrismaModelBlock,
    prismaFieldNames: string[],
    fieldByPhysicalName: Map<string, DBField>
): string[] => {
    const ids: string[] = [];

    prismaFieldNames.forEach((fieldName) => {
        const modelField = model.fields.find(
            (field) => field.name === fieldName
        );
        const physicalName = modelField
            ? getPhysicalFieldName(modelField)
            : fieldName;
        const field = fieldByPhysicalName.get(physicalName);

        if (field) {
            ids.push(field.id);
        }
    });

    return ids;
};

const parseDefaultValue = (
    attribute: PrismaAttribute | undefined,
    diagnostics: ProjectImportDiagnostic[],
    modelName: string,
    fieldName: string
): string | undefined => {
    if (!attribute) {
        return undefined;
    }

    const value = attribute.args[0]?.value;

    if (typeof value === 'string') {
        if (['autoincrement', 'uuid', 'cuid', 'now'].includes(value)) {
            return undefined;
        }

        if (value.startsWith('dbgenerated') || value.startsWith('sequence')) {
            addDiagnostic(
                diagnostics,
                'warning',
                'prisma_dynamic_default_ignored',
                `Dynamic default on "${modelName}.${fieldName}" was ignored.`,
                `model ${modelName}`
            );
            return undefined;
        }

        return value;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }

    addDiagnostic(
        diagnostics,
        'warning',
        'prisma_dynamic_default_ignored',
        `Unsupported default on "${modelName}.${fieldName}" was ignored.`,
        `model ${modelName}`
    );

    return undefined;
};

const isAutoIncrementDefault = (attribute?: PrismaAttribute): boolean =>
    attribute?.args[0]?.value === 'autoincrement';

const providersAreCompatible = (
    provider: string,
    targetDatabaseType: DatabaseType
): boolean => {
    const normalized = provider.trim().toLowerCase();

    switch (targetDatabaseType) {
        case DatabaseType.MYSQL:
        case DatabaseType.MARIADB:
            return normalized === 'mysql';
        case DatabaseType.POSTGRESQL:
            return normalized === 'postgresql';
        case DatabaseType.SQLITE:
            return normalized === 'sqlite';
        case DatabaseType.SQL_SERVER:
            return normalized === 'sqlserver';
        case DatabaseType.ORACLE:
            return normalized === 'oracle';
        default:
            return true;
    }
};

export const buildDiagramName = (rootPath: string): string => {
    const segments = rootPath.split('/').filter(Boolean);
    const basename = segments[segments.length - 1];

    return basename ? `${basename} Import` : 'Prisma Import';
};
