import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DialogProvider } from '@/context/dialog-context/dialog-provider';
import { useDialog } from '@/hooks/use-dialog';

vi.mock('@/dialogs/open-diagram-dialog/open-diagram-dialog', () => ({
    OpenDiagramDialog: () => null,
}));
vi.mock(
    '@/dialogs/create-relationship-dialog/create-relationship-dialog',
    () => ({
        CreateRelationshipDialog: () => null,
    })
);
vi.mock('@/dialogs/table-schema-dialog/table-schema-dialog', () => ({
    TableSchemaDialog: () => null,
}));
vi.mock('@/dialogs/export-diagram-dialog/export-diagram-dialog', () => ({
    ExportDiagramDialog: () => null,
}));
vi.mock('@/dialogs/export-wizard/export-wizard-dialog', () => ({
    ExportWizardDialog: () => null,
}));
vi.mock('@/dialogs/import-diagram-dialog/import-diagram-dialog', () => ({
    ImportDiagramDialog: () => null,
}));
vi.mock('@/dialogs/auth-dialog/auth-dialog', () => ({
    AuthDialog: () => null,
}));
vi.mock('@/dialogs/user-settings-dialog/user-settings-dialog', () => ({
    UserSettingsDialog: () => null,
}));
vi.mock(
    '@/dialogs/laravel-migration-import-dialog/laravel-migration-import-dialog',
    () => ({
        LaravelMigrationImportDialog: () => null,
    })
);
vi.mock(
    '@/dialogs/laravel-migration-diff-dialog/laravel-migration-diff-dialog',
    () => ({
        LaravelMigrationDiffDialog: () => null,
    })
);
vi.mock(
    '@/dialogs/guest-diagram-migration-dialog/guest-diagram-migration-dialog',
    () => ({
        GuestDiagramMigrationDialog: () => null,
    })
);

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

const Probe: React.FC = () => {
    const { openMergeWizardDialog, closeMergeWizardDialog } = useDialog();

    return (
        <>
            <button type="button" onClick={() => openMergeWizardDialog()}>
                open-merge
            </button>
            <button type="button" onClick={() => closeMergeWizardDialog()}>
                close-merge
            </button>
        </>
    );
};

describe('DialogProvider merge wizard', () => {
    it('registers open and close without rendering until opened', async () => {
        const user = userEvent.setup();
        render(
            <DialogProvider>
                <Probe />
            </DialogProvider>
        );

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'open-merge' }));
        expect(await screen.findByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('merge_wizard.title')).toBeInTheDocument();

        await user.click(
            screen.getByRole('button', { name: 'merge_wizard.cancel' })
        );
        await waitFor(() =>
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        );
    });
});
