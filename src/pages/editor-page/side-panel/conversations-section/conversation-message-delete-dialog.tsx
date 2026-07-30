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
import type { ConversationStatus } from '@/lib/conversations/conversation-types';
import { useConversationMessageDeleteSession } from './use-conversation-message-delete-session';

export interface ConversationMessageDeleteDialogProps {
    conversationId: number;
    messageId: number;
    conversationStatus: ConversationStatus;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDeleted: () => void;
    onCloseAutoFocus?: () => void;
}

export const ConversationMessageDeleteDialog: React.FC<
    ConversationMessageDeleteDialogProps
> = ({
    conversationId,
    messageId,
    conversationStatus,
    open,
    onOpenChange,
    onDeleted,
    onCloseAutoFocus,
}) => {
    const { t } = useTranslation();
    const errorId = useId();

    const session = useConversationMessageDeleteSession({
        conversationId,
        messageId,
        conversationStatus,
        open,
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
                data-testid={`conversation-message-delete-dialog-${messageId}`}
                onCloseAutoFocus={(event) => {
                    event.preventDefault();
                    onCloseAutoFocus?.();
                }}
            >
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {t(
                            'side_panel.conversations_section.detail.delete_dialog.title'
                        )}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {t(
                            'side_panel.conversations_section.detail.delete_dialog.description'
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
                            'side_panel.conversations_section.detail.delete_dialog.cancel'
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
                                  'side_panel.conversations_section.detail.delete_dialog.deleting'
                              )
                            : t(
                                  'side_panel.conversations_section.detail.delete_dialog.confirm'
                              )}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
