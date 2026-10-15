import React from 'react';
import { ChartDBProvider } from '@/context/chartdb-context/chartdb-provider';
import { DiffProvider } from '@/context/diff-context/diff-provider';
import { RedoUndoStackProvider } from '@/context/history-context/redo-undo-stack-provider';
import { StorageProvider } from '@/context/storage-context/storage-provider';
import type { Diagram } from '@/lib/domain/diagram';

/**
 * Minimal provider tree for an isolated merge preview canvas.
 * Does not include realtime, collaboration, export, or keyboard shortcuts.
 */
export const MergePreviewProviders: React.FC<
    React.PropsWithChildren<{ diagram: Diagram }>
> = ({ diagram, children }) => (
    <StorageProvider>
        <RedoUndoStackProvider>
            <DiffProvider>
                <ChartDBProvider diagram={diagram} readonly>
                    {children}
                </ChartDBProvider>
            </DiffProvider>
        </RedoUndoStackProvider>
    </StorageProvider>
);
