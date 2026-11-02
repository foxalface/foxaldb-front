import { describe, expect, it } from 'vitest';
import { buildVisualDemoScenario } from '../scenarios/visual-demo-scenario';

describe('buildVisualDemoScenario', () => {
    it('builds overlapping demo nodes with edges under nodes', () => {
        const { nodes, edges } = buildVisualDemoScenario('liquid-svg');
        expect(nodes).toHaveLength(4);
        expect(edges.length).toBeGreaterThanOrEqual(4);
        expect(nodes.every((n) => n.data.visualEvaluationMode)).toBe(true);
        expect(nodes.every((n) => n.data.renderMode === 'liquid-svg')).toBe(
            true
        );
        const zIndexes = nodes.map((n) => n.zIndex ?? 0);
        expect(Math.max(...zIndexes)).toBeGreaterThan(0);
        expect(edges.every((e) => (e.zIndex ?? 0) === 0)).toBe(true);
    });
});
