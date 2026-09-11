import React, { useEffect } from 'react';
import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VisualExportError } from '@/lib/visual-export/visual-export-options';
import { downloadBlob } from '@/lib/download-blob';
import type { ExportImageOptions } from '@/context/export-image-context/export-image-context';
import type { VisualExportFormat } from '@/lib/visual-export/visual-export-options';

const toPng = vi.fn();
const toJpeg = vi.fn();
const toSvg = vi.fn();
const getNodesBounds = vi.fn();
const showLoader = vi.fn();
const hideLoader = vi.fn();
const setVisualExportCaptureActive = vi.fn();
const setNodes = vi.fn();
const setEdges = vi.fn();
const getViewport = vi.fn();
const getNodes = vi.fn();
const getEdges = vi.fn();

vi.mock('html-to-image', () => ({
    toPng: (...args: unknown[]) => toPng(...args),
    toJpeg: (...args: unknown[]) => toJpeg(...args),
    toSvg: (...args: unknown[]) => toSvg(...args),
}));

vi.mock('@xyflow/react', () => ({
    useReactFlow: () => ({
        setNodes,
        setEdges,
        getNodes,
        getEdges,
        getViewport,
    }),
    getNodesBounds: (...args: unknown[]) => getNodesBounds(...args),
}));

vi.mock('@/hooks/use-full-screen-spinner', () => ({
    useFullScreenLoader: () => ({
        showLoader,
        hideLoader,
    }),
}));

vi.mock('@/hooks/use-theme', () => ({
    useTheme: () => ({
        effectiveTheme: 'light',
    }),
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        diagramName: 'My Diagram',
    }),
}));

vi.mock('@/hooks/use-canvas', () => ({
    useCanvas: () => ({
        setVisualExportCaptureActive,
    }),
}));

vi.mock('@/lib/download-blob', () => ({
    downloadBlob: vi.fn(),
}));

import { ExportImageProvider } from '../export-image-provider';
import { useExportImage } from '@/hooks/use-export-image';

const defaultOptions: ExportImageOptions = {
    includePatternBG: false,
    transparent: false,
    scale: 2,
    extent: 'viewport',
};

const ExportCaller: React.FC<{
    format: VisualExportFormat;
    options: ExportImageOptions;
    onSettled?: (error?: unknown) => void;
}> = ({ format, options, onSettled }) => {
    const { exportImage } = useExportImage();

    useEffect(() => {
        void exportImage(format, options)
            .then(() => onSettled?.())
            .catch((error: unknown) => onSettled?.(error));
    }, [exportImage, format, onSettled, options]);

    return null;
};

const mountExport = (
    format: VisualExportFormat,
    options: ExportImageOptions = defaultOptions
) =>
    new Promise<unknown>((resolve) => {
        render(
            <ExportImageProvider>
                <ExportCaller
                    format={format}
                    options={options}
                    onSettled={resolve}
                />
            </ExportImageProvider>
        );
    });

