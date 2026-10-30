import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { useAuthIntent } from '@/hooks/use-auth-intent';
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
    const { clearAuthIntent } = useAuthIntent();
    const { closeAuthDialog } = useDialog();
    const [mode, setMode] = useState<AuthDialogMode>('login');
    const isEntryMode = entryAuthActions !== undefined;
    const skipIntentClearOnCloseRef = useRef(false);

    useEffect(() => {
        if (dialog.open) {
            setMode('login');
        }
    }, [dialog.open]);

    const closeAuthDialogOnly = useCallback(() => {
        closeAuthDialog();
        setMode('login');
    }, [closeAuthDialog]);

    const dismissAuthDialog = useCallback(() => {
        if (!skipIntentClearOnCloseRef.current && !isAuthenticated) {
            clearAuthIntent();
        }
        skipIntentClearOnCloseRef.current = false;
        closeAuthDialogOnly();
    }, [closeAuthDialogOnly, clearAuthIntent, isAuthenticated]);

    const markAuthSuccessClose = useCallback(() => {
        skipIntentClearOnCloseRef.current = true;
    }, []);

    const handleLoginSuccess = useCallback(() => {
        // Do not execute AuthIntent here. Entry mode only leaves the guest
        // gate. useAuthIntentContinuation is the continuation owner.
        markAuthSuccessClose();
        if (isEntryMode) {
            entryAuthActions.onLoginSuccess();
            return;
        }

        closeAuthDialogOnly();
    }, [
        isEntryMode,
        entryAuthActions,
        closeAuthDialogOnly,
        markAuthSuccessClose,
    ]);

    const handleRegisterSuccess = useCallback(() => {
        // Same continuation owner as login. Registration must not migrate.
        markAuthSuccessClose();
        if (isEntryMode) {
            entryAuthActions.onRegistrationSuccess();
            return;
        }

        closeAuthDialogOnly();
    }, [
        isEntryMode,
        entryAuthActions,
        closeAuthDialogOnly,
        markAuthSuccessClose,
    ]);

    const handleContinueWithoutAccount = useCallback(() => {
        clearAuthIntent();
        entryAuthActions?.onContinueAsGuest();
    }, [entryAuthActions, clearAuthIntent]);

    const showContinueWithoutAccount =
        isEntryMode && !isLoading && !isAuthenticated;

    const isEntryChoiceRequired = isEntryMode;

    return (
        <Dialog
            {...dialog}
            onOpenChange={(open) => {
                if (!open) {
                    if (isEntryChoiceRequired) {
                        return;
                    }

                    dismissAuthDialog();
                }
            }}
        >
            <DialogContent
                className="flex max-w-md flex-col"
                showClose={!isEntryChoiceRequired}
                onInteractOutside={(event) => {
                    if (isEntryChoiceRequired) {
                        event.preventDefault();
                    }
                }}
                onEscapeKeyDown={(event) => {
                    if (isEntryChoiceRequired) {
                        event.preventDefault();
                    }
                }}
            >
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
                    <AuthenticatedAccountPanel onBack={closeAuthDialogOnly} />
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
