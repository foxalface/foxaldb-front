import React, { useCallback, useEffect, useState } from 'react';
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
import { Input } from '@/components/input/input';
import { PasswordInput } from '@/components/password-input/password-input';
import { Separator } from '@/components/separator/separator';
import { useToast } from '@/components/toast/use-toast';
import type { BaseDialogProps } from '../common/base-dialog-props';
import { useAuth } from '@/hooks/use-auth';
import { useDialog } from '@/hooks/use-dialog';
import type {
    DiagramCreationDestinationPreference,
    UpdateProfilePayload,
} from '@/lib/api/auth';
import { normalizeApiError } from '@/lib/api/normalize-api-error';
import {
    collectFormValidity,
    type FormFieldIssue,
} from '@/lib/forms/collect-form-validity';
import {
    currentPasswordInvalidMessageKey,
    mapServerFieldMessages,
    messagesForIssues,
    nonFieldErrorMessageKey,
    submissionToastMessageKey,
    toastMessageForMappedFields,
} from '@/lib/forms/form-error-messages';
import { namedControl, usePendingFocus } from '@/lib/forms/use-pending-focus';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { AccountDangerZone } from './account-danger-zone';

const PROFILE_FIELDS = ['first_name', 'last_name', 'email'] as const;
const PASSWORD_FIELDS = [
    'current_password',
    'password',
    'password_confirmation',
] as const;
const SETTINGS_FIELDS = [...PROFILE_FIELDS, ...PASSWORD_FIELDS] as const;

type ProfileFieldName = (typeof SETTINGS_FIELDS)[number];

export interface UserSettingsDialogProps extends BaseDialogProps {}

