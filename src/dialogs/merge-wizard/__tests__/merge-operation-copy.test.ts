import { describe, expect, it } from 'vitest';
import type { DiffOperation, JsonValue } from '@/lib/schema-merge/diff-types';
import { formatMergeOperationDetail } from '../format-merge-change';
import type { MergeText } from '../format-merge-change';
import {
    buildMergeLabelContext,
    mergeOperationLabel,
    mergeOperationSelectLabel,
} from '../merge-operation-label';

const text: MergeText = (key, options) => {
    const labels: Record<string, string> = {
        on: 'On',
        off: 'Off',
        'merge_wizard.result.empty_value': 'none',
        'merge_wizard.result.attributes.type': 'Type',
        'merge_wizard.result.attributes.nullable': 'Nullable',
        'merge_wizard.result.attributes.primaryKey': 'Primary key',
        'merge_wizard.result.attributes.unique': 'Unique',
        'merge_wizard.result.attributes.increment': 'Increment',
        'merge_wizard.result.attributes.isArray': 'Array',
        'merge_wizard.result.attributes.length': 'Length',
        'merge_wizard.result.attributes.precision': 'Precision',
        'merge_wizard.result.attributes.scale': 'Scale',
        'merge_wizard.result.attributes.default': 'Default',
        'merge_wizard.result.attributes.comment': 'Comment',
        'merge_wizard.result.attributes.check': 'Check',
        'merge_wizard.result.attributes.collation': 'Collation',
        'merge_wizard.result.attributes.name': 'Name',
        'merge_wizard.result.attributes.onDelete': 'On delete',
        'merge_wizard.result.attributes.onUpdate': 'On update',
        'merge_wizard.result.attributes.sourceCardinality':
            'Source cardinality',
        'merge_wizard.result.attributes.targetCardinality':
            'Target cardinality',
        'merge_wizard.result.attributes.materialized': 'Materialized',
        'merge_wizard.result.attributes.indexes': 'Indexes changed',
        'merge_wizard.result.attributes.checks': 'Checks changed',
        'merge_wizard.result.attributes.dependencies': 'Dependencies changed',
        'merge_wizard.result.cardinality.one': 'one',
        'merge_wizard.result.cardinality.many': 'many',
        'merge_wizard.result.entity.table': 'Table {{name}}',
        'merge_wizard.result.entity.view': 'View {{name}}',
        'merge_wizard.result.select_change': 'Select change: {{description}}',
        'merge_wizard.result.action_description.add': 'Add {{label}}',
        'merge_wizard.result.action_description.modify': 'Modify {{label}}',
        'merge_wizard.result.action_description.rename':
            'Rename {{from}} to {{to}}',
        'merge_wizard.result.action_description.delete': 'Delete {{label}}',
        'merge_wizard.result.attribute_changed': '{{attribute}} changed',
    };
    const template = labels[key] ?? key;

    if (!options) {
        return template;
    }

    if (key === 'merge_wizard.result.properties_changed') {
        return `${String(options.count)} properties changed`;
    }

    return template.replace(/\{\{(\w+)\}\}/g, (_, name: string) =>
        String(options[name] ?? '')
    );
};

const field = (
    type: DiffOperation['type'],
    changes: DiffOperation['changes'],
    renameTo: string | null = null
): DiffOperation =>
    ({
        id: 'opaque-operation-id',
        category: 'field',
        type,
        entityId: type === 'add' ? null : 'opaque-entity-id',
        renameTo:
            type === 'rename'
                ? {
                      kind: 'field',
                      schema: 'public',
                      table: 'users',
                      name: renameTo ?? 'full_name',
                  }
                : null,
        identity: {
            kind: 'field',
            schema: 'public',
            table: 'users',
            name: 'email',
        },
        before: null,
        after: null,
        changes,
        dependsOn: [],
    }) as DiffOperation;

