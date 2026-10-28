/**
 * One-shot resume slot for a protected action that requested authentication.
 *
 * This is not a command bus. The guest entry point registers the existing
 * action callback; useAuthIntentContinuation takes it once after auth.
 */
let resume: (() => void) | null = null;

export const registerProtectedActionResume = (
    resumeAction: () => void
): void => {
    resume = resumeAction;
};

export const takeProtectedActionResume = (): (() => void) | null => {
    const current = resume;
    resume = null;
    return current;
};

export const clearProtectedActionResume = (): void => {
    resume = null;
};
