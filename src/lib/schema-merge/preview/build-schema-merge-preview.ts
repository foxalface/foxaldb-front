import type { Diagram } from '@/lib/domain/diagram';
import type { DBField } from '@/lib/domain/db-field';
import type { DBRelationship } from '@/lib/domain/db-relationship';
import type { DBTable } from '@/lib/domain/db-table';
import { snapshotMergeBaseDiagram } from '../snapshot-merge-base-diagram';
import type {
    DiffOperation,
    FieldIdentity,
    RelationshipIdentity,
    TableIdentity,
    ViewIdentity,
} from '../diff-types';
import {
    applyFieldAttributeChange,
    applyRelationshipAttributeChange,
    applyTableAttributeChange,
    extractCustomTypeFromFieldTypeChange,
} from './apply-preview-attributes';
import {
    fieldExistsOnTable,
    findIncomingField,
    findIncomingRelationship,
    findIncomingTable,
    findIncomingView,
} from './incoming-lookup';
import {
    fieldIdentityFromParts,
    fieldIdentityKey,
    semanticIdentityKey,
    tableIdentityKey,
    viewIdentityKey,
} from './identity-key';
import {
    createPreviewIdentityRegistry,
    registerTableRenameAliases,
} from './preview-identity-registry';
import type { PreviewIdentityRegistry } from './preview-identity-registry';
import { transformRelationshipIdentityForIncoming } from './transform-relationship-identity-for-incoming';
import {
    createPreviewPlacementState,
    defaultPreviewTableWidth,
    nextPreviewTablePosition,
} from './preview-placement';
import {
    previewFieldId,
    previewRelationshipId,
    previewTableId,
} from './preview-id';
import type {
    BuildSchemaMergePreviewInput,
    MergeChangeVisual,
    MergePreviewDecorations,
    SchemaMergePreviewResult,
} from './preview-types';
import { emptyMergePreviewDecorations } from './preview-types';

const cloneField = (field: DBField, id: string): DBField => ({
    ...structuredClone(field),
    id,
});

const cloneTableFromIncoming = (
    incoming: DBTable,
    tableId: string,
    position: { x: number; y: number },
    fieldIdFor: (identity: FieldIdentity) => string
): DBTable => ({
    ...structuredClone(incoming),
    id: tableId,
    x: position.x,
    y: position.y,
    width: incoming.width ?? defaultPreviewTableWidth(),
    fields: incoming.fields.map((field) => {
        const identity = fieldIdentityFromParts(
            incoming.schema ?? null,
            incoming.name,
            field.name
        );

        return cloneField(field, fieldIdFor(identity));
    }),
    indexes: structuredClone(incoming.indexes),
    checkConstraints: incoming.checkConstraints
        ? structuredClone(incoming.checkConstraints)
        : incoming.checkConstraints,
});

const setDecoration = (
    decorations: MergePreviewDecorations,
    category: DiffOperation['category'],
    id: string,
    visual: MergeChangeVisual
): void => {
    switch (category) {
        case 'table':
        case 'view':
            decorations.tables[id] = visual;
            break;
        case 'field':
            decorations.fields[id] = visual;
            break;
        case 'relationship':
            decorations.relationships[id] = visual;
            break;
        default:
            break;
    }
};

const findTableByEntityId = (
    diagram: Diagram,
    entityId: string
): DBTable | null =>
    (diagram.tables ?? []).find((table) => table.id === entityId) ?? null;

const findFieldByEntityId = (
    diagram: Diagram,
    entityId: string
): { table: DBTable; field: DBField } | null => {
    for (const table of diagram.tables ?? []) {
        const field = table.fields.find(
            (candidate) => candidate.id === entityId
        );

        if (field) {
            return { table, field };
        }
    }

    return null;
};

const findRelationshipByEntityId = (
    diagram: Diagram,
    entityId: string
): DBRelationship | null =>
    (diagram.relationships ?? []).find(
        (relationship) => relationship.id === entityId
    ) ?? null;

const findTableByEntityIdInDiagram = (
    diagram: Diagram,
    tableId: string
): DBTable | null =>
    (diagram.tables ?? []).find((table) => table.id === tableId) ?? null;

