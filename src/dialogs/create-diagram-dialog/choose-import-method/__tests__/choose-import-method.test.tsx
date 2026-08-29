import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dialog, DialogContent } from '@/components/dialog/dialog';
import { DatabaseType } from '@/lib/domain/database-type';
import { ChooseImportMethod } from '../choose-import-method';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: { database?: string }) => {
            if (key === 'new_diagram_dialog.choose_import_method.description') {
                return `Choose a source for your ${options?.database ?? ''} diagram.`;
            }

            return key;
        },
    }),
}));

const renderChooseImportMethod = (
    props: React.ComponentProps<typeof ChooseImportMethod>
) =>
    render(
        <Dialog open>
            <DialogContent>
                <ChooseImportMethod {...props} />
            </DialogContent>
        </Dialog>
    );

describe('ChooseImportMethod', () => {
    it('renders both import method options', () => {
        renderChooseImportMethod({
            databaseType: DatabaseType.POSTGRESQL,
            onBack: vi.fn(),
            onImportFromFile: vi.fn(),
            onImportFromDatabase: vi.fn(),
        });

        expect(
            screen.getByRole('heading', {
                name: 'new_diagram_dialog.choose_import_method.title',
            })
        ).toBeInTheDocument();
        expect(
            screen.getByText('Choose a source for your PostgreSQL diagram.')
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: /new_diagram_dialog\.choose_import_method\.from_file/,
            })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: /new_diagram_dialog\.choose_import_method\.from_database/,
            })
        ).toBeInTheDocument();
    });

    it('invokes callbacks for each option and back', async () => {
        const user = userEvent.setup();
        const onBack = vi.fn();
        const onImportFromFile = vi.fn();
        const onImportFromDatabase = vi.fn();

        renderChooseImportMethod({
            databaseType: DatabaseType.MYSQL,
            onBack,
            onImportFromFile,
            onImportFromDatabase,
        });

        await user.click(
            screen.getByRole('button', {
                name: /new_diagram_dialog\.choose_import_method\.from_file/,
            })
        );
        await user.click(
            screen.getByRole('button', {
                name: /new_diagram_dialog\.choose_import_method\.from_database/,
            })
        );
        await user.click(
            screen.getByRole('button', {
                name: 'new_diagram_dialog.choose_import_method.back',
            })
        );

        expect(onImportFromFile).toHaveBeenCalledTimes(1);
        expect(onImportFromDatabase).toHaveBeenCalledTimes(1);
        expect(onBack).toHaveBeenCalledTimes(1);
    });
});
