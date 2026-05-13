import React, { useCallback, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/button/button';
import { Input } from '@/components/input/input';
import { LocalConfigProvider } from '@/context/local-config-context/local-config-provider';
import { ThemeProvider } from '@/context/theme-context/theme-provider';
import { useAuth } from '@/hooks/use-auth';
import { formatApiErrorMessage } from './format-api-error-message';

const RegisterPageContent: React.FC = () => {
    const { user, isAuthenticated, isLoading, register, logout } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLogout = useCallback(async () => {
        setErrorMessage(null);
        await logout();
    }, [logout]);

    const handleSubmit = useCallback(
        async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setErrorMessage(null);
            setIsSubmitting(true);
            try {
                await register(name, email, password, passwordConfirmation);
                navigate('/');
            } catch (error: unknown) {
                setErrorMessage(formatApiErrorMessage(error));
            } finally {
                setIsSubmitting(false);
            }
        },
        [name, email, password, passwordConfirmation, register, navigate]
    );

    if (isLoading) {
        return (
            <p className="text-sm text-muted-foreground">Checking session…</p>
        );
    }

    if (isAuthenticated && user !== null) {
        return (
            <div className="flex max-w-md flex-col gap-4">
                <p className="text-sm">
                    Signed in as{' '}
                    <span className="font-medium text-foreground">
                        {user.email}
                    </span>
                </p>
                <Button
                    type="button"
                    variant="secondary"
                    onClick={handleLogout}
                >
                    Logout
                </Button>
                <Link
                    to="/"
                    className="text-sm text-muted-foreground underline underline-offset-4"
                >
                    Back to editor
                </Link>
            </div>
        );
    }

    return (
        <div className="flex max-w-md flex-col gap-4">
            <h1 className="text-lg font-semibold">Register</h1>
            <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
                <label className="flex flex-col gap-1 text-sm">
                    <span>Name</span>
                    <Input
                        autoComplete="name"
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
                    {isSubmitting ? 'Creating account…' : 'Create account'}
                </Button>
            </form>
            <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link className="underline underline-offset-4" to="/login">
                    Log in
                </Link>
            </p>
        </div>
    );
};

const RegisterPageComponent: React.FC = () => {
    return (
        <>
            <Helmet>
                <title>FoxalDB — Register</title>
            </Helmet>
            <section className="flex min-h-screen flex-col bg-background px-4 py-10">
                <div className="mx-auto w-full max-w-md">
                    <RegisterPageContent />
                </div>
            </section>
        </>
    );
};

export const RegisterPage: React.FC = () => (
    <LocalConfigProvider>
        <ThemeProvider>
            <RegisterPageComponent />
        </ThemeProvider>
    </LocalConfigProvider>
);
