export const VISUAL_EXPORT_TRANSIENT_NODE_TYPES = new Set([
    'temp-cursor',
    'create-relationship',
]);

export interface VisualExportNodeLike {
    hidden?: boolean;
    type?: string;
}

export interface VisualExportBounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface VisualExportCaptureLayout {
    width: number;
    height: number;
    transform: string;
}

export const isVisualExportDiagramNode = (
    node: VisualExportNodeLike
): boolean =>
    !node.hidden && !VISUAL_EXPORT_TRANSIENT_NODE_TYPES.has(node.type ?? '');

export const getCompleteDiagramCaptureLayout = (
    bounds: VisualExportBounds,
    paddingPx: number
): VisualExportCaptureLayout => {
    const width = Math.max(1, Math.ceil(bounds.width + paddingPx * 2));
    const height = Math.max(1, Math.ceil(bounds.height + paddingPx * 2));

    return {
        width,
        height,
        transform: `translate(${-bounds.x + paddingPx}px, ${-bounds.y + paddingPx}px) scale(1)`,
    };
};

export const getViewportCaptureLayout = (
    viewport: { x: number; y: number; zoom: number },
    container: { width: number; height: number }
): VisualExportCaptureLayout => ({
    width: container.width,
    height: container.height,
    transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
});
