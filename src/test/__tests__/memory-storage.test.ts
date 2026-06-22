import { describe, expect, it } from 'vitest';
import { createMemoryStorage } from '../memory-storage';

describe('createMemoryStorage', () => {
    it('implements the Storage interface', () => {
        const storage = createMemoryStorage();

        expect(storage.length).toBe(0);
        expect(storage.getItem('missing')).toBeNull();

        storage.setItem('a', '1');
        storage.setItem('b', '2');

        expect(storage.length).toBe(2);
        expect(storage.getItem('a')).toBe('1');
        expect(storage.key(0)).toBe('a');
        expect(storage.key(1)).toBe('b');

        storage.removeItem('a');

        expect(storage.length).toBe(1);
        expect(storage.getItem('a')).toBeNull();

        storage.clear();

        expect(storage.length).toBe(0);
    });
});

describe('vitest global storage setup', () => {
    it('seeds localStorage uuid for deterministic diagram ids', () => {
        expect(localStorage.getItem('uuid')).toBe('test-workspace');
    });
});
