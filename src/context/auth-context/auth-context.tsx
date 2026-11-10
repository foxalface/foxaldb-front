import { createContext } from 'react';
import { emptyFn } from '@/lib/utils';
import type {
    AuthUser,
    UpdateDiagramCreationPreferencePayload,
    UpdateProfilePayload,
} from '@/lib/api/auth';

export interface AuthContextValue {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isEmailVerified: boolean;
    isLoading: boolean;
    refreshSession: () => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    register: (
        firstName: string,
        lastName: string,
        email: string,
        password: string,
        passwordConfirmation: string,
        invitationToken?: string
    ) => Promise<void>;
    logout: () => Promise<void>;
    closeAccount: (currentPassword: string) => Promise<void>;
    fetchUser: () => Promise<void>;
    updateProfile: (payload: UpdateProfilePayload) => Promise<void>;
    updateDiagramCreationPreference: (
        payload: UpdateDiagramCreationPreferencePayload
    ) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue>({
    user: null,
    isAuthenticated: false,
    isEmailVerified: false,
    isLoading: true,
    refreshSession: emptyFn,
    login: emptyFn,
    register: emptyFn,
    logout: emptyFn,
    closeAccount: emptyFn,
    fetchUser: emptyFn,
    updateProfile: emptyFn,
    updateDiagramCreationPreference: emptyFn,
});
