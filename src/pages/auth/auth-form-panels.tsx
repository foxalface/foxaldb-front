import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import {
    validateRegisterFields,
    type RegisterField,
    type RegisterFieldErrors,
} from '@/lib/auth/validate-register-fields';
import { requestAccountRecovery } from '@/lib/api/auth';
import { normalizeApiError } from '@/lib/api/normalize-api-error';
import { readRecoverableUntil } from '@/lib/api/parse-validation-errors';
import { formatRecoveryDeadline } from '@/lib/account/format-recovery-deadline';
import {
    collectFormValidity,
    type FormFieldIssue,
    type FormFieldIssueCode,
} from '@/lib/forms/collect-form-validity';
import { focusFirstInvalid } from '@/lib/forms/focus-first-invalid-field';
import {
    mapServerFieldMessages,
    messagesForIssues,
    nonFieldErrorMessageKey,
    submissionToastMessageKey,
    toastMessageForMappedFields,
} from '@/lib/forms/form-error-messages';
import { namedControl, usePendingFocus } from '@/lib/forms/use-pending-focus';
import { useTranslation } from 'react-i18next';
import { RegisterAcceptTermsField } from './register-accept-terms-field';
import { AuthStepFooter } from '@/dialogs/auth-dialog/auth-step-footer';

const REGISTER_FIELDS: RegisterField[] = [
    'first_name',
    'last_name',
    'email',
    'password',
    'password_confirmation',
];

const REGISTER_VALIDATION_TOAST_KEY = 'validation:register';

const REGISTER_ISSUE_MESSAGE_KEY: Record<FormFieldIssueCode, string> = {
    required: 'validation.required',
    invalid_email: 'validation.invalid_email',
    password_confirmation: 'validation.password_confirmation',
    invalid: 'validation.invalid',
};

const isRegisterField = (name: string): name is RegisterField =>
    REGISTER_FIELDS.some((field) => field === name);

const LOGIN_FORM_ID = 'auth-login-form';
const REGISTER_FORM_ID = 'auth-register-form';

export interface LoginFormPanelProps {
    onSuccess: () => void;
    onSwitchToRegister: () => void;
    onForgotPassword?: () => void;
    /** Wizard Back. Rendered in the step footer with the submit action. */
    onBack?: () => void;
    backLabel?: string;
    /** False when AuthCard already renders the surface title. */
    showHeading?: boolean;
    initialEmail?: string;
}

const LOGIN_FIELDS = ['email', 'password'] as const;
const LOGIN_VALIDATION_TOAST_KEY = 'validation:login';

