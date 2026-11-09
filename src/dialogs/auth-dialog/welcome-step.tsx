import React from 'react';
import { Button } from '@/components/button/button';
import { useTranslation } from 'react-i18next';

export interface WelcomeStepProps {
    showOnlineDiagramNote: boolean;
    onSignIn: () => void;
    onCreateAccount: () => void;
    onContinueAsGuest: () => void;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({
    showOnlineDiagramNote,
    onSignIn,
    onCreateAccount,
    onContinueAsGuest,
}) => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
                {t('auth.welcome.support')}
            </p>
            {showOnlineDiagramNote ? (
                <p className="text-sm">{t('auth.welcome.online_diagram')}</p>
            ) : null}
            <Button
                autoFocus
                className="w-full"
                onClick={onSignIn}
                type="button"
            >
                {t('auth.login.submit')}
            </Button>
            <Button
                className="w-full"
                onClick={onContinueAsGuest}
                type="button"
                variant="secondary"
            >
                {t('auth.dialog.continue_without_account')}
            </Button>
            <p className="text-sm text-muted-foreground">
                {t('auth.welcome.guest_note')}
            </p>
            <button
                className="self-center text-sm text-muted-foreground underline underline-offset-4"
                onClick={onCreateAccount}
                type="button"
            >
                {t('auth.register.submit')}
            </button>
        </div>
    );
};
