import {
    DBCustomTypeKind,
    type DBCustomType,
} from '@/lib/domain/db-custom-type';
import type { DBField } from '@/lib/domain/db-field';
import type { DBIndex } from '@/lib/domain/db-index';
import type { DBTable } from '@/lib/domain/db-table';
import type { Diagram } from '@/lib/domain/diagram';
import { getTableIndexesWithPrimaryKey } from '@/lib/domain/db-index';
import { mapFieldDefault } from './prisma-default-mapper';
import {
    isPrismaExportSupported,
    resolvePrismaDatasourceProvider,
} from './prisma-export-capability';
import type {
    PrismaExportError,
    PrismaExportNote,
    PrismaExportResult,
} from './prisma-export-types';
import type { PrismaExportVersion } from './prisma-export-version';
import { IdentifierAllocator } from './prisma-identifier';
import {
    buildModelRelations,
    isUnsupportedIndexType,
} from './prisma-relationship-builder';
import {
    type PrismaEnumBlock,
    type PrismaModelBlock,
    type PrismaScalarFieldLine,
    type PrismaSchemaDocument,
    writePrismaSchema,
} from './prisma-schema-writer';
import { mapFieldToPrismaType } from './prisma-type-mapper';
import { getPrismaVersionProfile } from './prisma-version-profile';

export interface GeneratePrismaSchemaFromDiagramInput {
    diagram: Diagram;
    version: PrismaExportVersion;
}

const isExportableTable = (table: DBTable): boolean =>
    !table.isView && !table.isMaterializedView;

const fieldParticipatesInStructure = (
    field: DBField,
    indexes: DBIndex[],
    relationshipFieldIds: ReadonlySet<string>
): boolean => {
    if (
        field.primaryKey ||
        field.unique ||
        relationshipFieldIds.has(field.id)
    ) {
        return true;
    }

    return indexes.some((index) => index.fieldIds.includes(field.id));
};

const buildEnumBlocks = (
    customTypes: DBCustomType[] | undefined,
    notes: PrismaExportNote[]
): PrismaEnumBlock[] => {
    const enums = (customTypes ?? [])
        .filter((customType) => customType.kind === DBCustomTypeKind.enum)
        .sort((left, right) => left.id.localeCompare(right.id));

    const blocks: PrismaEnumBlock[] = [];

    enums.forEach((customType) => {
        const values = customType.values ?? [];

        if (values.length === 0) {
            notes.push({
                code: 'enum_skipped',
                message: `Enum "${customType.name}" has no values and was omitted.`,
                path: customType.name,
            });
            return;
        }

        const enumAllocator = new IdentifierAllocator();
        const enumValueAllocator = new IdentifierAllocator();
        const enumIdentifier = enumAllocator.allocate(
            customType.name,
            'pascal',
            'Enum'
        );

        blocks.push({
            identifier: enumIdentifier.prismaName,
            physicalName: customType.name,
            values: values.map((physicalValue) => {
                const member = enumValueAllocator.allocate(
                    physicalValue,
                    'pascal',
                    'Value'
                );

                return {
                    prismaName: member.prismaName,
                    physicalValue,
                    needsMap: member.needsMap,
                };
            }),
        });
    });

    (customTypes ?? [])
        .filter((customType) => customType.kind === DBCustomTypeKind.composite)
        .forEach((customType) => {
            notes.push({
                code: 'composite_type_skipped',
                message: `Composite type "${customType.name}" is not supported in Prisma export.`,
                path: customType.name,
            });
        });

    return blocks;
};

const validatePrimaryKeys = (
    table: DBTable,
    indexes: DBIndex[]
): PrismaExportError | null => {
    const pkFields = table.fields.filter((field) => field.primaryKey);
    const pkIndex = indexes.find((index) => index.isPrimaryKey);

    if (pkFields.length === 0 && !pkIndex) {
        return null;
    }

    const pkFieldIds = new Set(
        pkFields.length > 0
            ? pkFields.map((field) => field.id)
            : (pkIndex?.fieldIds ?? [])
    );

    const fieldsMarkedPk = table.fields.filter((field) => field.primaryKey);

    if (fieldsMarkedPk.length > 1 && !pkIndex) {
        const allMarkedArePk = fieldsMarkedPk.every(
            (field) => field.primaryKey
        );

        if (allMarkedArePk && fieldsMarkedPk.length > 1) {
            return null;
        }
    }

    const contradictory = table.fields.filter(
        (field) => field.primaryKey && !pkFieldIds.has(field.id)
    );

    if (contradictory.length > 0) {
        return {
            code: 'invalid_primary_key',
            message: `Table "${table.name}" has contradictory primary key flags.`,
            path: table.name,
        };
    }

    return null;
};

