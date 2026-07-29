import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as ClientModule from '../client';

const { apiRequestMock } = vi.hoisted(() => ({
    apiRequestMock: vi.fn(),
}));

vi.mock('../client', async () => {
    const actual = (await vi.importActual('../client')) as typeof ClientModule;

    return {
        ...actual,
        apiRequest: apiRequestMock,
    };
});

import { login, register } from '../auth';

const sampleUser = {
    id: 1,
    first_name: 'Alexis',
    last_name: 'Renart',
    full_name: 'Alexis Renart',
    email: 'alexis@example.com',
};

describe('auth API', () => {
    beforeEach(() => {
        apiRequestMock.mockReset();
    });

    describe('register', () => {
        it('sends trimmed first_name and last_name in the payload', async () => {
            apiRequestMock.mockResolvedValueOnce({ user: sampleUser });

            await register(
                'Alexis',
                'Renart',
                'alexis@example.com',
                'password',
                'password'
            );

            expect(apiRequestMock).toHaveBeenCalledWith('/register', {
                method: 'POST',
                data: {
                    first_name: 'Alexis',
                    last_name: 'Renart',
                    email: 'alexis@example.com',
                    password: 'password',
                    password_confirmation: 'password',
                },
            });
        });

        it('accepts international names in the response', async () => {
            apiRequestMock.mockResolvedValueOnce({
                user: {
                    ...sampleUser,
                    first_name: 'Élodie',
                    last_name: 'Nguyễn',
                    full_name: 'Élodie Nguyễn',
                },
            });

            await expect(
                register(
                    'Élodie',
                    'Nguyễn',
                    'elodie@example.com',
                    'password',
                    'password'
                )
            ).resolves.toMatchObject({
                first_name: 'Élodie',
                last_name: 'Nguyễn',
                full_name: 'Élodie Nguyễn',
            });
        });
    });

    describe('login', () => {
        it('parses the identity payload from the response', async () => {
            apiRequestMock.mockResolvedValueOnce({ user: sampleUser });

            await expect(
                login('alexis@example.com', 'password')
            ).resolves.toEqual(sampleUser);
        });
    });
});