describe('ExportImageProvider visual capture', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        document.body.innerHTML = `
            <div class="react-flow" style="width: 800px; height: 600px"></div>
            <div class="react-flow__viewport"></div>
        `;
        const flow = document.querySelector('.react-flow') as HTMLElement;
        vi.spyOn(flow, 'getBoundingClientRect').mockReturnValue({
            width: 800,
            height: 600,
            top: 0,
            left: 0,
            bottom: 600,
            right: 800,
            x: 0,
            y: 0,
            toJSON: () => ({}),
        });

        getViewport.mockReturnValue({ x: 40, y: -12, zoom: 1.5 });
        getNodes.mockReturnValue([
            { id: 'table-1', type: 'table', selected: true, hidden: false },
            { id: 'hidden', type: 'table', selected: false, hidden: true },
            { id: 'temp', type: 'temp-cursor', selected: false },
        ]);
        getEdges.mockReturnValue([
            { id: 'rel-1', selected: true, animated: true },
        ]);
        getNodesBounds.mockReturnValue({
            x: 100,
            y: 50,
            width: 400,
            height: 200,
        });
        toPng.mockResolvedValue('data:image/png;base64,aGVsbG8=');
        toJpeg.mockResolvedValue('data:image/jpeg;base64,aGVsbG8=');
        toSvg.mockResolvedValue('data:image/svg+xml;base64,aGVsbG8=');
        setNodes.mockImplementation((updater: unknown) => {
            if (typeof updater === 'function') {
                updater(getNodes());
            }
        });
        setEdges.mockImplementation((updater: unknown) => {
            if (typeof updater === 'function') {
                updater(getEdges());
            }
        });
    });

    it('captures PNG from the viewport node with the current transform', async () => {
        await mountExport('png');

        expect(toPng).toHaveBeenCalledTimes(1);
        expect(toJpeg).not.toHaveBeenCalled();
        const [node, options] = toPng.mock.calls[0] as [
            HTMLElement,
            { style: { transform: string }; backgroundColor: string },
        ];
        expect(node.className).toBe('react-flow__viewport');
        expect(options.style.transform).toBe(
            'translate(40px, -12px) scale(1.5)'
        );
        expect(options.backgroundColor).toBe('#ffffff');
        expect(downloadBlob).toHaveBeenCalledWith(
            expect.any(Blob),
            'my-diagram.png'
        );
        const blob = vi.mocked(downloadBlob).mock.calls[0][0];
        expect(blob.type).toBe('image/png');
    });

    it('captures JPG with toJpeg and an opaque background', async () => {
        await mountExport('jpg', {
            ...defaultOptions,
            transparent: true,
        });

        expect(toJpeg).toHaveBeenCalledTimes(1);
        const options = toJpeg.mock.calls[0][1] as {
            backgroundColor: string;
        };
        expect(options.backgroundColor).toBe('#ffffff');
        expect(downloadBlob).toHaveBeenCalledWith(
            expect.any(Blob),
            'my-diagram.jpg'
        );
        expect(vi.mocked(downloadBlob).mock.calls[0][0].type).toBe(
            'image/jpeg'
        );
    });

    it('captures SVG with toSvg and a complete-diagram transform', async () => {
        await mountExport('svg', {
            ...defaultOptions,
            extent: 'diagram',
            includePatternBG: false,
        });

        expect(toSvg).toHaveBeenCalledTimes(1);
        const [node, options] = toSvg.mock.calls[0] as [
            HTMLElement,
            { style: { transform: string }; backgroundColor?: string },
        ];
        expect(node.className).toBe('react-flow__viewport');
        expect(options.style.transform).toBe(
            'translate(-68px, -18px) scale(1)'
        );
        expect(options.backgroundColor).toBeUndefined();
        expect(getNodesBounds).toHaveBeenCalledWith([
            { id: 'table-1', type: 'table', selected: true, hidden: false },
        ]);
    });

    it('toggles capture state and restores it in finally', async () => {
        await mountExport('png');

        expect(setVisualExportCaptureActive).toHaveBeenNthCalledWith(1, true);
        expect(setVisualExportCaptureActive).toHaveBeenLastCalledWith(false);
        expect(hideLoader).toHaveBeenCalled();
    });

    it('clears node and edge selection before capture', async () => {
        await mountExport('png');

        const nodeUpdater = setNodes.mock.calls[0][0] as (
            nodes: Array<{ selected?: boolean }>
        ) => Array<{ selected?: boolean }>;
        expect(nodeUpdater([{ selected: true }])).toEqual([
            { selected: false },
        ]);

        const edgeUpdater = setEdges.mock.calls[0][0] as (
            edges: Array<{ selected?: boolean; animated?: boolean }>
        ) => Array<{ selected?: boolean; animated?: boolean }>;
        expect(edgeUpdater([{ selected: true, animated: true }])).toEqual([
            { selected: false, animated: false },
        ]);
    });

    it('rejects unsafe raster dimensions before html-to-image', async () => {
        getNodesBounds.mockReturnValue({
            x: 0,
            y: 0,
            width: 10000,
            height: 10000,
        });

        const error = await mountExport('png', {
            ...defaultOptions,
            extent: 'diagram',
            scale: 4,
        });

        expect(error).toBeInstanceOf(VisualExportError);
        expect((error as VisualExportError).code).toBe('raster_too_large');
        expect(toPng).not.toHaveBeenCalled();
        expect(setVisualExportCaptureActive).toHaveBeenLastCalledWith(false);
    });

    it('does not apply a watermark canvas after raster capture', async () => {
        const toDataURL = vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL');

        await mountExport('png');

        expect(toDataURL).not.toHaveBeenCalled();
        toDataURL.mockRestore();
    });

    it('resolves only after capture cleanup', async () => {
        let hideLoaderCalled = false;
        hideLoader.mockImplementation(() => {
            hideLoaderCalled = true;
        });

        await mountExport('png');

        expect(hideLoaderCalled).toBe(true);
        await waitFor(() => {
            expect(setVisualExportCaptureActive).toHaveBeenLastCalledWith(
                false
            );
        });
    });
});
