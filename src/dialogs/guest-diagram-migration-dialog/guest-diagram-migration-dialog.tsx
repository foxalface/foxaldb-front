import React, { useCallback } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/alert-dialog/alert-dialog';
import type { BaseDialogProps } from '../common/base-dialog-props';
import type { EntryFlowGuestMigrationActions } from '@/pages/editor-page/entry-flow-guest-migration-actions';
import { useTranslation } from 'react-i18next';

export interface GuestDiagramMigrationDialogProps extends BaseDialogProps {
    entryGuestMigrationActions?: EntryFlowGuestMigrationActions;
    isMigrating?: boolean;
}

export const GuestDiagramMigrationDialog: React.FC<
    GuestDiagramMigrationDialogProps
> = ({ dialog, entryGuestMigrationActions, isMigrating = false }) => {
    const { t } = useTranslation();
    const isEntryMode = entryGuestMigrationActions !== undefined;

    const handleImport = useCallback(() => {
        entryGuestMigrationActions?.onAcceptMigration();
    }, [entryGuestMigrationActions]);

    const handleDecline = useCallback(() => {
        entryGuestMigrationActions?.onDeclineMigration();
    }, [entryGuestMigrationActions]);

    return (
        <AlertDialog
            {...dialog}
            onOpenChange={(open) => {
                if (!open && isEntryMode) {
                    return;
                }
            }}
        >
            <AlertDialogContent
                onEscapeKeyDown={(event) => {
                    if (isEntryMode) {
                        event.preventDefault();
                    }
                }}
            >
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {t('guest_migration_dialog.title')}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('guest_migration_dialog.description')}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel
                        disabled={isMigrating}
                        onClick={handleDecline}
                    >
                        {t('guest_migration_dialog.continue_without_import')}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        disabled={isMigrating}
                        onClick={(event) => {
                            event.preventDefault();
                            handleImport();
                        }}
                    >
                        {t('guest_migration_dialog.import')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
