import type { AuthUser } from './auth';

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

const isNonEmptyString = (value: unknown): value is string =>
    typeof value === 'string' && value.length > 0;

const isFiniteInteger = (value: unknown): value is number =>
    typeof value === 'number' && Number.isInteger(value);

const normalizeDestinationPreference = (
    value: unknown
): 'device' | 'online' | null | undefined => {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    if (value === 'device' || value === 'online') {
        return value;
    }
    return undefined;
};

export const parseAuthUser = (value: unknown): AuthUser | null => {
    if (!isRecord(value)) {
        return null;
    }

    const {
        id,
        first_name,
        last_name,
        full_name,
        email,
        email_verified_at,
        default_diagram_creation_destination,
    } = value;

    const hasDestinationKey = Object.prototype.hasOwnProperty.call(
        value,
        'default_diagram_creation_destination'
    );

    const destination = hasDestinationKey
        ? normalizeDestinationPreference(default_diagram_creation_destination)
        : null;

    if (
        !isFiniteInteger(id) ||
        !isNonEmptyString(first_name) ||
        !isNonEmptyString(last_name) ||
        !isNonEmptyString(full_name) ||
        !isNonEmptyString(email) ||
        (email_verified_at !== null && !isNonEmptyString(email_verified_at)) ||
        destination === undefined
    ) {
        return null;
    }

    return {
        id,
        first_name,
        last_name,
        full_name,
        email,
        email_verified_at,
        default_diagram_creation_destination: destination,
    };
};
