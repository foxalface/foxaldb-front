export const formatRecoveryDeadline = (
    iso: string,
    language: string
): string => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
        return iso;
    }

    return new Intl.DateTimeFormat(language.replaceAll('_', '-'), {
        dateStyle: 'long',
        timeStyle: 'short',
    }).format(date);
};
