import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/button/button';
import { Input } from '@/components/input/input';
import { useAuth } from '@/hooks/use-auth';
import { ApiError } from '@/lib/api/client';
import { resetPassword } from '@/lib/api/auth';
import { parseLaravelValidationErrors } from '@/lib/api/parse-validation-errors';
import { formatApiErrorMessage } from './format-api-error-message';
import { useTranslation } from 'react-i18next';

export const ResetPasswordScreen: React.FC<{
    token: string | null;
    email: string | null;
}> = ({ token, email }) => {
    const { t } = useTranslation();
    const { refreshSession } = useAuth();
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [succeeded, setSucceeded] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [linkInvalid, setLinkInvalid] = useState(false);

    const hasRequiredParams = useMemo(
        () =>
            typeof token === 'string' &&
            token.length > 0 &&
            typeof email === 'string' &&
            email.length > 0,
        [email, token]
    );

    useEffect(() => {
        if (!hasRequiredParams) {
            setLinkInvalid(true);
        }
    }, [hasRequiredParams]);

    const handleSubmit = useCallback(
        async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            if (!hasRequiredParams || token === null || email === null) {
                setLinkInvalid(true);
                return;
            }

            setFormError(null);
            setPasswordError(null);
            setIsSubmitting(true);

            try {
                await resetPassword({
                    token,
                    email,
                    password,
                    password_confirmation: passwordConfirmation,
                });
                await refreshSession();
                setSucceeded(true);
            } catch (error: unknown) {
                const validationErrors = parseLaravelValidationErrors(error);
                const passwordMessage = validationErrors.password;
                const emailMessage = validationErrors.email;

                if (passwordMessage !== undefined) {
                    setPasswordError(passwordMessage);
                    return;
                }

                if (emailMessage !== undefined) {
                    setLinkInvalid(true);
                    return;
                }

                if (error instanceof ApiError && error.status === 429) {
                    setFormError(t('auth.password_reset.errors.rate_limit'));
                    return;
                }

                setFormError(
                    formatApiErrorMessage(error) ||
                        t('auth.password_reset.errors.server')
                );
            } finally {
                setIsSubmitting(false);
            }
        },
        [
            email,
            hasRequiredParams,
            password,
            passwordConfirmation,
            refreshSession,
            t,
            token,
        ]
    );

    if (succeeded) {
        return (
            <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-10">
                <h1 className="text-2xl font-semibold">
                    {t('auth.password_reset.reset.success_title')}
                </h1>
                <p className="text-sm text-muted-foreground">
                    {t('auth.password_reset.reset.success_description')}
                </p>
                <Link
                    className="text-sm font-medium underline underline-offset-4"
                    to="/login"
                >
                    {t('auth.password_reset.reset.sign_in')}
                </Link>
            </div>
        );
    }

    if (linkInvalid) {
        return (
            <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-10">
                <h1 className="text-2xl font-semibold">
                    {t('auth.password_reset.reset.invalid_title')}
                </h1>
                <p className="text-sm text-muted-foreground">
                    {t('auth.password_reset.reset.invalid_description')}
                </p>
                <Link
                    className="text-sm text-muted-foreground underline underline-offset-4"
                    to="/forgot-password"
                >
                    {t('auth.password_reset.forgot.send')}
                </Link>
                <Link
                    className="text-sm text-muted-foreground underline underline-offset-4"
                    to="/login"
                >
                    {t('auth.password_reset.reset.sign_in')}
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-10">
            <h1 className="text-2xl font-semibold">
                {t('auth.password_reset.reset.title')}
            </h1>
            <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
                <label className="flex flex-col gap-1 text-sm">
                    <span>{t('auth.password_reset.reset.email_label')}</span>
                    <Input disabled readOnly type="email" value={email ?? ''} />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                    <span>{t('auth.password_reset.reset.password_label')}</span>
                    <Input
                        autoComplete="new-password"
                        autoFocus
                        disabled={isSubmitting}
                        name="password"
                        onChange={(event) => setPassword(event.target.value)}
                        required
                        type="password"
                        value={password}
                    />
                    {passwordError !== null ? (
                        <p className="text-xs text-destructive" role="alert">
                            {passwordError}
                        </p>
                    ) : null}
                </label>
                <label className="flex flex-col gap-1 text-sm">
                    <span>
                        {t(
                            'auth.password_reset.reset.password_confirmation_label'
                        )}
                    </span>
                    <Input
                        autoComplete="new-password"
                        disabled={isSubmitting}
                        name="password_confirmation"
                        onChange={(event) =>
                            setPasswordConfirmation(event.target.value)
                        }
                        required
                        type="password"
                        value={passwordConfirmation}
                    />
                </label>
                {formError !== null ? (
                    <p className="text-sm text-destructive" role="alert">
                        {formError}
                    </p>
                ) : null}
                <Button disabled={isSubmitting} type="submit">
                    {isSubmitting
                        ? t('auth.password_reset.reset.submitting')
                        : t('auth.password_reset.reset.submit')}
                </Button>
            </form>
            <Link
                className="text-sm text-muted-foreground underline underline-offset-4"
                to="/login"
            >
                {t('auth.password_reset.reset.sign_in')}
            </Link>
        </div>
    );
};
