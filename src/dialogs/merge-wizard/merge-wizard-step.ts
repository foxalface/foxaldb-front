export const MergeWizardStep = {
    SOURCE: 'source',
    RESULT: 'result',
} as const;

export type MergeWizardStep =
    (typeof MergeWizardStep)[keyof typeof MergeWizardStep];
