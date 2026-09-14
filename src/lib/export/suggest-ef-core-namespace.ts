const capitalizeSegment = (segment: string): string => {
    if (segment.length === 0) {
        return '';
    }

    return segment.charAt(0).toUpperCase() + segment.slice(1);
};

const toPascalIdentifier = (raw: string): string =>
    raw
        .split(/[^A-Za-z0-9]+/)
        .filter((part) => part.length > 0)
        .map(capitalizeSegment)
        .join('');

export const suggestEfCoreNamespace = (diagramName: string): string => {
    const trimmed = diagramName.trim();

    if (trimmed.length === 0) {
        return '';
    }

    return trimmed
        .split('.')
        .map(toPascalIdentifier)
        .filter((segment) => segment.length > 0)
        .join('.');
};
