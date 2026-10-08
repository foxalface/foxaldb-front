import type {
    DiffOperation,
    FieldIdentity,
    RelationshipEndpointIdentity,
    TableIdentity,
    ViewIdentity,
} from '@/lib/schema-merge/diff-types';
import type { MergeText } from './format-merge-change';

export interface MergeLabelContext {
    readonly defaultSchema: string | null;
    readonly qualifiedNames: ReadonlySet<string>;
}

const schemaBucket = (
    schema: string | null,
    defaultSchema: string | null
): string => {
    if (
        schema === null ||
        schema.length === 0 ||
        (defaultSchema !== null && schema === defaultSchema)
    ) {
        return '';
    }

    return schema;
};

const rememberName = (
    buckets: Map<string, Set<string>>,
    name: string,
    schema: string | null,
    defaultSchema: string | null
) => {
    const bucket = buckets.get(name) ?? new Set<string>();
    bucket.add(schemaBucket(schema, defaultSchema));
    buckets.set(name, bucket);
};

export const buildMergeLabelContext = (
    operations: readonly DiffOperation[],
    defaultSchema: string | null
): MergeLabelContext => {
    const buckets = new Map<string, Set<string>>();

    for (const operation of operations) {
        if (operation.category === 'table' || operation.category === 'view') {
            rememberName(
                buckets,
                operation.identity.name,
                operation.identity.schema,
                defaultSchema
            );

            if (operation.type === 'rename') {
                rememberName(
                    buckets,
                    operation.renameTo.name,
                    operation.renameTo.schema,
                    defaultSchema
                );
            }
        } else if (operation.category === 'field') {
            rememberName(
                buckets,
                operation.identity.table,
                operation.identity.schema,
                defaultSchema
            );

            if (operation.type === 'rename') {
                rememberName(
                    buckets,
                    operation.renameTo.table,
                    operation.renameTo.schema,
                    defaultSchema
                );
            }
        } else {
            rememberName(
                buckets,
                operation.identity.source.table,
                operation.identity.source.schema,
                defaultSchema
            );
            rememberName(
                buckets,
                operation.identity.target.table,
                operation.identity.target.schema,
                defaultSchema
            );
        }
    }

    const qualifiedNames = new Set<string>();

    for (const [name, schemas] of buckets) {
        if (schemas.size > 1) {
            qualifiedNames.add(name);
        }
    }

    return { defaultSchema, qualifiedNames };
};

const qualify = (
    schema: string | null,
    name: string,
    context: MergeLabelContext
): string => {
    if (!context.qualifiedNames.has(name)) {
        return name;
    }

    const shown =
        schema !== null && schema.length > 0 ? schema : context.defaultSchema;

    return shown ? `${shown}.${name}` : name;
};

const fieldLabel = (
    identity: FieldIdentity,
    context: MergeLabelContext
): string =>
    `${qualify(identity.schema, identity.table, context)}.${identity.name}`;

const endpointLabel = (
    endpoint: RelationshipEndpointIdentity,
    context: MergeLabelContext
): string =>
    `${qualify(endpoint.schema, endpoint.table, context)}.${endpoint.field}`;

const namedEntity = (
    identity: TableIdentity | ViewIdentity,
    context: MergeLabelContext
): string => qualify(identity.schema, identity.name, context);

export const mergeOperationLabel = (
    operation: DiffOperation,
    context: MergeLabelContext,
    text: MergeText
): string => {
    if (operation.category === 'relationship') {
        return `${endpointLabel(operation.identity.source, context)} → ${endpointLabel(operation.identity.target, context)}`;
    }

    if (operation.category === 'field') {
        const current = fieldLabel(operation.identity, context);

        if (operation.type !== 'rename') {
            return current;
        }

        const sameTable =
            operation.identity.table === operation.renameTo.table &&
            schemaBucket(operation.identity.schema, context.defaultSchema) ===
                schemaBucket(operation.renameTo.schema, context.defaultSchema);

        if (sameTable) {
            return `${current} → ${operation.renameTo.name}`;
        }

        return `${current} → ${fieldLabel(operation.renameTo, context)}`;
    }

    const current = namedEntity(operation.identity, context);

    if (operation.type === 'rename') {
        return `${current} → ${namedEntity(operation.renameTo, context)}`;
    }

    if (operation.type === 'modify') {
        return current;
    }

    return text(
        operation.category === 'table'
            ? 'merge_wizard.result.entity.table'
            : 'merge_wizard.result.entity.view',
        { name: current }
    );
};

export const mergeOperationSelectLabel = (
    operation: DiffOperation,
    context: MergeLabelContext,
    text: MergeText
): string => {
    const description =
        operation.category === 'field' && operation.type === 'rename'
            ? text('merge_wizard.result.action_description.rename', {
                  from: fieldLabel(operation.identity, context),
                  to:
                      operation.identity.table === operation.renameTo.table
                          ? operation.renameTo.name
                          : fieldLabel(operation.renameTo, context),
              })
            : (operation.category === 'table' ||
                    operation.category === 'view') &&
                operation.type === 'rename'
              ? text('merge_wizard.result.action_description.rename', {
                    from: namedEntity(operation.identity, context),
                    to: namedEntity(operation.renameTo, context),
                })
              : text(
                    `merge_wizard.result.action_description.${operation.type}`,
                    {
                        label: mergeOperationLabel(operation, context, text),
                    }
                );

    return text('merge_wizard.result.select_change', { description });
};
