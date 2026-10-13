import { describe, expect, it } from 'vitest';
import {
    WIZARD_DIALOG_NARROW_CLASS,
    WIZARD_DIALOG_SIZE_TRANSITION_CLASS,
    WIZARD_DIALOG_WIDE_CLASS,
    wizardDialogContentClassName,
} from '../wizard-dialog-size';

describe('wizardDialogContentClassName', () => {
    it('applies narrow layout classes', () => {
        const className = wizardDialogContentClassName(false);

        expect(className).toContain(WIZARD_DIALOG_NARROW_CLASS);
        expect(className).not.toContain(WIZARD_DIALOG_WIDE_CLASS);
        expect(className).toContain(WIZARD_DIALOG_SIZE_TRANSITION_CLASS);
    });

    it('applies wide layout classes', () => {
        const className = wizardDialogContentClassName(true);

        expect(className).toContain(WIZARD_DIALOG_WIDE_CLASS);
        expect(className).not.toContain(WIZARD_DIALOG_NARROW_CLASS);
        expect(className).toContain(WIZARD_DIALOG_SIZE_TRANSITION_CLASS);
    });
});
