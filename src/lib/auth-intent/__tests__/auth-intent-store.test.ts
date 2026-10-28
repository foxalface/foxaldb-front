import { describe, expect, it } from 'vitest';
import { createAuthIntentStore, noneAuthIntent } from '@/lib/auth-intent';

describe('auth intent store', () => {
    it('defaults to none', () => {
        const store = createAuthIntentStore();
        expect(store.peek()).toEqual({ type: 'none' });
    });

    it('sets and reads pending intent', () => {
        const store = createAuthIntentStore();
        store.set({ type: 'open-online-tab' });
        expect(store.peek()).toEqual({ type: 'open-online-tab' });
    });

    it('consumes once then returns none', () => {
        const store = createAuthIntentStore();
        store.set({
            type: 'open-online-diagram',
            diagramId: '42',
        });

        expect(store.consume()).toEqual({
            type: 'open-online-diagram',
            diagramId: '42',
        });
        expect(store.consume()).toEqual({ type: 'none' });
        expect(store.peek()).toEqual({ type: 'none' });
    });

    it('clears pending intent', () => {
        const store = createAuthIntentStore();
        store.set({ type: 'open-online-tab' });
        store.clear();
        expect(store.peek()).toEqual({ type: 'none' });
    });

    it('preserves put-online localId and mode until consume', () => {
        const store = createAuthIntentStore();
        store.set({
            type: 'put-online',
            localId: 'local-abc',
            mode: 'move',
        });

        expect(store.peek()).toEqual({
            type: 'put-online',
            localId: 'local-abc',
            mode: 'move',
        });
        expect(store.consume().type).toBe('put-online');
    });

    it('preserves protected-action discriminator', () => {
        const store = createAuthIntentStore();
        store.set({
            type: 'protected-action',
            action: 'merge',
        });

        expect(store.consume()).toEqual({
            type: 'protected-action',
            action: 'merge',
        });
    });

    it('second consume after clear is none', () => {
        const store = createAuthIntentStore();
        store.set({ type: 'open-online-tab' });
        store.clear();
        expect(store.consume()).toEqual(noneAuthIntent());
    });
});
