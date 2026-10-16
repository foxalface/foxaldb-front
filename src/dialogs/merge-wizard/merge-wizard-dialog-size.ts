import { cn } from '@/lib/utils';
import {
    WIZARD_DIALOG_CONTENT_BASE_CLASS,
    WIZARD_DIALOG_NARROW_CLASS,
    WIZARD_DIALOG_SIZE_TRANSITION_CLASS,
    WIZARD_DIALOG_WIDE_CLASS,
} from '@/dialogs/common/wizard-dialog-size';

/** Large Result workspace when operations exist (list + diagram preview). */
export const MERGE_WIZARD_RESULT_WORKSPACE_CLASS =
    'h-[min(92dvh,calc(100dvh-2rem))] w-[min(96vw,calc(100vw-2rem))] max-w-[96rem]';

export const mergeWizardDialogContentClassName = (
    step: 'source' | 'result',
    resultWithPreviewWorkspace: boolean,
    resultEmpty = false
): string =>
    cn(
        WIZARD_DIALOG_CONTENT_BASE_CLASS,
        WIZARD_DIALOG_SIZE_TRANSITION_CLASS,
        step === 'result' && resultWithPreviewWorkspace
            ? MERGE_WIZARD_RESULT_WORKSPACE_CLASS
            : step === 'result' && resultEmpty
              ? WIZARD_DIALOG_NARROW_CLASS
              : WIZARD_DIALOG_WIDE_CLASS
    );
