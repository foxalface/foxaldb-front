import { describe, expect, it, vi } from 'vitest';
import {
    adoptCommentSubscription,
    clearActiveCommentSubscription,
    type ActiveCommentSubscription,
} from '../comment-subscription-owner';

describe('comment-subscription-owner', () => {
    it('first adoption becomes active and matching release cleans once', () => {
        const activeRef: { current: ActiveCommentSubscription | null } = {
            current: null,
        };
        const cleanup = vi.fn();

        const release = adoptCommentSubscription(activeRef, cleanup);

        expect(activeRef.current).not.toBeNull();
        expect(activeRef.current?.cleanup).toBe(cleanup);

        release();

        expect(cleanup).toHaveBeenCalledTimes(1);
        expect(activeRef.current).toBeNull();

        release();
        expect(cleanup).toHaveBeenCalledTimes(1);
    });

    it('stale release cannot clear a newer adoption', () => {
        const activeRef: { current: ActiveCommentSubscription | null } = {
            current: null,
        };
        const cleanupA = vi.fn();
        const cleanupB = vi.fn();

        const releaseA = adoptCommentSubscription(activeRef, cleanupA);
        clearActiveCommentSubscription(activeRef);
        expect(cleanupA).toHaveBeenCalledTimes(1);

        adoptCommentSubscription(activeRef, cleanupB);
        expect(activeRef.current?.cleanup).toBe(cleanupB);

        releaseA();

        expect(cleanupB).not.toHaveBeenCalled();
        expect(activeRef.current?.cleanup).toBe(cleanupB);
    });

    it('explicit clear removes the current adoption', () => {
        const activeRef: { current: ActiveCommentSubscription | null } = {
            current: null,
        };
        const cleanup = vi.fn();

        adoptCommentSubscription(activeRef, cleanup);
        clearActiveCommentSubscription(activeRef);

        expect(cleanup).toHaveBeenCalledTimes(1);
        expect(activeRef.current).toBeNull();

        clearActiveCommentSubscription(activeRef);
        expect(cleanup).toHaveBeenCalledTimes(1);
    });

    it('clears the ref before an external cleanup throws so later adoption works', () => {
        const activeRef: { current: ActiveCommentSubscription | null } = {
            current: null,
        };
        const throwingCleanup = vi.fn(() => {
            throw new Error('stopListening failed');
        });
        const nextCleanup = vi.fn();

        adoptCommentSubscription(activeRef, throwingCleanup);

        expect(() => {
            clearActiveCommentSubscription(activeRef);
        }).toThrow('stopListening failed');

        expect(activeRef.current).toBeNull();
        expect(throwingCleanup).toHaveBeenCalledTimes(1);

        const releaseNext = adoptCommentSubscription(activeRef, nextCleanup);
        expect(activeRef.current?.cleanup).toBe(nextCleanup);

        releaseNext();
        expect(nextCleanup).toHaveBeenCalledTimes(1);
        expect(activeRef.current).toBeNull();
    });
});
