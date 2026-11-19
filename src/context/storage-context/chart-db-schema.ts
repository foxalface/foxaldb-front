const chartDbDiagramStores = {
    diagrams: '++id, name, databaseType, databaseEdition, createdAt, updatedAt',
    db_tables:
        '++id, diagramId, name, schema, x, y, fields, indexes, color, createdAt, width, comment, isView, isMaterializedView, order',
    db_relationships:
        '++id, diagramId, name, sourceSchema, sourceTableId, targetSchema, targetTableId, sourceFieldId, targetFieldId, type, createdAt',
    db_dependencies:
        '++id, diagramId, schema, tableId, dependentSchema, dependentTableId, createdAt',
    areas: '++id, diagramId, name, x, y, width, height, color',
    db_custom_types: '++id, diagramId, schema, type, kind, values, fields',
    config: '++id, defaultDiagramId',
    diagram_filters: 'diagramId, tableIds, schemasIds',
    notes: '++id, diagramId, content, x, y, width, height, color',
} as const;

export const chartDbV13Stores = chartDbDiagramStores;

export const chartDbV14Stores = {
    ...chartDbDiagramStores,
    tags: '++id, diagramId, name, color',
    tag_assignments: '++id, diagramId, tagId, targetType, targetId',
} as const;

const {
    diagram_filters: _legacyDiagramFilters,
    ...chartDbStoresWithoutDiagramFilters
} = chartDbV14Stores;

export const chartDbV15Stores = {
    ...chartDbStoresWithoutDiagramFilters,
} as const;

void _legacyDiagramFilters;

export const CHART_DB_SCHEMA_VERSION = 15;
