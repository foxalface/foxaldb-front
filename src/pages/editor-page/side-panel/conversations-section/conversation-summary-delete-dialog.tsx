import React, { useId } from 'react';
import { useTranslation } from 'react-i18next';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/alert-dialog/alert-dialog';
import { Button } from '@/components/button/button';
import { useConversationDeleteSession } from './use-conversation-delete-session';

export interface ConversationSummaryDeleteDialogProps {
    conversationId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirmDelete: (conversationId: number) => Promise<void>;
    onDeleted: () => void;
    onCloseAutoFocus?: () => void;
}

export const ConversationSummaryDeleteDialog: React.FC<
    ConversationSummaryDeleteDialogProps
> = ({
    conversationId,
    open,
    onOpenChange,
    onConfirmDelete,
    onDeleted,
    onCloseAutoFocus,
}) => {
    const { t } = useTranslation();
    const errorId = useId();

    const session = useConversationDeleteSession({
        conversationId,
        open,
        onConfirmDelete,
        onDeleted,
        onOpenChange,
    });

    const handleConfirmClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        void session.confirmDelete();
    };

    return (
        <AlertDialog open={open} onOpenChange={session.handleOpenChange}>
            <AlertDialogContent
                data-vaul-no-drag
                data-testid={`conversation-summary-delete-dialog-${conversationId}`}
                onCloseAutoFocus={(event) => {
                    event.preventDefault();
                    onCloseAutoFocus?.();
                }}
            >
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {t(
                            'side_panel.conversations_section.summary.delete_dialog.title'
                        )}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {t(
                            'side_panel.conversations_section.summary.delete_dialog.description'
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                {session.errorMessage ? (
                    <p
                        id={errorId}
                        role="alert"
                        className="text-sm text-destructive"
                    >
                        {session.errorMessage}
                    </p>
                ) : null}
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={session.isPending}>
                        {t(
                            'side_panel.conversations_section.summary.delete_dialog.cancel'
                        )}
                    </AlertDialogCancel>
                    <Button
                        type="button"
                        variant="destructive"
                        disabled={session.isPending}
                        aria-describedby={
                            session.errorMessage ? errorId : undefined
                        }
                        onClick={handleConfirmClick}
                    >
                        {session.isPending
                            ? t(
                                  'side_panel.conversations_section.summary.delete_dialog.deleting'
                              )
                            : t(
                                  'side_panel.conversations_section.summary.delete_dialog.confirm'
                              )}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
