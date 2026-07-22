import React from 'react';
import { render, screen } from '@testing-library/react';
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

    it('renders no trigger when canEdit is false', () => {
        render(<CommentActionsMenu canEdit={false} onEdit={vi.fn()} />);

        expect(
            screen.queryByRole('button', { name: 'Comment actions' })
        ).not.toBeInTheDocument();
        expect(screen.queryByText('Edit')).not.toBeInTheDocument();
        expect(screen.queryByText(/delete/i)).not.toBeInTheDocument();
    });

    it('renders an accessible trigger and translated Edit item when canEdit is true', async () => {
        const user = userEvent.setup();
        const onEdit = vi.fn();
        render(<CommentActionsMenu canEdit={true} onEdit={onEdit} />);

        const trigger = screen.getByRole('button', {
            name: 'Comment actions',
        });
        expect(trigger).toBeInTheDocument();

        await user.click(trigger);

        expect(screen.getByText('Edit')).toBeInTheDocument();
        expect(screen.queryByText(/delete/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/^\d+$/)).not.toBeInTheDocument();
    });

    it('invokes onEdit once when Edit is selected', async () => {
        const user = userEvent.setup();
        const onEdit = vi.fn();
        render(<CommentActionsMenu canEdit={true} onEdit={onEdit} />);

        await user.click(
            screen.getByRole('button', { name: 'Comment actions' })
        );
        await user.click(screen.getByText('Edit'));

        expect(onEdit).toHaveBeenCalledTimes(1);
    });

    it('disables the trigger when disabled', () => {
        render(
            <CommentActionsMenu
                canEdit={true}
                disabled={true}
                onEdit={vi.fn()}
            />
        );

        expect(
            screen.getByRole('button', { name: 'Comment actions' })
        ).toBeDisabled();
    });

    it('supports keyboard activation of the Edit item', async () => {
        const user = userEvent.setup();
        const onEdit = vi.fn();
        render(<CommentActionsMenu canEdit={true} onEdit={onEdit} />);

        const trigger = screen.getByRole('button', {
            name: 'Comment actions',
        });
        trigger.focus();
        await user.keyboard('{Enter}');
        await user.keyboard('{Enter}');

        expect(onEdit).toHaveBeenCalledTimes(1);
    });

    it('does not render a Delete item or badge', async () => {
        const user = userEvent.setup();
        render(<CommentActionsMenu canEdit={true} onEdit={vi.fn()} />);

        await user.click(
            screen.getByRole('button', { name: 'Comment actions' })
        );

        expect(screen.queryByText(/delete/i)).not.toBeInTheDocument();
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
        expect(screen.queryByText(/^\d+$/)).not.toBeInTheDocument();
    });
});
