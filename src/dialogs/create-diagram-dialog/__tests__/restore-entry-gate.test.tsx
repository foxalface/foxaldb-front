import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import { Dialog, DialogContent } from '@/components/dialog/dialog';
import { SelectDatabase } from '../select-database/select-database';

vi.mock('@/hooks/use-dialog', () => ({
    useDialog: () => ({
        openImportDiagramDialog: vi.fn(),
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('../select-database/select-database-content', () => ({
    SelectDatabaseContent: () => <div data-testid="database-choices" />,
}));

describe('Restore entry gate', () => {
    it('shows Restore only when the create flow has no existing diagram', () => {
        const { rerender } = render(
            <Dialog open>
                <DialogContent>
                    <SelectDatabase
                        databaseType={DatabaseType.POSTGRESQL}
                        setDatabaseType={vi.fn()}
                        onDatabaseSelected={vi.fn()}
                        hasExistingDiagram={false}
                    />
                </DialogContent>
            </Dialog>
        );

        expect(
            screen.getByRole('button', {
                name: 'new_diagram_dialog.restore_from_backup',
            })
        ).toBeInTheDocument();

        rerender(
            <Dialog open>
                <DialogContent>
                    <SelectDatabase
                        databaseType={DatabaseType.POSTGRESQL}
                        setDatabaseType={vi.fn()}
                        onDatabaseSelected={vi.fn()}
                        hasExistingDiagram
                    />
                </DialogContent>
            </Dialog>
        );

        expect(
            screen.queryByRole('button', {
                name: 'new_diagram_dialog.restore_from_backup',
            })
        ).not.toBeInTheDocument();
    });
});
