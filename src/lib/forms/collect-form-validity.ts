export type FormFieldIssueCode =
    | 'required'
    | 'invalid_email'
    | 'password_confirmation'
    | 'invalid';

export interface FormFieldIssue {
    name: string;
    element: HTMLElement;
    code: FormFieldIssueCode;
}

export type FormValidityToastKind = 'required_fields' | 'invalid_fields';

export interface FormValidityResult {
    issues: FormFieldIssue[];
    toastKind: FormValidityToastKind | null;
    firstInvalid: HTMLElement | null;
}

export interface CollectFormValidityOptions {
    confirmation?: {
        field: string;
        matches: string;
    };
    additionalIssues?: FormFieldIssue[];
}

const SKIPPED_INPUT_TYPES = new Set([
    'button',
    'hidden',
    'image',
    'reset',
    'submit',
]);

const isFieldControl = (
    element: Element
): element is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement =>
    element instanceof HTMLInputElement ||
    element instanceof HTMLSelectElement ||
    element instanceof HTMLTextAreaElement;

const controlName = (
    element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
): string => element.name || element.id;

const compareDomOrder = (left: HTMLElement, right: HTMLElement): number => {
    if (left === right) {
        return 0;
    }

    const position = left.compareDocumentPosition(right);
    if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
        return -1;
    }
    if (position & Node.DOCUMENT_POSITION_PRECEDING) {
        return 1;
    }
    return 0;
};

const toastKindFor = (
    issues: FormFieldIssue[]
): FormValidityToastKind | null => {
    if (issues.length === 0) {
        return null;
    }

    return issues.every((issue) => issue.code === 'required')
        ? 'required_fields'
        : 'invalid_fields';
};

export const collectFormValidity = (
    form: HTMLFormElement,
    options: CollectFormValidityOptions = {}
): FormValidityResult => {
    const issues: FormFieldIssue[] = [];
    const seen = new Set<string>();

    const pushIssue = (issue: FormFieldIssue) => {
        if (issue.name === '' || seen.has(issue.name)) {
            return;
        }
        seen.add(issue.name);
        issues.push(issue);
    };

    for (const element of Array.from(form.elements)) {
        if (!isFieldControl(element) || element.disabled) {
            continue;
        }
        if (
            element instanceof HTMLInputElement &&
            SKIPPED_INPUT_TYPES.has(element.type)
        ) {
            continue;
        }

        const name = controlName(element);
        if (name === '') {
            continue;
        }

        if (element.validity.valueMissing) {
            pushIssue({ name, element, code: 'required' });
            continue;
        }

        if (element.validity.typeMismatch) {
            pushIssue({
                name,
                element,
                code:
                    element instanceof HTMLInputElement &&
                    element.type === 'email'
                        ? 'invalid_email'
                        : 'invalid',
            });
        }
    }

    const confirmation = options.confirmation;
    if (confirmation) {
        const field = form.elements.namedItem(confirmation.field);
        const match = form.elements.namedItem(confirmation.matches);
        if (
            field instanceof HTMLInputElement &&
            match instanceof HTMLInputElement &&
            !field.disabled &&
            !match.disabled &&
            field.value !== '' &&
            match.value !== '' &&
            field.value !== match.value
        ) {
            pushIssue({
                name: controlName(field),
                element: field,
                code: 'password_confirmation',
            });
        }
    }

    for (const issue of options.additionalIssues ?? []) {
        pushIssue(issue);
    }

    issues.sort((left, right) => compareDomOrder(left.element, right.element));

    return {
        issues,
        toastKind: toastKindFor(issues),
        firstInvalid: issues[0]?.element ?? null,
    };
};
