import { describe, expect, it } from 'vitest';
import { ApiError } from '@/lib/api/client';
import { normalizeApiError } from '@/lib/api/normalize-api-error';

const keysOf = (value: object): string[] => Object.keys(value);

describe('normalizeApiError', () => {
    it('keeps machine-readable validation fields and ignores debug keys', () => {
        const error = normalizeApiError(
            new ApiError('The email field is required.', 422, {
                code: 'validation_failed',
                message: 'The email field is required.',
                errors: {
                    email: ['The email field is required.'],
                },
                fields: {
                    email: [
                        {
                            code: 'required',
                            message: 'The email field is required.',
                        },
                    ],
                },
                trace: [{ file: '/secret.php', line: 12 }],
                exception: 'Illuminate\\Validation\\ValidationException',
                file: '/secret.php',
                line: 12,
            })
        );

        expect(keysOf(error)).toEqual([
            'status',
            'code',
            'message',
            'fields',
            'retryable',
        ]);
        expect(error).toMatchObject({
            status: 422,
            code: 'validation_failed',
            retryable: false,
        });
        expect(error.fields.email).toEqual([
            {
                code: 'required',
                message: 'The email field is required.',
            },
        ]);
        expect(error).not.toHaveProperty('trace');
        expect(error).not.toHaveProperty('exception');
        expect(error).not.toHaveProperty('file');
        expect(error).not.toHaveProperty('line');
    });

    it('maps legacy string errors when no rule code exists', () => {
        const error = normalizeApiError(
            new ApiError('The email has already been taken.', 422, {
                message: 'The email has already been taken.',
                errors: {
                    email: ['The email has already been taken.'],
                },
            })
        );

        expect(error.code).toBe('validation_failed');
        expect(error.fields.email).toEqual([
            {
                code: null,
                message: 'The email has already been taken.',
            },
        ]);
    });

    it('keeps invalid credentials as a non-validation code', () => {
        const error = normalizeApiError(
            new ApiError('These credentials do not match our records.', 422, {
                code: 'invalid_credentials',
                message: 'These credentials do not match our records.',
                errors: {
                    email: ['These credentials do not match our records.'],
                },
            })
        );

        expect(error.code).toBe('invalid_credentials');
        expect(error.fields.email[0]?.code).toBeNull();
        expect(error.retryable).toBe(false);
    });

    it.each([
        [401, 'unauthenticated', false],
        [403, 'forbidden', false],
        [404, 'not_found', false],
        [409, 'conflict', false],
        [419, 'session_expired', false],
        [422, 'validation_failed', false],
        [429, 'too_many_requests', true],
        [500, 'server', true],
        [503, 'server', true],
    ] as const)('maps HTTP %s to %s', (status, code, retryable) => {
        const error = normalizeApiError(
            new ApiError('raw', status, { message: 'raw' })
        );

        expect(error.code).toBe(code);
        expect(error.retryable).toBe(retryable);
        expect(error.fields).toEqual({});
    });

    it('treats a fetch TypeError as a retryable network failure', () => {
        const error = normalizeApiError(new TypeError('Failed to fetch'));

        expect(error).toMatchObject({
            status: 0,
            code: 'network',
            message: 'Failed to fetch',
            fields: {},
            retryable: true,
        });
    });

    it('treats an unknown throw as a generic error', () => {
        expect(normalizeApiError('nope')).toEqual({
            status: 0,
            code: 'generic',
            message: '',
            fields: {},
            retryable: false,
        });
        expect(normalizeApiError(new Error('boom')).code).toBe('generic');
    });
});
