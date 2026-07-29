import { describe, expect, it } from 'vitest';
import { parseAuthUser } from '../parse-auth-user';

describe('parseAuthUser', () => {
    it('parses a valid auth user payload', () => {
        expect(
            parseAuthUser({
                id: 1,
                first_name: 'Alexis',
                last_name: 'Renart',
                full_name: 'Alexis Renart',
                email: 'alexis@example.com',
            })
        ).toEqual({
            id: 1,
            first_name: 'Alexis',
            last_name: 'Renart',
            full_name: 'Alexis Renart',
            email: 'alexis@example.com',
        });
    });

    it('accepts international names', () => {
        expect(
            parseAuthUser({
                id: 2,
                first_name: 'Élodie',
                last_name: 'Nguyễn',
                full_name: 'Élodie Nguyễn',
                email: 'elodie@example.com',
            })
        )?.toMatchObject({
            first_name: 'Élodie',
            last_name: 'Nguyễn',
            full_name: 'Élodie Nguyễn',
        });
    });

    it('rejects legacy name-only payloads', () => {
        expect(
            parseAuthUser({
                id: 1,
                name: 'Alexis Renart',
                email: 'alexis@example.com',
            })
        ).toBeNull();
    });

    it('rejects incomplete payloads', () => {
        expect(parseAuthUser(null)).toBeNull();
        expect(parseAuthUser({})).toBeNull();
        expect(
            parseAuthUser({
                id: 1,
                first_name: 'Alexis',
                email: 'alexis@example.com',
            })
        ).toBeNull();
    });
});
