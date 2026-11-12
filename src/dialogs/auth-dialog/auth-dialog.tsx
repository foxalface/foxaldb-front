import React, { useCallback, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/dialog/dialog';
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
import { ForgotPasswordScreen } from '@/pages/auth/forgot-password-screen';
import { isValidBackendDiagramId } from '@/lib/realtime/diagram-id';
import { useTranslation } from 'react-i18next';
import { AuthCard } from './auth-card';
import type { AuthOrigin, AuthRegisterReturnTo, AuthStep } from './auth-origin';
import { WelcomeStep } from './welcome-step';

export interface AuthDialogProps extends BaseDialogProps {
    entryAuthActions?: EntryFlowAuthActions;
    origin?: AuthOrigin;
}

export const AuthDialog: React.FC<AuthDialogProps> = ({
    dialog,
    entryAuthActions,
    origin = 'navbar',
}) => {
    const { t } = useTranslation();
    const { diagramId: routeDiagramId } = useParams<{ diagramId?: string }>();
    const { isAuthenticated, isLoading } = useAuth();
    const { clearAuthIntent } = useAuthIntent();
    const { closeAuthDialog } = useDialog();
    const [step, setStep] = useState<AuthStep>(
        origin === 'entry' ? 'welcome' : 'login'
    );
    const [registerReturnTo, setRegisterReturnTo] =
        useState<AuthRegisterReturnTo>('login');
    const [trackedOpen, setTrackedOpen] = useState(dialog.open);
    const skipIntentClearOnCloseRef = useRef(false);
    const isEntryOrigin = origin === 'entry';
    const showOnlineDiagramNote =
        isEntryOrigin &&
        routeDiagramId !== undefined &&
        isValidBackendDiagramId(routeDiagramId);

    if (dialog.open !== trackedOpen) {
        setTrackedOpen(dialog.open);
        if (dialog.open) {
            skipIntentClearOnCloseRef.current = false;
            setStep(isEntryOrigin ? 'welcome' : 'login');
            setRegisterReturnTo('login');
        }
    }

    const closeAuthDialogOnly = useCallback(() => {
        closeAuthDialog();
        setStep(isEntryOrigin ? 'welcome' : 'login');
        setRegisterReturnTo('login');
    }, [closeAuthDialog, isEntryOrigin]);

    const dismissAuthDialog = useCallback(() => {
        if (!skipIntentClearOnCloseRef.current && !isAuthenticated) {
            clearAuthIntent();
        }

        skipIntentClearOnCloseRef.current = false;
        closeAuthDialogOnly();
    }, [closeAuthDialogOnly, clearAuthIntent, isAuthenticated]);

    const handleLoginSuccess = useCallback(() => {
        // Do not execute AuthIntent here. Entry mode only leaves the guest
        // gate. useAuthIntentContinuation is the continuation owner.
        if (isEntryOrigin) {
            entryAuthActions?.onLoginSuccess();
            return;
        }

        skipIntentClearOnCloseRef.current = true;
        closeAuthDialogOnly();
    }, [isEntryOrigin, entryAuthActions, closeAuthDialogOnly]);

    const handleRegisterSuccess = useCallback(() => {
        // Same continuation owner as login. Registration must not migrate.
        if (isEntryOrigin) {
            entryAuthActions?.onRegistrationSuccess();
            return;
        }

        skipIntentClearOnCloseRef.current = true;
        closeAuthDialogOnly();
    }, [isEntryOrigin, entryAuthActions, closeAuthDialogOnly]);

    const handleContinueWithoutAccount = useCallback(() => {
        clearAuthIntent();
        entryAuthActions?.onContinueAsGuest();
    }, [entryAuthActions, clearAuthIntent]);

    const openLogin = useCallback(() => {
        setStep('login');
    }, []);

    const openRegisterFromWelcome = useCallback(() => {
        setRegisterReturnTo('welcome');
        setStep('register');
    }, []);

    const openRegisterFromLogin = useCallback(() => {
        setRegisterReturnTo('login');
        setStep('register');
    }, []);

    const openForgotPassword = useCallback(() => {
        setStep('forgot-password');
    }, []);

    const handleBack = useCallback(() => {
        if (step === 'forgot-password') {
            setStep('login');
            return;
        }

        if (step === 'register') {
            setStep(registerReturnTo);
            return;
        }

        if (isEntryOrigin && step === 'login') {
            setStep('welcome');
        }
    }, [isEntryOrigin, registerReturnTo, step]);

    const handleEscape = useCallback(
        (event: KeyboardEvent) => {
            if (!isEntryOrigin || isAuthenticated || isLoading) {
                return;
            }

            event.preventDefault();

            if (step === 'forgot-password') {
                setStep('login');
                return;
            }

            if (step === 'login') {
                setStep('welcome');
                return;
            }

            if (step === 'register') {
                setStep(registerReturnTo);
            }
        },
        [isAuthenticated, isEntryOrigin, isLoading, registerReturnTo, step]
    );

    const showWelcome = isEntryOrigin && step === 'welcome' && !isAuthenticated;
    const showRegister = step === 'register' && !isAuthenticated && !isLoading;
    const showForgotPassword =
        step === 'forgot-password' && !isAuthenticated && !isLoading;
    const showLogin =
        !showWelcome &&
        !showRegister &&
        !showForgotPassword &&
        !isAuthenticated &&
        !isLoading;
    const backLabel = t('auth.dialog.back');
    const onBack =
        !isLoading &&
        !isAuthenticated &&
        (showRegister || showForgotPassword || (showLogin && isEntryOrigin))
            ? handleBack
            : undefined;

    let title = t('auth.dialog.login_title');
    let description: string | undefined = t('auth.dialog.login_description');
    let descriptionClassName: string | undefined;

    if (isLoading) {
        title =
            showWelcome || isEntryOrigin
                ? t('auth.welcome.brand')
                : t('auth.dialog.login_title');
        description = t('auth.dialog.checking_session');
        descriptionClassName = undefined;
    } else if (isAuthenticated) {
        title = t('auth.dialog.account_title');
        description = t('auth.dialog.account_description');
    } else if (showWelcome) {
        title = t('auth.welcome.brand');
        description = t('auth.welcome.lead');
        descriptionClassName = 'text-foreground';
    } else if (showRegister) {
        title = t('auth.dialog.register_title');
        description = t('auth.dialog.register_description');
    } else if (showForgotPassword) {
        title = t('auth.password_reset.forgot.title');
        description = t('auth.password_reset.forgot.description');
    }

    return (
        <Dialog
            {...dialog}
            onOpenChange={(open) => {
                if (!open) {
                    if (isEntryOrigin) {
                        return;
                    }

                    dismissAuthDialog();
                }
            }}
        >
            <DialogContent
                className="flex max-w-md flex-col"
                showClose={!isEntryOrigin}
                onInteractOutside={(event) => {
                    if (isEntryOrigin) {
                        event.preventDefault();
                    }
                }}
                onEscapeKeyDown={handleEscape}
            >
                <AuthCard
                    description={description}
                    descriptionClassName={descriptionClassName}
                    title={title}
                    titleAs="dialog"
                >
                    {isLoading ? null : isAuthenticated ? (
                        <AuthenticatedAccountPanel
                            onBack={closeAuthDialogOnly}
                        />
                    ) : showWelcome ? (
                        <WelcomeStep
                            onContinueAsGuest={handleContinueWithoutAccount}
                            onCreateAccount={openRegisterFromWelcome}
                            onSignIn={openLogin}
                            showOnlineDiagramNote={showOnlineDiagramNote}
                        />
                    ) : showRegister ? (
                        <RegisterFormPanel
                            backLabel={backLabel}
                            onBack={onBack}
                            onSuccess={handleRegisterSuccess}
                            onSwitchToLogin={openLogin}
                            showHeading={false}
                        />
                    ) : showForgotPassword ? (
                        <ForgotPasswordScreen onBackToLogin={openLogin} />
                    ) : (
                        <LoginFormPanel
                            backLabel={onBack ? backLabel : undefined}
                            onBack={onBack}
                            onForgotPassword={openForgotPassword}
                            onSuccess={handleLoginSuccess}
                            onSwitchToRegister={openRegisterFromLogin}
                            showHeading={false}
                        />
                    )}
                </AuthCard>
            </DialogContent>
        </Dialog>
    );
};
