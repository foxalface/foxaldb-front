import { apiRequest, BACKEND_URL } from './client';
import { parseAuthUser } from './parse-auth-user';

export interface UpdateProfilePayload {
    first_name: string;
    last_name: string;
    email: string;
    current_password?: string;
    password?: string;
    password_confirmation?: string;
}

export interface AuthUser {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
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

    const user = parseAuthUser(response.user);
    if (user === null) {
        throw new Error('Invalid login response');
    }

    return user;
};

export const register = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    passwordConfirmation: string
): Promise<AuthUser> => {
    const response = await apiRequest<AuthUserResponse>('/register', {
        method: 'POST',
        data: {
            first_name: firstName,
            last_name: lastName,
            email,
            password,
            password_confirmation: passwordConfirmation,
        },
    });

    const user = parseAuthUser(response.user);
    if (user === null) {
        throw new Error('Invalid registration response');
    }

    return user;
};

export const logout = async (): Promise<void> => {
    await apiRequest<LogoutResponse>('/logout', { method: 'POST' });
};

export const fetchSessionUser = async (): Promise<AuthUser | null> => {
    const response = await apiRequest<SessionUserResponse>('/session');

    if (response.user === null) {
        return null;
    }

    return parseAuthUser(response.user);
};

export const fetchCurrentUser = async (): Promise<AuthUser> => {
    const response = await apiRequest<AuthUserResponse>('/me');
    const user = parseAuthUser(response.user);

    if (user === null) {
        throw new Error('Invalid current user response');
    }

    return user;
};

export const updateProfile = async (
    payload: UpdateProfilePayload
): Promise<AuthUser> => {
    const response = await apiRequest<AuthUserResponse>('/me', {
        method: 'PATCH',
        data: payload,
    });

    const user = parseAuthUser(response.user);
    if (user === null) {
        throw new Error('Invalid profile update response');
    }

    return user;
};
