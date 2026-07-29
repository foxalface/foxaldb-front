import React, { useCallback, useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/dialog/dialog';
import type { BaseDialogProps } from '../common/base-dialog-props';
import { useAuth } from '@/hooks/use-auth';
import { useDialog } from '@/hooks/use-dialog';
import {
    AuthenticatedAccountPanel,
    LoginFormPanel,
    RegisterFormPanel,
} from '@/pages/auth/auth-form-panels';
import { useTranslation } from 'react-i18next';

type AuthDialogMode = 'login' | 'register';

export interface AuthDialogProps extends BaseDialogProps {}

export const AuthDialog: React.FC<AuthDialogProps> = ({ dialog }) => {
    const { t } = useTranslation();
    const { isAuthenticated, isLoading } = useAuth();
    const { closeAuthDialog } = useDialog();
    const [mode, setMode] = useState<AuthDialogMode>('login');

    useEffect(() => {
        if (dialog.open) {
            setMode('login');
        }
    }, [dialog.open]);

    const closeDialog = useCallback(() => {
        closeAuthDialog();
        setMode('login');
    }, [closeAuthDialog]);

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
                        onSuccess={closeDialog}
                        onSwitchToRegister={() => setMode('register')}
                    />
                ) : (
                    <RegisterFormPanel
                        onSuccess={closeDialog}
                        onSwitchToLogin={() => setMode('login')}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
};
