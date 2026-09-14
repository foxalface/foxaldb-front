import { describe, expect, it } from 'vitest';
import { suggestEfCoreNamespace } from '../suggest-ef-core-namespace';

describe('suggestEfCoreNamespace', () => {
    it('derives a PascalCase suggestion from the diagram name', () => {
        expect(suggestEfCoreNamespace('My Diagram')).toBe('MyDiagram');
        expect(suggestEfCoreNamespace('shop database')).toBe('ShopDatabase');
    });

    it('preserves dot-separated segments', () => {
        expect(suggestEfCoreNamespace('Acme.Catalog')).toBe('Acme.Catalog');
    });

    it('returns an empty string when the diagram name is blank', () => {
        expect(suggestEfCoreNamespace('')).toBe('');
        expect(suggestEfCoreNamespace('   ')).toBe('');
    });
});
