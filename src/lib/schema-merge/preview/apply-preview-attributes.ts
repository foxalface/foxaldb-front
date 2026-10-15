import type { DataType } from '@/lib/data/data-types/data-types';
import type { DBField } from '@/lib/domain/db-field';
import type { DBRelationship } from '@/lib/domain/db-relationship';
import type { DBTable } from '@/lib/domain/db-table';
import type { AttributeChange, JsonValue } from '../diff-types';

const typeFromJson = (value: JsonValue): DataType => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return { id: 'string', name: 'string' };
    }

    const record = value as Record<string, JsonValue>;
    const name =
        typeof record.name === 'string' && record.name.length > 0
            ? record.name
            : 'string';
    const id =
        typeof record.id === 'string' && record.id.length > 0
            ? record.id
            : name;

    return { id, name };
};

export const applyFieldAttributeChange = (
    field: DBField,
    change: AttributeChange
): void => {
    switch (change.attribute) {
        case 'type':
            field.type = typeFromJson(change.after);
            break;
        case 'nullable':
        case 'primaryKey':
        case 'unique':
            field[change.attribute] = Boolean(change.after);
            break;
        case 'increment':
        case 'isArray':
            field[change.attribute] =
                typeof change.after === 'boolean' ? change.after : null;
            break;
        case 'characterMaximumLength':
            field.characterMaximumLength =
                typeof change.after === 'string' ||
                typeof change.after === 'number'
                    ? String(change.after)
                    : null;
            break;
        case 'precision':
        case 'scale':
            field[change.attribute] =
                typeof change.after === 'number' ? change.after : null;
            break;
        case 'default':
            field.default =
                typeof change.after === 'string' ||
                typeof change.after === 'number' ||
                typeof change.after === 'boolean'
                    ? String(change.after)
                    : null;
            break;
        case 'collation':
            field.collation =
                typeof change.after === 'string' ? change.after : null;
            break;
        case 'comment':
            field.comments =
                typeof change.after === 'string' ? change.after : null;
            break;
        case 'check':
            field.check =
                typeof change.after === 'string' ? change.after : null;
            break;
        default:
            break;
    }
};

export const applyTableAttributeChange = (
    table: DBTable,
    change: AttributeChange
): void => {
    switch (change.attribute) {
        case 'color':
            if (typeof change.after === 'string') {
                table.color = change.after;
            }
            break;
        case 'comments':
        case 'comment':
            table.comments =
                typeof change.after === 'string' ? change.after : null;
            break;
        case 'width':
            table.width =
                typeof change.after === 'number' ? change.after : null;
            break;
        case 'expanded':
            table.expanded =
                typeof change.after === 'boolean' ? change.after : null;
            break;
        case 'isMaterializedView':
            table.isMaterializedView =
                typeof change.after === 'boolean' ? change.after : null;
            break;
        default:
            break;
    }
};

export const applyRelationshipAttributeChange = (
    relationship: DBRelationship,
    change: AttributeChange
): void => {
    switch (change.attribute) {
        case 'name':
            if (typeof change.after === 'string') {
                relationship.name = change.after;
            }
            break;
        case 'sourceCardinality':
        case 'targetCardinality':
            if (change.after === 'one' || change.after === 'many') {
                relationship[change.attribute] = change.after;
            }
            break;
        case 'onDelete':
            if (
                change.after === 'cascade' ||
                change.after === 'set_null' ||
                change.after === 'restrict' ||
                change.after === null
            ) {
                relationship.onDelete = change.after;
            }
            break;
        case 'onUpdate':
            if (
                change.after === 'cascade' ||
                change.after === 'restrict' ||
                change.after === null
            ) {
                relationship.onUpdate = change.after;
            }
            break;
        default:
            break;
    }
};

export const extractCustomTypeFromFieldTypeChange = (
    change: AttributeChange
): Record<string, JsonValue> | null => {
    if (change.attribute !== 'type' || !change.after) {
        return null;
    }

    if (typeof change.after !== 'object' || Array.isArray(change.after)) {
        return null;
    }

    const customType = (change.after as Record<string, JsonValue>).customType;

    if (
        !customType ||
        typeof customType !== 'object' ||
        Array.isArray(customType)
    ) {
        return null;
    }

    return customType as Record<string, JsonValue>;
};
