import React, { useCallback, useState } from 'react';
import { Button } from '@/components/button/button';
import { Input } from '@/components/input/input';
import { ApiError } from '@/lib/api/client';
import { requestPasswordReset } from '@/lib/api/auth';
import { formatApiErrorMessage } from './format-api-error-message';
import { useTranslation } from 'react-i18next';

export interface ForgotPasswordScreenProps {
    onBackToLogin: () => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
    onBackToLogin,
}) => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = useCallback(
        async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setErrorMessage(null);
            setIsSubmitting(true);

            try {
                await requestPasswordReset(email);
                setSubmitted(true);
            } catch (error: unknown) {
                if (error instanceof ApiError && error.status === 429) {
                    setErrorMessage(t('auth.password_reset.errors.rate_limit'));
                } else {
                    setErrorMessage(
                        formatApiErrorMessage(error) ||
                            t('auth.password_reset.errors.server')
                    );
                }
            } finally {
                setIsSubmitting(false);
            }
        },
        [email, t]
    );

    return (
        <div className="flex max-w-md flex-col gap-4">
            {submitted ? (
                <p className="text-sm text-foreground" role="status">
                    {t('auth.password_reset.forgot.sent')}
                </p>
            ) : (
                <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
                    <label className="flex flex-col gap-1 text-sm">
                        <span>
                            {t('auth.password_reset.forgot.email_label')}
                        </span>
                        <Input
                            autoComplete="email"
                            autoFocus
                            disabled={isSubmitting}
                            name="email"
                            onChange={(event) => setEmail(event.target.value)}
                            required
                            type="email"
                            value={email}
                        />
                    </label>
                    {errorMessage !== null ? (
                        <p className="text-sm text-destructive" role="alert">
                            {errorMessage}
                        </p>
                    ) : null}
                    <Button disabled={isSubmitting} type="submit">
                        {isSubmitting
                            ? t('auth.password_reset.forgot.sending')
                            : t('auth.password_reset.forgot.send')}
                    </Button>
                </form>
            )}

            <button
                className="w-fit text-sm text-muted-foreground underline underline-offset-4"
                onClick={onBackToLogin}
                type="button"
            >
                {t('auth.password_reset.forgot.back_to_sign_in')}
            </button>
        </div>
    );
};
