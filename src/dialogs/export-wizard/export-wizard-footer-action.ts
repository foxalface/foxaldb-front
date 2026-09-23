export type ExportWizardFooterActionType = 'export' | 'continue' | 'retry';

export interface ExportWizardFooterAction {
    type: ExportWizardFooterActionType;
    onClick: () => void;
    disabled?: boolean;
    testId?: string;
    label?: string;
}

export type RegisterExportWizardFooterAction = (
    action: ExportWizardFooterAction | null
) => void;