export const UserSettingsDialog: React.FC<UserSettingsDialogProps> = ({
    dialog,
}) => {
    const { t } = useTranslation();
    const { user, updateProfile, updateDiagramCreationPreference } = useAuth();
    const { closeUserSettingsDialog } = useDialog();
    const { toast } = useToast();
    const focusInvalid = usePendingFocus();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [fieldErrors, setFieldErrors] = useState<
        Partial<Record<ProfileFieldName, string>>
    >({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [
        diagramCreationPreferenceSaving,
        setDiagramCreationPreferenceSaving,
    ] = useState(false);

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
        setDiagramCreationPreferenceSaving(false);
    }, [dialog.open, user]);

    const closeDialog = useCallback(() => {
        closeUserSettingsDialog();
    }, [closeUserSettingsDialog]);

    const handleDiagramCreationPreferenceChange = useCallback(
        async (
            next: DiagramCreationDestinationPreference | null
        ): Promise<void> => {
            if (
                user !== null &&
                user.default_diagram_creation_destination === next
            ) {
                return;
            }

            setDiagramCreationPreferenceSaving(true);
            try {
                await updateDiagramCreationPreference({
                    default_diagram_creation_destination: next,
                });
                if (next === null) {
                    toast({
                        variant: 'success',
                        title: t(
                            'auth.settings.diagram_creation.reset_success_title'
                        ),
                        description: t(
                            'auth.settings.diagram_creation.reset_success_description'
                        ),
                    });
                }
            } catch {
                toast({
                    variant: 'danger',
                    title: t('auth.settings.diagram_creation.save_error_title'),
                    description: t(
                        'auth.settings.diagram_creation.save_error_description'
                    ),
                });
            } finally {
                setDiagramCreationPreferenceSaving(false);
            }
        },
        [t, toast, updateDiagramCreationPreference, user]
    );

    const clearField = useCallback((field: ProfileFieldName) => {
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

            const form = event.currentTarget;
            const isChangingPassword =
                currentPassword.length > 0 ||
                newPassword.length > 0 ||
                passwordConfirmation.length > 0;
            const additionalIssues: FormFieldIssue[] = [];

            for (const name of ['first_name', 'last_name'] as const) {
                const value = name === 'first_name' ? firstName : lastName;
                if (value.trim() !== '') {
                    continue;
                }

                const element = form.elements.namedItem(name);
                if (
                    element instanceof HTMLInputElement &&
                    !element.validity.valueMissing
                ) {
                    additionalIssues.push({
                        name,
                        element,
                        code: 'required',
                    });
                }
            }

            const validity = collectFormValidity(form, {
                confirmation: isChangingPassword
                    ? {
                          field: 'password_confirmation',
                          matches: 'password',
                      }
                    : undefined,
                additionalIssues,
            });

            if (validity.issues.length > 0) {
                setFieldErrors(messagesForIssues(validity.issues, t));
                focusInvalid(validity.firstInvalid);
                const includesProfile = validity.issues.some((issue) =>
                    PROFILE_FIELDS.some((field) => field === issue.name)
                );
                toast({
                    title: t(submissionToastMessageKey(validity.issues)),
                    variant: 'danger',
                    dedupeKey: includesProfile
                        ? 'validation:settings-profile'
                        : 'validation:settings-password',
                });
                return;
            }

            setFieldErrors({});
            setIsSubmitting(true);

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
                    variant: 'success',
                    title: t('auth.settings.success_title'),
                    description: t('auth.settings.success_description'),
                });
                closeDialog();
            } catch (error: unknown) {
                const apiError = normalizeApiError(error);

                if (apiError.code === 'current_password_invalid') {
                    const message = t(currentPasswordInvalidMessageKey);
                    setFieldErrors({
                        current_password: message,
                    });
                    focusInvalid(namedControl(form, 'current_password'));
                    toast({
                        title: message,
                        variant: 'danger',
                        dedupeKey: 'auth:current-password',
                    });
                    return;
                }

                const mapped = mapServerFieldMessages(
                    apiError,
                    SETTINGS_FIELDS,
                    t
                );
                if (
                    apiError.code === 'validation_failed' &&
                    Object.keys(mapped).length > 0
                ) {
                    setFieldErrors(mapped);
                    const firstField = SETTINGS_FIELDS.find(
                        (field) => mapped[field] !== undefined
                    );
                    focusInvalid(
                        firstField === undefined
                            ? null
                            : namedControl(form, firstField)
                    );
                    const includesProfile = PROFILE_FIELDS.some(
                        (field) => mapped[field] !== undefined
                    );
                    toast({
                        title: toastMessageForMappedFields(mapped, t),
                        variant: 'danger',
                        dedupeKey: includesProfile
                            ? 'validation:settings-profile'
                            : 'validation:settings-password',
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
        },
        [
            closeDialog,
            currentPassword,
            email,
            firstName,
            focusInvalid,
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

    const changingPassword =
        currentPassword.length > 0 ||
        newPassword.length > 0 ||
        passwordConfirmation.length > 0;

    return (
        <Dialog
            {...dialog}
            onOpenChange={(open) => {
                if (!open) {
                    closeDialog();
                }
            }}
        >
            <DialogContent
                className="flex max-h-dvh min-w-0 max-w-md flex-col overflow-hidden"
                showClose
            >
                <DialogHeader className="shrink-0">
                    <DialogTitle>{t('auth.settings.title')}</DialogTitle>
                    <DialogDescription>
                        {t('auth.settings.description')}
                    </DialogDescription>
                </DialogHeader>

                <div
                    className="min-h-0 min-w-0 flex-1 overflow-y-auto"
                    data-testid="user-settings-scroll-body"
                >
                    <form
                        className="flex flex-col gap-3"
                        noValidate
                        onSubmit={handleSubmit}
                    >
                        <FormField
                            error={fieldErrors.first_name ?? null}
                            id="settings-first-name"
                            label={t('auth.settings.first_name_label')}
                        >
                            <Input
                                id="settings-first-name"
                                aria-describedby={formFieldDescribedBy(
                                    'settings-first-name',
                                    { error: Boolean(fieldErrors.first_name) }
                                )}
                                aria-invalid={
                                    fieldErrors.first_name ? true : undefined
                                }
                                autoComplete="given-name"
                                autoFocus
                                className={invalidControlClassName(
                                    Boolean(fieldErrors.first_name)
                                )}
                                disabled={isSubmitting}
                                name="first_name"
                                onChange={(event) => {
                                    setFirstName(event.target.value);
                                    clearField('first_name');
                                }}
                                required
                                value={firstName}
                            />
                        </FormField>
                        <FormField
                            error={fieldErrors.last_name ?? null}
                            id="settings-last-name"
                            label={t('auth.settings.last_name_label')}
                        >
                            <Input
                                id="settings-last-name"
                                aria-describedby={formFieldDescribedBy(
                                    'settings-last-name',
                                    { error: Boolean(fieldErrors.last_name) }
                                )}
                                aria-invalid={
                                    fieldErrors.last_name ? true : undefined
                                }
                                autoComplete="family-name"
                                className={invalidControlClassName(
                                    Boolean(fieldErrors.last_name)
                                )}
                                disabled={isSubmitting}
                                name="last_name"
                                onChange={(event) => {
                                    setLastName(event.target.value);
                                    clearField('last_name');
                                }}
                                required
                                value={lastName}
                            />
                        </FormField>
                        <FormField
                            error={fieldErrors.email ?? null}
                            id="settings-email"
                            label={t('auth.settings.email_label')}
                        >
                            <Input
                                id="settings-email"
                                aria-describedby={formFieldDescribedBy(
                                    'settings-email',
                                    { error: Boolean(fieldErrors.email) }
                                )}
                                aria-invalid={
                                    fieldErrors.email ? true : undefined
                                }
                                autoComplete="email"
                                className={invalidControlClassName(
                                    Boolean(fieldErrors.email)
                                )}
                                disabled={isSubmitting}
                                name="email"
                                onChange={(event) => {
                                    setEmail(event.target.value);
                                    clearField('email');
                                }}
                                required
                                type="email"
                                value={email}
                            />
                        </FormField>

                        <Separator className="my-1" />

                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-1">
                                <p className="text-sm font-medium">
                                    {t(
                                        'auth.settings.diagram_creation.heading'
                                    )}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {t(
                                        'auth.settings.diagram_creation.description'
                                    )}
                                </p>
                            </div>
                            <div
                                className="flex flex-col gap-2"
                                role="radiogroup"
                                aria-label={t(
                                    'auth.settings.diagram_creation.heading'
                                )}
                            >
                                <label className="flex cursor-pointer items-start gap-2 rounded-md border border-border px-3 py-2 text-sm">
                                    <input
                                        checked={
                                            user.default_diagram_creation_destination ===
                                            null
                                        }
                                        className="mt-1"
                                        disabled={
                                            isSubmitting ||
                                            diagramCreationPreferenceSaving
                                        }
                                        name="diagram_creation_destination"
                                        onChange={() => {
                                            void handleDiagramCreationPreferenceChange(
                                                null
                                            );
                                        }}
                                        type="radio"
                                        value="ask"
                                    />
                                    <span>
                                        {t(
                                            'auth.settings.diagram_creation.ask_each_time'
                                        )}
                                    </span>
                                </label>
                                <label className="flex cursor-pointer items-start gap-2 rounded-md border border-border px-3 py-2 text-sm">
                                    <input
                                        checked={
                                            user.default_diagram_creation_destination ===
                                            'device'
                                        }
                                        className="mt-1"
                                        disabled={
                                            isSubmitting ||
                                            diagramCreationPreferenceSaving
                                        }
                                        name="diagram_creation_destination"
                                        onChange={() => {
                                            void handleDiagramCreationPreferenceChange(
                                                'device'
                                            );
                                        }}
                                        type="radio"
                                        value="device"
                                    />
                                    <span>
                                        {t(
                                            'auth.settings.diagram_creation.prefer_device'
                                        )}
                                    </span>
                                </label>
                                <label className="flex cursor-pointer items-start gap-2 rounded-md border border-border px-3 py-2 text-sm">
                                    <input
                                        checked={
                                            user.default_diagram_creation_destination ===
                                            'online'
                                        }
                                        className="mt-1"
                                        disabled={
                                            isSubmitting ||
                                            diagramCreationPreferenceSaving
                                        }
                                        name="diagram_creation_destination"
                                        onChange={() => {
                                            void handleDiagramCreationPreferenceChange(
                                                'online'
                                            );
                                        }}
                                        type="radio"
                                        value="online"
                                    />
                                    <span>
                                        {t(
                                            'auth.settings.diagram_creation.prefer_online'
                                        )}
                                    </span>
                                </label>
                            </div>
                            {diagramCreationPreferenceSaving ? (
                                <p className="text-xs text-muted-foreground">
                                    {t('auth.settings.diagram_creation.saving')}
                                </p>
                            ) : null}
                        </div>

                        <Separator className="my-1" />

                        <div className="flex flex-col gap-3">
                            <p className="text-sm font-medium">
                                {t('auth.settings.change_password_heading')}
                            </p>
                            <FormField
                                error={fieldErrors.current_password ?? null}
                                id="settings-current-password"
                                label={t(
                                    'auth.settings.current_password_label'
                                )}
                            >
                                <PasswordInput
                                    id="settings-current-password"
                                    aria-describedby={formFieldDescribedBy(
                                        'settings-current-password',
                                        {
                                            error: Boolean(
                                                fieldErrors.current_password
                                            ),
                                        }
                                    )}
                                    aria-invalid={
                                        fieldErrors.current_password
                                            ? true
                                            : undefined
                                    }
                                    autoComplete="current-password"
                                    className={invalidControlClassName(
                                        Boolean(fieldErrors.current_password)
                                    )}
                                    disabled={isSubmitting}
                                    name="current_password"
                                    onChange={(event) => {
                                        setCurrentPassword(event.target.value);
                                        clearField('current_password');
                                    }}
                                    required={changingPassword}
                                    value={currentPassword}
                                />
                            </FormField>
                            <FormField
                                error={fieldErrors.password ?? null}
                                id="settings-new-password"
                                label={t('auth.settings.new_password_label')}
                            >
                                <PasswordInput
                                    id="settings-new-password"
                                    aria-describedby={formFieldDescribedBy(
                                        'settings-new-password',
                                        { error: Boolean(fieldErrors.password) }
                                    )}
                                    aria-invalid={
                                        fieldErrors.password ? true : undefined
                                    }
                                    autoComplete="new-password"
                                    className={invalidControlClassName(
                                        Boolean(fieldErrors.password)
                                    )}
                                    disabled={isSubmitting}
                                    name="password"
                                    onChange={(event) => {
                                        setNewPassword(event.target.value);
                                        clearField('password');
                                    }}
                                    required={changingPassword}
                                    value={newPassword}
                                />
                            </FormField>
                            <FormField
                                error={
                                    fieldErrors.password_confirmation ?? null
                                }
                                id="settings-password-confirmation"
                                label={t(
                                    'auth.settings.password_confirmation_label'
                                )}
                            >
                                <PasswordInput
                                    id="settings-password-confirmation"
                                    aria-describedby={formFieldDescribedBy(
                                        'settings-password-confirmation',
                                        {
                                            error: Boolean(
                                                fieldErrors.password_confirmation
                                            ),
                                        }
                                    )}
                                    aria-invalid={
                                        fieldErrors.password_confirmation
                                            ? true
                                            : undefined
                                    }
                                    autoComplete="new-password"
                                    className={invalidControlClassName(
                                        Boolean(
                                            fieldErrors.password_confirmation
                                        )
                                    )}
                                    disabled={isSubmitting}
                                    name="password_confirmation"
                                    onChange={(event) => {
                                        setPasswordConfirmation(
                                            event.target.value
                                        );
                                        clearField('password_confirmation');
                                    }}
                                    required={changingPassword}
                                    value={passwordConfirmation}
                                />
                            </FormField>
                        </div>

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
                    <AccountDangerZone onClosed={closeUserSettingsDialog} />
                </div>
            </DialogContent>
        </Dialog>
    );
};
