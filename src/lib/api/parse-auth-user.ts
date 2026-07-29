import type { AuthUser } from './auth';

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

const isNonEmptyString = (value: unknown): value is string =>
    typeof value === 'string' && value.length > 0;

const isFiniteInteger = (value: unknown): value is number =>
    typeof value === 'number' && Number.isInteger(value);

export const parseAuthUser = (value: unknown): AuthUser | null => {
    if (!isRecord(value)) {
        return null;
    }

    const { id, first_name, last_name, full_name, email } = value;

    if (
        !isFiniteInteger(id) ||
        !isNonEmptyString(first_name) ||
        !isNonEmptyString(last_name) ||
        !isNonEmptyString(full_name) ||
        !isNonEmptyString(email)
    ) {
        return null;
    }

    return {
        id,
        first_name,
        last_name,
        full_name,
        email,
    };
};
