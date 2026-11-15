export const formFieldErrorId = (id: string): string => `${id}-error`;

export const formFieldDescriptionId = (id: string): string =>
    `${id}-description`;

export const formFieldDescribedBy = (
    id: string,
    options: { description?: boolean; error?: boolean }
): string | undefined => {
    const ids: string[] = [];
    if (options.description) {
        ids.push(formFieldDescriptionId(id));
    }
    if (options.error) {
        ids.push(formFieldErrorId(id));
    }
    return ids.length > 0 ? ids.join(' ') : undefined;
};

export const invalidControlClassName = (
    invalid: boolean
): string | undefined => (invalid ? 'border-destructive' : undefined);
