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

export type DiagramCreationDestinationPreference = 'device' | 'online';

export interface UpdateDiagramCreationPreferencePayload {
    default_diagram_creation_destination: DiagramCreationDestinationPreference | null;
}

export interface AuthUser {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    email_verified_at: string | null;
    default_diagram_creation_destination: DiagramCreationDestinationPreference | null;
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
    passwordConfirmation: string,
    invitationToken?: string
): Promise<AuthUser> => {
    const response = await apiRequest<AuthUserResponse>('/register', {
        method: 'POST',
        data: {
            first_name: firstName,
            last_name: lastName,
            email,
            password,
            password_confirmation: passwordConfirmation,
            ...(invitationToken ? { invitation_token: invitationToken } : {}),
        },
    });

    const user = parseAuthUser(response.user);
    if (user === null) {
        throw new Error('Invalid registration response');
    }

    return user;
};

export const resendVerificationEmail = async (): Promise<void> => {
    await apiRequest<{ message: string }>('/email/verification-notification', {
        method: 'POST',
    });
};

export const requestPasswordReset = async (email: string): Promise<void> => {
    await initCsrf();
    await apiRequest<{ message: string }>('/forgot-password', {
        method: 'POST',
        data: { email },
    });
};

export interface ResetPasswordPayload {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export const resetPassword = async (
    payload: ResetPasswordPayload
): Promise<void> => {
    await initCsrf();
    await apiRequest<{ message: string }>('/reset-password', {
        method: 'POST',
        data: payload,
    });
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

export const closeAccount = async (currentPassword: string): Promise<void> => {
    await apiRequest<{ message: string }>('/me', {
        method: 'DELETE',
        data: { current_password: currentPassword },
    });
};

export const requestAccountRecovery = async (email: string): Promise<void> => {
    await initCsrf();
    await apiRequest<{ message: string }>('/account/recovery', {
        method: 'POST',
        data: { email },
    });
};

export interface RestoreAccountResult {
    status: 'restored';
    email: string;
}

const isRestoreAccountResult = (
    value: unknown
): value is RestoreAccountResult => {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    const candidate = value as { status?: unknown; email?: unknown };

    return (
        candidate.status === 'restored' && typeof candidate.email === 'string'
    );
};

export const restoreAccount = async (
    token: string
): Promise<RestoreAccountResult> => {
    await initCsrf();
    const response = await apiRequest<unknown>('/account/restore', {
        method: 'POST',
        data: { token },
    });

    if (!isRestoreAccountResult(response)) {
        throw new Error('Invalid account restoration response');
    }

    return response;
};

export const updateDiagramCreationPreference = async (
    payload: UpdateDiagramCreationPreferencePayload
): Promise<AuthUser> => {
    const response = await apiRequest<AuthUserResponse>(
        '/me/diagram-creation-preference',
        {
            method: 'PATCH',
            data: payload,
        }
    );

    const user = parseAuthUser(response.user);
    if (user === null) {
        throw new Error('Invalid diagram creation preference response');
    }

    return user;
};
