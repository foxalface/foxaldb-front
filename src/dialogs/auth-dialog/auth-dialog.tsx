import React, { useCallback, useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/dialog/dialog';
import { Button } from '@/components/button/button';
import type { BaseDialogProps } from '../common/base-dialog-props';
import { useAuth } from '@/hooks/use-auth';
import { useDialog } from '@/hooks/use-dialog';
import type { EntryFlowAuthActions } from '@/pages/editor-page/entry-flow-auth-actions';
import {
    AuthenticatedAccountPanel,
    LoginFormPanel,
    RegisterFormPanel,
} from '@/pages/auth/auth-form-panels';
import { useTranslation } from 'react-i18next';

type AuthDialogMode = 'login' | 'register';

export interface AuthDialogProps extends BaseDialogProps {
    entryAuthActions?: EntryFlowAuthActions;
}

export const AuthDialog: React.FC<AuthDialogProps> = ({
    dialog,
    entryAuthActions,
}) => {
    const { t } = useTranslation();
    const { isAuthenticated, isLoading } = useAuth();
    const { closeAuthDialog } = useDialog();
    const [mode, setMode] = useState<AuthDialogMode>('login');
    const isEntryMode = entryAuthActions !== undefined;

    useEffect(() => {
        if (dialog.open) {
            setMode('login');
        }
    }, [dialog.open]);

    const closeDialog = useCallback(() => {
        closeAuthDialog();
        setMode('login');
    }, [closeAuthDialog]);

    const handleLoginSuccess = useCallback(() => {
        if (isEntryMode) {
            entryAuthActions.onLoginSuccess();
            return;
        }

        closeDialog();
    }, [isEntryMode, entryAuthActions, closeDialog]);

    const handleRegisterSuccess = useCallback(() => {
        if (isEntryMode) {
            entryAuthActions.onRegistrationSuccess();
            return;
        }

        closeDialog();
    }, [isEntryMode, entryAuthActions, closeDialog]);

    const handleContinueWithoutAccount = useCallback(() => {
        entryAuthActions?.onContinueAsGuest();
    }, [entryAuthActions]);

    const showContinueWithoutAccount =
        isEntryMode && !isLoading && !isAuthenticated;

    return (
        <Dialog
            {...dialog}
            onOpenChange={(open) => {
                if (!open) {
                    closeDialog();
                }
            }}
        >
            <DialogContent className="flex max-w-md flex-col" showClose>
                <DialogHeader>
                    <DialogTitle>
                        {isAuthenticated
                            ? t('auth.dialog.account_title')
                            : mode === 'login'
                              ? t('auth.dialog.login_title')
                              : t('auth.dialog.register_title')}
                    </DialogTitle>
                    <DialogDescription>
                        {isAuthenticated
                            ? t('auth.dialog.account_description')
                            : mode === 'login'
                              ? t('auth.dialog.login_description')
                              : t('auth.dialog.register_description')}
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <p className="text-sm text-muted-foreground">
                        {t('auth.dialog.checking_session')}
                    </p>
                ) : isAuthenticated ? (
                    <AuthenticatedAccountPanel onBack={closeDialog} />
                ) : mode === 'login' ? (
                    <LoginFormPanel
                        onSuccess={handleLoginSuccess}
                        onSwitchToRegister={() => setMode('register')}
                    />
                ) : (
                    <RegisterFormPanel
                        onSuccess={handleRegisterSuccess}
                        onSwitchToLogin={() => setMode('login')}
                    />
                )}

                {showContinueWithoutAccount ? (
                    <Button
                        className="mt-2"
                        type="button"
                        variant="secondary"
                        onClick={handleContinueWithoutAccount}
                    >
                        {t('auth.dialog.continue_without_account')}
                    </Button>
                ) : null}
            </DialogContent>
        </Dialog>
    );
};
