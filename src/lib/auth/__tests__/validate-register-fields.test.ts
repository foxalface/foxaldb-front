import { describe, expect, it } from 'vitest';
import { validateRegisterFields } from '../validate-register-fields';

const messages = {
    firstNameRequired: 'First name is required.',
    lastNameRequired: 'Last name is required.',
};

describe('validateRegisterFields', () => {
    it('returns no errors for valid names', () => {
        expect(
            validateRegisterFields(
                { firstName: 'Jean-Pierre', lastName: "O'Connor" },
                messages
            )
        ).toEqual({});
    });

    it('rejects empty first name after trimming', () => {
        expect(
            validateRegisterFields(
                { firstName: '   ', lastName: 'Renart' },
                messages
            )
        ).toEqual({
            first_name: messages.firstNameRequired,
        });
    });

    it('rejects empty last name after trimming', () => {
        expect(
            validateRegisterFields(
                { firstName: 'Alexis', lastName: '\t\n' },
                messages
            )
        ).toEqual({
            last_name: messages.lastNameRequired,
        });
    });

    it('rejects both names independently', () => {
        expect(
            validateRegisterFields({ firstName: ' ', lastName: ' ' }, messages)
        ).toEqual({
            first_name: messages.firstNameRequired,
            last_name: messages.lastNameRequired,
        });
    });
});
