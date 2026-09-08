import { describe, expect, it } from 'vitest';
import { ExportWizardStep } from '../export-wizard-step';
import { popWizardStepHistory } from '../export-wizard-navigation';

describe('export wizard navigation', () => {
    it('returns null previous step when history is empty', () => {
        expect(popWizardStepHistory([])).toEqual({
            history: [],
            previousStep: null,
        });
    });

    it('pops the most recent step from history', () => {
        expect(
            popWizardStepHistory([
                ExportWizardStep.TARGET_PICKER,
                ExportWizardStep.TARGET_PICKER,
            ])
        ).toEqual({
            history: [ExportWizardStep.TARGET_PICKER],
            previousStep: ExportWizardStep.TARGET_PICKER,
        });
    });
});
