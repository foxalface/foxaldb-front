import type {
    AttributeChange,
    DiffOperation,
    JsonValue,
} from '@/lib/schema-merge/diff-types';

export type MergeText = (
    key: string,
    options?: Record<string, string | number>
) => string;

const SUMMARY_ATTRIBUTE_KEYS: Record<string, string> = {
    indexes: 'merge_wizard.result.attributes.indexes',
    checks: 'merge_wizard.result.attributes.checks',
    dependencies: 'merge_wizard.result.attributes.dependencies',
    sourceFields: 'merge_wizard.result.attributes.sourceFields',
    targetFields: 'merge_wizard.result.attributes.targetFields',
};

const LABELED_ATTRIBUTE_KEYS: Record<string, string> = {
    type: 'merge_wizard.result.attributes.type',
    nullable: 'merge_wizard.result.attributes.nullable',
    primaryKey: 'merge_wizard.result.attributes.primaryKey',
    unique: 'merge_wizard.result.attributes.unique',
    increment: 'merge_wizard.result.attributes.increment',
    isArray: 'merge_wizard.result.attributes.isArray',
    characterMaximumLength: 'merge_wizard.result.attributes.length',
    precision: 'merge_wizard.result.attributes.precision',
    scale: 'merge_wizard.result.attributes.scale',
    default: 'merge_wizard.result.attributes.default',
    collation: 'merge_wizard.result.attributes.collation',
    comment: 'merge_wizard.result.attributes.comment',
    check: 'merge_wizard.result.attributes.check',
    name: 'merge_wizard.result.attributes.name',
    onDelete: 'merge_wizard.result.attributes.onDelete',
    onUpdate: 'merge_wizard.result.attributes.onUpdate',
    sourceCardinality: 'merge_wizard.result.attributes.sourceCardinality',
    targetCardinality: 'merge_wizard.result.attributes.targetCardinality',
    materialized: 'merge_wizard.result.attributes.materialized',
};

const REFERENTIAL_ACTIONS: Record<string, string> = {
    cascade: 'CASCADE',
    set_null: 'SET NULL',
    restrict: 'RESTRICT',
};

const CARDINALITY_ATTRIBUTES = new Set([
    'sourceCardinality',
    'targetCardinality',
]);

const REFERENTIAL_ATTRIBUTES = new Set(['onDelete', 'onUpdate']);

const BOOLEAN_ATTRIBUTES = new Set([
    'nullable',
    'primaryKey',
    'unique',
    'increment',
    'isArray',
    'materialized',
]);

const LONG_TEXT_LIMIT = 48;

const isRecord = (value: JsonValue): value is { [key: string]: JsonValue } =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const attributeLabel = (attribute: string, text: MergeText): string => {
    const key = LABELED_ATTRIBUTE_KEYS[attribute];
    return key ? text(key) : attribute;
};

const emptyValue = (text: MergeText): string =>
    text('merge_wizard.result.empty_value');

const formatTypeValue = (value: JsonValue): string | null => {
    if (typeof value === 'string' && value.length > 0) {
        return value;
    }

    if (!isRecord(value)) {
        return null;
    }

    const name =
        typeof value.name === 'string' && value.name.length > 0
            ? value.name
            : typeof value.id === 'string' && value.id.length > 0
              ? value.id
              : null;

    if (!name) {
        return null;
    }

    const length = value.length ?? value.characterMaximumLength;

    if (typeof length === 'number' && Number.isFinite(length)) {
        return `${name}(${length})`;
    }

    const precision = value.precision;
    const scale = value.scale;

    if (
        typeof precision === 'number' &&
        Number.isFinite(precision) &&
        typeof scale === 'number' &&
        Number.isFinite(scale)
    ) {
        return `${name}(${precision}, ${scale})`;
    }

    if (typeof precision === 'number' && Number.isFinite(precision)) {
        return `${name}(${precision})`;
    }

    return name;
};

const formatCardinality = (value: JsonValue, text: MergeText): string => {
    if (value === 'one' || value === 'many') {
        return text(`merge_wizard.result.cardinality.${value}`);
    }

    return formatScalar(value, text);
};

const formatReferential = (value: JsonValue, text: MergeText): string => {
    if (typeof value === 'string' && REFERENTIAL_ACTIONS[value]) {
        return REFERENTIAL_ACTIONS[value];
    }

    return formatScalar(value, text);
};

const formatScalar = (value: JsonValue, text: MergeText): string => {
    if (value === null || value === '') {
        return emptyValue(text);
    }

    if (typeof value === 'boolean') {
        return value ? text('on') : text('off');
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
        return String(value);
    }

    if (typeof value === 'string') {
        return value;
    }

    return '';
};

const changedPhrase = (attribute: string, text: MergeText): string =>
    text('merge_wizard.result.attribute_changed', {
        attribute: attributeLabel(attribute, text),
    });

const formatTransition = (
    attribute: string,
    before: JsonValue,
    after: JsonValue,
    text: MergeText
): string | null => {
    if (attribute === 'type') {
        const left = formatTypeValue(before);
        const right = formatTypeValue(after);

        if (left && right && left !== right) {
            return `${left} → ${right}`;
        }

        return changedPhrase('type', text);
    }

    const summaryKey = SUMMARY_ATTRIBUTE_KEYS[attribute];

    if (summaryKey) {
        return text(summaryKey);
    }

    if (
        (typeof before === 'string' && before.length > LONG_TEXT_LIMIT) ||
        (typeof after === 'string' && after.length > LONG_TEXT_LIMIT) ||
        Array.isArray(before) ||
        Array.isArray(after) ||
        isRecord(before) ||
        isRecord(after)
    ) {
        return changedPhrase(attribute, text);
    }

    const left = BOOLEAN_ATTRIBUTES.has(attribute)
        ? formatScalar(before, text)
        : CARDINALITY_ATTRIBUTES.has(attribute)
          ? formatCardinality(before, text)
          : REFERENTIAL_ATTRIBUTES.has(attribute)
            ? formatReferential(before, text)
            : formatScalar(before, text);
    const right = BOOLEAN_ATTRIBUTES.has(attribute)
        ? formatScalar(after, text)
        : CARDINALITY_ATTRIBUTES.has(attribute)
          ? formatCardinality(after, text)
          : REFERENTIAL_ATTRIBUTES.has(attribute)
            ? formatReferential(after, text)
            : formatScalar(after, text);

    if (left.length === 0 || right.length === 0) {
        return changedPhrase(attribute, text);
    }

    if (attribute === 'type') {
        return `${left} → ${right}`;
    }

    return `${attributeLabel(attribute, text)}: ${left} → ${right}`;
};

const formatChange = (change: AttributeChange, text: MergeText): string =>
    formatTransition(change.attribute, change.before, change.after, text) ??
    changedPhrase(change.attribute, text);

/**
 * One compact detail line for an operation.
 * Complex structures stay summarized. Values are never serialized as JSON.
 */
export const formatMergeOperationDetail = (
    operation: DiffOperation,
    text: MergeText
): string | null => {
    if (operation.changes.length === 0) {
        return null;
    }

    if (operation.changes.length > 2) {
        return text('merge_wizard.result.properties_changed', {
            count: operation.changes.length,
        });
    }

    return operation.changes
        .map((change) => formatChange(change, text))
        .join(' · ');
};
