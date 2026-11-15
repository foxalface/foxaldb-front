export const translateExportCode = (
    translate: (key: string, options?: { path: string }) => string,
    prefix: string,
    genericKey: string,
    error: { code?: string; path?: string }
): string => {
    if (typeof error.code === 'string' && error.code.length > 0) {
        const key = `${prefix}.${error.code}`;
        const translated = translate(key, { path: error.path ?? '' });
        if (translated !== key) {
            return translated;
        }
    }

    return translate(genericKey);
};
