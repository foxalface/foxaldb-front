import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { en } from '@/i18n/locales/en';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: Record<string, unknown>) => {
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
                String(options[name] ?? `{{${name}}}`)
            );
        },
    }),
}));

import { CommentActionsMenu } from '../comment-actions-menu';

describe('CommentActionsMenu', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders no trigger when neither action exists', () => {
        render(
            <CommentActionsMenu
                canEdit={false}
                canDelete={false}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
            />
        );

        expect(
            screen.queryByRole('button', { name: 'Comment actions' })
        ).not.toBeInTheDocument();
        expect(screen.queryByText('Edit')).not.toBeInTheDocument();
        expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    });

    it('renders Edit only when canEdit is true and canDelete is false', async () => {
        const user = userEvent.setup();
        render(
            <CommentActionsMenu
                canEdit={true}
                canDelete={false}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
            />
        );

        await user.click(
            screen.getByRole('button', { name: 'Comment actions' })
        );

        expect(screen.getByText('Edit')).toBeInTheDocument();
        expect(screen.queryByText('Delete')).not.toBeInTheDocument();
        expect(screen.queryByRole('separator')).not.toBeInTheDocument();
    });

    it('renders Delete only when canDelete is true and canEdit is false', async () => {
        const user = userEvent.setup();
        render(
            <CommentActionsMenu
                canEdit={false}
                canDelete={true}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
            />
        );

        await user.click(
            screen.getByRole('button', { name: 'Comment actions' })
        );

        expect(screen.queryByText('Edit')).not.toBeInTheDocument();
        expect(screen.getByText('Delete')).toBeInTheDocument();
        expect(screen.queryByRole('separator')).not.toBeInTheDocument();
    });

    it('renders Edit and Delete with a separator only when both exist', async () => {
        const user = userEvent.setup();
        render(
            <CommentActionsMenu
                canEdit={true}
                canDelete={true}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
            />
        );

        await user.click(
            screen.getByRole('button', { name: 'Comment actions' })
        );

        const menu = screen.getByRole('menu');
        expect(within(menu).getByText('Edit')).toBeInTheDocument();
        expect(within(menu).getByText('Delete')).toBeInTheDocument();
        expect(within(menu).getByRole('separator')).toBeInTheDocument();

        const children = Array.from(menu.children);
        expect(children[0]).toHaveTextContent('Edit');
        expect(children[1]).toHaveAttribute('role', 'separator');
        expect(children[2]).toHaveTextContent('Delete');
    });

    it('invokes onEdit once when Edit is selected', async () => {
        const user = userEvent.setup();
        const onEdit = vi.fn();
        render(
            <CommentActionsMenu
                canEdit={true}
                canDelete={true}
                onEdit={onEdit}
                onDelete={vi.fn()}
            />
        );

        await user.click(
            screen.getByRole('button', { name: 'Comment actions' })
        );
        await user.click(screen.getByText('Edit'));

        expect(onEdit).toHaveBeenCalledTimes(1);
    });

    it('invokes onDelete once when Delete is selected', async () => {
        const user = userEvent.setup();
        const onDelete = vi.fn();
        render(
            <CommentActionsMenu
                canEdit={true}
                canDelete={true}
                onEdit={vi.fn()}
                onDelete={onDelete}
            />
        );

        await user.click(
            screen.getByRole('button', { name: 'Comment actions' })
        );
        await user.click(screen.getByText('Delete'));

        expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it('disables the trigger when disabled', () => {
        render(
            <CommentActionsMenu
                canEdit={true}
                canDelete={true}
                disabled={true}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
            />
        );

        expect(
            screen.getByRole('button', { name: 'Comment actions' })
        ).toBeDisabled();
    });

    it('supports keyboard activation of the Delete item', async () => {
        const user = userEvent.setup();
        const onDelete = vi.fn();
        render(
            <CommentActionsMenu
                canEdit={false}
                canDelete={true}
                onEdit={vi.fn()}
                onDelete={onDelete}
            />
        );

        const trigger = screen.getByRole('button', {
            name: 'Comment actions',
        });
        trigger.focus();
        await user.keyboard('{Enter}');
        await user.keyboard('{Enter}');

        expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it('uses translated names and destructive Delete styling without badges', async () => {
        const user = userEvent.setup();
        render(
            <CommentActionsMenu
                canEdit={true}
                canDelete={true}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
            />
        );

        expect(
            screen.getByRole('button', { name: 'Comment actions' })
        ).toBeInTheDocument();

        await user.click(
            screen.getByRole('button', { name: 'Comment actions' })
        );

        const deleteItem = screen.getByRole('menuitem', { name: 'Delete' });
        expect(deleteItem).toHaveClass('!text-red-700');
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
        expect(screen.queryByText(/^\d+$/)).not.toBeInTheDocument();
    });
});
