import React, { useCallback, useMemo } from 'react';
import type { ExportImageContext } from './export-image-context';
import { exportImageContext } from './export-image-context';
import { toJpeg, toPng, toSvg } from 'html-to-image';
import { getNodesBounds, useReactFlow } from '@xyflow/react';
import { useChartDB } from '@/hooks/use-chartdb';
import { useFullScreenLoader } from '@/hooks/use-full-screen-spinner';
import { useTheme } from '@/hooks/use-theme';
import { useCanvas } from '@/hooks/use-canvas';
import { downloadBlob } from '@/lib/download-blob';
import { buildVisualExportFilename } from '@/lib/visual-export/build-visual-export-filename';
import {
    getCompleteDiagramCaptureLayout,
    getViewportCaptureLayout,
    isVisualExportDiagramNode,
} from '@/lib/visual-export/visual-export-capture-layout';
import {
    VISUAL_EXPORT_DIAGRAM_PADDING_PX,
    VisualExportError,
    dataUrlToBlob,
    getExpectedRasterDimensions,
    getVisualExportBackgroundColor,
    getVisualExportMimeType,
    isUnsafeRasterDimension,
    toHtmlToImageType,
    waitForExportRender,
} from '@/lib/visual-export/visual-export-options';
import type { HtmlToImageType } from '@/lib/visual-export/visual-export-options';