const buildScalarFieldLine = (
    field: DBField,
    prismaName: string,
    physicalName: string,
    needsMap: boolean,
    enumTypeNames: ReadonlySet<string>,
    enumIdentifierByName: ReadonlyMap<string, string>,
    databaseType: Diagram['databaseType'],
    provider: NonNullable<ReturnType<typeof resolvePrismaDatasourceProvider>>,
    isPartOfCompositePk: boolean,
    fieldLevelUnique: boolean
): {
    line: PrismaScalarFieldLine | null;
    error: PrismaExportError | null;
    defaultOmitted: boolean;
} => {
    const typeMapping = mapFieldToPrismaType(
        field,
        databaseType,
        provider,
        enumTypeNames
    );

    if (typeMapping.kind === 'unsupported') {
        return { line: null, error: null, defaultOmitted: false };
    }

    const enumIdentifier = enumIdentifierByName.get(
        field.type.name.toLowerCase()
    );
    const scalarType =
        enumIdentifier ??
        enumIdentifierByName.get(field.type.id.toLowerCase()) ??
        typeMapping.scalar;

    const nullableSuffix =
        field.primaryKey || scalarType.endsWith('[]')
            ? ''
            : field.nullable
              ? '?'
              : '';

    const attributes: string[] = [];

    if (needsMap) {
        attributes.push(`@map(${JSON.stringify(physicalName)})`);
    }

    if (typeMapping.nativeAnnotation) {
        attributes.push(typeMapping.nativeAnnotation);
    }

    if (field.primaryKey && !isPartOfCompositePk) {
        attributes.push('@id');
    }

    if (fieldLevelUnique) {
        attributes.push('@unique');
    }

    const defaultMapping = mapFieldDefault(field, typeMapping);
    const defaultOmitted =
        Boolean(field.default?.trim()) && defaultMapping.kind === 'omitted';

    if (defaultMapping.kind === 'value') {
        attributes.push(defaultMapping.expression);
    }

    return {
        line: {
            prismaName,
            physicalName,
            typeExpression: `${scalarType}${nullableSuffix}`,
            attributes,
            ...(field.comments ? { documentation: field.comments } : {}),
        },
        error: null,
        defaultOmitted,
    };
};

