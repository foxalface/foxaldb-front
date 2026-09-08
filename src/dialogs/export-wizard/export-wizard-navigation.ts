import type { ExportWizardStep } from './export-wizard-step';

export const popWizardStepHistory = (
    history: ExportWizardStep[]
): {
    history: ExportWizardStep[];
    previousStep: ExportWizardStep | null;
} => {
    if (history.length === 0) {
        return { history: [], previousStep: null };
    }

    const previousStep = history[history.length - 1] ?? null;

    return {
        history: history.slice(0, -1),
        previousStep,
    };
};