const resolveRelationshipFieldIds = (
    registry: PreviewIdentityRegistry,
    identity: RelationshipIdentity
): { sourceFieldId: string; targetFieldId: string } | null => {
    const sourceFieldId = registry.resolveFieldEndpoint(identity.source);
    const targetFieldId = registry.resolveFieldEndpoint(identity.target);

    if (!sourceFieldId || !targetFieldId) {
        return null;
    }

    return { sourceFieldId, targetFieldId };
};

const ensureCustomTypeFromIncoming = (
    diagram: Diagram,
    incomingDiagram: Diagram,
    customTypePayload: Record<string, unknown>
): void => {
    const name =
        typeof customTypePayload.name === 'string'
            ? customTypePayload.name
            : '';
    const schema =
        typeof customTypePayload.schema === 'string'
            ? customTypePayload.schema
            : customTypePayload.schema === null
              ? null
              : undefined;

    if (name.length === 0) {
        return;
    }

    const exists = (diagram.customTypes ?? []).some(
        (type) =>
            type.name === name && (type.schema ?? null) === (schema ?? null)
    );

    if (exists) {
        return;
    }

    const incoming = (incomingDiagram.customTypes ?? []).find(
        (type) =>
            type.name === name && (type.schema ?? null) === (schema ?? null)
    );

    if (!incoming) {
        return;
    }

    diagram.customTypes = [
        ...(diagram.customTypes ?? []),
        structuredClone(incoming),
    ];
};

const selectedOperations = (
    operations: readonly DiffOperation[],
    selectedOperationIds: ReadonlySet<string>
): DiffOperation[] =>
    operations.filter((operation) => selectedOperationIds.has(operation.id));

const byCategoryThenId = (
    left: DiffOperation,
    right: DiffOperation
): number => {
    const order = ['table', 'view', 'field', 'relationship'];
    const leftIndex = order.indexOf(left.category);
    const rightIndex = order.indexOf(right.category);

    if (leftIndex !== rightIndex) {
        return leftIndex - rightIndex;
    }

    return left.id.localeCompare(right.id);
};

