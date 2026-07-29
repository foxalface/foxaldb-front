import type { AuthUser } from '@/lib/api/auth';
import { formatUserFullName } from './format-user-full-name';
import type {
    UserIdentity,
    UserIdentityWithEmail,
} from './user-identity-types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const isFiniteInteger = (value: unknown): value is number =>
    typeof value === 'number' && Number.isInteger(value);

const isNonEmptyString = (value: unknown): value is string =>
    typeof value === 'string' && value.length > 0;

export interface UserIdentityHttpDto {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
}

export interface UserIdentityWithEmailHttpDto extends UserIdentityHttpDto {
    email: string;
}

export interface UserIdentityWebSocketDto {
    id: number;
    firstName: string;
    lastName: string;
    fullName: string;
}

export const buildUserIdentity = (
    id: number,
    firstName: string,
    lastName: string
): UserIdentity => ({
    id,
    firstName,
    lastName,
    fullName: formatUserFullName(firstName, lastName),
});

export const userIdentityFromAuthUser = (user: AuthUser): UserIdentity => ({
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    fullName: user.full_name,
});

export const parseUserIdentityFromHttp = (
    value: unknown
): UserIdentity | null => {
    if (!isRecord(value)) {
        return null;
    }

    const { id, first_name, last_name, full_name } = value;

    if (
        !isFiniteInteger(id) ||
        typeof first_name !== 'string' ||
        typeof last_name !== 'string' ||
        typeof full_name !== 'string'
    ) {
        return null;
    }

    const firstName = first_name.trim();
    const lastName = last_name.trim();

    if (firstName.length === 0 && lastName.length === 0) {
        return null;
    }

    return {
        id,
        firstName,
        lastName,
        fullName: formatUserFullName(firstName, lastName),
    };
};

export const parseUserIdentityWithEmailFromHttp = (
    value: unknown
): UserIdentityWithEmail | null => {
    if (!isRecord(value)) {
        return null;
    }

    const identity = parseUserIdentityFromHttp(value);

    if (identity === null) {
        return null;
    }

    const { email } = value;

    if (!isNonEmptyString(email)) {
        return null;
    }

    return {
        ...identity,
        email,
    };
};

export const parseUserIdentityFromWebSocket = (
    value: unknown
): UserIdentity | null => {
    if (!isRecord(value)) {
        return null;
    }

    const { id, firstName, lastName, fullName } = value;

    if (
        !isFiniteInteger(id) ||
        typeof firstName !== 'string' ||
        typeof lastName !== 'string' ||
        typeof fullName !== 'string'
    ) {
        return null;
    }

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();

    if (trimmedFirstName.length === 0 && trimmedLastName.length === 0) {
        return null;
    }

    return {
        id,
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        fullName: formatUserFullName(trimmedFirstName, trimmedLastName),
    };
};

export const parsePresenceUserIdentityFromChannel = (
    value: unknown
): UserIdentity | null => {
    if (!isRecord(value)) {
        return null;
    }

    if (
        'name' in value &&
        !('first_name' in value) &&
        !('last_name' in value)
    ) {
        return null;
    }

    const id = typeof value.id === 'number' ? value.id : Number(value.id);
    const firstName =
        typeof value.first_name === 'string' ? value.first_name.trim() : '';
    const lastName =
        typeof value.last_name === 'string' ? value.last_name.trim() : '';

    if (!Number.isInteger(id) || id <= 0) {
        return null;
    }

    if (firstName.length === 0 && lastName.length === 0) {
        return null;
    }

    return buildUserIdentity(id, firstName, lastName);
};