export const LoginFormPanel: React.FC<LoginFormPanelProps> = ({
    onSuccess,
    onSwitchToRegister,
    onForgotPassword,
    onBack,
    backLabel,
    showHeading = true,
    initialEmail = '',
}) => {
    const { t } = useTranslation();
    const { login } = useAuth();
    const { toast } = useToast();
    const focusInvalid = usePendingFocus();
    const [email, setEmail] = useState(initialEmail);
    const [password, setPassword] = useState('');
    const [fieldErrors, setFieldErrors] = useState<
        Partial<Record<(typeof LOGIN_FIELDS)[number], string>>
    >({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const clearField = useCallback((field: (typeof LOGIN_FIELDS)[number]) => {
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
            const validity = collectFormValidity(form);

            if (validity.issues.length > 0) {
                setFieldErrors(messagesForIssues(validity.issues, t));
                focusInvalid(validity.firstInvalid);
                toast({
                    title: t(submissionToastMessageKey(validity.issues)),
                    variant: 'danger',
                    dedupeKey: LOGIN_VALIDATION_TOAST_KEY,
                });
                return;
            }

            setFieldErrors({});
            setIsSubmitting(true);

            try {
                await login(email, password);
                onSuccess();
            } catch (error: unknown) {
                const apiError = normalizeApiError(error);

                if (apiError.code === 'invalid_credentials') {
                    setFieldErrors({});
                    toast({
                        title: t('errors.invalid_credentials'),
                        variant: 'danger',
                        dedupeKey: 'auth:invalid-credentials',
                    });
                    return;
                }

                const mapped = mapServerFieldMessages(
                    apiError,
                    LOGIN_FIELDS,
                    t
                );
                if (
                    apiError.code === 'validation_failed' &&
                    Object.keys(mapped).length > 0
                ) {
                    setFieldErrors(mapped);
                    const firstField = LOGIN_FIELDS.find(
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
                        dedupeKey: LOGIN_VALIDATION_TOAST_KEY,
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
        [email, focusInvalid, login, onSuccess, password, t, toast]
    );

    return (
        <div className="flex max-w-md flex-col gap-4">
            {showHeading ? (
                <h1 className="text-lg font-semibold">
                    {t('auth.login.title')}
                </h1>
            ) : null}
            <form
                className="flex flex-col gap-3"
                id={LOGIN_FORM_ID}
                noValidate
                onSubmit={handleSubmit}
            >
                <FormField
                    error={fieldErrors.email ?? null}
                    id="login-email"
                    label={t('auth.login.email_label')}
                >
                    <Input
                        id="login-email"
                        aria-describedby={formFieldDescribedBy('login-email', {
                            error: Boolean(fieldErrors.email),
                        })}
                        aria-invalid={fieldErrors.email ? true : undefined}
                        autoComplete="email"
                        autoFocus
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
                <FormField
                    error={fieldErrors.password ?? null}
                    id="login-password"
                    label={t('auth.login.password_label')}
                >
                    <PasswordInput
                        id="login-password"
                        aria-describedby={formFieldDescribedBy(
                            'login-password',
                            { error: Boolean(fieldErrors.password) }
                        )}
                        aria-invalid={fieldErrors.password ? true : undefined}
                        autoComplete="current-password"
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
                {onForgotPassword ? (
                    <button
                        className="w-fit text-sm text-muted-foreground underline underline-offset-4"
                        disabled={isSubmitting}
                        onClick={onForgotPassword}
                        type="button"
                    >
                        {t('auth.login.forgot_password')}
                    </button>
                ) : null}
                {onBack ? null : (
                    <Button disabled={isSubmitting} type="submit">
                        {isSubmitting
                            ? t('auth.login.submitting')
                            : t('auth.login.submit')}
                    </Button>
                )}
            </form>
            <p className="text-sm text-muted-foreground">
                {t('auth.login.no_account')}{' '}
                <button
                    className="underline underline-offset-4"
                    disabled={isSubmitting}
                    onClick={onSwitchToRegister}
                    type="button"
                >
                    {t('auth.login.switch_to_register')}
                </button>
            </p>
            {onBack ? (
                <AuthStepFooter layout="between">
                    <Button
                        disabled={isSubmitting}
                        onClick={onBack}
                        type="button"
                        variant="secondary"
                    >
                        {backLabel}
                    </Button>
                    <Button
                        disabled={isSubmitting}
                        form={LOGIN_FORM_ID}
                        type="submit"
                    >
                        {isSubmitting
                            ? t('auth.login.submitting')
                            : t('auth.login.submit')}
                    </Button>
                </AuthStepFooter>
            ) : null}
        </div>
    );
};

export interface RegisterFormPanelProps {
    onSuccess: () => void;
    onSwitchToLogin: () => void;
    lockedEmail?: string;
    invitationToken?: string;
    /** Wizard Back. Rendered in the step footer with the submit action. */
    onBack?: () => void;
    backLabel?: string;
    /** False when AuthCard already renders the surface title. */
    showHeading?: boolean;
}

export const RegisterFormPanel: React.FC<RegisterFormPanelProps> = ({
    onSuccess,
    onSwitchToLogin,
    lockedEmail,
    invitationToken,
    onBack,
    backLabel,
    showHeading = true,
}) => {
    const { t, i18n } = useTranslation();
    const { register } = useAuth();
    const { toast } = useToast();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState(lockedEmail ?? '');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [acceptTermsError, setAcceptTermsError] = useState<string | null>(
        null
    );
    const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRequestingRecovery, setIsRequestingRecovery] = useState(false);
    const [recoveryNotice, setRecoveryNotice] = useState<string | null>(null);
    const [reservedAccount, setReservedAccount] = useState<
        | { kind: 'recoverable'; email: string; until: string | null }
        | { kind: 'unavailable' }
        | null
    >(null);
    const pendingFocusRef = useRef<HTMLElement | null>(null);
    const [focusNonce, setFocusNonce] = useState(0);

    useEffect(() => {
        if (focusNonce === 0) {
            return;
        }

        const target = pendingFocusRef.current;
        pendingFocusRef.current = null;
        focusFirstInvalid(target);
    }, [focusNonce]);

    const clearFieldError = useCallback((field: RegisterField) => {
        setFieldErrors((current) => {
            if (current[field] === undefined) {
                return current;
            }

            const next = { ...current };
            delete next[field];
            return next;
        });
    }, []);

    const handleFirstNameChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setFirstName(event.target.value);
            clearFieldError('first_name');
        },
        [clearFieldError]
    );

    const handleLastNameChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setLastName(event.target.value);
            clearFieldError('last_name');
        },
        [clearFieldError]
    );

    const handleEmailChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setEmail(event.target.value);
            clearFieldError('email');
            setReservedAccount(null);
            setRecoveryNotice(null);
        },
        [clearFieldError]
    );

    const handlePasswordChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setPassword(event.target.value);
            clearFieldError('password');
        },
        [clearFieldError]
    );

    const handlePasswordConfirmationChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setPasswordConfirmation(event.target.value);
            clearFieldError('password_confirmation');
        },
        [clearFieldError]
    );

    const handleSubmit = useCallback(
        async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            const form = event.currentTarget;
            const trimmedFirstName = firstName.trim();
            const trimmedLastName = lastName.trim();
            const nameErrors = validateRegisterFields(
                {
                    firstName: trimmedFirstName,
                    lastName: trimmedLastName,
                },
                {
                    firstNameRequired: 'required',
                    lastNameRequired: 'required',
                }
            );
            const additionalIssues: FormFieldIssue[] = [];

            for (const name of ['first_name', 'last_name'] as const) {
                if (nameErrors[name] === undefined) {
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

            if (!acceptTerms) {
                const terms = form.querySelector('#register-accept-terms');
                if (terms instanceof HTMLElement) {
                    additionalIssues.push({
                        name: 'accept_terms',
                        element: terms,
                        code: 'required',
                    });
                }
            }

            const validity = collectFormValidity(form, {
                confirmation: {
                    field: 'password_confirmation',
                    matches: 'password',
                },
                additionalIssues,
            });

            if (validity.issues.length > 0) {
                const nextFieldErrors: RegisterFieldErrors = {};
                let nextTermsError: string | null = null;

                for (const issue of validity.issues) {
                    const message = t(REGISTER_ISSUE_MESSAGE_KEY[issue.code]);
                    if (issue.name === 'accept_terms') {
                        nextTermsError = message;
                        continue;
                    }
                    if (
                        isRegisterField(issue.name) &&
                        nextFieldErrors[issue.name] === undefined
                    ) {
                        nextFieldErrors[issue.name] = message;
                    }
                }

                setFieldErrors(nextFieldErrors);
                setAcceptTermsError(nextTermsError);
                pendingFocusRef.current = validity.firstInvalid;
                setFocusNonce((current) => current + 1);
                toast({
                    title: t(submissionToastMessageKey(validity.issues)),
                    variant: 'danger',
                    dedupeKey: REGISTER_VALIDATION_TOAST_KEY,
                });
                return;
            }

            setFieldErrors({});
            setAcceptTermsError(null);
            setIsSubmitting(true);

            try {
                if (invitationToken) {
                    await register(
                        trimmedFirstName,
                        trimmedLastName,
                        lockedEmail ?? email,
                        password,
                        passwordConfirmation,
                        true,
                        invitationToken
                    );
                } else {
                    await register(
                        trimmedFirstName,
                        trimmedLastName,
                        lockedEmail ?? email,
                        password,
                        passwordConfirmation,
                        true
                    );
                }
                onSuccess();
            } catch (error: unknown) {
                const apiError = normalizeApiError(error);
                const code = apiError.code;
                const submittedEmail = (lockedEmail ?? email).trim();

                if (code === 'account_recoverable') {
                    setReservedAccount({
                        kind: 'recoverable',
                        email: submittedEmail,
                        until: readRecoverableUntil(error),
                    });
                    setRecoveryNotice(null);
                    return;
                }

                if (code === 'account_unavailable') {
                    setReservedAccount({ kind: 'unavailable' });
                    setRecoveryNotice(null);
                    return;
                }

                const mappedErrors = mapServerFieldMessages(
                    apiError,
                    REGISTER_FIELDS,
                    t
                );

                if (
                    apiError.code === 'validation_failed' &&
                    Object.keys(mappedErrors).length > 0
                ) {
                    setFieldErrors(mappedErrors);
                    const firstField = REGISTER_FIELDS.find(
                        (field) => mappedErrors[field] !== undefined
                    );
                    pendingFocusRef.current =
                        firstField === undefined
                            ? null
                            : namedControl(form, firstField);
                    setFocusNonce((current) => current + 1);
                    toast({
                        title: toastMessageForMappedFields(mappedErrors, t),
                        variant: 'danger',
                        dedupeKey: REGISTER_VALIDATION_TOAST_KEY,
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
            email,
            firstName,
            invitationToken,
            lastName,
            lockedEmail,
            onSuccess,
            password,
            passwordConfirmation,
            register,
            acceptTerms,
            t,
            toast,
        ]
    );

    const requestRecovery = useCallback(async () => {
        if (reservedAccount?.kind !== 'recoverable') {
            return;
        }

        setRecoveryNotice(null);
        setIsRequestingRecovery(true);

        try {
            await requestAccountRecovery(reservedAccount.email);
            setRecoveryNotice(t('auth.account_recovery.instructions_sent'));
        } catch {
            setRecoveryNotice(t('auth.account_recovery.request_error'));
        } finally {
            setIsRequestingRecovery(false);
        }
    }, [reservedAccount, t]);

    return (
        <div className="flex max-w-md flex-col gap-4">
            {showHeading ? (
                <h1 className="text-lg font-semibold">
                    {t('auth.register.title')}
                </h1>
            ) : null}
            {reservedAccount?.kind === 'recoverable' ? (
                <div className="flex flex-col gap-3 rounded-md border p-3">
                    <p className="text-sm">
                        {t('auth.account_recovery.recoverable_description')}
                    </p>
                    {reservedAccount.until !== null ? (
                        <p className="text-sm text-muted-foreground">
                            {t('auth.account_recovery.recoverable_until', {
                                date: formatRecoveryDeadline(
                                    reservedAccount.until,
                                    i18n.language
                                ),
                            })}
                        </p>
                    ) : null}
                    <Button
                        disabled={isRequestingRecovery}
                        onClick={() => {
                            void requestRecovery();
                        }}
                        type="button"
                    >
                        {isRequestingRecovery
                            ? t('auth.account_recovery.requesting')
                            : t('auth.account_recovery.restore_action')}
                    </Button>
                    <Button
                        disabled={isRequestingRecovery}
                        onClick={onSwitchToLogin}
                        type="button"
                        variant="secondary"
                    >
                        {t('auth.register.switch_to_login')}
                    </Button>
                    {recoveryNotice !== null ? (
                        <p className="text-sm" role="status">
                            {recoveryNotice}
                        </p>
                    ) : null}
                </div>
            ) : null}
            {reservedAccount?.kind === 'unavailable' ? (
                <p className="text-sm text-destructive" role="alert">
                    {t('auth.account_recovery.unavailable')}
                </p>
            ) : null}
            <form
                className="flex flex-col gap-3"
                id={REGISTER_FORM_ID}
                noValidate
                onSubmit={handleSubmit}
            >
                <FormField
                    error={fieldErrors.first_name ?? null}
                    id="register-first-name"
                    label={t('auth.register.first_name_label')}
                >
                    <Input
                        id="register-first-name"
                        aria-describedby={formFieldDescribedBy(
                            'register-first-name',
                            { error: Boolean(fieldErrors.first_name) }
                        )}
                        aria-invalid={fieldErrors.first_name ? true : undefined}
                        autoComplete="given-name"
                        autoFocus
                        className={invalidControlClassName(
                            Boolean(fieldErrors.first_name)
                        )}
                        disabled={isSubmitting}
                        name="first_name"
                        onChange={handleFirstNameChange}
                        required
                        type="text"
                        value={firstName}
                    />
                </FormField>
                <FormField
                    error={fieldErrors.last_name ?? null}
                    id="register-last-name"
                    label={t('auth.register.last_name_label')}
                >
                    <Input
                        id="register-last-name"
                        aria-describedby={formFieldDescribedBy(
                            'register-last-name',
                            { error: Boolean(fieldErrors.last_name) }
                        )}
                        aria-invalid={fieldErrors.last_name ? true : undefined}
                        autoComplete="family-name"
                        className={invalidControlClassName(
                            Boolean(fieldErrors.last_name)
                        )}
                        disabled={isSubmitting}
                        name="last_name"
                        onChange={handleLastNameChange}
                        required
                        type="text"
                        value={lastName}
                    />
                </FormField>
                <FormField
                    error={fieldErrors.email ?? null}
                    id="register-email"
                    label={t('auth.register.email_label')}
                >
                    <Input
                        id="register-email"
                        aria-describedby={formFieldDescribedBy(
                            'register-email',
                            { error: Boolean(fieldErrors.email) }
                        )}
                        aria-invalid={fieldErrors.email ? true : undefined}
                        autoComplete="email"
                        className={invalidControlClassName(
                            Boolean(fieldErrors.email)
                        )}
                        disabled={isSubmitting || lockedEmail !== undefined}
                        name="email"
                        onChange={handleEmailChange}
                        readOnly={lockedEmail !== undefined}
                        required
                        type="email"
                        value={lockedEmail ?? email}
                    />
                </FormField>
                <FormField
                    error={fieldErrors.password ?? null}
                    id="register-password"
                    label={t('auth.register.password_label')}
                >
                    <PasswordInput
                        id="register-password"
                        aria-describedby={formFieldDescribedBy(
                            'register-password',
                            { error: Boolean(fieldErrors.password) }
                        )}
                        aria-invalid={fieldErrors.password ? true : undefined}
                        autoComplete="new-password"
                        className={invalidControlClassName(
                            Boolean(fieldErrors.password)
                        )}
                        disabled={isSubmitting}
                        name="password"
                        onChange={handlePasswordChange}
                        required
                        value={password}
                    />
                </FormField>
                <FormField
                    error={fieldErrors.password_confirmation ?? null}
                    id="register-password-confirmation"
                    label={t('auth.register.password_confirmation_label')}
                >
                    <PasswordInput
                        id="register-password-confirmation"
                        aria-describedby={formFieldDescribedBy(
                            'register-password-confirmation',
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
                        onChange={handlePasswordConfirmationChange}
                        required
                        value={passwordConfirmation}
                    />
                </FormField>
                <RegisterAcceptTermsField
                    checked={acceptTerms}
                    disabled={isSubmitting}
                    error={acceptTermsError}
                    onCheckedChange={(next) => {
                        setAcceptTerms(next);
                        if (next) {
                            setAcceptTermsError(null);
                        }
                    }}
                />
                {onBack ? null : (
                    <Button disabled={isSubmitting} type="submit">
                        {isSubmitting
                            ? t('auth.register.submitting')
                            : t('auth.register.submit')}
                    </Button>
                )}
            </form>
            <p className="text-sm text-muted-foreground">
                {t('auth.register.already_have_account')}{' '}
                <button
                    className="underline underline-offset-4"
                    disabled={isSubmitting}
                    onClick={onSwitchToLogin}
                    type="button"
                >
                    {t('auth.register.switch_to_login')}
                </button>
            </p>
            {onBack ? (
                <AuthStepFooter layout="between">
                    <Button
                        disabled={isSubmitting}
                        onClick={onBack}
                        type="button"
                        variant="secondary"
                    >
                        {backLabel}
                    </Button>
                    <Button
                        disabled={isSubmitting}
                        form={REGISTER_FORM_ID}
                        type="submit"
                    >
                        {isSubmitting
                            ? t('auth.register.submitting')
                            : t('auth.register.submit')}
                    </Button>
                </AuthStepFooter>
            ) : null}
        </div>
    );
};

export interface AuthenticatedAccountPanelProps {
    onBack?: () => void;
}

export const AuthenticatedAccountPanel: React.FC<
    AuthenticatedAccountPanelProps
> = ({ onBack }) => {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const { toast } = useToast();

    const handleLogout = useCallback(async () => {
        try {
            await logout();
        } catch (error: unknown) {
            const apiError = normalizeApiError(error);
            toast({
                title: t(nonFieldErrorMessageKey(apiError.code)),
                variant: 'danger',
                dedupeKey: `auth:${apiError.code}`,
            });
        }
    }, [logout, t, toast]);

    return (
        <div className="flex max-w-md flex-col gap-4">
            <p className="text-sm">
                {t('auth.account.signed_in_as')}{' '}
                <span className="font-medium text-foreground">
                    {user?.full_name}
                </span>
            </p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <Button type="button" variant="secondary" onClick={handleLogout}>
                {t('auth.account.logout')}
            </Button>
            {onBack ? (
                <button
                    className="text-left text-sm text-muted-foreground underline underline-offset-4"
                    onClick={onBack}
                    type="button"
                >
                    {t('auth.account.back_to_editor')}
                </button>
            ) : null}
        </div>
    );
};
