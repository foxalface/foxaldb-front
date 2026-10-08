import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Dialog, DialogContent } from '@/components/dialog/dialog';
import { DatabaseType } from '@/lib/domain/database-type';
import type { Diagram } from '@/lib/domain/diagram';
import type { DiffOperation } from '@/lib/schema-merge/diff-types';
import { MergeResultStep } from '../merge-result-step';
import type { MergeWizardApplyContext } from '../merge-wizard-apply-context';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: Record<string, unknown>) =>
            options
                ? `${key} ${Object.entries(options)
                      .map(([name, value]) => `${name}:${String(value)}`)
                      .join(' ')}`
                : key,
    }),
}));

const incoming = {
    id: 'incoming',
    name: 'Incoming',
    databaseType: DatabaseType.POSTGRESQL,
    tables: [],
    relationships: [],
    createdAt: new Date(0),
    updatedAt: new Date(0),
} as Diagram;

const hash = 'a'.repeat(64);

const operation = (value: DiffOperation): DiffOperation => value;

const table = (
    id: string,
    name: string,
    type: 'add' | 'modify' | 'delete' | 'rename',
    extra: Partial<DiffOperation> = {}
): DiffOperation =>
    operation({
        id,
        category: 'table',
        type,
        entityId: type === 'add' ? null : `entity-${id}`,
        renameTo:
            type === 'rename'
                ? { kind: 'table', schema: 'public', name: 'accounts' }
                : null,
        identity: { kind: 'table', schema: 'public', name },
        before: null,
        after: null,
        changes: [],
        dependsOn: [],
        ...extra,
    } as DiffOperation);

const renderResult = (
    operations: DiffOperation[],
    viewsCompared = true,
    onBack = vi.fn()
) => {
    const applyContext: MergeWizardApplyContext = {
        incomingDiagram: incoming,
        source: { kind: 'sql' },
        includeDeletions: true,
        generation: 1,
        response: {
            baseContentHash: hash,
            baseUpdatedAt: null,
            viewsCompared,
            operations,
        },
    };

    const view = render(
        <Dialog open>
            <DialogContent>
                <MergeResultStep
                    applyContext={applyContext}
                    defaultSchema="public"
                    onBack={onBack}
                />
            </DialogContent>
        </Dialog>
    );

    return { ...view, onBack };
};

const mixed = (): DiffOperation[] => [
    table('opaque-table-add', 'invoices', 'add'),
    table('opaque-table-rename', 'users', 'rename'),
    table('opaque-table-delete', 'legacy_users', 'delete', {
        dependsOn: ['opaque-relationship-delete'],
    }),
    {
        id: 'opaque-field-modify',
        category: 'field',
        type: 'modify',
        entityId: 'opaque-field-entity',
        renameTo: null,
        identity: {
            kind: 'field',
            schema: 'public',
            table: 'users',
            name: 'email',
        },
        before: null,
        after: null,
        changes: [
            {
                attribute: 'type',
                before: { name: 'varchar', length: 100 },
                after: { name: 'varchar', length: 255 },
            },
        ],
        dependsOn: [],
    } as DiffOperation,
    {
        id: 'opaque-field-rename',
        category: 'field',
        type: 'rename',
        entityId: 'opaque-name-entity',
        renameTo: {
            kind: 'field',
            schema: 'public',
            table: 'users',
            name: 'full_name',
        },
        identity: {
            kind: 'field',
            schema: 'public',
            table: 'users',
            name: 'name',
        },
        before: null,
        after: null,
        changes: [],
        dependsOn: [],
    } as DiffOperation,
    {
        id: 'opaque-field-delete',
        category: 'field',
        type: 'delete',
        entityId: 'opaque-legacy-field',
        renameTo: null,
        identity: {
            kind: 'field',
            schema: 'public',
            table: 'posts',
            name: 'legacy_code',
        },
        before: null,
        after: null,
        changes: [],
        dependsOn: ['opaque-table-modify'],
    } as DiffOperation,
    table('opaque-table-modify', 'users', 'modify', {
        changes: [
            {
                attribute: 'indexes',
                before: [{ name: 'posts_legacy_idx', fields: ['legacy_code'] }],
                after: [],
            },
            {
                attribute: 'checks',
                before: ['legacy_code is not null'],
                after: [],
            },
        ],
    }),
    {
        id: 'opaque-relationship-delete',
        category: 'relationship',
        type: 'delete',
        entityId: 'opaque-relationship-entity',
        renameTo: null,
        identity: {
            kind: 'relationship',
            source: { schema: 'public', table: 'users', field: 'id' },
            target: { schema: 'public', table: 'posts', field: 'user_id' },
        },
        before: null,
        after: null,
        changes: [
            { attribute: 'onDelete', before: 'restrict', after: 'cascade' },
        ],
        dependsOn: [],
    } as DiffOperation,
];

