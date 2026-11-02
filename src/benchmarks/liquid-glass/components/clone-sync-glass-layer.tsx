import React, {
    useId,
    useLayoutEffect,
    useRef,
    type CSSProperties,
    type ReactNode,
    type RefObject,
} from 'react';
import { buildLensDisplacementMapDataUrl } from '../lib/lens-displacement-map';

/**
 * Clone-sync glass layer (minimal port inspired by cocolayuan/liquid-glass, MIT).
 * Refracts an aligned clone of `sceneRef`, not the live React Flow backdrop API.
 */

const PAD = 24;
const SS = 1;

export interface CloneSyncGlassLayerProps {
    sceneRef: RefObject<HTMLElement | null>;
    lensRef: RefObject<HTMLElement | null>;
    width: number;
    height: number;
    radius?: number;
    depth?: number;
    repaintKey?: number | string;
    children: ReactNode;
    className?: string;
}

export const CloneSyncGlassLayer: React.FC<CloneSyncGlassLayerProps> = ({
    sceneRef,
    lensRef,
    width,
    height,
    radius = 12,
    depth = 48,
    repaintKey = 0,
    children,
    className,
}) => {
    const rawId = useId();
    const versionRef = useRef(0);
    const refractionRef = useRef<HTMLDivElement>(null);
    const cloneWrapRef = useRef<HTMLDivElement>(null);
    const housingRef = useRef<HTMLDivElement>(null);
    const lastCloneHtml = useRef('');
    const rafRef = useRef<number | null>(null);

    const mapWidth = (width + PAD * 2) * SS;
    const mapHeight = (height + PAD * 2) * SS;

    useLayoutEffect(() => {
        const applyFilter = (mapUrl: string) => {
            const housing = housingRef.current;
            const refraction = refractionRef.current;
            if (!housing || !refraction || !mapUrl) {
                return;
            }
            const filterId = `${rawId.replace(/[:]/g, '')}-v${++versionRef.current}`;
            const scale = depth * SS;
            housing.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="0" height="0"><defs><filter id="${filterId}" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB"><feImage href="${mapUrl}" result="dispMap" preserveAspectRatio="none"/><feDisplacementMap in="SourceGraphic" in2="dispMap" scale="${scale}" xChannelSelector="R" yChannelSelector="G"/></filter></defs></svg>`;
            refraction.style.filter = `url(#${filterId})`;
        };

        const repaint = () => {
            const scene = sceneRef.current;
            const lens = lensRef.current;
            const cloneWrap = cloneWrapRef.current;
            const refraction = refractionRef.current;
            if (!scene || !lens || !cloneWrap || !refraction) {
                return;
            }

            const sceneRect = scene.getBoundingClientRect();
            const lensRect = lens.getBoundingClientRect();
            const lensLeftInScene = lensRect.left - sceneRect.left;
            const lensTopInScene = lensRect.top - sceneRect.top;

            const sceneClone = scene.cloneNode(true) as HTMLElement;
            sceneClone
                .querySelectorAll('[data-clone-sync-lens]')
                .forEach((node) => {
                    node.remove();
                });
            const html = sceneClone.innerHTML;
            if (lastCloneHtml.current !== html) {
                cloneWrap.innerHTML = html;
                lastCloneHtml.current = html;
            }

            cloneWrap.style.width = `${sceneRect.width}px`;
            cloneWrap.style.height = `${sceneRect.height}px`;
            cloneWrap.style.left = `${-(lensLeftInScene - PAD)}px`;
            cloneWrap.style.top = `${-(lensTopInScene - PAD)}px`;

            const mapUrl = buildLensDisplacementMapDataUrl({
                mapWidth,
                mapHeight,
                lensWidth: width * SS,
                lensHeight: height * SS,
                radius: radius * SS,
                rim: 14,
                curve: 2.6,
                feather: 12,
                bias: 0.65,
                biasAngle: 45,
            });
            applyFilter(mapUrl);
        };

        const scheduleRepaint = () => {
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
            }
            rafRef.current = requestAnimationFrame(() => {
                rafRef.current = null;
                repaint();
            });
        };

        scheduleRepaint();

        const onResize = () => scheduleRepaint();
        window.addEventListener('resize', onResize);
        const observer = new ResizeObserver(onResize);
        const sceneElement = sceneRef.current;
        const lensElement = lensRef.current;
        if (sceneElement) {
            observer.observe(sceneElement);
        }
        if (lensElement) {
            observer.observe(lensElement);
        }
        const housingElement = housingRef.current;

        return () => {
            window.removeEventListener('resize', onResize);
            observer.disconnect();
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
            if (housingElement) {
                housingElement.innerHTML = '';
            }
        };
    }, [
        depth,
        height,
        lensRef,
        mapHeight,
        mapWidth,
        radius,
        rawId,
        repaintKey,
        sceneRef,
        width,
    ]);

    const clipStyle: CSSProperties = {
        width,
        height,
        borderRadius: radius,
        overflow: 'hidden',
        isolation: 'isolate',
    };

    return (
        <div
            className={className}
            data-clone-sync-lens="true"
            style={clipStyle}
        >
            <div className="relative size-full" style={clipStyle}>
                <div
                    ref={refractionRef}
                    className="pointer-events-none absolute inset-0 overflow-hidden"
                    style={clipStyle}
                >
                    <div
                        ref={cloneWrapRef}
                        className="pointer-events-none absolute left-0 top-0 origin-top-left"
                        aria-hidden
                    />
                </div>
                <div
                    className="pointer-events-none absolute inset-0 bg-white/[0.06] backdrop-blur-[2px]"
                    aria-hidden
                />
                <div className="relative z-10">{children}</div>
            </div>
            <div ref={housingRef} className="hidden" aria-hidden />
        </div>
    );
};
