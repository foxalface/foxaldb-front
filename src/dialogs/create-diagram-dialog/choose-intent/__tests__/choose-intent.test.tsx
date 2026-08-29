import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Dialog, DialogContent } from '@/components/dialog/dialog';
import { DatabaseType } from '@/lib/domain/database-type';
import { ChooseIntent } from '../choose-intent';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: { database?: string }) => {
            if (key === 'new_diagram_dialog.choose_intent.description') {
                return `Create a new diagram for ${options?.database ?? ''}.`;
            }

            return key;
        },
    }),
}));

const renderChooseIntent = (props: React.ComponentProps<typeof ChooseIntent>) =>
    render(
        <Dialog open>
            <DialogContent>
                <ChooseIntent {...props} />
            </DialogContent>
        </Dialog>
    );

describe('ChooseIntent', () => {
    it('renders create empty and import actions', () => {
        renderChooseIntent({
            databaseType: DatabaseType.POSTGRESQL,
            onBack: vi.fn(),
            onCreateEmpty: vi.fn(),
            onImport: vi.fn(),
        });

        expect(
            screen.getByRole('heading', {
                name: 'new_diagram_dialog.choose_intent.title',
            })
        ).toBeInTheDocument();
        expect(
            screen.getByText('Create a new diagram for PostgreSQL.')
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: /new_diagram_dialog\.choose_intent\.create_empty/,
            })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: /new_diagram_dialog\.choose_intent\.import/,
            })
        ).toBeInTheDocument();
    });

    it('does not show a separate advanced import link', () => {
        renderChooseIntent({
            databaseType: DatabaseType.POSTGRESQL,
            onBack: vi.fn(),
            onCreateEmpty: vi.fn(),
            onImport: vi.fn(),
        });

        expect(
            screen.queryByText(
                'new_diagram_dialog.choose_intent.no_schema_file'
            )
        ).not.toBeInTheDocument();
    });

    it('invokes callbacks for create empty, import, and back', async () => {
        const user = userEvent.setup();
        const onBack = vi.fn();
        const onCreateEmpty = vi.fn();
        const onImport = vi.fn();

        renderChooseIntent({
            databaseType: DatabaseType.MYSQL,
            onBack,
            onCreateEmpty,
            onImport,
        });

        await user.click(
            screen.getByRole('button', {
                name: /new_diagram_dialog\.choose_intent\.create_empty/,
            })
        );
        await user.click(
            screen.getByRole('button', {
                name: /new_diagram_dialog\.choose_intent\.import/,
            })
        );
        await user.click(
            screen.getByRole('button', {
                name: 'new_diagram_dialog.choose_intent.back',
            })
        );

        expect(onCreateEmpty).toHaveBeenCalledTimes(1);
        expect(onImport).toHaveBeenCalledTimes(1);
        expect(onBack).toHaveBeenCalledTimes(1);
    });
});
