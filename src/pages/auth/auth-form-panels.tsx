import React, { useCallback, useState } from 'react';
import { Button } from '@/components/button/button';
import { Input } from '@/components/input/input';
import { useAuth } from '@/hooks/use-auth';
import {
    validateRegisterFields,
    type RegisterField,
    type RegisterFieldErrors,
} from '@/lib/auth/validate-register-fields';
import { parseLaravelValidationErrors } from '@/lib/api/parse-validation-errors';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { formatApiErrorMessage } from './format-api-error-message';

const REGISTER_FIELDS: RegisterField[] = [
    'first_name',
    'last_name',
    'email',
    'password',
];

export interface LoginFormPanelProps {
    onSuccess: () => void;
    onSwitchToRegister: () => void;
}

export const LoginFormPanel: React.FC<LoginFormPanelProps> = ({
    onSuccess,
    onSwitchToRegister,
}) => {
    const { t } = useTranslation();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = useCallback(
        async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setErrorMessage(null);
            setIsSubmitting(true);

            try {
                await login(email, password);
                onSuccess();
            } catch (error: unknown) {
                setErrorMessage(formatApiErrorMessage(error));
            } finally {
                setIsSubmitting(false);
            }
        },
        [email, password, login, onSuccess]
    );

    return (
        <div className="flex max-w-md flex-col gap-4">
            <h1 className="text-lg font-semibold">{t('auth.login.title')}</h1>
            <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
                <label className="flex flex-col gap-1 text-sm">
                    <span>{t('auth.login.email_label')}</span>
                    <Input
                        autoComplete="email"
                        autoFocus
                        disabled={isSubmitting}
                        name="email"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        type="email"
                        value={email}
                    />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                    <span>{t('auth.login.password_label')}</span>
                    <Input
                        autoComplete="current-password"
                        disabled={isSubmitting}
                        name="password"
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        type="password"
                        value={password}
                    />
                </label>
                {errorMessage !== null ? (
                    <p className="text-sm text-destructive" role="alert">
                        {errorMessage}
                    </p>
                ) : null}
                <Button disabled={isSubmitting} type="submit">
                    {isSubmitting
                        ? t('auth.login.submitting')
                        : t('auth.login.submit')}
                </Button>
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
        </div>
    );
};

export interface RegisterFormPanelProps {
    onSuccess: () => void;
    onSwitchToLogin: () => void;
}

