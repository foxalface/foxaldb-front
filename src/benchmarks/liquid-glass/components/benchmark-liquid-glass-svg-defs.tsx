import React from 'react';

/** Shared SVG displacement filter (POC — no external liquid-glass dependency).
 *  Applied only to the semi-transparent glass layer, NOT to backdrop pixels.
 *  feDisplacementMap displaces SourceGraphic of that layer; it does not sample
 *  the React Flow canvas or edges behind the node. */
export const LIQUID_GLASS_FILTER_ID = 'foxaldb-liquid-glass-benchmark-filter';

export const BenchmarkLiquidGlassSvgDefs: React.FC = () => (
    <svg
        aria-hidden
        className="pointer-events-none absolute size-0 overflow-hidden"
        xmlns="http://www.w3.org/2000/svg"
    >
        <defs>
            <filter
                id={LIQUID_GLASS_FILTER_ID}
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
                colorInterpolationFilters="sRGB"
            >
                <feGaussianBlur
                    in="SourceGraphic"
                    stdDeviation="0.6"
                    result="blur"
                />
                <feColorMatrix
                    in="blur"
                    type="matrix"
                    values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
                    result="edge"
                />
                <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.012"
                    numOctaves="2"
                    seed="3"
                    result="noise"
                />
                <feDisplacementMap
                    in="edge"
                    in2="noise"
                    scale="10"
                    xChannelSelector="R"
                    yChannelSelector="G"
                    result="displaced"
                />
                <feBlend in="displaced" in2="SourceGraphic" mode="normal" />
            </filter>
        </defs>
    </svg>
);
