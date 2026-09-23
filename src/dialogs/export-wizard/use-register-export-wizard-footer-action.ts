import { useEffect } from 'react';
import type {
    ExportWizardFooterAction,
    RegisterExportWizardFooterAction,
} from './export-wizard-footer-action';

export const useRegisterExportWizardFooterAction = (
    registerFooterAction: RegisterExportWizardFooterAction | undefined,
    action: ExportWizardFooterAction | null
): void => {
    const type = action?.type;
    const onClick = action?.onClick;
    const disabled = action?.disabled;
    const testId = action?.testId;
    const label = action?.label;

    useEffect(() => {
        if (!registerFooterAction) {
            return;
        }

        if (!type || !onClick) {
            registerFooterAction(null);
            return () => {
                registerFooterAction(null);
            };
        }

        registerFooterAction({
            type,
            onClick,
            disabled,
            testId,
            label,
        });

        return () => {
            registerFooterAction(null);
        };
    }, [disabled, label, onClick, registerFooterAction, testId, type]);
};
