import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
    claimEditingConflictExplanation,
    completeEditingConflictExplanationEpisode,
    releaseEditingConflictExplanation,
    resetEditingConflictExplanationForTests,
} from '../editing-conflict-explanation';

const createClaimant = () =>
    Symbol('editing-conflict-explanation-claimant-test');

describe('editing-conflict-explanation', () => {
    beforeEach(() => {
        resetEditingConflictExplanationForTests();
    });

    afterEach(() => {
        resetEditingConflictExplanationForTests();
    });

    it('returns a token for the first claimant', () => {
        const claimant = createClaimant();
        const claim = claimEditingConflictExplanation(claimant);

        expect(claim).not.toBeNull();
        expect(typeof claim).toBe('symbol');
    });

    it('allows the same claimant to reclaim after release while the episode is incomplete', () => {
        const claimant = createClaimant();
        const first = claimEditingConflictExplanation(claimant);
        expect(first).not.toBeNull();

        releaseEditingConflictExplanation(first!);

        const reclaimed = claimEditingConflictExplanation(claimant);
        expect(reclaimed).not.toBeNull();
        expect(reclaimed).not.toBe(first);
    });

    it('rejects another claimant during the incomplete episode', () => {
        const owner = createClaimant();
        const other = createClaimant();

        expect(claimEditingConflictExplanation(owner)).not.toBeNull();
        expect(claimEditingConflictExplanation(other)).toBeNull();
    });

    it('releases safely with the owner token', () => {
        const claimant = createClaimant();
        const claim = claimEditingConflictExplanation(claimant);
        expect(claim).not.toBeNull();

        releaseEditingConflictExplanation(claim!);

        // Episode still incomplete — owner may reclaim.
        expect(claimEditingConflictExplanation(claimant)).not.toBeNull();
    });

    it('ignores stale or unknown token releases', () => {
        const claimant = createClaimant();
        const ownerClaim = claimEditingConflictExplanation(claimant);
        expect(ownerClaim).not.toBeNull();

        releaseEditingConflictExplanation(
            Symbol('stale-editing-conflict-explanation')
        );

        // Active claim still held — owner cannot take a second concurrent claim.
        expect(claimEditingConflictExplanation(claimant)).toBeNull();

        releaseEditingConflictExplanation(ownerClaim!);
        expect(claimEditingConflictExplanation(claimant)).not.toBeNull();
    });

    it('prevents the same claimant from reclaiming after the episode is completed', () => {
        const claimant = createClaimant();
        const claim = claimEditingConflictExplanation(claimant);
        releaseEditingConflictExplanation(claim!);
        completeEditingConflictExplanationEpisode(claimant);

        expect(claimEditingConflictExplanation(claimant)).toBeNull();
    });

    it('prevents every later claimant after the episode is completed', () => {
        const owner = createClaimant();
        const later = createClaimant();
        const claim = claimEditingConflictExplanation(owner);
        releaseEditingConflictExplanation(claim!);
        completeEditingConflictExplanationEpisode(owner);

        expect(claimEditingConflictExplanation(later)).toBeNull();
    });

    it('ignores completion attempts from another claimant', () => {
        const owner = createClaimant();
        const other = createClaimant();
        const claim = claimEditingConflictExplanation(owner);

        completeEditingConflictExplanationEpisode(other);

        // Owner episode is still incomplete and active.
        expect(claimEditingConflictExplanation(other)).toBeNull();
        releaseEditingConflictExplanation(claim!);
        expect(claimEditingConflictExplanation(owner)).not.toBeNull();
    });

    it('restores a fresh session via reset', () => {
        const first = createClaimant();
        const claim = claimEditingConflictExplanation(first);
        releaseEditingConflictExplanation(claim!);
        completeEditingConflictExplanationEpisode(first);
        expect(claimEditingConflictExplanation(first)).toBeNull();

        resetEditingConflictExplanationForTests();

        const next = createClaimant();
        expect(claimEditingConflictExplanation(next)).not.toBeNull();
    });
});
