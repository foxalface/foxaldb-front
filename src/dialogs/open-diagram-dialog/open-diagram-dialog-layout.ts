import { cn } from '@/lib/utils';
import { WIZARD_DIALOG_CONTENT_BASE_CLASS } from '@/dialogs/common/wizard-dialog-size';

/**
 * Wide enough for the longest column labels (all locales) plus sort icons,
 * without truncating headers. Inner width after dialog padding (~3rem).
 */
export const OPEN_DIAGRAM_DIALOG_CONTENT_CLASS = cn(
    WIZARD_DIALOG_CONTENT_BASE_CLASS,
    'h-[min(30rem,calc(100dvh-2rem))] w-[min(58rem,calc(100vw-2rem))] max-w-[58rem]'
);

/** Shared vertical alignment for table body cells. */
export const OPEN_DIAGRAM_TABLE_CELL_CLASS = 'align-middle py-2.5';

/** Layout tokens aligned with wizard dialogs and side-panel section tabs. */
export const OPEN_DIAGRAM_TABLE_PANEL_CLASS =
    'flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-border bg-background';

export const OPEN_DIAGRAM_TABLE_SCROLL_CLASS =
    'scrollbar-app min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto';

export const OPEN_DIAGRAM_TABLE_CLASS = 'w-full table-fixed border-collapse';

/**
 * Header sits outside the scroll area. Sticky thead inside the transformed
 * dialog paints a 1px light seam above the labels on first open.
 */
export const OPEN_DIAGRAM_TABLE_HEADER_WRAPPER_CLASS =
    'shrink-0 border-b border-border bg-background';

export const OPEN_DIAGRAM_TABLE_HEAD_CLASS = 'bg-background [&_tr]:border-0';

/** Plain <tr> — avoid TableRow hover:bg-muted/50 (reads as a white bar on dark). */
export const OPEN_DIAGRAM_TABLE_HEADER_ROW_CLASS = 'border-0 bg-background';

/** Sized for the longest locale labels + sort icon (e.g. "Cơ sở dữ liệu", "Değiştirildi"). */
export const OPEN_DIAGRAM_COL_DATABASE_CLASS = 'w-[10rem]';
export const OPEN_DIAGRAM_COL_ROLE_CLASS = 'w-[6.5rem]';
export const OPEN_DIAGRAM_COL_DATE_CLASS = 'w-[8.25rem]';
export const OPEN_DIAGRAM_COL_TABLES_CLASS = 'w-[6rem]';
export const OPEN_DIAGRAM_COL_ACTIONS_CLASS = 'w-10';

export const openDiagramTableColumnCount = (showRoleColumn: boolean): number =>
    showRoleColumn ? 7 : 6;

export const OPEN_DIAGRAM_EMPTY_STATE_WRAPPER_CLASS =
    'flex min-h-[12rem] flex-1 flex-col items-center justify-center px-3 py-6';

export const OPEN_DIAGRAM_EMPTY_STATE_TITLE_CLASS =
    'text-sm font-normal text-muted-foreground';
