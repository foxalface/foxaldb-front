import { describe, expect, it } from 'vitest';
import {
    dataUrlToBlob,
    getDefaultIncludePattern,
    getExpectedRasterDimensions,
    getVisualExportBackgroundColor,
    getVisualExportMimeType,
    isUnsafeRasterDimension,
    toHtmlToImageType,
    VISUAL_EXPORT_RASTER_CANVAS_LIMIT,
} from '../visual-export-options';

describe('visual export option helpers', () => {
    it('maps jpg to html-to-image jpeg', () => {
        expect(toHtmlToImageType('png')).toBe('png');
        expect(toHtmlToImageType('jpg')).toBe('jpeg');
        expect(toHtmlToImageType('svg')).toBe('svg');
    });

    it('returns the download MIME type for each format', () => {
        expect(getVisualExportMimeType('png')).toBe('image/png');
        expect(getVisualExportMimeType('jpg')).toBe('image/jpeg');
        expect(getVisualExportMimeType('svg')).toBe('image/svg+xml');
    });

    it('uses theme-opaque backgrounds for JPG and non-transparent PNG', () => {
        expect(getVisualExportBackgroundColor('jpg', 'light', true)).toBe(
            '#ffffff'
        );
        expect(getVisualExportBackgroundColor('jpg', 'dark', false)).toBe(
            '#141414'
        );
        expect(getVisualExportBackgroundColor('png', 'light', false)).toBe(
            '#ffffff'
        );
        expect(getVisualExportBackgroundColor('png', 'dark', false)).toBe(
            '#141414'
        );
    });

    it('allows transparent PNG and skips SVG background color', () => {
        expect(getVisualExportBackgroundColor('png', 'light', true)).toBe(
            'transparent'
        );
        expect(getVisualExportBackgroundColor('svg', 'dark', false)).toBe(
            undefined
        );
    });

    it('defaults pattern on for raster and off for SVG', () => {
        expect(getDefaultIncludePattern('png')).toBe(true);
        expect(getDefaultIncludePattern('jpg')).toBe(true);
        expect(getDefaultIncludePattern('svg')).toBe(false);
    });

    it('rejects raster dimensions above the html-to-image canvas limit', () => {
        expect(getExpectedRasterDimensions(1000, 500, 2)).toEqual({
            width: 2000,
            height: 1000,
        });
        expect(isUnsafeRasterDimension(1000, 500)).toBe(false);
        expect(
            isUnsafeRasterDimension(VISUAL_EXPORT_RASTER_CANVAS_LIMIT + 1, 100)
        ).toBe(true);
        expect(
            isUnsafeRasterDimension(100, VISUAL_EXPORT_RASTER_CANVAS_LIMIT + 1)
        ).toBe(true);
    });

    it('converts a data URL into a Blob with the requested MIME type', async () => {
        const blob = dataUrlToBlob(
            'data:image/png;base64,aGVsbG8=',
            'image/png'
        );

        expect(blob.type).toBe('image/png');
        await expect(blob.text()).resolves.toBe('hello');
    });
});
