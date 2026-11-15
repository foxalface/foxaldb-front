import { describe, expect, it } from 'vitest';
import { translateExportCode } from '../translate-export-code';

describe('translateExportCode', () => {
    const translate = (key: string): string => {
        if (key === 'export_wizard.rails.result_step.errors.empty_diagram') {
            return 'The diagram has no exportable tables.';
        }

        return key;
    };

    it('uses the localized copy for a known code and ignores runtime prose', () => {
        expect(
            translateExportCode(
                translate,
                'export_wizard.rails.result_step.errors',
                'export_wizard.rails.result_step.error_semantic',
                {
                    code: 'empty_diagram',
                    path: undefined,
                }
            )
        ).toBe('The diagram has no exportable tables.');
    });

    it('uses the generic message for an unknown code', () => {
        const message = translateExportCode(
            translate,
            'export_wizard.rails.result_step.errors',
            'export_wizard.rails.result_step.error_semantic',
            { code: 'future_error' }
        );

        expect(message).toBe('export_wizard.rails.result_step.error_semantic');
        expect(message).not.toContain('Backend exploded');
    });
});
