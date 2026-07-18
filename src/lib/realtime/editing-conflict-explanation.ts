/**
 * Tab-lifetime in-memory registry for Last Writer Wins education.
 *
 * Imperative only — call from React effects, never during render.
 * No localStorage, sessionStorage, or backend persistence.
 *
 * Distinguishes:
 * - the claimant that owns the first educational episode
 * - the active claim token (releasable by effect cleanup)
 * - whether that first episode has been genuinely completed
 */

export type EditingConflictExplanationClaimant = symbol;
export type EditingConflictExplanationClaim = symbol;

let episodeClaimant: EditingConflictExplanationClaimant | null = null;
let episodeCompleted = false;
let activeClaim: EditingConflictExplanationClaim | null = null;

/**
 * Claim (or reclaim) the LWW explanation for this tab.
 *
 * The first claimant starts the only educational episode.
 * That same claimant may reclaim after a release while the episode
 * remains incomplete (Strict Mode effect replay).
 * Every other claimant always receives `null`.
 */
export const claimEditingConflictExplanation = (
    claimant: EditingConflictExplanationClaimant
): EditingConflictExplanationClaim | null => {
    if (episodeCompleted) {
        return null;
    }

    if (episodeClaimant === null) {
        episodeClaimant = claimant;
        const claim: EditingConflictExplanationClaim = Symbol(
            'editing-conflict-explanation-claim'
        );
        activeClaim = claim;
        return claim;
    }

    if (episodeClaimant !== claimant) {
        return null;
    }

    if (activeClaim !== null) {
        return null;
    }

    const claim: EditingConflictExplanationClaim = Symbol(
        'editing-conflict-explanation-claim'
    );
    activeClaim = claim;
    return claim;
};

/**
 * Release an active claim token.
 *
 * Only a matching active token is cleared.
 * Does not complete the educational episode.
 */
export const releaseEditingConflictExplanation = (
    claim: EditingConflictExplanationClaim
): void => {
    if (activeClaim !== claim) {
        return;
    }

    activeClaim = null;
};

/**
 * Permanently complete the first educational episode for its owner.
 *
 * Completing with any other claimant identity is a no-op.
 * After completion, all future claims return `null`.
 */
export const completeEditingConflictExplanationEpisode = (
    claimant: EditingConflictExplanationClaimant
): void => {
    if (episodeClaimant !== claimant) {
        return;
    }

    episodeCompleted = true;
    activeClaim = null;
};

/** Test isolation only — resets tab education state. */
export const resetEditingConflictExplanationForTests = (): void => {
    episodeClaimant = null;
    episodeCompleted = false;
    activeClaim = null;
};
