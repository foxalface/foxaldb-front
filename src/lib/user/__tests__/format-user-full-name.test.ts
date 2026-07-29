import { describe, expect, it } from 'vitest';
import {
    UNKNOWN_USER_DISPLAY_NAME,
    formatUserFullName,
} from '../format-user-full-name';

describe('formatUserFullName', () => {
    it('joins trimmed first and last names with one space', () => {
        expect(formatUserFullName('Alexis', 'Renart')).toBe('Alexis Renart');
        expect(formatUserFullName('  Alexis  ', '  Renart  ')).toBe(
            'Alexis Renart'
        );
    });

    it('returns only first name when last name is missing', () => {
        expect(formatUserFullName('Alexis', '')).toBe('Alexis');
        expect(formatUserFullName('Alexis', '   ')).toBe('Alexis');
    });

    it('returns only last name when first name is missing', () => {
        expect(formatUserFullName('', 'Renart')).toBe('Renart');
        expect(formatUserFullName('   ', 'Renart')).toBe('Renart');
    });

    it('returns fallback when both names are missing', () => {
        expect(formatUserFullName('', '')).toBe(UNKNOWN_USER_DISPLAY_NAME);
        expect(formatUserFullName(null, undefined)).toBe(
            UNKNOWN_USER_DISPLAY_NAME
        );
    });

    it('preserves hyphenated and apostrophized names', () => {
        expect(formatUserFullName('Jean-Pierre', "O'Connor")).toBe(
            "Jean-Pierre O'Connor"
        );
    });
});
