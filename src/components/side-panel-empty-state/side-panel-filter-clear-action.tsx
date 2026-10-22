import React from 'react';
import { Eraser } from 'lucide-react';

/** Shared clear-filter action styling (side panel filter empty states). */
export const sidePanelFilterClearButtonClassName =
    'h-8 gap-1.5 border-destructive text-destructive shadow-sm hover:bg-destructive/10 hover:text-destructive';

export const sidePanelFilterClearButtonIcon = (
    <Eraser className="size-3.5 shrink-0" aria-hidden="true" />
);
