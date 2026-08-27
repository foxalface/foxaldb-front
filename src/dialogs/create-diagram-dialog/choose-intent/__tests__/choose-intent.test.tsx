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
    it('renders both intent actions with selected database context', () => {
        renderChooseIntent({
            databaseType: DatabaseType.POSTGRESQL,
            onBack: vi.fn(),
            onCreateEmpty: vi.fn(),
            onImportSchema: vi.fn(),
            onImportFromDatabase: vi.fn(),
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
                name: /new_diagram_dialog\.choose_intent\.import_schema/,
            })
        ).toBeInTheDocument();
    });

    it('shows the advanced import-from-database action as a secondary link', () => {
        renderChooseIntent({
            databaseType: DatabaseType.POSTGRESQL,
            onBack: vi.fn(),
            onCreateEmpty: vi.fn(),
            onImportSchema: vi.fn(),
            onImportFromDatabase: vi.fn(),
        });

        expect(
            screen.getByRole('button', {
                name: 'new_diagram_dialog.choose_intent.import_from_database',
            })
        ).toBeInTheDocument();
        expect(
            screen.getByText('new_diagram_dialog.choose_intent.no_schema_file')
        ).toBeInTheDocument();
    });

    it('invokes callbacks for create empty, import schema, advanced import, and back', async () => {
        const user = userEvent.setup();
        const onBack = vi.fn();
        const onCreateEmpty = vi.fn();
        const onImportSchema = vi.fn();
        const onImportFromDatabase = vi.fn();

        renderChooseIntent({
            databaseType: DatabaseType.MYSQL,
            onBack,
            onCreateEmpty,
            onImportSchema,
            onImportFromDatabase,
        });

        await user.click(
            screen.getByRole('button', {
                name: /new_diagram_dialog\.choose_intent\.create_empty/,
            })
        );
        await user.click(
            screen.getByRole('button', {
                name: /new_diagram_dialog\.choose_intent\.import_schema/,
            })
        );
        await user.click(
            screen.getByRole('button', {
                name: 'new_diagram_dialog.choose_intent.import_from_database',
            })
        );
        await user.click(
            screen.getByRole('button', {
                name: 'new_diagram_dialog.choose_intent.back',
            })
        );

        expect(onCreateEmpty).toHaveBeenCalledTimes(1);
        expect(onImportSchema).toHaveBeenCalledTimes(1);
        expect(onImportFromDatabase).toHaveBeenCalledTimes(1);
        expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('supports keyboard activation for intent actions', async () => {
        const user = userEvent.setup();
        const onCreateEmpty = vi.fn();

        renderChooseIntent({
            databaseType: DatabaseType.POSTGRESQL,
            onBack: vi.fn(),
            onCreateEmpty,
            onImportSchema: vi.fn(),
            onImportFromDatabase: vi.fn(),
        });

        const createEmptyButton = screen.getByRole('button', {
            name: /new_diagram_dialog\.choose_intent\.create_empty/,
        });

        createEmptyButton.focus();
        await user.keyboard('{Enter}');

        expect(onCreateEmpty).toHaveBeenCalledTimes(1);
    });
});