describe('merge operation copy', () => {
    const context = buildMergeLabelContext([], 'public');

    it('formats a type change without JSON', () => {
        const detail = formatMergeOperationDetail(
            field('modify', [
                {
                    attribute: 'type',
                    before: { name: 'varchar', length: 100 },
                    after: { name: 'varchar', length: 255 },
                },
            ]),
            text
        );

        expect(detail).toBe('varchar(100) → varchar(255)');
        expect(detail).not.toContain('{');
    });

    it('formats common field attributes and summarizes long or complex values', () => {
        const detail = formatMergeOperationDetail(
            field('modify', [
                { attribute: 'nullable', before: true, after: false },
                {
                    attribute: 'characterMaximumLength',
                    before: 100,
                    after: 255,
                },
            ]),
            text
        );

        expect(detail).toBe('Nullable: On → Off · Length: 100 → 255');

        const summarized = formatMergeOperationDetail(
            field('modify', [
                {
                    attribute: 'indexes',
                    before: [{ name: 'users_email_idx', fields: ['email'] }],
                    after: [],
                },
            ]),
            text
        );

        expect(summarized).toBe('Indexes changed');
        expect(summarized).not.toContain('users_email_idx');
        expect(summarized).not.toContain('[');

        expect(
            formatMergeOperationDetail(
                field('modify', [
                    { attribute: 'primaryKey', before: false, after: true },
                    { attribute: 'unique', before: false, after: true },
                    { attribute: 'default', before: null, after: 'now()' },
                ]),
                text
            )
        ).toBe('3 properties changed');
    });

    it('formats relationship actions and cardinality without field ids', () => {
        const operation = {
            id: 'opaque-operation-id',
            category: 'relationship',
            type: 'modify',
            entityId: 'opaque-entity-id',
            renameTo: null,
            identity: {
                kind: 'relationship',
                source: {
                    schema: 'public',
                    table: 'users',
                    field: 'id',
                },
                target: {
                    schema: 'public',
                    table: 'posts',
                    field: 'user_id',
                },
            },
            before: { kind: 'relationship', name: 'posts_user_fk' },
            after: { kind: 'relationship', name: 'posts_user_fk' },
            changes: [
                {
                    attribute: 'onDelete',
                    before: 'restrict',
                    after: 'cascade',
                },
                {
                    attribute: 'sourceCardinality',
                    before: 'one',
                    after: 'many',
                },
            ],
            dependsOn: [],
        } as DiffOperation;

        expect(mergeOperationLabel(operation, context, text)).toBe(
            'users.id → posts.user_id'
        );
        expect(formatMergeOperationDetail(operation, text)).toBe(
            'On delete: RESTRICT → CASCADE · Source cardinality: one → many'
        );
        expect(JSON.stringify(operation.identity)).toContain('user_id');
        expect(mergeOperationLabel(operation, context, text)).not.toContain(
            'opaque-entity-id'
        );
    });

    it('hides the default schema unless two schemas share a name', () => {
        const plain = {
            id: 'table-add',
            category: 'table',
            type: 'add',
            entityId: null,
            renameTo: null,
            identity: { kind: 'table', schema: 'public', name: 'invoices' },
            before: null,
            after: null,
            changes: [],
            dependsOn: [],
        } as DiffOperation;
        const hidden = buildMergeLabelContext([plain], 'public');

        expect(mergeOperationLabel(plain, hidden, text)).toBe('Table invoices');
        expect(mergeOperationSelectLabel(plain, hidden, text)).toBe(
            'Select change: Add Table invoices'
        );

        const billing = {
            ...plain,
            id: 'billing',
            identity: { kind: 'table', schema: 'billing', name: 'users' },
        } as DiffOperation;
        const publicUsers = {
            ...plain,
            id: 'public',
            type: 'modify',
            entityId: 'entity-users',
            identity: { kind: 'table', schema: 'public', name: 'users' },
        } as DiffOperation;
        const qualified = buildMergeLabelContext(
            [billing, publicUsers],
            'public'
        );

        expect(mergeOperationLabel(publicUsers, qualified, text)).toBe(
            'public.users'
        );
        expect(mergeOperationLabel(billing, qualified, text)).toBe(
            'Table billing.users'
        );
    });

    it('renders rename, delete, and view labels from semantic names', () => {
        const renamedField = field('rename', [], 'full_name');
        renamedField.identity = {
            kind: 'field',
            schema: 'public',
            table: 'users',
            name: 'name',
        };

        expect(mergeOperationLabel(renamedField, context, text)).toBe(
            'users.name → full_name'
        );
        expect(mergeOperationSelectLabel(renamedField, context, text)).toBe(
            'Select change: Rename users.name to full_name'
        );

        const renamedTable = {
            id: 'rename-table',
            category: 'table',
            type: 'rename',
            entityId: 'entity-users',
            renameTo: { kind: 'table', schema: 'public', name: 'accounts' },
            identity: { kind: 'table', schema: 'public', name: 'users' },
            before: null,
            after: null,
            changes: [],
            dependsOn: [],
        } as DiffOperation;

        expect(mergeOperationLabel(renamedTable, context, text)).toBe(
            'users → accounts'
        );

        const deleted = {
            id: 'delete-table',
            category: 'table',
            type: 'delete',
            entityId: 'entity-legacy',
            renameTo: null,
            identity: { kind: 'table', schema: 'public', name: 'legacy_users' },
            before: null,
            after: null,
            changes: [],
            dependsOn: [],
        } as DiffOperation;

        expect(mergeOperationLabel(deleted, context, text)).toBe(
            'Table legacy_users'
        );

        const view = {
            id: 'view-add',
            category: 'view',
            type: 'add',
            entityId: null,
            renameTo: null,
            identity: { kind: 'view', schema: null, name: 'open_invoices' },
            before: null,
            after: null,
            changes: [
                { attribute: 'checks', before: [], after: ['amount > 0'] },
                {
                    attribute: 'dependencies',
                    before: [] as JsonValue,
                    after: ['invoices'],
                },
            ],
            dependsOn: [],
        } as DiffOperation;

        expect(mergeOperationLabel(view, context, text)).toBe(
            'View open_invoices'
        );
        expect(formatMergeOperationDetail(view, text)).toBe(
            'Checks changed · Dependencies changed'
        );
        expect(formatMergeOperationDetail(view, text)).not.toContain('amount');
        expect(formatMergeOperationDetail(view, text)).not.toContain(
            'invoices'
        );
    });
});
