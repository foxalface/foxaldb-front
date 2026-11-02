import { describe, expect, it } from 'vitest';
import {
    buildRefractionVisualCompareScenario,
    REFRACTION_COMPARE_HERO_TABLE_ID,
    REFRACTION_THROUGH_TABLE_EDGE_ID,
} from '../scenarios/refraction-visual-scenario';

describe('buildRefractionVisualCompareScenario', () => {
    it('places a through-table edge under the hero table', () => {
        const { nodes, edges } =
            buildRefractionVisualCompareScenario('backdrop-chromium');

        const through = edges.find(
            (e) => e.id === REFRACTION_THROUGH_TABLE_EDGE_ID
        );
        expect(through).toBeDefined();
        expect(through?.zIndex ?? 0).toBe(0);

        const hero = nodes.find(
            (n) => n.id === REFRACTION_COMPARE_HERO_TABLE_ID
        );
        expect(hero).toBeDefined();
        expect((hero?.zIndex ?? 0) > (through?.zIndex ?? 0)).toBe(true);

        expect(nodes.every((n) => n.data.visualEvaluationMode)).toBe(true);
        expect(
            nodes.every((n) => n.data.comparePanel === 'backdrop-chromium')
        ).toBe(true);
    });

    it('marks clone-sync hero on a single table', () => {
        const { nodes } = buildRefractionVisualCompareScenario(
            'clone-sync-one-table'
        );
        const heroes = nodes.filter((n) => n.data.compareCloneSyncHero);
        expect(heroes).toHaveLength(1);
        expect(heroes[0]?.id).toBe(REFRACTION_COMPARE_HERO_TABLE_ID);
    });
});
