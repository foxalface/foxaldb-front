import React, { useCallback, useState } from 'react';
import { Button } from '@/components/button/button';
import { FormField } from '@/components/form-field/form-field';
import {
    formFieldDescribedBy,
    invalidControlClassName,
} from '@/components/form-field/form-field-ids';
import { Input } from '@/components/input/input';
import { useToast } from '@/components/toast/use-toast';
import { AuthStepFooter } from '@/dialogs/auth-dialog/auth-step-footer';
import { requestPasswordReset } from '@/lib/api/auth';
import { normalizeApiError } from '@/lib/api/normalize-api-error';
import { collectFormValidity } from '@/lib/forms/collect-form-validity';
import {
    messagesForIssues,
    nonFieldErrorMessageKey,
    submissionToastMessageKey,
} from '@/lib/forms/form-error-messages';
import { usePendingFocus } from '@/lib/forms/use-pending-focus';
import { useTranslation } from 'react-i18next';

const FORGOT_PASSWORD_FORM_ID = 'auth-forgot-password-form';
const FORGOT_PASSWORD_EMAIL_ID = 'forgot-password-email';
const FORGOT_PASSWORD_TOAST_KEY = 'validation:forgot-password';

export interface ForgotPasswordScreenProps {
    onBackToLogin: () => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
    onBackToLogin,
}) => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const focusInvalid = usePendingFocus();
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = useCallback(
        async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            const form = event.currentTarget;
            const validity = collectFormValidity(form);

            if (validity.issues.length > 0) {
                setEmailError(
                    messagesForIssues(validity.issues, t).email ?? null
                );
                focusInvalid(validity.firstInvalid);
                toast({
                    title: t(submissionToastMessageKey(validity.issues)),
                    variant: 'danger',
                    dedupeKey: FORGOT_PASSWORD_TOAST_KEY,
                });
                return;
            }

            setEmailError(null);
            setIsSubmitting(true);

            try {
                await requestPasswordReset(email);
                setSubmitted(true);
            } catch (error: unknown) {
                const apiError = normalizeApiError(error);
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
        [email, focusInvalid, t, toast]
    );

    return (
        <div className="flex max-w-md flex-col gap-4">
            {submitted ? (
                <p className="text-sm text-foreground" role="status">
                    {t('auth.password_reset.forgot.sent')}
                </p>
            ) : (
                <form
                    className="flex flex-col gap-3"
                    id={FORGOT_PASSWORD_FORM_ID}
                    noValidate
                    onSubmit={handleSubmit}
                >
                    <FormField
                        error={emailError}
                        id={FORGOT_PASSWORD_EMAIL_ID}
                        label={t('auth.password_reset.forgot.email_label')}
                    >
                        <Input
                            id={FORGOT_PASSWORD_EMAIL_ID}
                            aria-describedby={formFieldDescribedBy(
                                FORGOT_PASSWORD_EMAIL_ID,
                                { error: emailError !== null }
                            )}
                            aria-invalid={
                                emailError !== null ? true : undefined
                            }
                            autoComplete="email"
                            autoFocus
                            className={invalidControlClassName(
                                emailError !== null
                            )}
                            disabled={isSubmitting}
                            name="email"
                            onChange={(event) => {
                                setEmail(event.target.value);
                                setEmailError(null);
                            }}
                            required
                            type="email"
                            value={email}
                        />
                    </FormField>
                </form>
            )}

            <AuthStepFooter layout={submitted ? 'start' : 'between'}>
                <Button
                    disabled={isSubmitting}
                    onClick={onBackToLogin}
                    type="button"
                    variant="secondary"
                >
                    {t('auth.dialog.back')}
                </Button>
                {submitted ? null : (
                    <Button
                        disabled={isSubmitting}
                        form={FORGOT_PASSWORD_FORM_ID}
                        type="submit"
                    >
                        {isSubmitting
                            ? t('auth.password_reset.forgot.sending')
                            : t('auth.password_reset.forgot.send')}
                    </Button>
                )}
            </AuthStepFooter>
        </div>
    );
};
