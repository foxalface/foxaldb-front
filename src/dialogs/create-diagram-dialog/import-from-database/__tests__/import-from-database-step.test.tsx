import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Dialog, DialogContent } from '@/components/dialog/dialog';
import { TooltipProvider } from '@/components/tooltip/tooltip';
import { DatabaseType } from '@/lib/domain/database-type';
import { metadataJsonSample } from '@/lib/import/__tests__/fixtures/import-samples';
import { ImportFromDatabaseStep } from '../import-from-database-step';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

const renderStep = (
    props: Partial<React.ComponentProps<typeof ImportFromDatabaseStep>> = {}
) => {
    const setMetadataResult = vi.fn();
    const setDatabaseEdition = vi.fn();
    const onContinue = vi.fn();
    const onBack = vi.fn();

    render(
        <TooltipProvider>
            <Dialog open>
                <DialogContent>
                    <ImportFromDatabaseStep
                        databaseType={DatabaseType.POSTGRESQL}
                        databaseEdition={undefined}
                        setDatabaseEdition={setDatabaseEdition}
                        metadataResult=""
                        setMetadataResult={setMetadataResult}
                        onContinue={onContinue}
                        onBack={onBack}
                        {...props}
                    />
                </DialogContent>
            </Dialog>
        </TooltipProvider>
    );

    return { setMetadataResult, setDatabaseEdition, onContinue, onBack };
};

describe('ImportFromDatabaseStep', () => {
    it('shows unsupported state for generic database type', () => {
        renderStep({ databaseType: DatabaseType.GENERIC });

        expect(
            screen.getByText(
                'new_diagram_dialog.import_from_database.unsupported_database'
            )
        ).toBeInTheDocument();
    });

    it('enables continue for valid metadata result', async () => {
        const user = userEvent.setup();
        const onContinue = vi.fn();

        renderStep({
            metadataResult: metadataJsonSample,
            onContinue,
        });

        const continueButton = screen.getByRole('button', {
            name: 'new_diagram_dialog.import_from_database.continue',
        });

        await waitFor(() => {
            expect(continueButton).toBeEnabled();
        });

        await user.click(continueButton);

        expect(onContinue).toHaveBeenCalledWith(metadataJsonSample.trim());
    });

    it('does not expose Smart Query terminology', () => {
        renderStep();

        expect(screen.queryByText(/smart query/i)).not.toBeInTheDocument();
    });
});
