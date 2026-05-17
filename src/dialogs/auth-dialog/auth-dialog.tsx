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

type AuthDialogMode = 'login' | 'register';

export interface AuthDialogProps extends BaseDialogProps {}

export const AuthDialog: React.FC<AuthDialogProps> = ({ dialog }) => {
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
                            ? 'Account'
                            : mode === 'login'
                              ? 'Sign in to FoxalDB'
                              : 'Create a FoxalDB account'}
                    </DialogTitle>
                    <DialogDescription>
                        {isAuthenticated
                            ? 'Manage your current session.'
                            : mode === 'login'
                              ? 'Sign in to save more diagrams and keep them synced.'
                              : 'Create an account to save more diagrams.'}
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <p className="text-sm text-muted-foreground">
                        Checking session...
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
