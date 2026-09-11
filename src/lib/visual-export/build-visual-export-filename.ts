import type { VisualExportFormat } from './visual-export-options';

const slugifyDiagramName = (diagramName: string): string => {
    const slug = diagramName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    return slug || 'diagram';
};

export const buildVisualExportFilename = (
    diagramName: string,
    format: VisualExportFormat
): string => `${slugifyDiagramName(diagramName)}.${format}`;
