import type { TFunction } from 'i18next';
import type {
    AddFieldActivityMetadata,
    AddTablesActivityMetadata,
    DiagramActivityAction,
    DiagramActivityResource,
    UpdateFieldActivityMetadata,
} from '@/lib/api/diagram-activities';

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const stringValue = (value: unknown): string | null => {
    if (typeof value !== 'string' && typeof value !== 'number') {
        return null;
    }

    const string = String(value);

    return string === '' ? null : string;
};

const parseAddTablesMetadata = (
    metadata: unknown
): AddTablesActivityMetadata => {
    if (!isRecord(metadata) || !Array.isArray(metadata.tables)) {
        return { tables: [] };
    }

    const tables = metadata.tables.flatMap((table) => {
        if (!isRecord(table)) {
            return [];
        }

        const id = stringValue(table.id);
        const name = stringValue(table.name);

        if (id === null || name === null) {
            return [];
        }

        return [
            {
                id,
                name,
                isView: Boolean(table.isView),
            },
        ];
    });

    return { tables };
};

const parseAddFieldMetadata = (metadata: unknown): AddFieldActivityMetadata => {
    if (!isRecord(metadata)) {
        return { tableId: null, field: null };
    }

    const fieldRecord = isRecord(metadata.field) ? metadata.field : null;
    const fieldId = fieldRecord ? stringValue(fieldRecord.id) : null;
    const fieldName = fieldRecord ? stringValue(fieldRecord.name) : null;
    const fieldType = fieldRecord ? stringValue(fieldRecord.type) : null;

    return {
        tableId: stringValue(metadata.tableId),
        field:
            fieldId !== null && fieldName !== null && fieldType !== null
                ? { id: fieldId, name: fieldName, type: fieldType }
                : null,
    };
};

const parseUpdateFieldMetadata = (
    metadata: unknown
): UpdateFieldActivityMetadata => {
    if (!isRecord(metadata)) {
        return { tableId: null, fieldId: null, attributes: {} };
    }

    return {
        tableId: stringValue(metadata.tableId),
        fieldId: stringValue(metadata.fieldId),
        attributes: isRecord(metadata.attributes) ? metadata.attributes : {},
    };
};

const isDiagramActivityAction = (
    action: string
): action is DiagramActivityAction =>
    action === 'add_tables' ||
    action === 'remove_tables' ||
    action === 'add_field' ||
    action === 'remove_field' ||
    action === 'update_field' ||
    action === 'add_relationships' ||
    action === 'remove_relationships' ||
    action === 'update_relationship' ||
    action === 'add_notes' ||
    action === 'remove_notes' ||
    action === 'add_areas' ||
    action === 'remove_areas' ||
    action === 'add_dependencies' ||
    action === 'remove_dependencies';

const resolveFieldLabel = (
    metadata: UpdateFieldActivityMetadata,
    fallbackField: string | null
): string => {
    const attributeName = stringValue(metadata.attributes.name);

    if (attributeName !== null) {
        return attributeName;
    }

    if (metadata.fieldId !== null) {
        return metadata.fieldId;
    }

    return fallbackField ?? 'field';
};

export const formatActivityMessage = (
    activity: DiagramActivityResource,
    t: TFunction
): string => {
    const user = activity.user?.name ?? t('activity_feed_dialog.unknown_user');

    if (!isDiagramActivityAction(activity.action)) {
        return t('activity_feed_dialog.actions.fallback', { user });
    }

    switch (activity.action) {
        case 'add_tables': {
            const metadata = parseAddTablesMetadata(activity.metadata);
            const table = metadata.tables[0]?.name ?? 'table';

            return t('activity_feed_dialog.actions.add_tables', {
                user,
                table,
            });
        }
        case 'remove_tables':
            return t('activity_feed_dialog.actions.remove_tables', { user });
        case 'add_field': {
            const metadata = parseAddFieldMetadata(activity.metadata);
            const field = metadata.field?.name ?? 'field';

            return t('activity_feed_dialog.actions.add_field', {
                user,
                field,
            });
        }
        case 'remove_field':
            return t('activity_feed_dialog.actions.remove_field', { user });
        case 'update_field': {
            const metadata = parseUpdateFieldMetadata(activity.metadata);
            const field = resolveFieldLabel(metadata, null);

            return t('activity_feed_dialog.actions.update_field', {
                user,
                field,
            });
        }
        case 'add_relationships':
            return t('activity_feed_dialog.actions.add_relationships', {
                user,
            });
        case 'remove_relationships':
            return t('activity_feed_dialog.actions.remove_relationships', {
                user,
            });
        case 'update_relationship':
            return t('activity_feed_dialog.actions.update_relationship', {
                user,
            });
        case 'add_notes':
            return t('activity_feed_dialog.actions.add_notes', { user });
        case 'remove_notes':
            return t('activity_feed_dialog.actions.remove_notes', { user });
        case 'add_areas':
            return t('activity_feed_dialog.actions.add_areas', { user });
        case 'remove_areas':
            return t('activity_feed_dialog.actions.remove_areas', { user });
        case 'add_dependencies':
            return t('activity_feed_dialog.actions.add_dependencies', { user });
        case 'remove_dependencies':
            return t('activity_feed_dialog.actions.remove_dependencies', {
                user,
            });
    }
};