export const RegisterFormPanel: React.FC<RegisterFormPanelProps> = ({
    onSuccess,
    onSwitchToLogin,
}) => {
    const { t } = useTranslation();
    const { register } = useAuth();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const handleSubmit = useCallback(
        async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setFormError(null);

            const trimmedFirstName = firstName.trim();
            const trimmedLastName = lastName.trim();
            const clientErrors = validateRegisterFields(
                {
                    firstName: trimmedFirstName,
                    lastName: trimmedLastName,
                },
                {
                    firstNameRequired: t('auth.errors.first_name_required'),
                    lastNameRequired: t('auth.errors.last_name_required'),
                }
            );

            if (Object.keys(clientErrors).length > 0) {
                setFieldErrors(clientErrors);
                return;
            }

            setFieldErrors({});
            setIsSubmitting(true);

            try {
                await register(
                    trimmedFirstName,
                    trimmedLastName,
                    email,
                    password,
                    passwordConfirmation
                );
                onSuccess();
            } catch (error: unknown) {
                const validationErrors = parseLaravelValidationErrors(error);
                const mappedErrors =
                    REGISTER_FIELDS.reduce<RegisterFieldErrors>(
                        (accumulator, field) => {
                            const message = validationErrors[field];
                            if (message !== undefined) {
                                accumulator[field] = message;
                            }
                            return accumulator;
                        },
                        {}
                    );

                if (Object.keys(mappedErrors).length > 0) {
                    setFieldErrors(mappedErrors);
                    return;
                }

                setFormError(
                    formatApiErrorMessage(error) || t('auth.errors.generic')
                );
            } finally {
                setIsSubmitting(false);
            }
        },
        [
            email,
            firstName,
            lastName,
            onSuccess,
            password,
            passwordConfirmation,
            register,
            t,
        ]
    );

    return (
        <div className="flex max-w-md flex-col gap-4">
            <h1 className="text-lg font-semibold">
                {t('auth.register.title')}
            </h1>
            <form
                className="flex flex-col gap-3"
                noValidate
                onSubmit={handleSubmit}
            >
                <div className="flex flex-col gap-1 text-sm">
                    <label htmlFor="register-first-name">
                        {t('auth.register.first_name_label')}
                    </label>
                    <Input
                        id="register-first-name"
                        autoComplete="given-name"
                        autoFocus
                        aria-invalid={fieldErrors.first_name ? true : undefined}
                        className={cn(
                            fieldErrors.first_name && 'border-destructive'
                        )}
                        disabled={isSubmitting}
                        name="first_name"
                        onChange={handleFirstNameChange}
                        type="text"
                        value={firstName}
                    />
                    {fieldErrors.first_name ? (
                        <p className="text-xs text-destructive" role="alert">
                            {fieldErrors.first_name}
                        </p>
                    ) : null}
                </div>
                <div className="flex flex-col gap-1 text-sm">
                    <label htmlFor="register-last-name">
                        {t('auth.register.last_name_label')}
                    </label>
                    <Input
                        id="register-last-name"
                        autoComplete="family-name"
                        aria-invalid={fieldErrors.last_name ? true : undefined}
                        className={cn(
                            fieldErrors.last_name && 'border-destructive'
                        )}
                        disabled={isSubmitting}
                        name="last_name"
                        onChange={handleLastNameChange}
                        type="text"
                        value={lastName}
                    />
                    {fieldErrors.last_name ? (
                        <p className="text-xs text-destructive" role="alert">
                            {fieldErrors.last_name}
                        </p>
                    ) : null}
                </div>
                <div className="flex flex-col gap-1 text-sm">
                    <label htmlFor="register-email">
                        {t('auth.register.email_label')}
                    </label>
                    <Input
                        id="register-email"
                        autoComplete="email"
                        aria-invalid={fieldErrors.email ? true : undefined}
                        className={cn(
                            fieldErrors.email && 'border-destructive'
                        )}
                        disabled={isSubmitting}
                        name="email"
                        onChange={handleEmailChange}
                        required
                        type="email"
                        value={email}
                    />
                    {fieldErrors.email ? (
                        <p className="text-xs text-destructive" role="alert">
                            {fieldErrors.email}
                        </p>
                    ) : null}
                </div>
                <div className="flex flex-col gap-1 text-sm">
                    <label htmlFor="register-password">
                        {t('auth.register.password_label')}
                    </label>
                    <Input
                        id="register-password"
                        autoComplete="new-password"
                        aria-invalid={fieldErrors.password ? true : undefined}
                        className={cn(
                            fieldErrors.password && 'border-destructive'
                        )}
                        disabled={isSubmitting}
                        name="password"
                        onChange={handlePasswordChange}
                        required
                        type="password"
                        value={password}
                    />
                    {fieldErrors.password ? (
                        <p className="text-xs text-destructive" role="alert">
                            {fieldErrors.password}
                        </p>
                    ) : null}
                </div>
                <label className="flex flex-col gap-1 text-sm">
                    <span>
                        {t('auth.register.password_confirmation_label')}
                    </span>
                    <Input
                        autoComplete="new-password"
                        disabled={isSubmitting}
                        name="password_confirmation"
                        onChange={(e) =>
                            setPasswordConfirmation(e.target.value)
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
                        ? t('auth.register.submitting')
                        : t('auth.register.submit')}
                </Button>
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
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleLogout = useCallback(async () => {
        setErrorMessage(null);

        try {
            await logout();
        } catch (error: unknown) {
            setErrorMessage(formatApiErrorMessage(error));
        }
    }, [logout]);

    return (
        <div className="flex max-w-md flex-col gap-4">
            <p className="text-sm">
                {t('auth.account.signed_in_as')}{' '}
                <span className="font-medium text-foreground">
                    {user?.full_name}
                </span>
            </p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            {errorMessage !== null ? (
                <p className="text-sm text-destructive" role="alert">
                    {errorMessage}
                </p>
            ) : null}
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
