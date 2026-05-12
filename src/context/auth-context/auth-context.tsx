import { createContext } from 'react';
import { emptyFn } from '@/lib/utils';
import type { AuthUser } from '@/lib/api/auth';

export interface AuthContextValue {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (
        name: string,
        email: string,
        password: string,
        passwordConfirmation: string
    ) => Promise<void>;
    logout: () => Promise<void>;
    fetchUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    login: emptyFn,
    register: emptyFn,
    logout: emptyFn,
    fetchUser: emptyFn,
});
