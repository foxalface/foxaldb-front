const slugifyDiagramName = (diagramName: string): string => {
    const slug = diagramName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    return slug || 'diagram';
};

export const buildDbmlExportFilename = (diagramName: string): string =>
    `${slugifyDiagramName(diagramName)}.dbml`;
