import { createContext } from 'react';
import type { MergePreviewHighlightTarget } from '@/lib/schema-merge/preview/resolve-preview-highlight-target';

export interface MergePreviewHighlightHandlers {
    readonly onHighlightOperation: (operationId: string) => void;
    readonly onClearHighlight: (operationId?: string) => void;
    /** Live hover target. Read by nodes so hover does not replace React Flow state. */
    readonly highlightTarget?: MergePreviewHighlightTarget | null;
}

export const MergePreviewHighlightContext =
    createContext<MergePreviewHighlightHandlers | null>(null);
