import { renderHook, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
    isConversationTargetPending,
    releaseConversationTargetPending,
    resetConversationTargetPendingStoreForTests,
    tryAcquireConversationTargetPending,
} from '@/lib/conversations/conversation-target-pending';
import { useConversationTargetPending } from '@/hooks/use-conversation-target-pending';

describe('conversation target pending store', () => {
    beforeEach(() => {
        resetConversationTargetPendingStoreForTests();
    });

    afterEach(() => {
        resetConversationTargetPendingStoreForTests();
    });

    it('acquires and releases a pending key atomically', () => {
        const key = 'diagram-a:table:table-1';

        expect(tryAcquireConversationTargetPending(key)).toBe(true);
        expect(isConversationTargetPending(key)).toBe(true);
        expect(tryAcquireConversationTargetPending(key)).toBe(false);

        releaseConversationTargetPending(key);

        expect(isConversationTargetPending(key)).toBe(false);
        expect(tryAcquireConversationTargetPending(key)).toBe(true);
    });

    it('shares pending state across hook instances for the same key', () => {
        const key = 'diagram-a:table:table-1';

        const first = renderHook(() => useConversationTargetPending(key));
        const second = renderHook(() => useConversationTargetPending(key));

        expect(first.result.current).toBe(false);
        expect(second.result.current).toBe(false);

        act(() => {
            tryAcquireConversationTargetPending(key);
        });

        expect(first.result.current).toBe(true);
        expect(second.result.current).toBe(true);

        act(() => {
            releaseConversationTargetPending(key);
        });

        expect(first.result.current).toBe(false);
        expect(second.result.current).toBe(false);
    });

    it('keeps different targets independent', () => {
        const firstKey = 'diagram-a:table:table-1';
        const secondKey = 'diagram-a:table:table-2';

        expect(tryAcquireConversationTargetPending(firstKey)).toBe(true);

        expect(isConversationTargetPending(firstKey)).toBe(true);
        expect(isConversationTargetPending(secondKey)).toBe(false);
        expect(tryAcquireConversationTargetPending(secondKey)).toBe(true);
    });

    it('does not collide for the same target ID across diagrams', () => {
        const diagramAKey = 'diagram-a:table:table-1';
        const diagramBKey = 'diagram-b:table:table-1';

        expect(tryAcquireConversationTargetPending(diagramAKey)).toBe(true);
        expect(tryAcquireConversationTargetPending(diagramBKey)).toBe(true);

        releaseConversationTargetPending(diagramAKey);
        releaseConversationTargetPending(diagramBKey);
    });

    it('resets store state between tests via the test-only reset helper', () => {
        const key = 'diagram-a:diagram';

        tryAcquireConversationTargetPending(key);
        expect(isConversationTargetPending(key)).toBe(true);

        resetConversationTargetPendingStoreForTests();
        expect(isConversationTargetPending(key)).toBe(false);
    });
});
