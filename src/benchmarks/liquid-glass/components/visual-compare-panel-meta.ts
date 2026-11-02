import type { VisualComparePanelId, VisualComparePanelMeta } from '../types';

export const VISUAL_COMPARE_PANEL_META: Record<
    VisualComparePanelId,
    VisualComparePanelMeta
> = {
    'glass-css': {
        id: 'glass-css',
        title: 'glass-css',
        subtitle: 'Transparence + backdrop blur (référence frosted)',
    },
    'liquid-svg': {
        id: 'liquid-svg',
        title: 'liquid-svg',
        subtitle: 'Non réfractif — tint uniquement',
    },
    'backdrop-chromium': {
        id: 'backdrop-chromium',
        title: 'backdrop-chromium',
        subtitle: 'Réfraction backdrop via backdrop-filter + SVG (Chromium)',
    },
    'clone-sync-one-table': {
        id: 'clone-sync-one-table',
        title: 'clone-sync-one-table',
        subtitle:
            'Clone DOM synchronisé (1 table hero, inspiré cocolayuan/liquid-glass)',
    },
};