export const ExportImageProvider: React.FC<React.PropsWithChildren> = ({
    children,
}) => {
    const { hideLoader, showLoader } = useFullScreenLoader();
    const { setNodes, setEdges, getNodes, getEdges, getViewport } =
        useReactFlow();
    const { setVisualExportCaptureActive } = useCanvas();
    const { effectiveTheme } = useTheme();
    const { diagramName } = useChartDB();

    const imageCreatorMap: Record<
        HtmlToImageType,
        typeof toJpeg | typeof toPng | typeof toSvg
    > = useMemo(
        () => ({
            jpeg: toJpeg,
            png: toPng,
            svg: toSvg,
        }),
        []
    );

    const exportImage: ExportImageContext['exportImage'] = useCallback(
        async (format, { includePatternBG, transparent, scale, extent }) => {
            showLoader({
                animated: false,
            });
            setVisualExportCaptureActive(true);

            const previousNodeSelection = getNodes().map((node) => ({
                id: node.id,
                selected: Boolean(node.selected),
            }));
            const previousEdgeSelection = getEdges().map((edge) => ({
                id: edge.id,
                selected: Boolean(edge.selected),
                animated: Boolean(edge.animated),
            }));

            let viewportElement: HTMLElement | null = null;
            let tempSvg: SVGSVGElement | null = null;
            const originalEdgeStyles: {
                element: SVGPathElement;
                stroke: string;
                strokeWidth: string;
            }[] = [];
            const originalMarkerStyles: {
                element: SVGElement;
                fill: string;
                stroke: string;
            }[] = [];

            try {
                setNodes((nodes) =>
                    nodes.map((node) => ({ ...node, selected: false }))
                );
                setEdges((edges) =>
                    edges.map((edge) => ({
                        ...edge,
                        selected: false,
                        animated: false,
                    }))
                );

                await waitForExportRender();

                const reactFlowBounds = document
                    .querySelector('.react-flow')
                    ?.getBoundingClientRect();
                viewportElement = window.document.querySelector(
                    '.react-flow__viewport'
                ) as HTMLElement | null;

                if (!reactFlowBounds || !viewportElement) {
                    throw new VisualExportError('canvas_unavailable');
                }

                const viewport = getViewport();
                const captureNodes = getNodes().filter(
                    isVisualExportDiagramNode
                );

                if (extent === 'diagram' && captureNodes.length === 0) {
                    throw new VisualExportError('empty_diagram');
                }

                const layout =
                    extent === 'diagram'
                        ? getCompleteDiagramCaptureLayout(
                              getNodesBounds(captureNodes),
                              VISUAL_EXPORT_DIAGRAM_PADDING_PX
                          )
                        : getViewportCaptureLayout(viewport, {
                              width: reactFlowBounds.width,
                              height: reactFlowBounds.height,
                          });

                if (format !== 'svg') {
                    const raster = getExpectedRasterDimensions(
                        layout.width,
                        layout.height,
                        scale
                    );

                    if (isUnsafeRasterDimension(raster.width, raster.height)) {
                        throw new VisualExportError('raster_too_large');
                    }
                }

                const htmlType = toHtmlToImageType(format);
                const imageCreateFn = imageCreatorMap[htmlType];
                const patternZoom = extent === 'diagram' ? 1 : viewport.zoom;
                const patternX = extent === 'diagram' ? 0 : viewport.x;
                const patternY = extent === 'diagram' ? 0 : viewport.y;

                const markerDefs = document.querySelector(
                    '.marker-definitions defs'
                );

                tempSvg = document.createElementNS(
                    'http://www.w3.org/2000/svg',
                    'svg'
                );
                tempSvg.style.position = 'absolute';
                tempSvg.style.top = '0';
                tempSvg.style.left = '0';
                tempSvg.style.width = '100%';
                tempSvg.style.height = '100%';
                tempSvg.style.overflow = 'visible';
                tempSvg.style.zIndex = '-50';
                tempSvg.setAttribute(
                    'viewBox',
                    `0 0 ${layout.width} ${layout.height}`
                );

                const defs = document.createElementNS(
                    'http://www.w3.org/2000/svg',
                    'defs'
                );

                const markerCircles = document.querySelectorAll(
                    '.marker-definitions marker circle'
                ) as NodeListOf<SVGCircleElement>;
                const markerTexts = document.querySelectorAll(
                    '.marker-definitions marker text'
                ) as NodeListOf<SVGTextElement>;

                markerCircles.forEach((circle) => {
                    const computedStyle = window.getComputedStyle(circle);
                    originalMarkerStyles.push({
                        element: circle,
                        fill: circle.style.fill,
                        stroke: circle.style.stroke,
                    });
                    circle.style.fill = computedStyle.fill;
                    circle.style.stroke = computedStyle.stroke;
                });

                markerTexts.forEach((text) => {
                    const computedStyle = window.getComputedStyle(text);
                    originalMarkerStyles.push({
                        element: text,
                        fill: text.style.fill,
                        stroke: text.style.stroke,
                    });
                    text.style.fill = computedStyle.fill;
                });

                if (markerDefs) {
                    defs.innerHTML = markerDefs.innerHTML;
                }

                originalMarkerStyles.forEach(({ element, fill, stroke }) => {
                    element.style.fill = fill;
                    element.style.stroke = stroke;
                });
                originalMarkerStyles.length = 0;

                if (includePatternBG) {
                    const pattern = document.createElementNS(
                        'http://www.w3.org/2000/svg',
                        'pattern'
                    );
                    pattern.setAttribute('id', 'background-pattern');
                    pattern.setAttribute('width', String(16 * patternZoom));
                    pattern.setAttribute('height', String(16 * patternZoom));
                    pattern.setAttribute('patternUnits', 'userSpaceOnUse');
                    pattern.setAttribute(
                        'patternTransform',
                        `translate(${patternX % (16 * patternZoom)} ${patternY % (16 * patternZoom)})`
                    );

                    const dot = document.createElementNS(
                        'http://www.w3.org/2000/svg',
                        'circle'
                    );
                    const dotSize = patternZoom * 0.5;
                    dot.setAttribute('cx', String(patternZoom));
                    dot.setAttribute('cy', String(patternZoom));
                    dot.setAttribute('r', String(dotSize));
                    const dotColor =
                        effectiveTheme === 'light' ? '#92939C' : '#777777';
                    dot.setAttribute('fill', dotColor);

                    pattern.appendChild(dot);
                    defs.appendChild(pattern);
                }

                tempSvg.appendChild(defs);

                const backgroundRect = document.createElementNS(
                    'http://www.w3.org/2000/svg',
                    'rect'
                );
                const bgPadding = 2000;
                backgroundRect.setAttribute('x', String(-patternX - bgPadding));
                backgroundRect.setAttribute('y', String(-patternY - bgPadding));
                backgroundRect.setAttribute(
                    'width',
                    String(layout.width + 2 * bgPadding)
                );
                backgroundRect.setAttribute(
                    'height',
                    String(layout.height + 2 * bgPadding)
                );
                backgroundRect.setAttribute(
                    'fill',
                    includePatternBG ? 'url(#background-pattern)' : 'none'
                );
                tempSvg.appendChild(backgroundRect);

                viewportElement.insertBefore(
                    tempSvg,
                    viewportElement.firstChild
                );

                const edgePaths = viewportElement.querySelectorAll(
                    '.react-flow__edge-path'
                ) as NodeListOf<SVGPathElement>;

                edgePaths.forEach((path) => {
                    const computedStyle = window.getComputedStyle(path);
                    originalEdgeStyles.push({
                        element: path,
                        stroke: path.style.stroke,
                        strokeWidth: path.style.strokeWidth,
                    });
                    path.style.stroke = computedStyle.stroke;
                    path.style.strokeWidth = computedStyle.strokeWidth;
                });

                const backgroundColor = getVisualExportBackgroundColor(
                    format,
                    effectiveTheme,
                    transparent
                );

                let dataUrl: string;

                try {
                    dataUrl = await imageCreateFn(viewportElement, {
                        ...(backgroundColor !== undefined
                            ? { backgroundColor }
                            : {}),
                        width: layout.width,
                        height: layout.height,
                        style: {
                            width: `${layout.width}px`,
                            height: `${layout.height}px`,
                            transform: layout.transform,
                        },
                        quality: 1,
                        pixelRatio: format === 'svg' ? 1 : scale,
                        skipFonts: true,
                    });
                } catch (error) {
                    console.error('Visual export generation failed', error);
                    throw new VisualExportError('generation_failed');
                }

                try {
                    const mimeType = getVisualExportMimeType(format);
                    const blob = dataUrlToBlob(dataUrl, mimeType);
                    downloadBlob(
                        blob,
                        buildVisualExportFilename(
                            diagramName ?? 'diagram',
                            format
                        )
                    );
                } catch (error) {
                    if (error instanceof VisualExportError) {
                        throw error;
                    }

                    console.error('Visual export download failed', error);
                    throw new VisualExportError('download_failed');
                }
            } finally {
                originalEdgeStyles.forEach(
                    ({ element, stroke, strokeWidth }) => {
                        element.style.stroke = stroke;
                        element.style.strokeWidth = strokeWidth;
                    }
                );
                originalMarkerStyles.forEach(({ element, fill, stroke }) => {
                    element.style.fill = fill;
                    element.style.stroke = stroke;
                });

                if (tempSvg && viewportElement?.contains(tempSvg)) {
                    viewportElement.removeChild(tempSvg);
                }

                setNodes((nodes) =>
                    nodes.map((node) => ({
                        ...node,
                        selected:
                            previousNodeSelection.find(
                                (item) => item.id === node.id
                            )?.selected ?? false,
                    }))
                );
                setEdges((edges) =>
                    edges.map((edge) => {
                        const previous = previousEdgeSelection.find(
                            (item) => item.id === edge.id
                        );

                        return {
                            ...edge,
                            selected: previous?.selected ?? false,
                            animated: previous?.animated ?? false,
                        };
                    })
                );
                setVisualExportCaptureActive(false);
                hideLoader();
            }
        },
        [
            diagramName,
            effectiveTheme,
            getEdges,
            getNodes,
            getViewport,
            hideLoader,
            imageCreatorMap,
            setEdges,
            setNodes,
            setVisualExportCaptureActive,
            showLoader,
        ]
    );

    return (
        <exportImageContext.Provider value={{ exportImage }}>
            {children}
        </exportImageContext.Provider>
    );
};
