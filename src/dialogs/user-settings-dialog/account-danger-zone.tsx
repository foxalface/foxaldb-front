import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/dialog/dialog';
import { Button } from '@/components/button/button';
import { FormField } from '@/components/form-field/form-field';
import {
    formFieldDescribedBy,
    invalidControlClassName,
} from '@/components/form-field/form-field-ids';
import { PasswordInput } from '@/components/password-input/password-input';
import { useToast } from '@/components/toast/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { normalizeApiError } from '@/lib/api/normalize-api-error';
import { collectFormValidity } from '@/lib/forms/collect-form-validity';
import {
    currentPasswordInvalidMessageKey,
    mapServerFieldMessages,
    messagesForIssues,
    nonFieldErrorMessageKey,
    submissionToastMessageKey,
    toastMessageForMappedFields,
} from '@/lib/forms/form-error-messages';
import { usePendingFocus } from '@/lib/forms/use-pending-focus';
import { useTranslation } from 'react-i18next';

export const AccountDangerZone: React.FC<{
    onClosed: () => void;
}> = ({ onClosed }) => {
    const { t } = useTranslation();
    const { closeAccount } = useAuth();
    const { toast } = useToast();
    const focusInvalid = usePendingFocus();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submit = async (
        event: React.FormEvent<HTMLFormElement>
    ): Promise<void> => {
        event.preventDefault();

        const form = event.currentTarget;
        const validity = collectFormValidity(form);

        if (validity.issues.length > 0) {
            setPasswordError(
                messagesForIssues(validity.issues, t).current_password ??
                    t('validation.required')
            );
            focusInvalid(validity.firstInvalid);
            toast({
                title: t(submissionToastMessageKey(validity.issues)),
                variant: 'danger',
                dedupeKey: 'validation:account-close',
            });
            return;
        }

        setPasswordError(null);
        setIsSubmitting(true);

        try {
            await closeAccount(password);
            setConfirmOpen(false);
            onClosed();
        } catch (error: unknown) {
            const apiError = normalizeApiError(error);
            const mapped = mapServerFieldMessages(
                apiError,
                ['current_password'],
                t
            );
            const passwordMessage = mapped.current_password;

            if (
                passwordMessage !== undefined &&
                (apiError.code === 'current_password_invalid' ||
                    apiError.code === 'validation_failed')
            ) {
                const message =
                    apiError.code === 'current_password_invalid'
                        ? t(currentPasswordInvalidMessageKey)
                        : passwordMessage;
                setPasswordError(message);
                const target = form.querySelector('#danger-current-password');
                focusInvalid(target instanceof HTMLElement ? target : null);
                toast({
                    title:
                        apiError.code === 'current_password_invalid'
                            ? message
                            : toastMessageForMappedFields(
                                  { current_password: message },
                                  t
                              ),
                    variant: 'danger',
                    dedupeKey:
                        apiError.code === 'current_password_invalid'
                            ? 'auth:current-password'
                            : 'validation:account-close',
                });
                return;
            }

            toast({
                title: t(nonFieldErrorMessageKey(apiError.code)),
                variant: 'danger',
                dedupeKey: `auth:${apiError.code}`,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="mt-6 flex flex-col gap-3 border-t border-destructive/40 pt-4">
            <div className="flex flex-col gap-1">
                <h2 className="text-sm font-semibold text-destructive">
                    {t('auth.settings.danger_zone.title')}
                </h2>
                <p className="text-sm text-muted-foreground">
                    {t('auth.settings.danger_zone.description')}
                </p>
                <p className="text-sm text-muted-foreground">
                    {t('auth.settings.danger_zone.device_warning')}
                </p>
            </div>
            <Button
                className="w-fit"
                onClick={() => setConfirmOpen(true)}
                type="button"
                variant="destructive"
            >
                {t('auth.settings.danger_zone.delete_account')}
            </Button>
            <Dialog onOpenChange={setConfirmOpen} open={confirmOpen}>
                <DialogContent className="flex max-w-md flex-col" showClose>
                    <DialogHeader>
                        <DialogTitle>
                            {t('auth.settings.danger_zone.confirm_title')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('auth.settings.danger_zone.confirm_description')}
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        className="flex flex-col gap-3"
                        noValidate
                        onSubmit={(event) => {
                            void submit(event);
                        }}
                    >
                        <p className="text-sm text-muted-foreground">
                            {t('auth.settings.danger_zone.device_warning')}
                        </p>
                        <FormField
                            error={passwordError}
                            id="danger-current-password"
                            label={t(
                                'auth.settings.danger_zone.current_password_label'
                            )}
                        >
                            <PasswordInput
                                id="danger-current-password"
                                aria-describedby={formFieldDescribedBy(
                                    'danger-current-password',
                                    { error: passwordError !== null }
                                )}
                                aria-invalid={
                                    passwordError !== null ? true : undefined
                                }
                                autoComplete="current-password"
                                className={invalidControlClassName(
                                    passwordError !== null
                                )}
                                disabled={isSubmitting}
                                name="current_password"
                                onChange={(event) => {
                                    setPassword(event.target.value);
                                    setPasswordError(null);
                                }}
                                required
                                value={password}
                            />
                        </FormField>
                        <Button
                            disabled={isSubmitting}
                            type="submit"
                            variant="destructive"
                        >
                            {isSubmitting
                                ? t('auth.settings.danger_zone.submitting')
                                : t('auth.settings.danger_zone.submit')}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </section>
    );
};
