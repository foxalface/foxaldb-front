import React from 'react';
import {
    MergePreviewHighlightContext,
    type MergePreviewHighlightHandlers,
} from './merge-preview-highlight-context';

export const MergePreviewHighlightProvider: React.FC<
    React.PropsWithChildren<MergePreviewHighlightHandlers>
> = ({ onHighlightOperation, onClearHighlight, children }) => (
    <MergePreviewHighlightContext.Provider
        value={{ onHighlightOperation, onClearHighlight }}
    >
        {children}
    </MergePreviewHighlightContext.Provider>
);
