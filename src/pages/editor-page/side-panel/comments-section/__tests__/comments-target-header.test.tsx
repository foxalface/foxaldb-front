import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { en } from '@/i18n/locales/en';
import type { ResolvedDiscussionTarget } from '@/lib/comments/resolve-discussion-target';
import { CommentsTargetHeader } from '../comments-target-header';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: Record<string, string>) => {
            const parts = key.split('.');
            let current: unknown = en.translation;
            for (const part of parts) {
                if (
                    typeof current !== 'object' ||
                    current === null ||
                    !(part in current)
                ) {
                    return key;
                }
                current = (current as Record<string, unknown>)[part];
            }
            if (typeof current !== 'string') {
                return key;
            }
            if (!options) {
                return current;
            }
            return current.replace(/\{\{(\w+)\}\}/g, (_, name: string) =>
                Object.prototype.hasOwnProperty.call(options, name)
                    ? options[name]
                    : `{{${name}}}`
            );
        },
    }),
}));

const renderHeader = (
    overrides: Partial<React.ComponentProps<typeof CommentsTargetHeader>> = {}
) => {
    const onShowAll = vi.fn();
    const onShowDiagram = vi.fn();
    const props = {
        view: 'all' as const,
        resolvedTarget: { kind: 'diagram' } satisfies ResolvedDiscussionTarget,
        onShowAll,
        onShowDiagram,
        ...overrides,
    };
    render(<CommentsTargetHeader {...props} />);
    return { onShowAll, onShowDiagram };
};

describe('CommentsTargetHeader', () => {
    it('marks All as active', () => {
        renderHeader({ view: 'all' });
        expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute(
            'aria-pressed',
            'true'
        );
        expect(screen.getByRole('button', { name: 'Diagram' })).toHaveAttribute(
            'aria-pressed',
            'false'
        );
    });

    it('marks Diagram as active', () => {
        renderHeader({ view: 'diagram' });
        expect(screen.getByRole('button', { name: 'Diagram' })).toHaveAttribute(
            'aria-pressed',
            'true'
        );
    });

    it('shows the current target context in target view', () => {
        renderHeader({
            view: 'target',
            resolvedTarget: { kind: 'table', name: 'Clients' },
        });
        expect(screen.getByTestId('comments-current-target')).toHaveTextContent(
            'Current: Table Clients'
        );
    });

    it('formats a field as Table.field', () => {
        renderHeader({
            view: 'target',
            resolvedTarget: {
                kind: 'field',
                tableName: 'Clients',
                fieldName: 'email',
            },
        });
        expect(screen.getByTestId('comments-current-target')).toHaveTextContent(
            'Clients.email'
        );
    });

    it('formats a named relationship', () => {
        renderHeader({
            view: 'target',
            resolvedTarget: {
                kind: 'relationship',
                name: 'orders_fk',
                sourceTableName: 'Orders',
                targetTableName: 'Clients',
            },
        });
        expect(screen.getByTestId('comments-current-target')).toHaveTextContent(
            'orders_fk'
        );
    });

    it('formats unnamed relationship endpoints', () => {
        renderHeader({
            view: 'target',
            resolvedTarget: {
                kind: 'relationship',
                name: null,
                sourceTableName: 'Orders',
                targetTableName: 'Clients',
            },
        });
        expect(screen.getByTestId('comments-current-target')).toHaveTextContent(
            'Orders → Clients'
        );
    });

    it.each([
        ['table', 'Deleted table'],
        ['field', 'Deleted field'],
        ['relationship', 'Deleted relationship'],
    ] as const)('shows missing fallback for %s', (targetType, label) => {
        renderHeader({
            view: 'target',
            resolvedTarget: { kind: 'missing', targetType },
        });
        expect(screen.getByTestId('comments-current-target')).toHaveTextContent(
            label
        );
    });

    it('calls All and Diagram callbacks', async () => {
        const user = userEvent.setup();
        const { onShowAll, onShowDiagram } = renderHeader({ view: 'target' });

        await user.click(screen.getByRole('button', { name: 'All' }));
        await user.click(screen.getByRole('button', { name: 'Diagram' }));

        expect(onShowAll).toHaveBeenCalledTimes(1);
        expect(onShowDiagram).toHaveBeenCalledTimes(1);
    });

    it('exposes accessible names and wrapping-safe structure', () => {
        const { container } = render(
            <CommentsTargetHeader
                view="target"
                resolvedTarget={{ kind: 'table', name: 'Clients' }}
                onShowAll={vi.fn()}
                onShowDiagram={vi.fn()}
            />
        );

        expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Diagram' })
        ).toBeInTheDocument();
        expect(container.querySelector('.flex-wrap')).not.toBeNull();
        expect(container.querySelector('.break-words')).not.toBeNull();
    });

    it('never shows raw target ids', () => {
        renderHeader({
            view: 'target',
            resolvedTarget: { kind: 'table', name: 'Clients' },
        });
        expect(screen.queryByText(/tbl-|field-|rel-/i)).not.toBeInTheDocument();
    });
});
