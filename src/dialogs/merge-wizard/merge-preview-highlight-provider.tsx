import React from 'react';
import {
    MergePreviewHighlightContext,
    type MergePreviewHighlightHandlers,
} from './merge-preview-highlight-context';

export const MergePreviewHighlightProvider: React.FC<
    React.PropsWithChildren<MergePreviewHighlightHandlers>
> = ({ onHighlightOperation, onClearHighlight, highlightTarget, children }) => (
    <MergePreviewHighlightContext.Provider
        value={{ onHighlightOperation, onClearHighlight, highlightTarget }}
    >
        {children}
    </MergePreviewHighlightContext.Provider>
);
