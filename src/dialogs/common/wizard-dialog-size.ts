import { cn } from '@/lib/utils';

/** Shared with export wizard preview steps (SQL, DBML, generated files). */
export const WIZARD_DIALOG_CONTENT_BASE_CLASS =
    'flex max-h-dvh min-w-0 w-full flex-col overflow-hidden';

export const WIZARD_DIALOG_SIZE_TRANSITION_CLASS =
    'transition-[width,max-width] duration-300 ease-in-out';

export const WIZARD_DIALOG_NARROW_CLASS = 'max-w-[30rem]';

export const WIZARD_DIALOG_WIDE_CLASS =
    'w-[min(48rem,calc(100vw-2rem))] max-w-3xl';

export const wizardDialogContentClassName = (wide: boolean): string =>
    cn(
        WIZARD_DIALOG_CONTENT_BASE_CLASS,
        WIZARD_DIALOG_SIZE_TRANSITION_CLASS,
        wide ? WIZARD_DIALOG_WIDE_CLASS : WIZARD_DIALOG_NARROW_CLASS
    );

/** Step body width for schema editors and wide wizard content. */
export const WIZARD_DIALOG_BODY_CLASS = 'flex w-full flex-col gap-4';