const buildModelBlocks = (
    diagram: Diagram,
    provider: NonNullable<ReturnType<typeof resolvePrismaDatasourceProvider>>,
    notes: PrismaExportNote[],
    enumBlocks: PrismaEnumBlock[]
): { models: PrismaModelBlock[]; error: PrismaExportError | null } => {
    const tables = (diagram.tables ?? [])
        .filter(isExportableTable)
        .sort((left, right) => left.id.localeCompare(right.id));

    const enumTypeNames = new Set(
        enumBlocks.flatMap((enumBlock) => [
            enumBlock.identifier,
            enumBlock.physicalName,
        ])
    );
    const enumIdentifierByName = new Map(
        enumBlocks.flatMap((enumBlock) => [
            [enumBlock.physicalName.toLowerCase(), enumBlock.identifier],
            [enumBlock.identifier.toLowerCase(), enumBlock.identifier],
        ])
    );

    const relationshipFieldIds = new Set(
        (diagram.relationships ?? []).flatMap((relationship) => [
            relationship.sourceFieldId,
            relationship.targetFieldId,
        ])
    );

    const modelIdentifiers = new Map<string, string>();
    const modelAllocations = new Map<
        string,
        ReturnType<IdentifierAllocator['allocate']>
    >();
    const fieldPrismaNamesByTable = new Map<string, Map<string, string>>();
    const modelAllocator = new IdentifierAllocator();

    tables.forEach((table) => {
        if (table.schema) {
            notes.push({
                code: 'schema_namespace_unsupported',
                message: `Table "${table.name}" schema "${table.schema}" is not exported to Prisma @@schema in V1.`,
                path: table.name,
            });
        }

        const allocated = modelAllocator.allocate(
            table.name,
            'pascal',
            'Model'
        );
        modelIdentifiers.set(table.id, allocated.prismaName);
        modelAllocations.set(table.id, allocated);
    });

    const scalarModels: PrismaModelBlock[] = [];

    for (const table of tables) {
        const indexes = getTableIndexesWithPrimaryKey({ table });
        const pkError = validatePrimaryKeys(table, indexes);

        if (pkError) {
            return { models: [], error: pkError };
        }

        const pkIndex = indexes.find((index) => index.isPrimaryKey);
        const compositePkFieldIds = new Set(pkIndex?.fieldIds ?? []);
        const isCompositePk = compositePkFieldIds.size > 1;

        const fieldAllocator = new IdentifierAllocator();
        const fieldPrismaNames = new Map<string, string>();
        const scalarFields: PrismaScalarFieldLine[] = [];
        const coveredUniqueFieldIds = new Set<string>();

        indexes.forEach((index) => {
            if (index.unique && index.fieldIds.length === 1) {
                coveredUniqueFieldIds.add(index.fieldIds[0]);
            }
        });

        for (const field of table.fields) {
            const allocated = fieldAllocator.allocate(
                field.name,
                'camel',
                'field'
            );
            fieldPrismaNames.set(field.id, allocated.prismaName);

            const fieldLevelUnique =
                field.unique &&
                !field.primaryKey &&
                !coveredUniqueFieldIds.has(field.id);

            const { line, error, defaultOmitted } = buildScalarFieldLine(
                field,
                allocated.prismaName,
                field.name,
                allocated.needsMap,
                enumTypeNames,
                enumIdentifierByName,
                diagram.databaseType,
                provider,
                isCompositePk && compositePkFieldIds.has(field.id),
                fieldLevelUnique
            );

            if (error) {
                return { models: [], error };
            }

            if (!line) {
                if (
                    fieldParticipatesInStructure(
                        field,
                        indexes,
                        relationshipFieldIds
                    )
                ) {
                    return {
                        models: [],
                        error: {
                            code: 'unsupported_structural_field',
                            message: `Field "${table.name}.${field.name}" uses an unsupported type required by keys, indexes, or relations.`,
                            path: `${table.name}.${field.name}`,
                        },
                    };
                }

                notes.push({
                    code: 'unsupported_field_omitted',
                    message: `Field "${table.name}.${field.name}" was omitted because its type is unsupported in Prisma export.`,
                    path: `${table.name}.${field.name}`,
                });
                continue;
            }

            if (defaultOmitted) {
                notes.push({
                    code: 'unsupported_default_omitted',
                    message: `Default on "${table.name}.${field.name}" was omitted.`,
                    path: `${table.name}.${field.name}`,
                });
            }

            scalarFields.push(line);
        }

        fieldPrismaNamesByTable.set(table.id, fieldPrismaNames);

        const blockAttributes: string[] = [];

        if (isCompositePk && pkIndex) {
            const pkNames = pkIndex.fieldIds
                .map((fieldId) => fieldPrismaNames.get(fieldId))
                .filter((name): name is string => Boolean(name));

            if (pkNames.length === pkIndex.fieldIds.length) {
                blockAttributes.push(`@@id([${pkNames.join(', ')}])`);
            }
        }

        const emittedUniqueIndexes = new Set<string>();

        indexes.forEach((index) => {
            if (index.isPrimaryKey) {
                return;
            }

            if (isUnsupportedIndexType(index.type)) {
                notes.push({
                    code: 'unsupported_index_omitted',
                    message: `Index "${index.name || index.id}" on "${table.name}" uses an unsupported index type.`,
                    path: table.name,
                });
                return;
            }

            const fieldNames = index.fieldIds
                .map((fieldId) => fieldPrismaNames.get(fieldId))
                .filter((name): name is string => Boolean(name));

            if (fieldNames.length !== index.fieldIds.length) {
                return;
            }

            const signature = `${index.unique ? 'unique' : 'index'}:${fieldNames.join(',')}`;

            if (emittedUniqueIndexes.has(signature)) {
                return;
            }

            if (index.unique) {
                if (
                    fieldNames.length === 1 &&
                    coveredUniqueFieldIds.has(index.fieldIds[0])
                ) {
                    const field = table.fields.find(
                        (entry) => entry.id === index.fieldIds[0]
                    );

                    if (field?.unique) {
                        return;
                    }
                }

                const nameAttribute =
                    index.name.trim().length > 0
                        ? `, name: ${JSON.stringify(index.name)}`
                        : '';

                blockAttributes.push(
                    `@@unique([${fieldNames.join(', ')}]${nameAttribute})`
                );
            } else {
                const nameAttribute =
                    index.name.trim().length > 0
                        ? `, name: ${JSON.stringify(index.name)}`
                        : '';

                blockAttributes.push(
                    `@@index([${fieldNames.join(', ')}]${nameAttribute})`
                );
            }

            emittedUniqueIndexes.add(signature);
        });

        const modelIdentifier = modelIdentifiers.get(table.id) ?? table.name;
        const allocatedModel = modelAllocations.get(table.id);

        scalarModels.push({
            identifier: modelIdentifier,
            physicalName: table.name,
            needsTableMap:
                allocatedModel?.needsMap ?? modelIdentifier !== table.name,
            scalarFields,
            relationFields: [],
            blockAttributes,
            ...(table.comments ? { documentation: table.comments } : {}),
        });
    }

    const relationPlans = buildModelRelations(
        tables,
        diagram.relationships ?? [],
        modelIdentifiers,
        fieldPrismaNamesByTable,
        notes
    );

    const models = scalarModels.map((model) => {
        const table = tables.find(
            (entry) => modelIdentifiers.get(entry.id) === model.identifier
        );

        if (!table) {
            return model;
        }

        const relationPlan = relationPlans.get(table.id);

        return {
            ...model,
            relationFields: (relationPlan?.relationFields ?? [])
                .sort((left, right) =>
                    left.prismaName.localeCompare(right.prismaName)
                )
                .map((field) => ({
                    prismaName: field.prismaName,
                    typeExpression: field.typeExpression,
                    attributes: field.attributes,
                })),
        };
    });

    return { models, error: null };
};

