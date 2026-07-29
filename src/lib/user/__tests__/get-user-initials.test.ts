import { describe, expect, it } from 'vitest';
import { UNKNOWN_USER_INITIALS, getUserInitials } from '../get-user-initials';

describe('getUserInitials', () => {
    it('returns first grapheme from each name', () => {
        expect(getUserInitials('Alexis', 'Renart')).toBe('AR');
        expect(getUserInitials('Jean-Pierre', 'Le Goff')).toBe('JL');
        expect(getUserInitials('Élodie', 'Martin')).toBe('ÉM');
        expect(getUserInitials("O'Connor", 'Smith')).toBe('OS');
    });

    it('handles Unicode names safely', () => {
        expect(getUserInitials('Nguyễn', 'Trần')).toBe('NT');
    });

    it('returns first-name initial when last name is missing', () => {
        expect(getUserInitials('Alexis', '')).toBe('A');
    });

    it('returns last-name initial when first name is missing', () => {
        expect(getUserInitials('', 'Renart')).toBe('R');
    });

    it('returns fallback when both names are missing', () => {
        expect(getUserInitials('', '')).toBe(UNKNOWN_USER_INITIALS);
        expect(getUserInitials(null, undefined)).toBe(UNKNOWN_USER_INITIALS);
    });
});
