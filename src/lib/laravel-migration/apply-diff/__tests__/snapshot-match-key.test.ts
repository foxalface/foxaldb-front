import type { IndexSnapshot } from '@/types/laravel-migration';
import { describe, expect, it } from 'vitest';
import { indexMatchKey } from '../snapshot-match-key';

describe('indexMatchKey', () => {
    it('uses column-based identity for unnamed indexes', () => {
        const unnamedUniqueIndex: IndexSnapshot = {
            name: null,
            columns: ['email'],
            unique: true,
            primary: false,
        };

        expect(indexMatchKey('users', unnamedUniqueIndex)).toBe(
            'users::index::email::unique::non_primary'
        );
    });

    it('uses column-based identity for primary key indexes without names', () => {
        const unnamedPrimaryIndex: IndexSnapshot = {
            name: null,
            columns: ['id'],
            unique: true,
            primary: true,
        };

        expect(indexMatchKey('users', unnamedPrimaryIndex)).toBe(
            'users::index::id::unique::primary'
        );
    });

    it('uses the normalized index name when present', () => {
        const namedIndex: IndexSnapshot = {
            name: 'users_email_unique',
            columns: ['email'],
            unique: true,
            primary: false,
        };

        expect(indexMatchKey('Users', namedIndex)).toBe(
            'users::index::users_email_unique'
        );
    });
});
