import React, { useMemo } from 'react';
import { buildLensDisplacementMapDataUrl } from '../lib/lens-displacement-map';

/** Shared backdrop displacement filter for Chromium visual compare (not GPU batching). */
export const BACKDROP_LIQUID_COMPARE_FILTER_ID =
    'foxaldb-backdrop-liquid-compare-filter';

const LENS_W = 224;
const LENS_H = 280;
const PAD = 24;
const RADIUS = 12;

export const BenchmarkBackdropLiquidSvgDefs: React.FC = () => {
    const mapUrl = useMemo(() => {
        if (typeof document === 'undefined') {
            return '';
        }
        return buildLensDisplacementMapDataUrl({
            mapWidth: LENS_W + PAD * 2,
            mapHeight: LENS_H + PAD * 2,
            lensWidth: LENS_W,
            lensHeight: LENS_H,
            radius: RADIUS,
            rim: 18,
            curve: 2.4,
            feather: 14,
            bias: 0.55,
            biasAngle: 45,
            boost: 0.9,
        });
    }, []);

    if (!mapUrl) {
        return null;
    }

    return (
        <svg
            aria-hidden
            className="pointer-events-none absolute size-0 overflow-hidden"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <filter
                    id={BACKDROP_LIQUID_COMPARE_FILTER_ID}
                    x="-25%"
                    y="-25%"
                    width="150%"
                    height="150%"
                    colorInterpolationFilters="sRGB"
                >
                    <feImage
                        href={mapUrl}
                        result="displacementMap"
                        preserveAspectRatio="none"
                    />
                    <feGaussianBlur
                        in="SourceGraphic"
                        stdDeviation="0.35"
                        result="blurredBackdrop"
                    />
                    <feDisplacementMap
                        in="blurredBackdrop"
                        in2="displacementMap"
                        scale="28"
                        xChannelSelector="R"
                        yChannelSelector="G"
                        result="refracted"
                    />
                    <feColorMatrix
                        in="refracted"
                        type="saturate"
                        values="1.35"
                    />
                </filter>
            </defs>
        </svg>
    );
};
