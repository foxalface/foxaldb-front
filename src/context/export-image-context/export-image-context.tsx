import { createContext } from 'react';
import { emptyFn } from '@/lib/utils';
import type {
    VisualExportExtent,
    VisualExportFormat,
} from '@/lib/visual-export/visual-export-options';

export type ImageType = VisualExportFormat;

export interface ExportImageOptions {
    includePatternBG: boolean;
    transparent: boolean;
    scale: number;
    extent: VisualExportExtent;
}

export interface ExportImageContext {
    exportImage: (
        format: VisualExportFormat,
        options: ExportImageOptions
    ) => Promise<void>;
}

export const exportImageContext = createContext<ExportImageContext>({
    exportImage: emptyFn,
});
