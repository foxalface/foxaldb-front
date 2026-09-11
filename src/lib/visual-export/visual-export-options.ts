export type VisualExportFormat = 'png' | 'jpg' | 'svg';
export type VisualExportExtent = 'diagram' | 'viewport';
export type HtmlToImageType = 'png' | 'jpeg' | 'svg';
export type VisualExportErrorCode =
    | 'canvas_unavailable'
    | 'generation_failed'
    | 'raster_too_large'
    | 'download_failed'
    | 'empty_diagram';

export const VISUAL_EXPORT_RASTER_CANVAS_LIMIT = 16384;
export const VISUAL_EXPORT_DIAGRAM_PADDING_PX = 32;
export const DEFAULT_VISUAL_EXPORT_SCALE = 2;
export const DEFAULT_VISUAL_EXPORT_EXTENT: VisualExportExtent = 'diagram';

export class VisualExportError extends Error {
    readonly code: VisualExportErrorCode;

    constructor(code: VisualExportErrorCode, message?: string) {
        super(message ?? code);
        this.name = 'VisualExportError';
        this.code = code;
    }
}

export const toHtmlToImageType = (
    format: VisualExportFormat
): HtmlToImageType => (format === 'jpg' ? 'jpeg' : format);

export const getVisualExportMimeType = (format: VisualExportFormat): string => {
    switch (format) {
        case 'png':
            return 'image/png';
        case 'jpg':
            return 'image/jpeg';
        case 'svg':
            return 'image/svg+xml';
    }
};

export const getVisualExportBackgroundColor = (
    format: VisualExportFormat,
    theme: 'light' | 'dark',
    transparent: boolean
): string | undefined => {
    if (format === 'svg') {
        return undefined;
    }

    if (format === 'png' && transparent) {
        return 'transparent';
    }

    return theme === 'light' ? '#ffffff' : '#141414';
};

export const getDefaultIncludePattern = (format: VisualExportFormat): boolean =>
    format !== 'svg';

export const getExpectedRasterDimensions = (
    width: number,
    height: number,
    scale: number
): { width: number; height: number } => ({
    width: width * scale,
    height: height * scale,
});

export const isUnsafeRasterDimension = (
    width: number,
    height: number
): boolean =>
    width > VISUAL_EXPORT_RASTER_CANVAS_LIMIT ||
    height > VISUAL_EXPORT_RASTER_CANVAS_LIMIT;

export const dataUrlToBlob = (dataUrl: string, mimeType: string): Blob => {
    const commaIndex = dataUrl.indexOf(',');

    if (commaIndex === -1) {
        throw new VisualExportError('download_failed');
    }

    const header = dataUrl.slice(0, commaIndex);
    const data = dataUrl.slice(commaIndex + 1);
    const isBase64 = /;base64/i.test(header);
    const binary = isBase64 ? atob(data) : decodeURIComponent(data);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
    }

    return new Blob([bytes], { type: mimeType });
};

export const waitForAnimationFrames = async (count = 2): Promise<void> => {
    for (let i = 0; i < count; i += 1) {
        await new Promise<void>((resolve) => {
            requestAnimationFrame(() => {
                resolve();
            });
        });
    }
};

export const waitForExportRender = async (): Promise<void> => {
    await new Promise<void>((resolve) => {
        setTimeout(resolve, 0);
    });
    await waitForAnimationFrames(2);
};
