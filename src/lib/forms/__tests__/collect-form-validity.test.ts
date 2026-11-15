import { describe, expect, it } from 'vitest';
import { collectFormValidity } from '../collect-form-validity';

const mountForm = (html: string): HTMLFormElement => {
    const form = document.createElement('form');
    form.noValidate = true;
    form.innerHTML = html;
    document.body.append(form);
    return form;
};

describe('collectFormValidity', () => {
    it('collects missing fields in DOM order and a confirmation mismatch', () => {
        const form = mountForm(`
            <input name="first_name" required value="" />
            <input name="email" type="email" required value="not-an-email" />
            <input name="password" type="password" required value="secret" />
            <input name="password_confirmation" type="password" required value="other" />
        `);

        const result = collectFormValidity(form, {
            confirmation: {
                field: 'password_confirmation',
                matches: 'password',
            },
        });

        expect(result.issues.map((issue) => issue.name)).toEqual([
            'first_name',
            'email',
            'password_confirmation',
        ]);
        expect(result.issues.map((issue) => issue.code)).toEqual([
            'required',
            'invalid_email',
            'password_confirmation',
        ]);
        expect(result.toastKind).toBe('invalid_fields');
        expect(result.firstInvalid).toBe(form.elements.namedItem('first_name'));

        form.remove();
    });

    it('treats an empty confirmation as required rather than a mismatch', () => {
        const form = mountForm(`
            <input name="password" type="password" required value="secret" />
            <input name="password_confirmation" type="password" required value="" />
        `);

        const result = collectFormValidity(form, {
            confirmation: {
                field: 'password_confirmation',
                matches: 'password',
            },
        });

        expect(result.issues).toEqual([
            expect.objectContaining({
                name: 'password_confirmation',
                code: 'required',
            }),
        ]);
        expect(result.toastKind).toBe('required_fields');

        form.remove();
    });

    it('places an additional issue by document order', () => {
        const form = mountForm(`
            <input id="name" name="name" required value="Ada" />
            <button id="terms" type="button">Terms</button>
        `);
        const terms = form.querySelector('#terms');
        if (!(terms instanceof HTMLElement)) {
            throw new Error('Missing terms control');
        }

        const result = collectFormValidity(form, {
            additionalIssues: [
                { name: 'accept_terms', element: terms, code: 'required' },
            ],
        });

        expect(result.issues.map((issue) => issue.name)).toEqual([
            'accept_terms',
        ]);
        expect(result.firstInvalid).toBe(terms);
        expect(result.toastKind).toBe('required_fields');

        form.remove();
    });
});