describe('Merge result step', () => {
    it('renders four expanded sections and preserves backend order', () => {
        renderResult([
            {
                id: 'field-zeta',
                category: 'field',
                type: 'add',
                entityId: null,
                renameTo: null,
                identity: {
                    kind: 'field',
                    schema: 'public',
                    table: 'zeta',
                    name: 'col',
                },
                before: null,
                after: null,
                changes: [],
                dependsOn: [],
            } as DiffOperation,
            table('table-alpha', 'alpha', 'add'),
            {
                id: 'field-alpha',
                category: 'field',
                type: 'add',
                entityId: null,
                renameTo: null,
                identity: {
                    kind: 'field',
                    schema: 'public',
                    table: 'alpha',
                    name: 'col',
                },
                before: null,
                after: null,
                changes: [],
                dependsOn: [],
            } as DiffOperation,
        ]);

        const fields = screen.getByTestId('merge-result-section-field');
        const labels = within(fields).getAllByText(/\.col$/);

        expect(labels.map((node) => node.textContent)).toEqual([
            'zeta.col',
            'alpha.col',
        ]);
        expect(
            screen.getByRole('button', {
                name: /merge_wizard.result.sections.table/,
            })
        ).toHaveAttribute('aria-expanded', 'true');
        expect(
            screen.getByRole('button', {
                name: /merge_wizard.result.sections.relationship/,
            })
        ).toHaveAttribute('aria-expanded', 'true');
        expect(
            screen.getByRole('button', {
                name: /merge_wizard.result.sections.view/,
            })
        ).toHaveAttribute('aria-expanded', 'true');
        expect(
            within(
                screen.getByTestId('merge-result-section-relationship')
            ).getByText('merge_wizard.result.empty_section')
        ).toBeInTheDocument();
        expect(
            within(screen.getByTestId('merge-result-section-view')).getByText(
                'merge_wizard.result.empty_section'
            )
        ).toBeInTheDocument();
    });

    it('shows why views were not compared', () => {
        renderResult([table('table-alpha', 'alpha', 'add')], false);

        expect(
            within(screen.getByTestId('merge-result-section-view')).getByText(
                'merge_wizard.result.views_not_compared'
            )
        ).toBeInTheDocument();
        expect(
            within(screen.getByTestId('merge-result-section-view')).queryByRole(
                'checkbox'
            )
        ).not.toBeInTheDocument();
    });

    it('renders a no-differences state without checkboxes', async () => {
        const { onBack } = renderResult([], false);

        expect(
            screen.getByText('merge_wizard.result.no_differences')
        ).toBeInTheDocument();
        expect(
            screen.getByText('merge_wizard.result.views_not_compared')
        ).toBeInTheDocument();
        expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
        expect(
            screen.queryByTestId('merge-result-section-table')
        ).not.toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /merge_wizard.result.merge/ })
        ).toBeDisabled();

        await userEvent.click(
            screen.getByRole('button', { name: 'new_diagram_dialog.back' })
        );
        expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('renders add, modify, rename, and delete rows without internal ids', () => {
        renderResult(mixed());
        const text = document.body.textContent ?? '';

        expect(
            screen.getByText('merge_wizard.result.entity.table name:invoices')
        ).toBeInTheDocument();
        expect(screen.getByText('users.email')).toBeInTheDocument();
        expect(
            screen.getByText('varchar(100) → varchar(255)')
        ).toBeInTheDocument();
        expect(screen.getByText('users → accounts')).toBeInTheDocument();
        expect(screen.getByText('users.name → full_name')).toBeInTheDocument();
        expect(
            screen.getByText('users.id → posts.user_id')
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'merge_wizard.result.entity.table name:legacy_users'
            )
        ).toBeInTheDocument();
        expect(screen.getByText('posts.legacy_code')).toBeInTheDocument();
        expect(text).toContain('merge_wizard.result.attributes.indexes');
        expect(text).toContain('merge_wizard.result.attributes.checks');
        expect(text).not.toContain('posts_legacy_idx');
        expect(text).not.toContain('legacy_code is not null');
        expect(text).not.toContain('opaque-table-add');
        expect(text).not.toContain('opaque-field-entity');
        expect(text).not.toContain('opaque-relationship-entity');
        expect(text).not.toContain('{');
        expect(
            screen.getByRole('checkbox', {
                name: /from:users.name to:full_name/,
            })
        ).toBeInTheDocument();
        expect(
            screen.getAllByText('merge_wizard.result.change.add').length
        ).toBeGreaterThan(0);
        expect(
            screen.getAllByText('merge_wizard.result.change.modify').length
        ).toBeGreaterThan(0);
        expect(
            screen.getAllByText('merge_wizard.result.change.rename').length
        ).toBeGreaterThan(0);
        expect(
            screen.getAllByText('merge_wizard.result.change.delete').length
        ).toBeGreaterThan(0);
    });

    it('keeps selection dependency-closed across sections and updates counters', async () => {
        const user = userEvent.setup();
        renderResult(mixed());

        const fieldDelete = screen.getByRole('checkbox', {
            name: /label:posts.legacy_code/,
        });
        const tableModify = screen.getByRole('checkbox', {
            name: /label:users$/,
        });
        const relationshipDelete = screen.getByRole('checkbox', {
            name: /users.id → posts.user_id/,
        });
        const tableDelete = screen.getByRole('checkbox', {
            name: /legacy_users/,
        });

        expect(fieldDelete).toBeChecked();
        expect(tableModify).toBeChecked();
        expect(relationshipDelete).toBeChecked();
        expect(tableDelete).toBeChecked();
        expect(
            screen.getByText('merge_wizard.result.counter selected:3 total:3')
        ).toBeInTheDocument();

        await user.click(fieldDelete);
        expect(fieldDelete).not.toBeChecked();
        expect(tableModify).toBeChecked();
        expect(
            screen.getByText('merge_wizard.result.counter selected:2 total:3')
        ).toBeInTheDocument();

        await user.click(fieldDelete);
        expect(fieldDelete).toBeChecked();
        expect(tableModify).toBeChecked();

        await user.click(tableModify);
        expect(tableModify).not.toBeChecked();
        expect(fieldDelete).not.toBeChecked();

        await user.click(fieldDelete);
        expect(fieldDelete).toBeChecked();
        expect(tableModify).toBeChecked();

        await user.click(relationshipDelete);
        expect(relationshipDelete).not.toBeChecked();
        expect(tableDelete).not.toBeChecked();

        const tables = screen.getByRole('checkbox', {
            name: 'merge_wizard.result.select_all_section section:merge_wizard.result.sections.table',
        });
        expect(tables).toBePartiallyChecked();
        await user.click(tables);
        expect(tableDelete).toBeChecked();
        expect(tableModify).toBeChecked();
        expect(relationshipDelete).toBeChecked();
        expect(tables).toBeChecked();

        await user.click(tables);
        expect(tableDelete).not.toBeChecked();
        expect(tableModify).not.toBeChecked();
        expect(fieldDelete).not.toBeChecked();
        expect(relationshipDelete).toBeChecked();
        expect(
            screen.getByRole('button', { name: /merge_wizard.result.merge/ })
        ).toBeDisabled();
    });

    it('leaves Merge disabled when every change stays selected', () => {
        renderResult(mixed());

        expect(
            screen.getByRole('button', {
                name: 'merge_wizard.result.merge count:8',
            })
        ).toBeDisabled();
        expect(screen.getByTestId('merge-wizard-result-step')).toHaveAttribute(
            'data-base-hash',
            hash
        );
        expect(screen.getByTestId('merge-wizard-result-step')).toHaveAttribute(
            'data-selected-count',
            '8'
        );
    });

    it('shows an analysis error for a cyclic graph and does not offer checkboxes', () => {
        renderResult([
            table('left', 'left', 'modify', { dependsOn: ['right'] }),
            table('right', 'right', 'modify', { dependsOn: ['left'] }),
        ]);

        expect(screen.getByRole('alert')).toHaveTextContent(
            'merge_wizard.result.analysis_error'
        );
        expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /merge_wizard.result.merge/ })
        ).toBeDisabled();
    });
});
