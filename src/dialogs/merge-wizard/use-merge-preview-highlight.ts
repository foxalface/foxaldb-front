import { useContext } from 'react';
import {
    MergePreviewHighlightContext,
    type MergePreviewHighlightHandlers,
} from './merge-preview-highlight-context';

export const useMergePreviewHighlight =
    (): MergePreviewHighlightHandlers | null =>
        useContext(MergePreviewHighlightContext);
