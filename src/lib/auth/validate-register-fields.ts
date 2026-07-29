export type RegisterField = 'first_name' | 'last_name' | 'email' | 'password';

export type RegisterFieldErrors = Partial<Record<RegisterField, string>>;

export interface RegisterFieldValues {
    firstName: string;
    lastName: string;
}

export interface RegisterValidationMessages {
    firstNameRequired: string;
    lastNameRequired: string;
}

export const validateRegisterFields = (
    values: RegisterFieldValues,
    messages: RegisterValidationMessages
): RegisterFieldErrors => {
    const errors: RegisterFieldErrors = {};

    if (values.firstName.trim() === '') {
        errors.first_name = messages.firstNameRequired;
    }

    if (values.lastName.trim() === '') {
        errors.last_name = messages.lastNameRequired;
    }

    return errors;
};
