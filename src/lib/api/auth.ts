import { apiRequest, BACKEND_URL } from './client';

export interface AuthUser {
    id: number;
    name: string;
    email: string;
}

interface AuthUserResponse {
    user: AuthUser;
}

interface SessionUserResponse {
    user: AuthUser | null;
}

interface LogoutResponse {
    message: string;
}

export const initCsrf = async (): Promise<void> => {
    const response = await fetch(`${BACKEND_URL}/sanctum/csrf-cookie`, {
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error(
            `Failed to initialize CSRF cookie (status ${response.status})`
        );
    }
};

export const login = async (
    email: string,
    password: string
): Promise<AuthUser> => {
    const response = await apiRequest<AuthUserResponse>('/login', {
        method: 'POST',
        data: { email, password },
    });
    return response.user;
};

export const register = async (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string
): Promise<AuthUser> => {
    const response = await apiRequest<AuthUserResponse>('/register', {
        method: 'POST',
        data: {
            name,
            email,
            password,
            password_confirmation: passwordConfirmation,
        },
    });
    return response.user;
};

export const logout = async (): Promise<void> => {
    await apiRequest<LogoutResponse>('/logout', { method: 'POST' });
};

export const fetchSessionUser = async (): Promise<AuthUser | null> => {
    const response = await apiRequest<SessionUserResponse>('/session');
    return response.user;
};

export const fetchCurrentUser = async (): Promise<AuthUser> => {
    const response = await apiRequest<AuthUserResponse>('/me');
    return response.user;
};
