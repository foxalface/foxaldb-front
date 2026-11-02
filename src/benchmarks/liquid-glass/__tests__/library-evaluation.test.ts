/**
 * Documents library evaluation for integration (no package installed in POC).
 */
import { describe, expect, it } from 'vitest';

export const LIQUID_GLASS_LIBRARY_CANDIDATES = [
    {
        name: 'cocolayuan/liquid-glass',
        refraction: 'clone-sync-svg-filter',
        react18: true,
        deps: 'zero (React peer only)',
        notes: 'Cross-browser refraction via aligned DOM clone + filter: url(); MIT.',
    },
    {
        name: 'liquid-glass-web-react',
        refraction: 'svg-displacement-live-dom',
        react18: true,
        deps: 'zero',
        notes: 'Cross-browser SVG displacement; map regen on shape change only.',
    },
    {
        name: 'simple-liquid-glass',
        refraction: 'svg-or-webgl',
        react18: true,
        deps: 'peer react only',
        notes: 'WebGL on Safari/iOS; heavier bundle; broad test matrix.',
    },
    {
        name: 'liquid-glass-react',
        refraction: 'partial-safari-firefox',
        react18: false,
        deps: 'peer react >=19',
        notes: 'High downloads but React 19 peer; Safari displacement limited per README.',
    },
] as const;

describe('library evaluation', () => {
    it('selects liquid-glass-web-react as POC integration candidate', () => {
        const selected = LIQUID_GLASS_LIBRARY_CANDIDATES.find(
            (c) => c.name === 'liquid-glass-web-react'
        );
        expect(selected?.react18).toBe(true);
        expect(selected?.refraction).toBe('svg-displacement-live-dom');
    });
});