export const generatePrismaSchemaFromDiagram = (
    input: GeneratePrismaSchemaFromDiagramInput
): PrismaExportResult => {
    const { diagram, version } = input;

    if (!isPrismaExportSupported(diagram.databaseType)) {
        return {
            success: false,
            error: {
                code: 'unsupported_database',
                message: `Prisma export is not supported for database type "${diagram.databaseType}".`,
            },
        };
    }

    const provider = resolvePrismaDatasourceProvider(diagram.databaseType);

    if (!provider) {
        return {
            success: false,
            error: {
                code: 'unsupported_database',
                message: `Prisma export is not supported for database type "${diagram.databaseType}".`,
            },
        };
    }

    const exportableTables = (diagram.tables ?? []).filter(isExportableTable);

    (diagram.tables ?? []).forEach((table) => {
        if (table.isView || table.isMaterializedView) {
            return;
        }
    });

    if (exportableTables.length === 0) {
        return {
            success: false,
            error: {
                code: 'empty_diagram',
                message: 'Diagram has no exportable tables.',
            },
        };
    }

    const notes: PrismaExportNote[] = [];

    (diagram.tables ?? []).forEach((table) => {
        if (table.isView || table.isMaterializedView) {
            notes.push({
                code: 'view_skipped',
                message: `Skipped view "${table.name}".`,
                path: table.name,
            });
        }
    });

    const enumBlocks = buildEnumBlocks(diagram.customTypes, notes);
    const { models, error } = buildModelBlocks(
        diagram,
        provider,
        notes,
        enumBlocks
    );

    if (error) {
        return {
            success: false,
            error,
        };
    }

    const profile = getPrismaVersionProfile(version);
    const document: PrismaSchemaDocument = {
        enums: enumBlocks,
        models,
        notes,
    };

    const schema = writePrismaSchema(document, profile, provider);

    return {
        success: true,
        schema,
        notes,
    };
};

export {
    buildPrismaExportFilename,
    PRISMA_EXPORT_FILENAME,
} from './build-prisma-export-filename';
