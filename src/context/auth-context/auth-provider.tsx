import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { AuthContext } from './auth-context';
import type { AuthUser, UpdateProfilePayload } from '@/lib/api/auth';
import {
    initCsrf,
    login as apiLogin,
    register as apiRegister,
    logout as apiLogout,
    fetchSessionUser,
    fetchCurrentUser,
    updateProfile as apiUpdateProfile,
} from '@/lib/api/auth';
import { registerSessionExpiredHandler } from '@/lib/api/session-expired';
import { beginSessionEnd, type SessionEndReason } from '@/lib/session-end';

const SESSION_REVALIDATION_THRESHOLD_MS = 30_000;

export const AuthProvider: React.FC<React.PropsWithChildren> = ({
    children,
}) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const didCheckSessionRef = useRef(false);
    const userRef = useRef<AuthUser | null>(null);
    const hiddenAtRef = useRef<number | null>(null);
    const logoutInProgressRef = useRef(false);

    const endSession = useCallback((reason: SessionEndReason) => {
        if (userRef.current === null) {
            return;
        }

        userRef.current = null;
        beginSessionEnd(reason);
        setUser(null);
    }, []);

    useEffect(() => {
        if (didCheckSessionRef.current) {
            return;
        }

        didCheckSessionRef.current = true;

        const checkSession = async () => {
            try {
                await initCsrf();
                const currentUser = await fetchSessionUser();
                userRef.current = currentUser;
                setUser(currentUser);
            } catch {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        void checkSession();
    }, []);

    useEffect(() => {
        userRef.current = user;
    }, [user]);

    useEffect(() => {
        return registerSessionExpiredHandler(() => {
            if (logoutInProgressRef.current) {
                return;
            }

            endSession('session-expired');
        });
    }, [endSession]);

    useEffect(() => {
        if (user === null) {
            return;
        }

        const revalidateSession = async (): Promise<void> => {
            try {
                const currentUser = await fetchSessionUser();
                if (currentUser === null) {
                    endSession('session-expired');
                    return;
                }

                userRef.current = currentUser;
                setUser(currentUser);
            } catch {
                endSession('session-expired');
            }
        };

        const handleVisibilityChange = (): void => {
            if (document.visibilityState === 'hidden') {
                hiddenAtRef.current = Date.now();
                return;
            }

            const hiddenAt = hiddenAtRef.current;
            hiddenAtRef.current = null;

            if (hiddenAt === null) {
                return;
            }

            if (Date.now() - hiddenAt < SESSION_REVALIDATION_THRESHOLD_MS) {
                return;
            }

            void revalidateSession();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange
            );
        };
    }, [user, endSession]);

    const login = useCallback(
        async (email: string, password: string): Promise<void> => {
            await initCsrf();
            const loggedInUser = await apiLogin(email, password);
            userRef.current = loggedInUser;
            setUser(loggedInUser);
        },
        []
    );

    const register = useCallback(
        async (
            firstName: string,
            lastName: string,
            email: string,
            password: string,
            passwordConfirmation: string
        ): Promise<void> => {
            await initCsrf();
            const registeredUser = await apiRegister(
                firstName,
                lastName,
                email,
                password,
                passwordConfirmation
            );
            userRef.current = registeredUser;
            setUser(registeredUser);
        },
        []
    );

    const logout = useCallback(async (): Promise<void> => {
        logoutInProgressRef.current = true;

        try {
            await apiLogout();
        } finally {
            try {
                endSession('explicit-logout');
            } finally {
                logoutInProgressRef.current = false;
            }
        }
    }, [endSession]);

    const fetchUser = useCallback(async (): Promise<void> => {
        try {
            const currentUser = await fetchCurrentUser();
            userRef.current = currentUser;
            setUser(currentUser);
        } catch {
            endSession('session-expired');
        }
    }, [endSession]);

    const updateProfile = useCallback(
        async (payload: UpdateProfilePayload): Promise<void> => {
            const updatedUser = await apiUpdateProfile(payload);
            userRef.current = updatedUser;
            setUser(updatedUser);
        },
        []
    );

    const value = useMemo(
        () => ({
            user,
            isAuthenticated: user !== null,
            isLoading,
            login,
            register,
            logout,
            fetchUser,
            updateProfile,
        }),
        [user, isLoading, login, register, logout, fetchUser, updateProfile]
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};
