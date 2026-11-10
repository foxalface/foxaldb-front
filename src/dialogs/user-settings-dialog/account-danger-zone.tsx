import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/dialog/dialog';
import { Button } from '@/components/button/button';
import { Input } from '@/components/input/input';
import { useAuth } from '@/hooks/use-auth';
import {
    parseLaravelValidationErrors,
    readApiErrorCode,
} from '@/lib/api/parse-validation-errors';
import { useTranslation } from 'react-i18next';
import { formatApiErrorMessage } from '@/pages/auth/format-api-error-message';

export const AccountDangerZone: React.FC<{
    onClosed: () => void;
}> = ({ onClosed }) => {
    const { t } = useTranslation();
    const { closeAccount } = useAuth();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submit = async (
        event: React.FormEvent<HTMLFormElement>
    ): Promise<void> => {
        event.preventDefault();
        setPasswordError(null);
        setFormError(null);

        setIsSubmitting(true);

        try {
            await closeAccount(password);
            setConfirmOpen(false);
            onClosed();
        } catch (error: unknown) {
            const code = readApiErrorCode(error);
            const validationErrors = parseLaravelValidationErrors(error);
            if (
                code === 'current_password_invalid' ||
                validationErrors.current_password !== undefined
            ) {
                setPasswordError(
                    t('auth.settings.danger_zone.current_password_invalid')
                );
                return;
            }

            setFormError(
                formatApiErrorMessage(error) ||
                    t('auth.settings.danger_zone.failure')
            );
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
                        onSubmit={(event) => {
                            void submit(event);
                        }}
                    >
                        <p className="text-sm text-muted-foreground">
                            {t('auth.settings.danger_zone.device_warning')}
                        </p>
                        <label className="flex flex-col gap-1 text-sm">
                            <span>
                                {t(
                                    'auth.settings.danger_zone.current_password_label'
                                )}
                            </span>
                            <Input
                                autoComplete="current-password"
                                disabled={isSubmitting}
                                name="current_password"
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                type="password"
                                value={password}
                            />
                            {passwordError !== null ? (
                                <span
                                    className="text-xs text-destructive"
                                    role="alert"
                                >
                                    {passwordError}
                                </span>
                            ) : null}
                        </label>
                        {formError !== null ? (
                            <p
                                className="text-sm text-destructive"
                                role="alert"
                            >
                                {formError}
                            </p>
                        ) : null}
                        <Button
                            disabled={isSubmitting || password.length === 0}
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