export const buildSchemaMergePreview = (
    input: BuildSchemaMergePreviewInput
): SchemaMergePreviewResult => {
    const diagram = snapshotMergeBaseDiagram(input.baseDiagram);
    const decorations = emptyMergePreviewDecorations();

    if (input.selectedOperationIds.size === 0) {
        return { diagram, decorations };
    }

    const selected = selectedOperations(
        input.operations,
        input.selectedOperationIds
    );

    const identityRegistry = createPreviewIdentityRegistry(diagram);

    let placement = createPreviewPlacementState(diagram.tables ?? []);

    const tableRenames = selected.filter(
        (operation) =>
            (operation.category === 'table' || operation.category === 'view') &&
            operation.type === 'rename'
    );
    const fieldRenames = selected.filter(
        (operation) =>
            operation.category === 'field' && operation.type === 'rename'
    );
    const tableAdds = selected.filter(
        (operation) =>
            (operation.category === 'table' || operation.category === 'view') &&
            operation.type === 'add'
    );
    const fieldAdds = selected.filter(
        (operation) =>
            operation.category === 'field' && operation.type === 'add'
    );
    const modifies = selected.filter(
        (operation) =>
            operation.type === 'modify' && operation.category !== 'relationship'
    );
    const relationshipOps = selected.filter(
        (operation) => operation.category === 'relationship'
    );
    const deletes = selected.filter((operation) => operation.type === 'delete');

    for (const operation of tableRenames) {
        if (!operation.entityId || !operation.renameTo) {
            continue;
        }

        const table = findTableByEntityId(diagram, operation.entityId);

        if (!table) {
            continue;
        }

        const oldTableName = table.name;
        const oldSchema = table.schema ?? null;

        if (operation.category === 'view') {
            const renameTo = operation.renameTo as ViewIdentity;
            table.name = renameTo.name;
            table.schema = renameTo.schema;
            registerTableRenameAliases(
                identityRegistry,
                table,
                oldTableName,
                renameTo.name,
                oldSchema,
                renameTo.schema,
                'view'
            );
        } else {
            const renameTo = operation.renameTo as TableIdentity;
            table.name = renameTo.name;
            table.schema = renameTo.schema;
            registerTableRenameAliases(
                identityRegistry,
                table,
                oldTableName,
                renameTo.name,
                oldSchema,
                renameTo.schema,
                'table'
            );
        }

        for (const change of operation.changes) {
            if (
                operation.category === 'table' ||
                operation.category === 'view'
            ) {
                applyTableAttributeChange(table, change);
            }
        }

        setDecoration(decorations, operation.category, table.id, 'rename');
    }

    for (const operation of fieldRenames) {
        if (!operation.entityId || !operation.renameTo) {
            continue;
        }

        const located = findFieldByEntityId(diagram, operation.entityId);

        if (!located) {
            continue;
        }

        const renameTo = operation.renameTo as FieldIdentity;
        located.field.name = renameTo.name;

        identityRegistry.registerFieldAliases(located.field.id, [
            operation.identity as FieldIdentity,
            renameTo,
        ]);

        for (const change of operation.changes) {
            applyFieldAttributeChange(located.field, change);
            const customType = extractCustomTypeFromFieldTypeChange(change);

            if (customType) {
                ensureCustomTypeFromIncoming(
                    diagram,
                    input.incomingDiagram,
                    customType
                );
            }
        }

        setDecoration(decorations, 'field', located.field.id, 'rename');
    }

    for (const operation of tableAdds) {
        const incoming =
            operation.category === 'view'
                ? findIncomingView(
                      input.incomingDiagram,
                      operation.identity as ViewIdentity
                  )
                : findIncomingTable(
                      input.incomingDiagram,
                      operation.identity as TableIdentity
                  );

        if (!incoming) {
            continue;
        }

        const identityKey =
            operation.category === 'view'
                ? viewIdentityKey(operation.identity as ViewIdentity)
                : tableIdentityKey(operation.identity as TableIdentity);
        const tableId = previewTableId(identityKey);
        const { position, state } = nextPreviewTablePosition(placement);
        placement = state;

        const added = cloneTableFromIncoming(
            incoming,
            tableId,
            position,
            (identity) => previewFieldId(fieldIdentityKey(identity))
        );

        diagram.tables = [...(diagram.tables ?? []), added];
        if (operation.category === 'view') {
            identityRegistry.registerTableIdentity(
                operation.identity as ViewIdentity,
                tableId
            );
        } else {
            identityRegistry.registerTableIdentity(
                operation.identity as TableIdentity,
                tableId
            );
        }
        for (const field of added.fields) {
            identityRegistry.registerFieldIdentity(
                {
                    kind: 'field',
                    schema: added.schema ?? null,
                    table: added.name,
                    name: field.name,
                },
                field.id
            );
        }
        setDecoration(decorations, operation.category, tableId, 'add');
    }

    for (const operation of fieldAdds) {
        const identity = operation.identity as FieldIdentity;
        const parentTableId = identityRegistry.resolveTableId({
            kind: 'table',
            schema: identity.schema,
            name: identity.table,
        });
        const parent = parentTableId
            ? findTableByEntityIdInDiagram(diagram, parentTableId)
            : null;

        if (!parent) {
            continue;
        }

        if (fieldExistsOnTable(parent, identity)) {
            continue;
        }

        const incoming = findIncomingField(input.incomingDiagram, identity);

        if (!incoming) {
            continue;
        }

        const fieldId = previewFieldId(fieldIdentityKey(identity));
        const field = cloneField(incoming.field, fieldId);

        for (const change of operation.changes) {
            applyFieldAttributeChange(field, change);
            const customType = extractCustomTypeFromFieldTypeChange(change);

            if (customType) {
                ensureCustomTypeFromIncoming(
                    diagram,
                    input.incomingDiagram,
                    customType
                );
            }
        }

        parent.fields = [...parent.fields, field];
        identityRegistry.registerFieldIdentity(identity, fieldId);
        setDecoration(decorations, 'field', fieldId, 'add');
    }

    for (const operation of modifies) {
        if (operation.category === 'table' || operation.category === 'view') {
            if (!operation.entityId) {
                continue;
            }

            const table = findTableByEntityId(diagram, operation.entityId);

            if (!table) {
                continue;
            }

            for (const change of operation.changes) {
                applyTableAttributeChange(table, change);
            }

            if (decorations.tables[table.id] !== 'rename') {
                setDecoration(
                    decorations,
                    operation.category,
                    table.id,
                    'modify'
                );
            }

            continue;
        }

        if (operation.category === 'field') {
            if (!operation.entityId) {
                continue;
            }

            const located = findFieldByEntityId(diagram, operation.entityId);

            if (!located) {
                continue;
            }

            for (const change of operation.changes) {
                applyFieldAttributeChange(located.field, change);
                const customType = extractCustomTypeFromFieldTypeChange(change);

                if (customType) {
                    ensureCustomTypeFromIncoming(
                        diagram,
                        input.incomingDiagram,
                        customType
                    );
                }
            }

            if (decorations.fields[located.field.id] !== 'rename') {
                setDecoration(decorations, 'field', located.field.id, 'modify');
            }

            continue;
        }

        if (operation.category === 'relationship') {
            if (!operation.entityId) {
                continue;
            }

            const relationship = findRelationshipByEntityId(
                diagram,
                operation.entityId
            );

            if (!relationship) {
                continue;
            }

            for (const change of operation.changes) {
                applyRelationshipAttributeChange(relationship, change);
            }

            setDecoration(
                decorations,
                'relationship',
                relationship.id,
                'modify'
            );
        }
    }

    const sortedRelationshipOps = [...relationshipOps].sort(byCategoryThenId);

    for (const operation of sortedRelationshipOps) {
        if (operation.type === 'add') {
            const lookupIdentity = transformRelationshipIdentityForIncoming(
                operation.identity as RelationshipIdentity,
                fieldRenames,
                tableRenames
            );
            const incoming = findIncomingRelationship(
                input.incomingDiagram,
                lookupIdentity
            );

            if (!incoming) {
                continue;
            }

            const endpointIds = resolveRelationshipFieldIds(
                identityRegistry,
                operation.identity as RelationshipIdentity
            );

            if (!endpointIds) {
                continue;
            }

            const { sourceFieldId, targetFieldId } = endpointIds;

            const sourceTable = (diagram.tables ?? []).find((table) =>
                table.fields.some((field) => field.id === sourceFieldId)
            );
            const targetTable = (diagram.tables ?? []).find((table) =>
                table.fields.some((field) => field.id === targetFieldId)
            );

            if (!sourceTable || !targetTable) {
                continue;
            }

            const relationshipId = previewRelationshipId(
                semanticIdentityKey(operation.identity as RelationshipIdentity)
            );

            const relationship: DBRelationship = {
                ...structuredClone(incoming),
                id: relationshipId,
                sourceTableId: sourceTable.id,
                targetTableId: targetTable.id,
                sourceFieldId,
                targetFieldId,
                sourceSchema: operation.identity.source.schema,
                targetSchema: operation.identity.target.schema,
            };

            diagram.relationships = [
                ...(diagram.relationships ?? []),
                relationship,
            ];
            setDecoration(decorations, 'relationship', relationshipId, 'add');
            continue;
        }

        if (operation.type === 'modify' && operation.entityId) {
            const relationship = findRelationshipByEntityId(
                diagram,
                operation.entityId
            );

            if (!relationship) {
                continue;
            }

            for (const change of operation.changes) {
                applyRelationshipAttributeChange(relationship, change);
            }

            setDecoration(
                decorations,
                'relationship',
                relationship.id,
                'modify'
            );
        }
    }

    for (const operation of deletes) {
        if (operation.category === 'table' || operation.category === 'view') {
            if (!operation.entityId) {
                continue;
            }

            const table = findTableByEntityId(diagram, operation.entityId);

            if (!table) {
                continue;
            }

            setDecoration(decorations, operation.category, table.id, 'delete');
            continue;
        }

        if (operation.category === 'field') {
            if (!operation.entityId) {
                continue;
            }

            const located = findFieldByEntityId(diagram, operation.entityId);

            if (!located) {
                continue;
            }

            setDecoration(decorations, 'field', located.field.id, 'delete');
            continue;
        }

        if (operation.category === 'relationship') {
            if (!operation.entityId) {
                continue;
            }

            const relationship = findRelationshipByEntityId(
                diagram,
                operation.entityId
            );

            if (!relationship) {
                continue;
            }

            setDecoration(
                decorations,
                'relationship',
                relationship.id,
                'delete'
            );
        }
    }

    return { diagram, decorations };
};
