import type { AppApiError } from '@/lib/api/normalize-api-error';
import type { FormFieldIssue } from '@/lib/forms/collect-form-validity';

export const fieldRuleMessageKey = (ruleCode: string | null): string => {
    switch (ruleCode) {
        case 'required':
        case 'accepted':
            return 'validation.required';
        case 'email':
        case 'invalid_email':
            return 'validation.invalid_email';
        case 'confirmed':
        case 'password_confirmation':
            return 'validation.password_confirmation';
        case 'unique':
            return 'validation.already_used';
        case 'min':
            return 'validation.too_short';
        case 'max':
            return 'validation.too_long';
        default:
            return 'validation.invalid';
    }
};

export const nonFieldErrorMessageKey = (code: string): string => {
    switch (code) {
        case 'invalid_credentials':
            return 'errors.invalid_credentials';
        case 'network':
            return 'errors.network';
        case 'forbidden':
            return 'errors.forbidden';
        case 'not_found':
            return 'errors.not_found';
        case 'server':
            return 'errors.server';
        case 'too_many_requests':
            return 'errors.too_many_requests';
        case 'unauthenticated':
            return 'errors.unauthenticated';
        case 'session_expired':
            return 'errors.session_expired';
        default:
            return 'errors.generic';
    }
};

export const currentPasswordInvalidMessageKey =
    'auth.settings.danger_zone.current_password_invalid';

export const messagesForIssues = (
    issues: FormFieldIssue[],
    translate: (key: string) => string
): Record<string, string> => {
    const errors: Record<string, string> = {};

    for (const issue of issues) {
        if (errors[issue.name] !== undefined) {
            continue;
        }

        errors[issue.name] = translate(fieldRuleMessageKey(issue.code));
    }

    return errors;
};

export const mapServerFieldMessages = (
    error: AppApiError,
    fields: readonly string[],
    translate: (key: string) => string
): Record<string, string> => {
    const errors: Record<string, string> = {};

    for (const field of fields) {
        const issues = error.fields[field];
        if (issues === undefined || issues.length === 0) {
            continue;
        }

        const key =
            error.code === 'current_password_invalid' &&
            field === 'current_password'
                ? currentPasswordInvalidMessageKey
                : fieldRuleMessageKey(issues[0]?.code ?? null);

        errors[field] = translate(key);
    }

    return errors;
};

export const submissionToastMessageKey = (
    issues: readonly { code: string }[]
): string => {
    if (
        issues.length === 0 ||
        issues.every((issue) => issue.code === 'required')
    ) {
        return 'validation.required_fields';
    }

    if (issues.length === 1) {
        return fieldRuleMessageKey(issues[0]?.code ?? null);
    }

    return 'validation.invalid_fields';
};

export const toastMessageForMappedFields = (
    messages: Record<string, string>,
    translate: (key: string) => string
): string => {
    const values = Object.values(messages);
    if (values.length === 1 && values[0] !== undefined) {
        return values[0];
    }

    return translate('validation.invalid_fields');
};
