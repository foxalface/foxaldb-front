/**
 * Test-only in-memory Storage for Vitest.
 *
 * Node 22+ may expose a global `localStorage` object without working
 * getItem/setItem methods. happy-dom may not reliably override that global.
 * Import and round-trip tests call getWorkspaceId() / generateDiagramId(), which
 * need a real Storage API — use this helper from src/test/setup.ts instead of
 * per-file stubs.
 */
export function createMemoryStorage(): Storage {
    const store = new Map<string, string>();

    return {
        get length() {
            return store.size;
        },
        clear() {
            store.clear();
        },
        getItem(key: string) {
            return store.has(key) ? store.get(key)! : null;
        },
        key(index: number) {
            const keys = [...store.keys()];

            return keys[index] ?? null;
        },
        removeItem(key: string) {
            store.delete(key);
        },
        setItem(key: string, value: string) {
            store.set(key, String(value));
        },
    };
}
