import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/button/button';
import { FormField } from '@/components/form-field/form-field';
import {
    formFieldDescribedBy,
    invalidControlClassName,
} from '@/components/form-field/form-field-ids';
import { Input } from '@/components/input/input';
import { PasswordInput } from '@/components/password-input/password-input';
import { useToast } from '@/components/toast/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { resetPassword } from '@/lib/api/auth';
import { normalizeApiError } from '@/lib/api/normalize-api-error';
import { collectFormValidity } from '@/lib/forms/collect-form-validity';
import {
    mapServerFieldMessages,
    messagesForIssues,
    nonFieldErrorMessageKey,
    submissionToastMessageKey,
    toastMessageForMappedFields,
} from '@/lib/forms/form-error-messages';
import { namedControl, usePendingFocus } from '@/lib/forms/use-pending-focus';
import { useTranslation } from 'react-i18next';

const RESET_FIELDS = ['password', 'password_confirmation'] as const;
const RESET_VALIDATION_TOAST_KEY = 'validation:reset-password';

export const ResetPasswordScreen: React.FC<{
    token: string | null;
    email: string | null;
}> = ({ token, email }) => {
    const { t } = useTranslation();
    const { refreshSession } = useAuth();
    const { toast } = useToast();
    const focusInvalid = usePendingFocus();
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [succeeded, setSucceeded] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<
        Partial<Record<(typeof RESET_FIELDS)[number], string>>
    >({});
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

    const clearField = useCallback((field: (typeof RESET_FIELDS)[number]) => {
        setFieldErrors((current) => {
            if (current[field] === undefined) {
                return current;
            }

            const next = { ...current };
            delete next[field];
            return next;
        });
    }, []);

    const handleSubmit = useCallback(
        async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            if (!hasRequiredParams || token === null || email === null) {
                setLinkInvalid(true);
                return;
            }

            const form = event.currentTarget;
            const validity = collectFormValidity(form, {
                confirmation: {
                    field: 'password_confirmation',
                    matches: 'password',
                },
            });

            if (validity.issues.length > 0) {
                setFieldErrors(messagesForIssues(validity.issues, t));
                focusInvalid(validity.firstInvalid);
                toast({
                    title: t(submissionToastMessageKey(validity.issues)),
                    variant: 'danger',
                    dedupeKey: RESET_VALIDATION_TOAST_KEY,
                });
                return;
            }

            setFieldErrors({});
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
                const apiError = normalizeApiError(error);
                const tokenFailure =
                    (apiError.fields.email?.length ?? 0) > 0 &&
                    (apiError.fields.password?.length ?? 0) === 0 &&
                    (apiError.fields.password_confirmation?.length ?? 0) === 0;

                if (tokenFailure) {
                    setLinkInvalid(true);
                    return;
                }

                const mapped = mapServerFieldMessages(
                    apiError,
                    RESET_FIELDS,
                    t
                );
                if (
                    apiError.code === 'validation_failed' &&
                    Object.keys(mapped).length > 0
                ) {
                    setFieldErrors(mapped);
                    const firstField = RESET_FIELDS.find(
                        (field) => mapped[field] !== undefined
                    );
                    focusInvalid(
                        firstField === undefined
                            ? null
                            : namedControl(form, firstField)
                    );
                    toast({
                        title: toastMessageForMappedFields(mapped, t),
                        variant: 'danger',
                        dedupeKey: RESET_VALIDATION_TOAST_KEY,
                    });
                    return;
                }

                const messageKey =
                    apiError.code === 'too_many_requests'
                        ? 'auth.password_reset.errors.rate_limit'
                        : nonFieldErrorMessageKey(apiError.code);
                toast({
                    title: t(messageKey),
                    variant: 'danger',
                    dedupeKey: `auth:${apiError.code}`,
                });
            } finally {
                setIsSubmitting(false);
            }
        },
        [
            email,
            focusInvalid,
            hasRequiredParams,
            password,
            passwordConfirmation,
            refreshSession,
            t,
            toast,
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
            <form
                className="flex flex-col gap-3"
                noValidate
                onSubmit={handleSubmit}
            >
                <FormField
                    id="reset-email"
                    label={t('auth.password_reset.reset.email_label')}
                >
                    <Input
                        id="reset-email"
                        autoComplete="email"
                        disabled
                        readOnly
                        type="email"
                        value={email ?? ''}
                    />
                </FormField>
                <FormField
                    error={fieldErrors.password ?? null}
                    id="reset-password"
                    label={t('auth.password_reset.reset.password_label')}
                >
                    <PasswordInput
                        id="reset-password"
                        aria-describedby={formFieldDescribedBy(
                            'reset-password',
                            { error: Boolean(fieldErrors.password) }
                        )}
                        aria-invalid={fieldErrors.password ? true : undefined}
                        autoComplete="new-password"
                        autoFocus
                        className={invalidControlClassName(
                            Boolean(fieldErrors.password)
                        )}
                        disabled={isSubmitting}
                        name="password"
                        onChange={(event) => {
                            setPassword(event.target.value);
                            clearField('password');
                        }}
                        required
                        value={password}
                    />
                </FormField>
                <FormField
                    error={fieldErrors.password_confirmation ?? null}
                    id="reset-password-confirmation"
                    label={t(
                        'auth.password_reset.reset.password_confirmation_label'
                    )}
                >
                    <PasswordInput
                        id="reset-password-confirmation"
                        aria-describedby={formFieldDescribedBy(
                            'reset-password-confirmation',
                            {
                                error: Boolean(
                                    fieldErrors.password_confirmation
                                ),
                            }
                        )}
                        aria-invalid={
                            fieldErrors.password_confirmation ? true : undefined
                        }
                        autoComplete="new-password"
                        className={invalidControlClassName(
                            Boolean(fieldErrors.password_confirmation)
                        )}
                        disabled={isSubmitting}
                        name="password_confirmation"
                        onChange={(event) => {
                            setPasswordConfirmation(event.target.value);
                            clearField('password_confirmation');
                        }}
                        required
                        value={passwordConfirmation}
                    />
                </FormField>
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
