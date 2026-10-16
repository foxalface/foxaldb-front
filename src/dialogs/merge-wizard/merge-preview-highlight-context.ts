import { createContext } from 'react';

export interface MergePreviewHighlightHandlers {
    readonly onHighlightOperation: (operationId: string) => void;
    readonly onClearHighlight: (operationId?: string) => void;
}

export const MergePreviewHighlightContext =
    createContext<MergePreviewHighlightHandlers | null>(null);
