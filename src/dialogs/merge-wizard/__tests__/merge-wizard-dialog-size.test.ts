import { describe, expect, it } from 'vitest';
import { mergeWizardDialogContentClassName } from '../merge-wizard-dialog-size';

describe('mergeWizardDialogContentClassName', () => {
    it('uses compact wide size for source and zero-diff result', () => {
        expect(mergeWizardDialogContentClassName('source', false)).toContain(
            'max-w-3xl'
        );
        expect(mergeWizardDialogContentClassName('result', false)).toContain(
            'max-w-3xl'
        );
    });

    it('uses expanded workspace size for result with preview', () => {
        const className = mergeWizardDialogContentClassName('result', true);
        expect(className).toContain('max-w-[96rem]');
        expect(className).toContain('92dvh');
    });
});
