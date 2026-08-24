import React, { useCallback, useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/dialog/dialog';
import { Button } from '@/components/button/button';
import { Input } from '@/components/input/input';
import { Separator } from '@/components/separator/separator';
import { useToast } from '@/components/toast/use-toast';
import type { BaseDialogProps } from '../common/base-dialog-props';
import { useAuth } from '@/hooks/use-auth';
import { useDialog } from '@/hooks/use-dialog';
import type { UpdateProfilePayload } from '@/lib/api/auth';
import { parseLaravelValidationErrors } from '@/lib/api/parse-validation-errors';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { formatApiErrorMessage } from '@/pages/auth/format-api-error-message';

type ProfileFieldName =
    | 'first_name'
    | 'last_name'
    | 'email'
    | 'current_password'
    | 'password'
    | 'password_confirmation';

export interface UserSettingsDialogProps extends BaseDialogProps {}

export const UserSettingsDialog: React.FC<UserSettingsDialogProps> = ({
    dialog,
}) => {
    const { t } = useTranslation();
    const { user, updateProfile } = useAuth();
    const { closeUserSettingsDialog } = useDialog();
    const { toast } = useToast();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [fieldErrors, setFieldErrors] = useState<
        Partial<Record<ProfileFieldName, string>>
    >({});
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!dialog.open || !user) {
            return;
        }

        setFirstName(user.first_name);
        setLastName(user.last_name);
        setEmail(user.email);
        setCurrentPassword('');
        setNewPassword('');
        setPasswordConfirmation('');
        setFieldErrors({});
        setErrorMessage(null);
    }, [dialog.open, user]);

    const closeDialog = useCallback(() => {
        closeUserSettingsDialog();
    }, [closeUserSettingsDialog]);

    const handleSubmit = useCallback(
        async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setFieldErrors({});
            setErrorMessage(null);
            setIsSubmitting(true);

            const isChangingPassword =
                currentPassword.length > 0 ||
                newPassword.length > 0 ||
                passwordConfirmation.length > 0;

            const payload: UpdateProfilePayload = {
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                email: email.trim(),
            };

            if (isChangingPassword) {
                payload.current_password = currentPassword;
                payload.password = newPassword;
                payload.password_confirmation = passwordConfirmation;
            }

            try {
                await updateProfile(payload);
                toast({
                    title: t('auth.settings.success_title'),
                    description: t('auth.settings.success_description'),
                });
                closeDialog();
            } catch (error: unknown) {
                const validationErrors = parseLaravelValidationErrors(error);
                if (Object.keys(validationErrors).length > 0) {
                    setFieldErrors({
                        first_name: validationErrors.first_name,
                        last_name: validationErrors.last_name,
                        email: validationErrors.email,
                        current_password: validationErrors.current_password,
                        password: validationErrors.password,
                        password_confirmation:
                            validationErrors.password_confirmation,
                    });
                } else {
                    setErrorMessage(formatApiErrorMessage(error));
                }
            } finally {
                setIsSubmitting(false);
            }
        },
        [
            closeDialog,
            currentPassword,
            email,
            firstName,
            lastName,
            newPassword,
            passwordConfirmation,
            t,
            toast,
            updateProfile,
        ]
    );

    if (!user) {
        return null;
    }

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
                    <DialogTitle>{t('auth.settings.title')}</DialogTitle>
                    <DialogDescription>
                        {t('auth.settings.description')}
                    </DialogDescription>
                </DialogHeader>

                <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
                    <label className="flex flex-col gap-1 text-sm">
                        <span>{t('auth.settings.first_name_label')}</span>
                        <Input
                            autoComplete="given-name"
                            autoFocus
                            disabled={isSubmitting}
                            name="first_name"
                            onChange={(event) =>
                                setFirstName(event.target.value)
                            }
                            required
                            value={firstName}
                        />
                        {fieldErrors.first_name ? (
                            <span
                                className="text-xs text-destructive"
                                role="alert"
                            >
                                {fieldErrors.first_name}
                            </span>
                        ) : null}
                    </label>
                    <label className="flex flex-col gap-1 text-sm">
                        <span>{t('auth.settings.last_name_label')}</span>
                        <Input
                            autoComplete="family-name"
                            disabled={isSubmitting}
                            name="last_name"
                            onChange={(event) =>
                                setLastName(event.target.value)
                            }
                            required
                            value={lastName}
                        />
                        {fieldErrors.last_name ? (
                            <span
                                className="text-xs text-destructive"
                                role="alert"
                            >
                                {fieldErrors.last_name}
                            </span>
                        ) : null}
                    </label>
                    <label className="flex flex-col gap-1 text-sm">
                        <span>{t('auth.settings.email_label')}</span>
                        <Input
                            autoComplete="email"
                            disabled={isSubmitting}
                            name="email"
                            onChange={(event) => setEmail(event.target.value)}
                            required
                            type="email"
                            value={email}
                        />
                        {fieldErrors.email ? (
                            <span
                                className="text-xs text-destructive"
                                role="alert"
                            >
                                {fieldErrors.email}
                            </span>
                        ) : null}
                    </label>

                    <Separator className="my-1" />

                    <div className="flex flex-col gap-3">
                        <p className="text-sm font-medium">
                            {t('auth.settings.change_password_heading')}
                        </p>
                        <label className="flex flex-col gap-1 text-sm">
                            <span>
                                {t('auth.settings.current_password_label')}
                            </span>
                            <Input
                                autoComplete="current-password"
                                disabled={isSubmitting}
                                name="current_password"
                                onChange={(event) =>
                                    setCurrentPassword(event.target.value)
                                }
                                type="password"
                                value={currentPassword}
                            />
                            {fieldErrors.current_password ? (
                                <span
                                    className="text-xs text-destructive"
                                    role="alert"
                                >
                                    {fieldErrors.current_password}
                                </span>
                            ) : null}
                        </label>
                        <label className="flex flex-col gap-1 text-sm">
                            <span>{t('auth.settings.new_password_label')}</span>
                            <Input
                                autoComplete="new-password"
                                disabled={isSubmitting}
                                name="password"
                                onChange={(event) =>
                                    setNewPassword(event.target.value)
                                }
                                type="password"
                                value={newPassword}
                            />
                            {fieldErrors.password ? (
                                <span
                                    className="text-xs text-destructive"
                                    role="alert"
                                >
                                    {fieldErrors.password}
                                </span>
                            ) : null}
                        </label>
                        <label className="flex flex-col gap-1 text-sm">
                            <span>
                                {t('auth.settings.password_confirmation_label')}
                            </span>
                            <Input
                                autoComplete="new-password"
                                disabled={isSubmitting}
                                name="password_confirmation"
                                onChange={(event) =>
                                    setPasswordConfirmation(event.target.value)
                                }
                                type="password"
                                value={passwordConfirmation}
                            />
                            {fieldErrors.password_confirmation ? (
                                <span
                                    className="text-xs text-destructive"
                                    role="alert"
                                >
                                    {fieldErrors.password_confirmation}
                                </span>
                            ) : null}
                        </label>
                    </div>

                    {errorMessage !== null ? (
                        <p className="text-sm text-destructive" role="alert">
                            {errorMessage}
                        </p>
                    ) : null}
                    <Button
                        className={cn('mt-1')}
                        disabled={isSubmitting}
                        type="submit"
                    >
                        {isSubmitting
                            ? t('auth.settings.submitting')
                            : t('auth.settings.submit')}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};
