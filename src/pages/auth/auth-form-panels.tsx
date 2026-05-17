import React, { useCallback, useState } from 'react';
import { Button } from '@/components/button/button';
import { Input } from '@/components/input/input';
import { useAuth } from '@/hooks/use-auth';
import { formatApiErrorMessage } from './format-api-error-message';

export interface LoginFormPanelProps {
    onSuccess: () => void;
    onSwitchToRegister: () => void;
}

export const LoginFormPanel: React.FC<LoginFormPanelProps> = ({
    onSuccess,
    onSwitchToRegister,
}) => {
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
            <h1 className="text-lg font-semibold">Log in</h1>
            <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
                <label className="flex flex-col gap-1 text-sm">
                    <span>Email</span>
                    <Input
                        autoComplete="email"
                        autoFocus
                        name="email"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        type="email"
                        value={email}
                    />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                    <span>Password</span>
                    <Input
                        autoComplete="current-password"
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
                    {isSubmitting ? 'Signing in...' : 'Sign in'}
                </Button>
            </form>
            <p className="text-sm text-muted-foreground">
                No account?{' '}
                <button
                    className="underline underline-offset-4"
                    onClick={onSwitchToRegister}
                    type="button"
                >
                    Register
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
    const { register } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = useCallback(
        async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setErrorMessage(null);
            setIsSubmitting(true);

            try {
                await register(name, email, password, passwordConfirmation);
                onSuccess();
            } catch (error: unknown) {
                setErrorMessage(formatApiErrorMessage(error));
            } finally {
                setIsSubmitting(false);
            }
        },
        [name, email, password, passwordConfirmation, register, onSuccess]
    );

    return (
        <div className="flex max-w-md flex-col gap-4">
            <h1 className="text-lg font-semibold">Register</h1>
            <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
                <label className="flex flex-col gap-1 text-sm">
                    <span>Name</span>
                    <Input
                        autoComplete="name"
                        autoFocus
                        name="name"
                        onChange={(e) => setName(e.target.value)}
                        required
                        type="text"
                        value={name}
                    />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                    <span>Email</span>
                    <Input
                        autoComplete="email"
                        name="email"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        type="email"
                        value={email}
                    />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                    <span>Password</span>
                    <Input
                        autoComplete="new-password"
                        name="password"
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        type="password"
                        value={password}
                    />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                    <span>Confirm password</span>
                    <Input
                        autoComplete="new-password"
                        name="password_confirmation"
                        onChange={(e) =>
                            setPasswordConfirmation(e.target.value)
                        }
                        required
                        type="password"
                        value={passwordConfirmation}
                    />
                </label>
                {errorMessage !== null ? (
                    <p className="text-sm text-destructive" role="alert">
                        {errorMessage}
                    </p>
                ) : null}
                <Button disabled={isSubmitting} type="submit">
                    {isSubmitting ? 'Creating account...' : 'Create account'}
                </Button>
            </form>
            <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <button
                    className="underline underline-offset-4"
                    onClick={onSwitchToLogin}
                    type="button"
                >
                    Log in
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
                Signed in as{' '}
                <span className="font-medium text-foreground">
                    {user?.email}
                </span>
            </p>
            {errorMessage !== null ? (
                <p className="text-sm text-destructive" role="alert">
                    {errorMessage}
                </p>
            ) : null}
            <Button type="button" variant="secondary" onClick={handleLogout}>
                Logout
            </Button>
            {onBack ? (
                <button
                    className="text-left text-sm text-muted-foreground underline underline-offset-4"
                    onClick={onBack}
                    type="button"
                >
                    Back to editor
                </button>
            ) : null}
        </div>
    );
};
