import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { AuthContext } from './auth-context';
import type { AuthUser } from '@/lib/api/auth';
import {
    initCsrf,
    login as apiLogin,
    register as apiRegister,
    logout as apiLogout,
    fetchSessionUser,
    fetchCurrentUser,
} from '@/lib/api/auth';

export const AuthProvider: React.FC<React.PropsWithChildren> = ({
    children,
}) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const didCheckSessionRef = useRef(false);

    useEffect(() => {
        if (didCheckSessionRef.current) {
            return;
        }

        didCheckSessionRef.current = true;

        const checkSession = async () => {
            try {
                await initCsrf();
                const currentUser = await fetchSessionUser();
                setUser(currentUser);
            } catch {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        void checkSession();
    }, []);

    const login = useCallback(
        async (email: string, password: string): Promise<void> => {
            await initCsrf();
            const loggedInUser = await apiLogin(email, password);
            setUser(loggedInUser);
        },
        []
    );

    const register = useCallback(
        async (
            name: string,
            email: string,
            password: string,
            passwordConfirmation: string
        ): Promise<void> => {
            await initCsrf();
            const registeredUser = await apiRegister(
                name,
                email,
                password,
                passwordConfirmation
            );
            setUser(registeredUser);
        },
        []
    );

    const logout = useCallback(async (): Promise<void> => {
        try {
            await apiLogout();
        } finally {
            setUser(null);
        }
    }, []);

    const fetchUser = useCallback(async (): Promise<void> => {
        try {
            const currentUser = await fetchCurrentUser();
            setUser(currentUser);
        } catch {
            setUser(null);
        }
    }, []);

    const value = useMemo(
        () => ({
            user,
            isAuthenticated: user !== null,
            isLoading,
            login,
            register,
            logout,
            fetchUser,
        }),
        [user, isLoading, login, register, logout, fetchUser]
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};
